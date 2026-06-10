import { useEffect, useRef, useState } from "react";

const logos = [
  {
    name: "aave",
    render: () => (
      <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 28, color: "#a855f7", letterSpacing: "-0.02em" }}>
        aave
      </span>
    ),
  },
  {
    name: "EigenLayer",
    render: () => (
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: "#c084fc", lineHeight: 1.1, display: "inline-block", textAlign: "left" }}>
        Eigen<br />Layer
      </span>
    ),
  },
  {
    name: "ethereum foundation",
    render: () => (
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 14, color: "#a855f7", lineHeight: 1.4, display: "inline-block", textAlign: "left" }}>
        ethereum<br />foundation
      </span>
    ),
  },
  {
    name: "Morpho",
    render: () => (
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 26, color: "#c084fc", letterSpacing: "-0.01em" }}>
        Morpho
      </span>
    ),
  },
  {
    name: "Balancer",
    render: () => (
      <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24, color: "#a855f7", letterSpacing: "-0.01em" }}>
        Balancer
      </span>
    ),
  },
  {
    name: "VanEck",
    render: () => (
      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 26, color: "#c084fc", letterSpacing: "0.02em", fontStyle: "italic" }}>
        VanEck
      </span>
    ),
  },
];

const FLIP_DUR = 300;
const GAP = 80;
const HOLD = 3000;

export default function ClientsGrid() {
  const innerRefs = useRef([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    const inners = innerRefs.current;

    const flip = (el, anim) => new Promise(res => {
      el.style.animation = "none";
      el.offsetHeight; // force reflow
      el.style.animation = `${anim} ${FLIP_DUR}ms ease-in forwards`;
      setTimeout(res, FLIP_DUR);
    });

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    let cancelled = false;

    async function cycle() {
      if (cancelled) return;

      // flip out one by one: 0 → 1 → 2 → 3 → 4 → 5
      for (let i = 0; i < inners.length; i++) {
        if (cancelled) return;
        flip(inners[i], "logoFlipOut");
        await delay(GAP);
      }
      await delay(FLIP_DUR + 100);

      // flip in one by one: 0 → 1 → 2 → 3 → 4 → 5
      for (let i = 0; i < inners.length; i++) {
        if (cancelled) return;
        flip(inners[i], "logoFlipIn");
        await delay(GAP);
      }

      // hold visible then repeat
      await delay(HOLD);
      cycle();
    }

    const timer = setTimeout(cycle, HOLD);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&family=Space+Grotesk:wght@700&family=IBM+Plex+Mono:wght@400&family=DM+Sans:wght@600&family=Sora:wght@700&family=Playfair+Display:ital,wght@1,700&display=swap');

        @keyframes logoFlipOut {
          0%   { opacity: 1; transform: rotateX(0deg) scale(1); }
          100% { opacity: 0; transform: rotateX(80deg) scale(0.8); }
        }
        @keyframes logoFlipIn {
          0%   { opacity: 0; transform: rotateX(-80deg) scale(0.8); }
          100% { opacity: 1; transform: rotateX(0deg) scale(1); }
        }

        .logo-strip-item {
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 600px;
          transition: opacity 0.25s ease, border-color 0.25s ease;
          padding: 36px 20px;
          background: #080808;
          border: 1px solid #1a1a1a;
          cursor: default;
        }
        .logo-strip-inner {
          display: inline-block;
          transform-style: preserve-3d;
        }
      `}</style>

      <section style={{
        padding: "72px 24px",
        background: "#000000",
        borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p className="purple-gradient-text" style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 10,
            fontFamily: "var(--font-content)",
          }}>
            Trusted by
          </p>
          <h2 style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
            fontWeight: 700,
            color: "#FAFAFA",
            marginBottom: 12,
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.02em",
          }}>
            Organizations securing billions on-chain
          </h2>
          <p style={{
            fontSize: 14,
            color: "#52525B",
            maxWidth: 440,
            margin: "0 auto 52px",
            lineHeight: 1.7,
            fontFamily: "var(--font-content)",
          }}>
            Trusted by leading blockchain organizations and DAOs to manage their
            most critical on-chain treasuries.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {logos.map((logo, i) => (
              <div
                key={logo.name}
                className="logo-strip-item"
                style={{
                  opacity: hoveredIdx === null ? 1 : hoveredIdx === i ? 1 : 0.5,
                  borderColor: hoveredIdx === i ? "rgba(168,85,247,0.25)" : "#1a1a1a",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
              >
                <div className="logo-strip-inner" ref={el => innerRefs.current[i] = el}>
                  {logo.render()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
