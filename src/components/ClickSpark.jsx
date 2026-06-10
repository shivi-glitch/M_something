import { useEffect, useRef, useCallback } from 'react';

/*
  ClickSpark — faithful port of the ReactBits ClickSpark component.

  Settings (matching screenshot):
    sparkColor  : #ffffff
    sparkSize   : 10      — length of each spark line
    sparkRadius : 15      — how far each spark travels from origin
    sparkCount  : 8       — sparks per click
    duration    : 400ms   — total animation time
    extraScale  : 1       — scale multiplier
*/

const SPARK_COLOR = '#cdc7ffff';
const SPARK_SIZE = 10;      // line length (px)
const SPARK_RADIUS = 15;      // travel distance (px)
const SPARK_COUNT = 8;
const DURATION = 400;     // ms
const EXTRA_SCALE = 0.75;

export default function ClickSpark({ children, enabled = true }) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);   // [{x, y, angle, startTime}]
  const rafRef = useRef(null);

  /* ── resize canvas to full window ──────────────────────── */
  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [enabled, resize]);

  /* ── draw loop ──────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const now = performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparksRef.current = sparksRef.current.filter(s => now - s.startTime < DURATION);

    for (const s of sparksRef.current) {
      const elapsed = now - s.startTime;
      const progress = elapsed / DURATION;           // 0 → 1

      // ease-out: fast start, slow end
      const eased = 1 - Math.pow(1 - progress, 3);

      // travel along angle
      const dist = SPARK_RADIUS * EXTRA_SCALE * eased;
      const cx = s.x + Math.cos(s.angle) * dist;
      const cy = s.y + Math.sin(s.angle) * dist;

      // tail end (behind the tip)
      const tailDist = Math.max(0, dist - SPARK_SIZE * EXTRA_SCALE);
      const tx = s.x + Math.cos(s.angle) * tailDist;
      const ty = s.y + Math.sin(s.angle) * tailDist;

      // alpha: full → fades out in last 30%
      const alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.strokeStyle = SPARK_COLOR;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.shadowColor = SPARK_COLOR;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.restore();
    }

    if (sparksRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      rafRef.current = null;
    }
  }, []);

  /* ── spawn sparks on click ─────────────────────────────── */
  const handleClick = useCallback((e) => {
    if (!enabled) return;
    const now = performance.now();
    for (let i = 0; i < SPARK_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / SPARK_COUNT;
      sparksRef.current.push({ x: e.clientX, y: e.clientY, angle, startTime: now });
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [enabled, draw]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, handleClick]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {enabled && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
      {children}
    </div>
  );
}
