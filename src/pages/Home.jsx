import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Lock, Zap, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Lightfall from "../components/Lightfall";
import BorderGlow from "../components/BorderGlow";
import ClientsGrid from "../components/ClientsGrid";

/* ─── Animated Counter ─────────────────────────────────────── */
function useCountUp(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const end = parseFloat(target.replace(/[^0-9.]/g, ""));

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(eased * end);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, target, duration]);

  return count;
}

function formatStatValue(raw, count) {
  const prefix = raw.startsWith("$") ? "$" : "";
  const suffix = raw.replace(/[$0-9.]/g, "");
  const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
  const hasDecimal = raw.includes(".");
  const formatted = hasDecimal
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString();
  return `${prefix}${formatted}${suffix}`;
}

function AnimatedStat({ value, label, started }) {
  const count = useCountUp(value, 5000, started);
  return (
    <div style={{ textAlign: "center" }}>
      <div
        className="purple-gradient-text"
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-heading)",
        }}
      >
        {started ? formatStatValue(value, count) : value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#6b21a8",
          marginTop: 6,
          fontWeight: 500,
          fontFamily: "var(--font-content)",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ─── Intersection observer hook ───────────────────────────── */
function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Data ─────────────────────────────────────────────────── */
const features = [
  {
    icon: <Users size={18} />,
    title: "Multi-Owner Control",
    desc: "Distribute signing authority across your team. No single point of failure, ever.",
  },
  {
    icon: <Lock size={18} />,
    title: "Threshold Signatures",
    desc: "Define how many owners must sign before any transaction executes.",
  },
  {
    icon: <Zap size={18} />,
    title: "On-Chain & Trustless",
    desc: "Every action is verifiable on-chain. No backend, no middleman, no trust required.",
  },
];

const stats = [
  { value: "300+", label: "DAOs onboarded" },
  { value: "$8.5B", label: "Assets secured" },
  { value: "10,000+", label: "Transactions executed" },
];

const steps = [
  { step: "01", title: "Deposit funds", desc: "Any owner deposits ETH into the shared vault contract." },
  { step: "02", title: "Submit a transaction", desc: "An owner proposes a transfer — recipient address and amount." },
  { step: "03", title: "Approve & execute", desc: "Once enough owners sign off, any owner can trigger execution." },
];

/* ─── Main Component ────────────────────────────────────────── */
export default function Home() {
  const { account, connectWallet, loading, error } = useWallet();
  const navigate = useNavigate();

  const [statsRef, statsInView] = useInView(0.3);
  const [stepsRef, stepsInView] = useInView(0.2);

  useEffect(() => {
    if (account) navigate("/dashboard");
  }, [account]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090B",
        color: "#FAFAFA",
        fontFamily: "var(--font-content)",
        overflowX: "hidden",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginTop: "-30px",
        }}
      >
        {/* Lightfall WebGL background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Lightfall
            colors={["#4b90ffff", "#3300ffff", "#fd45f7ff"]}
            backgroundColor="#0A29FF"
            speed={0.4}
            streakCount={1.3}
            streakWidth={1}
            streakLength={1.2}
            glow={1.2}
            density={0.4}
            twinkle={0.9}
            zoom={3}
            backgroundGlow={0.5}
            opacity={1}
            mouseInteraction
            mouseStrength={0.7}
            mouseRadius={1}
          />
        </div>

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(9,9,11,0.45) 0%, rgba(9,9,11,0.55) 90%, rgba(9,9,11,1) 100%)",
            zIndex: 1,
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* Vault ring icon */}
          <div className="vault-ring" style={{ marginBottom: 28 }}>
            <div className="vault-ring-inner">
              <Shield size={30} />
            </div>
          </div>

          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: 99,
              padding: "4px 14px",
              fontSize: 11,
              fontWeight: 600,
              color: "#c084fc",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 24,
              fontFamily: "var(--font-content)",
            }}
          >
            <Shield size={11} />
            Decentralized Treasury Management
          </div>

          <h1
            className="purple-gradient-text glow-text"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 20,
              fontFamily: "var(--font-heading)",
            }}
          >
            Shared control.
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#A1A1AA",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 480,
              fontFamily: "var(--font-content)",
            }}
          >
            A multi-signature vault where your team collectively controls funds.
            No single owner can move money alone.
          </p>

          {/* BorderGlow CTA */}
          <div style={{ display: "inline-block" }}>
            <BorderGlow
              edgeSensitivity={20}
              glowColor="270 70 70"
              backgroundColor="#18181B"
              borderRadius={12}
              glowRadius={50}
              glowIntensity={1.2}
              coneSpread={30}
              animated={false}
              colors={["#a855f7", "#c084fc", "#e879f9"]}
              fillOpacity={0.4}
            >
              <button
                onClick={connectWallet}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 32px",
                  background: "transparent",
                  border: "none",
                  color: "#FAFAFA",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  fontFamily: "var(--font-content)",
                  borderRadius: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "Connecting..." : "Connect Wallet to Enter"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </BorderGlow>
          </div>

          <p style={{ marginTop: 14, fontSize: 12, color: "#cacacaff", fontFamily: "var(--font-content)" }}>
            Works with MetaMask and any Web3 wallet
          </p>

          {/* Error feedback */}
          {error && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 18px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: 10,
                color: "#f87171",
                fontSize: 13,
                fontFamily: "var(--font-content)",
                maxWidth: 380,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {error.includes("MetaMask not found")
                ? "MetaMask not detected. We've opened the install page for you — install it, refresh, and try again."
                : error}
            </div>
          )}
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section
        ref={statsRef}
        style={{
          borderTop: "1px solid #27272A",
          borderBottom: "1px solid #27272A",
          padding: "80px 80px",
          display: "flex",
          justifyContent: "center",
          gap: 80,
          background: "#0d0d10",
          flexWrap: "wrap",
        }}
      >
        {stats.map((s) => (
          <AnimatedStat key={s.label} value={s.value} label={s.label} started={statsInView} />
        ))}
      </section>


      {/* ── CLIENTS GRID ─────────────────────────────────── */}
      <ClientsGrid flipInterval={2200} />

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#7c3aed",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: "var(--font-content)",
          }}
        >
          How it works
        </p>
        <h2
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 64,
            color: "#FAFAFA",
            fontFamily: "var(--font-heading)",
          }}
        >
          Three steps to a secure vault
        </h2>

        <div
          ref={stepsRef}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}
        >
          {steps.map((item, i) => (
            <div
              key={item.step}
              className={stepsInView ? "step-card-animate" : ""}
              style={{
                background: "#0d0d10",
                border: "1px solid #27272A",
                padding: "32px 28px",
                position: "relative",
                opacity: stepsInView ? undefined : 0,
                animationDelay: `${i * 1}s`,
                animationDuration: "1s",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#3b0764",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: 20,
                  letterSpacing: "0.05em",
                }}
              >
                {item.step}
              </div>
              <div
                style={{
                  width: 32,
                  height: 2,
                  background: "linear-gradient(90deg, #7c3aed, #c084fc)",
                  marginBottom: 20,
                }}
              />
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#FAFAFA",
                  marginBottom: 10,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: "#71717A", lineHeight: 1.6, fontFamily: "var(--font-content)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>



      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section
        style={{
          textAlign: "center",
          padding: "50px 4px",
          maxWidth: 540,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 16,
            color: "#FAFAFA",
            fontFamily: "var(--font-heading)",
          }}
        >
          Ready to secure your vault?
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#71717A",
            marginBottom: 36,
            lineHeight: 1.6,
            fontFamily: "var(--font-content)",
          }}
        >
          Connect your wallet to get started.
          <br></br>No signup, no email, no backend.
        </p>
        <BorderGlow
          edgeSensitivity={20}
          glowColor="270 70 70"
          backgroundColor="#18181B"
          borderRadius={12}
          glowRadius={50}
          glowIntensity={1.2}
          coneSpread={10}
          animated
          colors={["#a855f7", "#c084fc", "#e879f9"]}
          fillOpacity={0.4}
        >
          <button
            onClick={connectWallet}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 32px",
              background: "transparent",
              border: "none",
              color: "#FAFAFA",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "var(--font-content)",
              borderRadius: 12,
              whiteSpace: "nowrap",
              margin: "0 auto",
            }}
          >
            {loading ? "Connecting..." : "Enter the Vault"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </BorderGlow>
      </section>
    </div>
  );
}