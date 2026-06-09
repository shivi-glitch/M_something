import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CheckCircle, PlayCircle, Clock, ShieldCheck } from "lucide-react";

function ApprovalBar({ count, threshold }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Approvals
        </span>
        <span className="font-mono-data" style={{ fontSize: 11, color: "var(--color-subtext)" }}>
          {count} / {threshold}
        </span>
      </div>
      <div className="approval-bar">
        {Array.from({ length: threshold }).map((_, i) => (
          <div
            key={i}
            className={`approval-bar-seg${i < count ? " filled" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Approve() {
  const { contract, account, threshold } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchTransactions(); }, [contract]);

  async function fetchTransactions() {
    if (!contract) return;
    setFetching(true);
    const txs = [];
    let i = 0;
    while (true) {
      try {
        const tx = await contract.allTransactions(i);
        const alreadyApproved = await contract.approvals(i, account);
        txs.push({
          id: i,
          recipient: tx.recipient,
          amount: ethers.formatEther(tx.amount),
          approvalCount: Number(tx.approvalCount),
          executed: tx.executed,
          alreadyApproved,
        });
        i++;
      } catch { break; }
    }
    setTransactions(txs);
    setFetching(false);
  }

  async function approve(txid) {
    setLoading(true);
    try {
      const tx = await contract.approveTransaction(txid);
      toast.loading("Approving…");
      await tx.wait();
      toast.dismiss();
      toast.success("Approved!");
      fetchTransactions();
    } catch {
      toast.dismiss();
      toast.error("Approval failed.");
    }
    setLoading(false);
  }

  async function execute(txid) {
    setLoading(true);
    try {
      const tx = await contract.executeTransaction(txid);
      toast.loading("Executing…");
      await tx.wait();
      toast.dismiss();
      toast.success("Transaction executed!");
      fetchTransactions();
    } catch {
      toast.dismiss();
      toast.error("Execution failed.");
    }
    setLoading(false);
  }

  const pending = transactions.filter((t) => !t.executed);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Approve Transactions</h1>
            <p className="page-sub">Review and approve pending transactions</p>
          </div>
          {pending.length > 0 && (
          <div
              className="font-mono-data"
              style={{
                fontSize: 11,
                color: "var(--color-neon)",
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: 6,
                padding: "4px 10px",
                marginBottom: 20,
              }}
            >
              {pending.length} pending
            </div>
          )}
        </div>
      </div>

      <div className="page-body">
        {fetching ? (
          <div style={{ color: "var(--color-muted)", fontSize: 13.5, padding: "40px 0" }}>
            Loading transactions…
          </div>
        ) : pending.length === 0 ? (
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
            <ShieldCheck size={32} style={{ color: "var(--color-border2)" }} />
            <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
              No pending transactions
            </p>
            <p style={{ fontSize: 12.5, color: "var(--color-border2)" }}>
              All caught up — the vault is clear.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((tx) => {
              const canExecute = tx.approvalCount >= threshold;
              const waitingForOthers = tx.alreadyApproved && !canExecute;

              return (
                <div
                  key={tx.id}
                  className="vault-card"
                  style={{ padding: "20px 22px" }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {/* TX ID */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="font-mono-data" style={{ fontSize: 10.5, color: "var(--color-muted)", letterSpacing: "0.06em" }}>
                          TX #{tx.id}
                        </span>
                        {canExecute && (
                          <span style={{
                            fontSize: 10,
                            color: "var(--color-neon)",
                            background: "rgba(168,85,247,0.08)",
                            border: "1px solid rgba(168,85,247,0.2)",
                            borderRadius: 4,
                            padding: "1px 6px",
                            fontWeight: 600,
                          }}>
                            Ready to Execute
                          </span>
                        )}
                      </div>
                      {/* Address */}
                      <span className="font-mono-data" style={{ fontSize: 12.5, color: "var(--color-subtext)" }}>
                        {tx.recipient}
                      </span>
                      {/* Amount */}
                      <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
                        {tx.amount}{" "}
                        <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 400 }}>ETH</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      {!tx.alreadyApproved && (
                        <button
                          id={`approve-btn-${tx.id}`}
                          className="btn-approve"
                          onClick={() => approve(tx.id)}
                          disabled={loading}
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                      )}
                      {canExecute && (
                        <button
                          id={`execute-btn-${tx.id}`}
                          className="btn-execute"
                          onClick={() => execute(tx.id)}
                          disabled={loading}
                        >
                          <PlayCircle size={13} />
                          Execute
                        </button>
                      )}
                      {waitingForOthers && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-muted)" }}>
                          <Clock size={12} />
                          Waiting for others
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <ApprovalBar count={tx.approvalCount} threshold={threshold} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}