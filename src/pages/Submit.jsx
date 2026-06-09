import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { Send, Info } from "lucide-react";

export default function Submit() {
  const { contract } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!recipient || !amount) return toast.error("Please fill in all fields.");
    if (!ethers.isAddress(recipient)) return toast.error("Invalid Ethereum address.");
    setLoading(true);
    try {
      const tx = await contract.submitTransaction(recipient, ethers.parseEther(amount));
      toast.loading("Broadcasting transaction…");
      await tx.wait();
      toast.dismiss();
      toast.success("Transaction submitted for approval.");
      setRecipient("");
      setAmount("");
    } catch (err) {
      toast.dismiss();
      toast.error("Submission failed. Check the console.");
      console.error(err);
    }
    setLoading(false);
  }

  const isValid = recipient && amount && parseFloat(amount) > 0;

  return (
    <div
      className="fade-up"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      {/* Page heading — centred */}
      <div style={{ textAlign: "center", marginBottom: 28, width: "100%", maxWidth: 520 }}>
        <h1 className="page-title" style={{ fontSize: 24 }}>Submit Transaction</h1>
        <p className="page-sub" style={{ marginTop: 4, paddingBottom: 0 }}>
          Propose a new transaction for owner approval
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Info banner */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          <Info size={14} style={{ color: "var(--color-purple)", marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12.5, color: "var(--color-muted)", lineHeight: 1.6 }}>
            Submitted transactions require{" "}
            <span style={{ color: "var(--color-neon)", fontWeight: 600 }}>threshold approvals</span>{" "}
            from vault owners before execution.
          </p>
        </div>

        {/* Form card */}
        <div className="vault-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Recipient */}
            <div>
              <label className="vault-label" htmlFor="recipient-input">Recipient Address</label>
              <input
                id="recipient-input"
                type="text"
                placeholder="0x0000…0000"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="vault-input mono"
                spellCheck={false}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="vault-label" htmlFor="amount-input">Amount (ETH)</label>
              <div style={{ position: "relative" }}>
                <input
                  id="amount-input"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="vault-input"
                  min="0"
                  step="0.001"
                  style={{ paddingRight: 44 }}
                />
                <span
                  className="font-mono-data"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    color: "var(--color-muted)",
                    pointerEvents: "none",
                  }}
                >
                  ETH
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="divider" style={{ margin: "4px 0" }} />

            {/* Review summary */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "12px 14px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12.5,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-muted)" }}>To</span>
                <span className="font-mono-data" style={{ color: "var(--color-subtext)", fontSize: 12 }}>
                  {recipient ? `${recipient.slice(0, 10)}…${recipient.slice(-6)}` : "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-muted)" }}>Value</span>
                <span
                  className="font-mono-data"
                  style={{ color: amount ? "var(--color-neon)" : "var(--color-muted)", fontWeight: 600 }}
                >
                  {amount ? `${amount} ETH` : "—"}
                </span>
              </div>
            </div>

            <button
              id="submit-tx-btn"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || !isValid}
              style={{ width: "100%", fontSize: 14, padding: "12px" }}
            >
              <Send size={14} />
              {loading ? "Submitting…" : "Submit Transaction"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}