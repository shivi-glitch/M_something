# Wiring Up Real Blockchain Data

This guide explains exactly what changes to make to go from dummy mock data to a live on-chain contract.

---

## Overview of what the mock does today

[WalletContext.jsx](file:///c:/Users/Dell/Desktop/multisig-frontend/src/context/WalletContext.jsx) currently:
- Hardcodes `MOCK_ACCOUNT`, `MOCK_OWNERS`, `MOCK_TRANSACTIONS`, `MOCK_BALANCE`
- Returns a fake `contract` object that resolves to static arrays
- `connectWallet()` just sets state after a `setTimeout` — no MetaMask interaction

---

## Step 1 — WalletContext.jsx (the biggest change)

Replace the entire mock context with a real ethers.js + MetaMask implementation.

```jsx
// src/context/WalletContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { MULTISIG_ABI } from "../abi";   // your existing abi.js

// ── Put your deployed contract address here ──────────────────────
const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account,   setAccount]   = useState(null);
  const [isOwner,   setIsOwner]   = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [balance,   setBalance]   = useState("0");
  const [contract,  setContract]  = useState(null);
  const [loading,   setLoading]   = useState(false);

  // ── Connect wallet ──────────────────────────────────────────────
  async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not found. Please install it.");
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);        // triggers MetaMask popup
      const signer   = await provider.getSigner();
      const addr     = await signer.getAddress();
      
      const c = new ethers.Contract(CONTRACT_ADDRESS, MULTISIG_ABI, signer);
      
      // Check if connected wallet is an owner
      let ownerFlag = false;
      try { ownerFlag = await c.isOwner(addr); } catch { /* try/catch — some contracts use a mapping */ }
      
      // Fetch threshold
      const thresh = await c.threshold();   // returns BigInt
      
      setAccount(addr);
      setIsOwner(ownerFlag);
      setThreshold(Number(thresh));
      setContract(c);
      
      await fetchBalance(provider, addr);
    } catch (err) {
      console.error("Connect failed:", err);
    }
    setLoading(false);
  }

  // ── Disconnect ──────────────────────────────────────────────────
  function disconnectWallet() {
    setAccount(null);
    setIsOwner(false);
    setThreshold(0);
    setBalance("0");
    setContract(null);
  }

  // ── Balance ─────────────────────────────────────────────────────
  async function fetchBalance(provider, addr) {
    // Option A — read from contract's ETH balance (most common for multisig)
    const raw = await provider.getBalance(CONTRACT_ADDRESS);
    setBalance(ethers.formatEther(raw));
    
    // Option B — if your contract has a `getBalance()` view function:
    // const raw = await contract.getBalance();
    // setBalance(ethers.formatEther(raw));
  }

  async function refreshBalance() {
    if (!account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    await fetchBalance(provider, account);
  }

  // ── Auto-reconnect on page load if MetaMask is already connected ─
  useEffect(() => {
    async function tryReconnect() {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) connectWallet();   // silently reconnect
    }
    tryReconnect();
  }, []);

  // ── Listen for MetaMask account/chain changes ───────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) disconnectWallet();
      else connectWallet();  // re-init with new account
    };
    const handleChainChange = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountChange);
    window.ethereum.on("chainChanged",    handleChainChange);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
      window.ethereum.removeListener("chainChanged",    handleChainChange);
    };
  }, []);

  return (
    <WalletContext.Provider value={{
      account, contract, isOwner, threshold,
      balance, loading,
      connectWallet, disconnectWallet, refreshBalance,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
```

---

## Step 2 — abi.js

Make sure `src/abi.js` exports the correct ABI for your deployed contract:

```js
// src/abi.js
export const MULTISIG_ABI = [
  // owners & config
  "function owners(uint256 index) view returns (address)",
  "function threshold() view returns (uint256)",
  "function isOwner(address) view returns (bool)",

  // transactions
  "function allTransactions(uint256 index) view returns (address recipient, uint256 amount, uint256 approvalCount, bool executed)",
  "function approvals(uint256 txId, address owner) view returns (bool)",

  // write functions
  "function deposit() payable",
  "function submitTransaction(address recipient, uint256 amount)",
  "function approveTransaction(uint256 txId)",
  "function executeTransaction(uint256 txId)",
];
```

> [!IMPORTANT]
> The function signatures above must exactly match what you compiled in Solidity. Check your contract's compiled ABI JSON to be sure.

---

## Step 3 — Dashboard.jsx

The `loadData()` function already calls `contract.owners(i)` and `contract.allTransactions(i)` in a loop — this works the same with the real contract. **No changes needed.**

The deposit button calls `contract.deposit({ value: ... })` — also already correct.

The one thing to double-check is the **balance fetch** — the Dashboard reads `balance` from context, so if you implement `fetchBalance()` in context as shown above, the dashboard auto-receives it.

---

## Step 4 — Approve.jsx

No logic changes. The real `contract.approveTransaction(txId)` and `contract.executeTransaction(txId)` calls are already wired. It will work when the contract is live.

One thing to verify: `contract.approvals(txId, account)` — make sure your Solidity mapping is `mapping(uint256 => mapping(address => bool)) public approvals;`.

---

## Step 5 — Submit.jsx

Already calls `contract.submitTransaction(recipient, ethers.parseEther(amount))` — correct. No changes needed.

---

## Step 6 — Network / Environment config

Add a `.env` file at the project root:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_CHAIN_ID=11155111   # Sepolia testnet, or 1 for mainnet
```

Then in WalletContext, use:
```js
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
```

And optionally guard the chain:
```js
const network = await provider.getNetwork();
if (Number(network.chainId) !== Number(import.meta.env.VITE_CHAIN_ID)) {
  toast.error("Wrong network. Please switch to Sepolia.");
  setLoading(false);
  return;
}
```

---

## Step 7 — Install MetaMask check

Add a user-facing guard in `TopNavbar.jsx` and `Sidebar.jsx`:

```jsx
if (!window.ethereum) {
  return toast.error("Please install MetaMask to use this app.");
}
```

---

## Summary checklist

| Task | File | Status |
|------|------|--------|
| Replace mock connect with MetaMask | `WalletContext.jsx` | ✏️ Must change |
| Set real `CONTRACT_ADDRESS` | `WalletContext.jsx` / `.env` | ✏️ Must change |
| Verify ABI matches Solidity output | `abi.js` | ✏️ Verify |
| Add chain guard | `WalletContext.jsx` | Recommended |
| Auto-reconnect on load | `WalletContext.jsx` | Recommended |
| Handle MetaMask events | `WalletContext.jsx` | Recommended |
| Dashboard balance reading | `WalletContext.jsx` | ✏️ Must change |
| Approve/Submit/Transactions pages | All pages | ✅ Already correct |
