import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Lock, Zap } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: Users,
    title: "Multi-Owner",
    desc: "Multiple wallet owners control the vault collectively. No single point of failure.",
  },
  {
    icon: Lock,
    title: "Threshold Approval",
    desc: "Transactions execute only after the required number of owners have signed off.",
  },
  {
    icon: Zap,
    title: "On-Chain Execution",
    desc: "Everything is transparent and trustless — immutably recorded on the blockchain.",
  },
];

function FlipCard({ icon: Icon, title, desc }) {
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        {/* Front — icon + title */}
        <div className="flip-card-front">
          <div className="flip-icon-wrap">
            <Icon size={22} />
          </div>
          <div className="flip-title">{title}</div>
        </div>

        {/* Back — description */}
        <div className="flip-card-back">
          <Icon size={16} className="flip-back-icon" />
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-neon)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 2,
          }}>
            {title}
          </div>
          <div className="flip-back-desc">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { account, connectWallet, loading } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) navigate("/dashboard");
  }, [account]);

  return (
    <div
      className="fade-up"
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px 80px",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      {/* Vault ring icon */}
      <div className="vault-ring" style={{ marginBottom: 28 }}>
        <div className="vault-ring-inner">
          <Shield size={30} />
        </div>
      </div>

      {/* Headline */}
      <h1
        className="glow-text"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 44,
          fontWeight: 700,
          color: "var(--color-text)",
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          marginBottom: 14,
        }}
      >
        MultiSig Vault
      </h1>

      <p
        style={{
          fontSize: 15,
          color: "var(--color-muted)",
          textAlign: "center",
          maxWidth: 440,
          lineHeight: 1.7,
          marginBottom: 36,
        }}
      >
        A decentralized multi-signature wallet. Propose, approve, and execute
        transactions — only when consensus is reached.
      </p>

      {/* CTA */}
      <button
        id="connect-wallet-btn"
        className="btn-primary"
        onClick={connectWallet}
        disabled={loading}
        style={{ fontSize: 15, padding: "12px 36px", marginBottom: 60 }}
      >
        {loading ? "Connecting…" : "Connect Wallet to Enter"}
      </button>

      {/* Flip feature cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          width: "100%",
          maxWidth: 640,
        }}
      >
        {features.map((f) => (
          <FlipCard key={f.title} {...f} />
        ))}
      </div>

      {/* Hover hint */}
      <p style={{
        marginTop: 14,
        fontSize: 11.5,
        color: "var(--color-muted)",
        opacity: 0.6,
        letterSpacing: "0.04em",
      }}>
        hover cards to learn more
      </p>
    </div>
  );
}