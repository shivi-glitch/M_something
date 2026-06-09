import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import {
  Shield, LayoutDashboard, Send, CheckCheck,
  ArrowLeftRight, Wallet, LogOut,
} from "lucide-react";

const links = [
  { to: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { to: "/submit",       label: "Submit",        icon: Send },
  { to: "/approve",      label: "Approve",       icon: CheckCheck },
  { to: "/transactions", label: "Transactions",  icon: ArrowLeftRight },
];

export default function Sidebar() {
  const { account, connectWallet, disconnectWallet, loading, isOwner } = useWallet();
  const location = useLocation();

  const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{
        padding: "18px 18px 14px",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--color-purple)",
            flexShrink: 0,
          }}>
            <Shield size={16} />
          </div>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: "var(--color-neon)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}>
              MultiSig
            </div>
            <div style={{
              fontSize: 10,
              color: "var(--color-muted)",
              letterSpacing: "0.04em",
              fontFamily: "var(--font-mono)",
              marginTop: 1,
            }}>
              Vault
            </div>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      {account && (
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <div style={{
            fontSize: 10,
            color: "var(--color-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 12px 8px",
            fontWeight: 600,
          }}>
            Navigation
          </div>
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`nav-link${isActive ? " active" : ""}`}
              >
                <Icon size={15} className="nav-icon" />
                {label}
                {isActive && (
                  <div style={{
                    marginLeft: "auto",
                    width: 5, height: 5,
                    borderRadius: "50%",
                    background: "var(--color-purple)",
                    boxShadow: "0 0 6px var(--color-purple)",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Bottom: wallet info */}
      <div style={{
        borderTop: "1px solid var(--color-border)",
        padding: "14px 16px",
        marginTop: "auto",
      }}>
        {account ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isOwner && <span className="badge-owner">Owner</span>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontSize: 10,
                  color: "var(--color-muted)",
                  marginBottom: 3,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>
                  Connected
                </div>
                <div className="font-mono-data" style={{ fontSize: 11.5, color: "var(--color-subtext)" }}>
                  {short(account)}
                </div>
              </div>
              <button
                className="btn-ghost"
                onClick={disconnectWallet}
                title="Disconnect"
                style={{ padding: "6px", borderRadius: 6 }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-primary"
            onClick={connectWallet}
            disabled={loading}
            style={{ width: "100%" }}
          >
            <Wallet size={14} />
            {loading ? "Connecting…" : "Connect Wallet"}
          </button>
        )}
      </div>
    </aside>
  );
}
