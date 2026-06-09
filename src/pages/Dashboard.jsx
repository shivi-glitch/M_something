import { useWallet } from "../context/WalletContext";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Wallet, Users, CheckCircle, Activity, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { contract, balance, refreshBalance, threshold, account } = useWallet();
  const [txCount, setTxCount] = useState(0);
  const [owners, setOwners] = useState([]);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => { loadData(); }, [contract]);

  async function loadData() {
    if (!contract) return;
    try {
      let i = 0;
      const ownerList = [];
      while (true) {
        try { ownerList.push(await contract.owners(i)); i++; }
        catch { break; }
      }
      setOwners(ownerList);

      let txIdx = 0, pending = 0;
      while (true) {
        try {
          const tx = await contract.allTransactions(txIdx);
          if (!tx.executed) pending++;
          txIdx++;
        } catch { break; }
      }
      setTxCount(txIdx);
      setPendingCount(pending);
    } catch (err) { console.error(err); }
  }

  async function handleDeposit() {
    if (!depositAmt || isNaN(depositAmt)) return;
    setDepositing(true);
    try {
      const tx = await contract.deposit({ value: ethers.parseEther(depositAmt) });
      toast.loading("Depositing…");
      await tx.wait();
      toast.dismiss();
      toast.success("Deposit successful!");
      setDepositAmt("");
      refreshBalance();
    } catch {
      toast.dismiss();
      toast.error("Deposit failed.");
    }
    setDepositing(false);
  }

  const short = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const stats = [
    {
      icon: Wallet,
      label: "Vault Balance",
      value: `${parseFloat(balance).toFixed(4)}`,
      unit: "ETH",
      highlight: true,
    },
    {
      icon: Users,
      label: "Owners",
      value: owners.length,
      unit: null,
    },
    {
      icon: CheckCircle,
      label: "Threshold",
      value: threshold,
      unit: "required",
    },
    {
      icon: Activity,
      label: "Pending TXs",
      value: pendingCount,
      unit: `of ${txCount}`,
    },
  ];

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Overview of your MultiSig vault</p>
      </div>

      <div className="page-body">
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {stats.map(({ icon: Icon, label, value, unit, highlight }) => (
            <div key={label} className="stat-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 11.5, color: "var(--color-muted)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {label}
                </span>
                <Icon size={14} style={{ color: "var(--color-muted)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span
                  className="font-mono-data"
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: highlight ? "var(--color-neon)" : "var(--color-text)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
                {unit && (
                  <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 500 }}>
                    {unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lower grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Deposit */}
          <div className="vault-card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <TrendingUp size={15} style={{ color: "var(--color-purple)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text)" }}>
                Deposit ETH
              </span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="vault-label">Amount</label>
              <input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={depositAmt}
                onChange={(e) => setDepositAmt(e.target.value)}
                className="vault-input"
                min="0"
                step="0.001"
              />
            </div>
            <button
              id="deposit-btn"
              className="btn-primary"
              onClick={handleDeposit}
              disabled={depositing || !depositAmt}
              style={{ width: "100%", marginTop: 4 }}
            >
              {depositing ? "Sending…" : "Deposit to Vault"}
            </button>
          </div>

          {/* Owners */}
          <div className="vault-card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Users size={15} style={{ color: "var(--color-purple)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text)" }}>
                Vault Owners
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {owners.map((o) => (
                <div
                  key={o}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 7,
                  }}
                >
                  <span className="font-mono-data" style={{ fontSize: 12, color: "var(--color-subtext)" }}>
                    {short(o)}
                  </span>
                  {o.toLowerCase() === account?.toLowerCase() && (
                    <span className="badge-owner">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}