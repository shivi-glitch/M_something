import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

// ─── Fake Data ───────────────────────────────────────────────
const MOCK_ACCOUNT = "0xAbCd1234EfGh5678IjKl9012MnOp3456QrSt7890";
const MOCK_OWNERS = [
  "0xAbCd1234EfGh5678IjKl9012MnOp3456QrSt7890",
  "0x1111222233334444555566667777888899990000",
  "0xAAAABBBBCCCCDDDDEEEEFFFF000011112222333",
];
const MOCK_THRESHOLD = 2;
const MOCK_BALANCE = "1.5";

const MOCK_TRANSACTIONS = [
  {
    id: 0,
    recipient: "0x1111222233334444555566667777888899990000",
    amount: "0.5",
    approvalCount: 2,
    executed: true,
    alreadyApproved: true,
  },
  {
    id: 1,
    recipient: "0xAAAABBBBCCCCDDDDEEEEFFFF000011112222333",
    amount: "0.25",
    approvalCount: 1,
    executed: false,
    alreadyApproved: true,
  },
  {
    id: 2,
    recipient: "0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
    amount: "0.1",
    approvalCount: 0,
    executed: false,
    alreadyApproved: false,
  },
];
// ─────────────────────────────────────────────────────────────

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [threshold] = useState(MOCK_THRESHOLD);
  const [balance, setBalance] = useState(MOCK_BALANCE);
  const [loading, setLoading] = useState(false);

  // Fake connect — just sets mock data after a short delay
  async function connectWallet() {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 800)); // fake loading
    setAccount(MOCK_ACCOUNT);
    setIsOwner(true); // set to false to test non-owner view
    setLoading(false);
  }

  function disconnectWallet() {
    setAccount(null);
    setIsOwner(false);
  }

  async function refreshBalance() {
    // no-op in mock mode
  }

  // Fake contract object — methods return mock data so your pages don't crash
  const contract = account
    ? {
        owners: async (i) => {
          if (i >= MOCK_OWNERS.length) throw new Error("out of bounds");
          return MOCK_OWNERS[i];
        },
        allTransactions: async (i) => {
          if (i >= MOCK_TRANSACTIONS.length) throw new Error("out of bounds");
          const t = MOCK_TRANSACTIONS[i];
          return {
            recipient: t.recipient,
            amount: BigInt(Math.round(parseFloat(t.amount) * 1e18)).toString(),
            approvalCount: BigInt(t.approvalCount),
            executed: t.executed,
          };
        },
        approvals: async (txid) => {
          return MOCK_TRANSACTIONS[txid]?.alreadyApproved ?? false;
        },
        threshold: async () => BigInt(MOCK_THRESHOLD),
        isOwner: async () => true,
        deposit: async () => ({ wait: async () => {} }),
        submitTransaction: async () => ({ wait: async () => {} }),
        approveTransaction: async () => ({ wait: async () => {} }),
        executeTransaction: async () => ({ wait: async () => {} }),
      }
    : null;

  return (
    <WalletContext.Provider
      value={{
        account,
        contract,
        isOwner,
        threshold,
        balance,
        loading,
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
