import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { CheckCircle2, Clock, ArrowLeftRight } from "lucide-react";

export default function Transactions() {
  const { contract, threshold } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchAll(); }, [contract]);

  async function fetchAll() {
    if (!contract) return;
    setFetching(true);
    const txs = [];
    let i = 0;
    while (true) {
      try {
        const tx = await contract.allTransactions(i);
        txs.push({
          id: i,
          recipient: tx.recipient,
          amount: ethers.formatEther(tx.amount),
          approvalCount: Number(tx.approvalCount),
          executed: tx.executed,
        });
        i++;
      } catch { break; }
    }
    setTransactions(txs.reverse());
    setFetching(false);
  }

  const short = (addr) => `${addr.slice(0, 8)}…${addr.slice(-6)}`;

  const executed = transactions.filter((t) => t.executed).length;
  const pending  = transactions.length - executed;

  return (
    <div className="fade-up">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-sub">Full history of submitted vault transactions</p>
          </div>
          {transactions.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div className="font-mono-data" style={{
                fontSize: 11, color: "var(--color-success)",
                background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 6, padding: "4px 10px",
              }}>
                {executed} executed
              </div>
              <div className="font-mono-data" style={{
                fontSize: 11, color: "var(--color-muted)",
                background: "var(--color-surface2)", border: "1px solid var(--color-border)",
                borderRadius: 6, padding: "4px 10px",
              }}>
                {pending} pending
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="page-body">
        {fetching ? (
          <div style={{ color: "var(--color-muted)", fontSize: 13.5, padding: "40px 0" }}>
            Loading transactions…
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 20px",
              gap: 12,
            }}
          >
            <ArrowLeftRight size={32} style={{ color: "var(--color-border2)" }} />
            <p style={{ fontSize: 14, color: "var(--color-muted)" }}>No transactions yet</p>
            <p style={{ fontSize: 12.5, color: "var(--color-border2)" }}>
              Submit the first transaction to get started.
            </p>
          </div>
        ) : (
          <div className="vault-card" style={{ overflow: "hidden" }}>
            <table className="vault-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                  <th>Approvals</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className="font-mono-data" style={{ fontSize: 12, color: "var(--color-muted)" }}>
                        #{tx.id}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono-data" style={{ fontSize: 12, color: "var(--color-subtext)" }}>
                        {short(tx.recipient)}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono-data" style={{ fontWeight: 600, color: "var(--color-text)" }}>
                        {tx.amount}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--color-muted)", marginLeft: 4 }}>ETH</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="font-mono-data" style={{ fontSize: 12, color: "var(--color-subtext)" }}>
                          {tx.approvalCount} / {threshold}
                        </span>
                        <div style={{ display: "flex", gap: 3 }}>
                          {Array.from({ length: threshold }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: 6, height: 6,
                                borderRadius: "50%",
                                background: i < tx.approvalCount
                                  ? "var(--color-purple)"
                                  : "var(--color-border2)",
                                transition: "background 0.2s ease",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      {tx.executed ? (
                        <span className="status-executed">
                          <CheckCircle2 size={11} />
                          Executed
                        </span>
                      ) : (
                        <span className="status-pending">
                          <Clock size={11} />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}