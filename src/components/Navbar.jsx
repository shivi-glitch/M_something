import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { Shield, Wallet, LogOut } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/submit", label: "Submit" },
  { to: "/approve", label: "Approve" },
  { to: "/transactions", label: "Transactions" },
];

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, loading, isOwner } = useWallet();
  const location = useLocation();

  const short = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-bg border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <Shield size={20} className="text-cyber-purple" />
          <span className="font-mono font-semibold text-cyber-neon tracking-widest text-sm">
            MULTISIG
          </span>
        </Link>

        {account && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                  location.pathname === l.to
                    ? "bg-cyber-purple/20 text-cyber-purple"
                    : "text-cyber-muted hover:text-cyber-text"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {isOwner && account && (
            <span className="hidden md:block text-xs font-mono text-cyber-neon border border-cyber-purple/30 px-2 py-1 rounded">
              OWNER
            </span>
          )}
          {account ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyber-muted bg-cyber-card border border-cyber-border px-3 py-1.5 rounded">
                {short(account)}
              </span>
              <button
                onClick={disconnectWallet}
                className="p-1.5 text-cyber-muted hover:text-cyber-pink transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="flex items-center gap-2 bg-cyber-purple hover:bg-cyber-neon text-white text-sm font-medium px-4 py-2 rounded transition-all"
            >
              <Wallet size={15} />
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}