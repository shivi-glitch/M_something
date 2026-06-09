import { Link } from "react-router-dom";
import { Shield, Wallet } from "lucide-react";
import { useWallet } from "../context/WalletContext";

export default function TopNavbar() {
  const { connectWallet, loading } = useWallet();

  return (
    <nav className="top-navbar">
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
        <div style={{
          width: 30, height: 30,
          borderRadius: 8,
          background: "rgba(168,85,247,0.12)",
          border: "1px solid rgba(168,85,247,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--color-purple)",
        }}>
          <Shield size={15} />
        </div>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--color-neon)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          MultiSig
        </span>
      </Link>

      {/* Right: CTA */}
      <button
        id="top-nav-connect-btn"
        className="btn-primary"
        onClick={connectWallet}
        disabled={loading}
        style={{ padding: "7px 18px", fontSize: 13 }}
      >
        <Wallet size={13} />
        {loading ? "Connecting…" : "Connect Wallet"}
      </button>
    </nav>
  );
}
