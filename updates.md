# MultiSig Vault — Hero Page Update Instructions

This document contains all the code and instructions needed to upgrade the Home page hero section with two new visual effects:
1. **Lightfall** — animated background for the full hero section
2. **BorderGlow** — interactive glow effect wrapping the "Connect Wallet" button

---

## Step 1 — Install the required dependency

The Lightfall component uses `ogl` (a WebGL library). Run this in your project root:

```bash
npm install ogl
```

---

## Step 2 — Create `src/components/Lightfall.jsx`

Create a new file at `src/components/Lightfall.jsx` and paste this entire code:

```jsx
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const MAX_COLORS = 8;

const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const prepColors = input => {
  const base = (input && input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
  const count = base.length;
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    avg[0] += arr[i][0];
    avg[1] += arr[i][1];
    avg[2] += arr[i][2];
  }
  avg[0] /= count;
  avg[1] /= count;
  avg[2] /= count;
  return { arr, count, avg };
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

const Lightfall = ({
  className,
  dpr,
  paused = false,
  colors = ['#A6C8FF', '#5227FF', '#FF9FFC'],
  backgroundColor = '#0A29FF',
  speed = 0.5,
  streakCount = 2,
  streakWidth = 1,
  streakLength = 1,
  glow = 1,
  density = 0.6,
  twinkle = 1,
  zoom = 3,
  backgroundGlow = 0.5,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
  mouseDampening = 0.15,
  mixBlendMode
}) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const programRef = useRef(null);
  const meshRef = useRef(null);
  const geometryRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseTargetRef = useRef([0, 0]);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
      alpha: true,
      antialias: true
    });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    const canvas = gl.canvas;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const { arr, count, avg } = prepColors(colors);

    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColor0: { value: arr[0] }, uColor1: { value: arr[1] },
      uColor2: { value: arr[2] }, uColor3: { value: arr[3] },
      uColor4: { value: arr[4] }, uColor5: { value: arr[5] },
      uColor6: { value: arr[6] }, uColor7: { value: arr[7] },
      uColorCount: { value: count },
      uBgColor: { value: hexToRGB(backgroundColor) },
      uMouseColor: { value: avg },
      uSpeed: { value: speed },
      uStreakCount: { value: Math.max(1, Math.min(16, Math.round(streakCount))) },
      uStreakWidth: { value: streakWidth },
      uStreakLength: { value: streakLength },
      uGlow: { value: glow },
      uDensity: { value: density },
      uTwinkle: { value: twinkle },
      uZoom: { value: zoom },
      uBgGlow: { value: backgroundGlow },
      uOpacity: { value: opacity },
      uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius }
    };

    const program = new Program(gl, { vertex, fragment, uniforms });
    programRef.current = program;
    const geometry = new Triangle(gl);
    geometryRef.current = geometry;
    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onPointerMove = e => {
      const rect = canvas.getBoundingClientRect();
      const scale = renderer.dpr || 1;
      const x = (e.clientX - rect.left) * scale;
      const y = (rect.height - (e.clientY - rect.top)) * scale;
      mouseTargetRef.current = [x, y];
      if (mouseDampening <= 0) uniforms.iMouse.value = [x, y];
    };
    if (mouseInteraction) canvas.addEventListener('pointermove', onPointerMove);

    const loop = t => {
      rafRef.current = requestAnimationFrame(loop);
      uniforms.iTime.value = t * 0.001;
      if (mouseDampening > 0) {
        if (!lastTimeRef.current) lastTimeRef.current = t;
        const dt = (t - lastTimeRef.current) / 1000;
        lastTimeRef.current = t;
        const tau = Math.max(1e-4, mouseDampening);
        let factor = 1 - Math.exp(-dt / tau);
        if (factor > 1) factor = 1;
        const target = mouseTargetRef.current;
        const cur = uniforms.iMouse.value;
        cur[0] += (target[0] - cur[0]) * factor;
        cur[1] += (target[1] - cur[1]) * factor;
      } else {
        lastTimeRef.current = t;
      }
      if (!paused && programRef.current && meshRef.current) {
        try { renderer.render({ scene: meshRef.current }); } catch (e) { console.error(e); }
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mouseInteraction) canvas.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      if (canvas.parentElement === container) container.removeChild(canvas);
      const callIfFn = (obj, key) => { if (obj && typeof obj[key] === 'function') obj[key].call(obj); };
      callIfFn(programRef.current, 'remove');
      callIfFn(geometryRef.current, 'remove');
      callIfFn(meshRef.current, 'remove');
      callIfFn(rendererRef.current, 'destroy');
      programRef.current = null;
      geometryRef.current = null;
      meshRef.current = null;
      rendererRef.current = null;
    };
  }, [dpr, paused, colors, backgroundColor, speed, streakCount, streakWidth, streakLength,
      glow, density, twinkle, zoom, backgroundGlow, opacity, mouseInteraction,
      mouseStrength, mouseRadius, mouseDampening]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative ${className ?? ''}`}
      style={{ ...(mixBlendMode && { mixBlendMode }) }}
    />
  );
};

export default Lightfall;
```

---

## Step 3 — Create `src/components/BorderGlow.jsx`

Create a new file at `src/components/BorderGlow.jsx` and paste this entire code:

```jsx
import { useRef, useCallback, useState, useEffect } from 'react';

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildBoxShadow(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers = [
    [0, 0, 0, 1, 100, true], [0, 0, 1, 0, 60, true], [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true], [0, 0, 15, 0, 30, true], [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false], [0, 0, 3, 0, 50, false], [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false], [0, 0, 25, 2, 20, false], [0, 0, 50, 2, 10, false],
  ];
  return layers.map(([x, y, blur, spread, alpha, inset]) => {
    const a = Math.min(alpha * intensity, 100);
    return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
  }).join(', ');
}

function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x) { return x * x * x; }

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors) {
  const gradients = [];
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
  }
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

const BorderGlow = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorAngle, setCursorAngle] = useState(45);
  const [edgeProximity, setEdgeProximity] = useState(0);
  const [sweepActive, setSweepActive] = useState(false);

  const getCenterOfElement = useCallback((el) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx; const dy = y - cy;
    let kx = Infinity; let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenterOfElement]);

  const getCursorAngle = useCallback((el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx; const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setEdgeProximity(getEdgeProximity(card, x, y));
    setCursorAngle(getCursorAngle(card, x, y));
  }, [getEdgeProximity, getCursorAngle]);

  useEffect(() => {
    if (!animated) return;
    const angleStart = 110; const angleEnd = 465;
    setSweepActive(true);
    setCursorAngle(angleStart);
    animateValue({ duration: 500, onUpdate: v => setEdgeProximity(v / 100) });
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => {
      setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart);
    }});
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => {
      setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart);
    }});
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: v => setEdgeProximity(v / 100),
      onEnd: () => setSweepActive(false),
    });
  }, [animated]);

  const colorSensitivity = edgeSensitivity + 20;
  const isVisible = isHovered || sweepActive;
  const borderOpacity = isVisible ? Math.max(0, (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity)) : 0;
  const glowOpacity = isVisible ? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity)) : 0;
  const meshGradients = buildMeshGradients(colors);
  const borderBg = meshGradients.map(g => `${g} border-box`);
  const fillBg = meshGradients.map(g => `${g} padding-box`);
  const angleDeg = `${cursorAngle.toFixed(3)}deg`;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={`relative grid isolate border border-white/15 ${className}`}
      style={{
        background: backgroundColor,
        borderRadius: `${borderRadius}px`,
        transform: 'translate3d(0, 0, 0.01px)',
        boxShadow: 'rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px',
      }}
    >
      <div className="absolute inset-0 rounded-[inherit] -z-[1]" style={{
        border: '1px solid transparent',
        background: [`linear-gradient(${backgroundColor} 0 100%) padding-box`, 'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box', ...borderBg].join(', '),
        opacity: borderOpacity,
        maskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
        WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
        transition: isVisible ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out',
      }} />
      <div className="absolute inset-0 rounded-[inherit] -z-[1]" style={{
        border: '1px solid transparent',
        background: fillBg.join(', '),
        maskImage: ['linear-gradient(to bottom, black, black)', 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)', 'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)', 'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)', 'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)', 'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)', `conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`].join(', '),
        WebkitMaskImage: ['linear-gradient(to bottom, black, black)', 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)', 'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)', 'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)', 'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)', 'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)', `conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`].join(', '),
        maskComposite: 'subtract, add, add, add, add, add',
        WebkitMaskComposite: 'source-out, source-over, source-over, source-over, source-over, source-over',
        opacity: borderOpacity * fillOpacity,
        mixBlendMode: 'soft-light',
        transition: isVisible ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out',
      }} />
      <span className="absolute pointer-events-none z-[1] rounded-[inherit]" style={{
        inset: `${-glowRadius}px`,
        maskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
        WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
        opacity: glowOpacity,
        mixBlendMode: 'plus-lighter',
        transition: isVisible ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out',
      }}>
        <span className="absolute rounded-[inherit]" style={{ inset: `${glowRadius}px`, boxShadow: buildBoxShadow(glowColor, glowIntensity) }} />
      </span>
      <div className="flex flex-col relative overflow-auto z-[1]">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
```

---

## Step 4 — Replace `src/pages/Home.jsx` entirely

Replace the entire contents of `src/pages/Home.jsx` with this:

```jsx
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Lock, Zap, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import Lightfall from "../components/Lightfall";
import BorderGlow from "../components/BorderGlow";

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
  { value: "$2.4B", label: "Assets secured" },
  { value: "12,000+", label: "Transactions executed" },
];

export default function Home() {
  const { account, connectWallet, loading } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) navigate("/dashboard");
  }, [account]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090B",
        color: "#FAFAFA",
        fontFamily: "Inter, system-ui, sans-serif",
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
        }}
      >
        {/* Lightfall fills the entire hero as background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          <Lightfall
            colors={["#A6C8FF", "#5227FF", "#FF9FFC"]}
            backgroundColor="#0A29FF"
            speed={0.4}
            streakCount={2}
            streakWidth={1}
            streakLength={1.2}
            glow={0.85}
            density={0.5}
            twinkle={0.8}
            zoom={3}
            backgroundGlow={0.3}
            opacity={0.55}
            mouseInteraction
            mouseStrength={0.4}
            mouseRadius={1}
          />
        </div>

        {/* dark gradient overlay so text stays readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(9,9,11,0.35) 0%, rgba(9,9,11,0.55) 60%, rgba(9,9,11,1) 100%)",
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
          }}
        >
          {/* eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 99,
              padding: "4px 14px",
              fontSize: 11,
              fontWeight: 600,
              color: "#F59E0B",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            <Shield size={11} />
            Decentralized Treasury Management
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 20,
              color: "#FAFAFA",
            }}
          >
            Shared control.
            <br />
            <span style={{ color: "#F59E0B" }}>Zero trust required.</span>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#A1A1AA",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 480,
              margin: "0 auto 40px",
            }}
          >
            A multi-signature vault where your team collectively controls funds.
            No single owner can move money alone.
          </p>

          {/* BorderGlow wraps the CTA button */}
          <div style={{ display: "inline-block" }}>
            <BorderGlow
              edgeSensitivity={20}
              glowColor="40 70 90"
              backgroundColor="#18181B"
              borderRadius={12}
              glowRadius={50}
              glowIntensity={1.2}
              coneSpread={30}
              animated={false}
              colors={["#c084fc", "#f472b6", "#38bdf8"]}
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
                  fontFamily: "inherit",
                  borderRadius: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "Connecting..." : "Connect Wallet to Enter"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </BorderGlow>
          </div>

          <p style={{ marginTop: 14, fontSize: 12, color: "#52525B" }}>
            Works with MetaMask and any Web3 wallet
          </p>
        </div>

        {/* scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 1,
              height: 48,
              background: "linear-gradient(to bottom, transparent, rgba(245,158,11,0.5))",
            }}
          />
          <span style={{ fontSize: 10, color: "#52525B", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Scroll
          </span>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid #27272A",
          borderBottom: "1px solid #27272A",
          padding: "32px 48px",
          display: "flex",
          justifyContent: "center",
          gap: 80,
          background: "#111113",
          flexWrap: "wrap",
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#F59E0B",
                letterSpacing: "-0.02em",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "#52525B", marginTop: 4, fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

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
            color: "#52525B",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
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
          }}
        >
          Three steps to a secure vault
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
          {[
            { step: "01", title: "Deposit funds", desc: "Any owner deposits ETH into the shared vault contract." },
            { step: "02", title: "Submit a transaction", desc: "An owner proposes a transfer — recipient address and amount." },
            { step: "03", title: "Approve & execute", desc: "Once enough owners sign off, any owner can trigger execution." },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                background: "#111113",
                border: "1px solid #27272A",
                padding: "32px 28px",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#27272A",
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
                  background: "#F59E0B",
                  marginBottom: 20,
                }}
              />
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#FAFAFA",
                  marginBottom: 10,
                }}
              >
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: "#71717A", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section
        style={{
          background: "#111113",
          borderTop: "1px solid #27272A",
          borderBottom: "1px solid #27272A",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "100px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 40,
          }}
        >
          {features.map((f) => (
            <div key={f.title}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F59E0B",
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#FAFAFA",
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: "#71717A", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 24px",
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
          }}
        >
          Connect your wallet to get started. No signup, no email, no backend.
        </p>
        <BorderGlow
          edgeSensitivity={20}
          glowColor="40 70 90"
          backgroundColor="#18181B"
          borderRadius={12}
          glowRadius={50}
          glowIntensity={1.2}
          coneSpread={30}
          animated
          colors={["#c084fc", "#f472b6", "#38bdf8"]}
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
              fontFamily: "inherit",
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
```

---

## Summary of all file changes

| Action | File path |
|---|---|
| `npm install ogl` | run in terminal |
| **Create** | `src/components/Lightfall.jsx` |
| **Create** | `src/components/BorderGlow.jsx` |
| **Replace** | `src/pages/Home.jsx` |

No other files need to change.

---

## Notes

- The **Lightfall** background has `opacity={0.55}` so the dark gradient overlay keeps text readable. Increase it toward `0.9` for a more dramatic background, or decrease toward `0.3` for subtler.
- The **BorderGlow** on the hero CTA has `animated={false}` — it only activates on hover. The bottom CTA has `animated={true}` so it runs the sweep animation on page load as a subtle attention-grabber.
- The stats (`300+ DAOs`, `$2.4B secured`, etc.) are placeholder copy — swap with real numbers when available.
