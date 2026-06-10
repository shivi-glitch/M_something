import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "../abi";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── helpers ────────────────────────────────────────────────
  function getProvider() {
    if (!window.ethereum) throw new Error("MetaMask not found. Please install it.");
    return new ethers.BrowserProvider(window.ethereum);
  }

  async function fetchBalance(provider) {
    const bal = await provider.getBalance(CONTRACT_ADDRESS);
    setBalance(ethers.formatEther(bal));
  }

  // ── connect ────────────────────────────────────────────────
  async function connectWallet() {
    setLoading(true);
    setError(null);
    try {
      const provider = getProvider();

      // trigger MetaMask popup
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const [ownerStatus, thresh] = await Promise.all([
        c.isOwner(address),
        c.threshold(),
      ]);

      await fetchBalance(provider);

      setAccount(address);
      setContract(c);
      setIsOwner(ownerStatus);
      setThreshold(Number(thresh));
    } catch (err) {
      console.error("Connect error:", err);
      if (err.code === 4001) {
        setError("Connection rejected. Please approve MetaMask.");
      } else {
        setError(err.message ?? "Failed to connect.");
      }
    }
    setLoading(false);
  }

  // ── disconnect ─────────────────────────────────────────────
  function disconnectWallet() {
    setAccount(null);
    setContract(null);
    setIsOwner(false);
    setThreshold(0);
    setBalance("0");
    setError(null);
  }

  // ── refresh balance ────────────────────────────────────────
  async function refreshBalance() {
    try {
      const provider = getProvider();
      await fetchBalance(provider);
    } catch (err) {
      console.error("Balance refresh error:", err);
    }
  }

  // ── MetaMask event listeners ───────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        // account switched — reconnect fresh
        connectWallet();
      }
    };

    const onChainChanged = () => {
      // reload so provider & contract re-init on the new chain
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        contract,
        isOwner,
        threshold,
        balance,
        loading,
        error,
        connectWallet,
        disconnectWallet,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}