import React, { useEffect, useRef, useState } from 'react';
import './App.css';

/* ============================================================
   SOUNDING II — one continuous descent, +32,000 m → −120 m.
   A WebGL fluid field carries the atmosphere. The layout stays
   quiet; the material does the talking.
   ============================================================ */

/* Atmosphere stops keyed by depth (metres).
   bg = base, tint = mid companion, hi = highlight, ink = text. */
const ATMO_STOPS = [
  { d: 32000, bg: [3, 3, 10], tint: [28, 18, 72], hi: [132, 112, 255], ink: [236, 233, 224] },
  { d: 20000, bg: [7, 13, 38], tint: [22, 38, 108], hi: [92, 130, 250], ink: [233, 237, 240] },
  { d: 8000, bg: [14, 40, 92], tint: [38, 88, 196], hi: [140, 188, 255], ink: [240, 244, 246] },
  { d: 2000, bg: [50, 108, 178], tint: [108, 168, 228], hi: [218, 238, 255], ink: [246, 250, 250] },
  { d: 300, bg: [138, 194, 214], tint: [188, 224, 234], hi: [255, 252, 244], ink: [14, 24, 30] },
  { d: 0, bg: [198, 229, 231], tint: [226, 245, 243], hi: [255, 255, 250], ink: [10, 18, 22] },
  { d: -8, bg: [108, 182, 196], tint: [82, 170, 182], hi: [230, 248, 244], ink: [10, 18, 22] },
  { d: -16, bg: [44, 132, 154], tint: [30, 120, 142], hi: [170, 225, 225], ink: [8, 16, 20] },
  { d: -26, bg: [14, 92, 120], tint: [8, 108, 138], hi: [76, 200, 212], ink: [232, 240, 238] },
  { d: -45, bg: [7, 58, 86], tint: [5, 74, 104], hi: [38, 160, 182], ink: [231, 239, 236] },
  { d: -70, bg: [3, 32, 54], tint: [3, 46, 72], hi: [18, 110, 142], ink: [229, 235, 232] },
  { d: -89.5, bg: [2, 18, 34], tint: [2, 28, 48], hi: [10, 80, 112], ink: [225, 231, 228] },
  { d: -120, bg: [1, 4, 11], tint: [1, 12, 26], hi: [6, 48, 82], ink: [217, 223, 225] },
];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => t * t * (3 - 2 * t);
const mixRgb = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

function sampleAtmosphere(depth) {
  const stops = ATMO_STOPS;
  const d = clamp(depth, stops[stops.length - 1].d, stops[0].d);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (d <= a.d && d >= b.d) {
      const t = a.d === b.d ? 0 : (a.d - d) / (a.d - b.d);
      return {
        bg: mixRgb(a.bg, b.bg, t),
        tint: mixRgb(a.tint, b.tint, t),
        hi: mixRgb(a.hi, b.hi, t),
        ink: mixRgb(a.ink, b.ink, smooth(t)).map(Math.round),
      };
    }
  }
  return stops[stops.length - 1];
}

/* Shared value noise for the 2D canvas figures */
const vHash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const vNoise = (x, y) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return (
    vHash(xi, yi) * (1 - u) * (1 - v) +
    vHash(xi + 1, yi) * u * (1 - v) +
    vHash(xi, yi + 1) * (1 - u) * v +
    vHash(xi + 1, yi + 1) * u * v
  );
};

/* ------------------------------------------------------------
   WebGL fluid field — the living background
   ------------------------------------------------------------ */

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uRay;
uniform float uMix;
uniform float uAurora;
uniform float uCaustic;
uniform float uScale;
uniform float uPaint;
uniform vec2 uSun;
uniform float uSunR;
uniform float uSunI;
uniform float uSnell;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;
  vec2 ps = p * uScale;

  vec2 q = vec2(fbm(ps * 1.3 + vec2(0.0, t)), fbm(ps * 1.3 - vec2(t * 0.8, 0.0)));
  vec2 r = vec2(
    fbm(ps * 2.0 + 1.7 * q + vec2(1.7 + t * 0.3, 9.2)),
    fbm(ps * 2.0 + 1.7 * q + vec2(8.3 - t * 0.4, 2.8))
  );
  float f = fbm(ps * 1.5 + 1.6 * r);

  /* posterize into hand-layered paint planes; shade the seams */
  float L = 6.0;
  float fq = (floor(f * L) + 0.5) / L;
  float bd = abs(fract(f * L) - 0.5);
  float seam = smoothstep(0.5, 0.455, bd);
  float fp = mix(f, fq, uPaint);

  vec3 col = mix(uC0, uC1, clamp(fp * 1.7, 0.0, 1.0));
  col = mix(col, uC2, clamp(q.y * q.y * 1.35, 0.0, 1.0) * 0.45 * uMix);
  col += (r.x - 0.5) * 0.065 * (1.0 - uPaint * 0.5);
  col = col * (1.0 - seam * uPaint * 0.07) + uC2 * seam * uPaint * 0.045;

  /* aurora curtains — the stratosphere's own light */
  if (uAurora > 0.001) {
    float curtain = fbm(vec2(p.x * 2.3 + t * 0.7, p.y * 0.4 - t * 0.18));
    float band = pow(clamp(curtain * 1.38, 0.0, 1.0), 3.2);
    float vfade = smoothstep(-0.25, 0.85, p.y);
    vec3 aurCol = mix(vec3(0.30, 0.90, 0.72), vec3(0.52, 0.38, 0.95),
                      noise(p * 1.4 + vec2(t * 0.25, 0.0)));
    col += aurCol * band * vfade * uAurora * 0.28;
  }

  /* caustic filaments — sunlight webbing just under the surface */
  if (uCaustic > 0.001) {
    vec2 cp = p * 4.6 + vec2(t * 0.8, -t * 0.45);
    float n1 = fbm(cp);
    float web = pow(1.0 - abs(2.0 * n1 - 1.0), 7.0);
    float vfade2 = smoothstep(-1.0, 0.65, p.y);
    col += uC2 * web * uCaustic * 0.20 * vfade2;
  }

  /* god rays through the water column */
  if (uRay > 0.001) {
    float ang = p.x * 0.9 + p.y * 0.35;
    float rays = pow(max(0.0, sin(ang * 13.0 + fbm(p * 3.0 + t) * 4.0)), 6.0);
    rays *= smoothstep(-0.9, 0.8, p.y);
    col += uC2 * rays * uRay * 0.32;
  }

  /* the sun — a sharp coin above, Snell's window below, gone in the abyss */
  if (uSunI > 0.001) {
    vec2 sp = p - uSun;
    if (uSnell > 0.01) {
      sp += (vec2(noise(p * 6.0 + t * 1.4), noise(p * 6.0 - t * 1.2)) - 0.5) * 0.09 * uSnell;
    }
    float dc = length(sp);
    float disc = 1.0 - smoothstep(uSunR * mix(0.8, 0.35, uSnell), uSunR, dc);
    float halo = exp(-dc * mix(8.0, 4.5, uSnell)) * 0.45;
    vec3 sunCol = mix(vec3(1.0, 0.985, 0.94), uC2 * 1.25, uSnell * 0.5);
    col += sunCol * (disc * 0.95 + halo) * uSunI;
  }

  col *= 1.0 - 0.30 * dot(p * vec2(0.85, 1.0), p * vec2(0.85, 1.0));
  col *= mix(0.94, 1.06, uv.y);

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

function initGL(canvas) {
  let gl;
  try {
    gl = canvas.getContext('webgl', { antialias: false, depth: false, alpha: false });
  } catch (e) {
    return null;
  }
  if (!gl || typeof gl.createShader !== 'function') return null;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      // eslint-disable-next-line no-console
      console.error('shader:', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    u: {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      c0: gl.getUniformLocation(prog, 'uC0'),
      c1: gl.getUniformLocation(prog, 'uC1'),
      c2: gl.getUniformLocation(prog, 'uC2'),
      ray: gl.getUniformLocation(prog, 'uRay'),
      mix: gl.getUniformLocation(prog, 'uMix'),
      aurora: gl.getUniformLocation(prog, 'uAurora'),
      caustic: gl.getUniformLocation(prog, 'uCaustic'),
      scale: gl.getUniformLocation(prog, 'uScale'),
      paint: gl.getUniformLocation(prog, 'uPaint'),
      sun: gl.getUniformLocation(prog, 'uSun'),
      sunR: gl.getUniformLocation(prog, 'uSunR'),
      sunI: gl.getUniformLocation(prog, 'uSunI'),
      snell: gl.getUniformLocation(prog, 'uSnell'),
    },
  };
}

/* ------------------------------------------------------------
   The sounding line — a weighted thread lowered by your scroll
   ------------------------------------------------------------ */

function SoundingLine() {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const svg = wrap.querySelector('svg');
    let raf = 0;
    let len = 0;
    let ok = false;
    let y0 = 0;
    let y1 = 1;

    const build = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const docH = document.body.scrollHeight;
      wrap.style.height = `${docH}px`;
      svg.setAttribute('viewBox', `0 0 ${vw} ${docH}`);
      svg.setAttribute('width', vw);
      svg.setAttribute('height', docH);

      y0 = vh * 0.94;
      y1 = docH - vh * 0.4;
      const amp = Math.min(vw * 0.17, 210);
      const cx = vw * 0.52;
      const pts = [];
      for (let y = y0; y <= y1; y += 80) {
        const x =
          cx +
          (vNoise(y * 0.0011, 7.3) - 0.5) * 2 * amp +
          Math.sin(y * 0.0032) * amp * 0.25;
        pts.push([x, y]);
      }
      if (pts.length < 3) return;
      let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2;
        const my = (pts[i][1] + pts[i + 1][1]) / 2;
        d += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      path.setAttribute('d', d);
      ok = typeof path.getTotalLength === 'function';
      if (ok) {
        try {
          len = path.getTotalLength();
          path.style.strokeDasharray = `${len}`;
        } catch (e) {
          ok = false;
        }
      }
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!ok || !len) return;
      const vh = window.innerHeight;
      const frac = clamp((window.scrollY + vh * 0.6 - y0) / Math.max(1, y1 - y0), 0, 1);
      path.style.strokeDashoffset = `${len * (1 - frac)}`;
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(document.body);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="sounding-line" aria-hidden="true">
      <svg preserveAspectRatio="none">
        <path ref={pathRef} className="sl-path" d="M 0 0" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------
   Generative bathymetry — organic contour figures
   ------------------------------------------------------------ */

function ContourField({ path = false, caption, light = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let visible = false;
    let w = 0;
    let h = 0;

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!visible || w === 0) return;
      const t = reduced ? 0 : (now / 1000) * 0.1;
      const ink = light
        ? '22, 25, 28'
        : getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.47;
      const RINGS = 9;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(t * 1.6) * 0.05);
      ctx.translate(-cx, -cy);

      /* outermost first: each fill layers darkness toward the centre,
         so the basin reads as depth, not just line-work */
      const drawRings = (ox, oy) => {
        for (let k = RINGS - 1; k >= 0; k--) {
          const base = R * (0.14 + k * 0.104);
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 72) {
            const nx = Math.cos(a);
            const ny = Math.sin(a);
            const wob = vNoise(nx * 1.5 + t, ny * 1.5 - t * 0.6) - 0.5;
            const wob2 = vNoise(nx * 3.1 - t * 0.4 + 7.3, ny * 3.1 + t * 0.5) - 0.5;
            const rad = base * (1 + wob * (0.1 + k * 0.03) + wob2 * 0.05);
            const x = cx + ox + nx * rad;
            const y = cy + oy + ny * rad * 0.92;
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = light ? 'rgba(22, 25, 28, 0.055)' : 'rgba(2, 12, 18, 0.075)';
          ctx.fill();
          ctx.strokeStyle = `rgba(${ink}, ${0.34 - k * 0.028})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      };

      /* the fault — the basin seen broken and reassembled */
      const fa = path ? 0.95 : -0.52;
      const fdx = Math.cos(fa);
      const fdy = Math.sin(fa);
      const shift = R * 0.055;
      const E = R * 3;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - fdx * E, cy - fdy * E);
      ctx.lineTo(cx + fdx * E, cy + fdy * E);
      ctx.lineTo(cx + fdx * E - fdy * E, cy + fdy * E + fdx * E);
      ctx.lineTo(cx - fdx * E - fdy * E, cy - fdy * E + fdx * E);
      ctx.closePath();
      ctx.clip();
      drawRings(-fdy * shift, fdx * shift);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - fdx * E, cy - fdy * E);
      ctx.lineTo(cx + fdx * E, cy + fdy * E);
      ctx.lineTo(cx + fdx * E + fdy * E, cy + fdy * E - fdx * E);
      ctx.lineTo(cx - fdx * E + fdy * E, cy - fdy * E - fdx * E);
      ctx.closePath();
      ctx.clip();
      drawRings(0, 0);
      ctx.restore();

      /* the fault line itself, drawn plainly */
      ctx.beginPath();
      ctx.moveTo(cx - fdx * R * 1.06, cy - fdy * R * 1.06);
      ctx.lineTo(cx + fdx * R * 1.06, cy + fdy * R * 1.06);
      ctx.strokeStyle = `rgba(${ink}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (path) {
        /* a trajectory sinking toward the basin's centre */
        ctx.beginPath();
        const N = 90;
        for (let i = 0; i <= N; i++) {
          const s = i / N;
          const theta = s * Math.PI * 3.1 + t * 0.5;
          const radius = R * (0.9 - s * 0.78) * (1 + (vNoise(s * 4 + t, 3.3) - 0.5) * 0.24);
          const x = cx + Math.cos(theta) * radius;
          const y = cy + Math.sin(theta) * radius * 0.92;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.setLineDash([2, 5]);
        ctx.lineDashOffset = reduced ? 0 : -(now / 1000) * 12;
        ctx.strokeStyle = `rgba(${ink}, 0.75)`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.setLineDash([]);

        const endTheta = Math.PI * 3.1 + t * 0.5;
        const endR = R * 0.12;
        const ex = cx + Math.cos(endTheta) * endR;
        const ey = cy + Math.sin(endTheta) * endR * 0.92;
        const pulse = reduced ? 0.5 : (Math.sin(now / 400) + 1) / 2;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5 + pulse * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = EGGS.mono ? '#2e2e2e' : '#ff4b26';
        ctx.fill();
      } else {
        /* the deepest sounding */
        const dx = cx + R * 0.07;
        const dy = cy - R * 0.04;
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = EGGS.mono ? '#2e2e2e' : '#ff4b26';
        ctx.fill();
      }

      ctx.restore();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: '80px' }
    );
    io.observe(canvas);

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [path, light]);

  return (
    <figure className="figure" data-reveal style={{ '--reveal-delay': '0.15s' }}>
      <canvas ref={ref} aria-hidden="true" />
      {caption && <figcaption className="figure-cap">{caption}</figcaption>}
    </figure>
  );
}

/* ------------------------------------------------------------
   Waterline — an organic threshold
   ------------------------------------------------------------ */

function Waterline() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let visible = false;
    let w = 0;
    let h = 0;

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!visible || w === 0) return;
      const t = reduced ? 0 : now / 1000;
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
      ctx.clearRect(0, 0, w, h);

      const lineY = (x, i) =>
        h * 0.5 +
        (i - 1) * 11 +
        Math.sin(x * 0.006 + t * 1.05 + i * 1.7) * 5.5 +
        Math.sin(x * 0.0138 - t * 0.7 + i) * 3.4 +
        (vNoise(x * 0.02, t * 0.35 + i * 3.7) - 0.5) * 9;

      const alphas = [0.75, 0.32, 0.14];
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = lineY(x, i);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${ink}, ${alphas[i]})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      /* sun glitter — brief specular glints riding the swell */
      for (let i = 0; i < 46; i++) {
        const gx = vHash(i * 3.7, 1.1) * w;
        const tw = Math.sin(t * 1.35 + i * 2.71) ** 2;
        const a = Math.pow(tw, 7) * 0.85;
        if (a < 0.03) continue;
        const gy = lineY(gx, 1) - 1;
        ctx.strokeStyle = `rgba(255, 255, 250, ${a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(gx - 2.5, gy);
        ctx.lineTo(gx + 2.5, gy);
        ctx.stroke();
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: '80px' }
    );
    io.observe(canvas);

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div className="waterline" data-depth="0">
      <canvas ref={ref} className="waterline-canvas" aria-hidden="true" />
      <div className="waterline-cap" data-reveal>0 m</div>
    </div>
  );
}


/* ------------------------------------------------------------
   System 7 chrome — a little operating system at depth
   ------------------------------------------------------------ */

function MacWindow({ title, children, term = false, reveal = true, onClose, onBarPointerDown }) {
  return (
    <div
      className={`mac-window${term ? ' term' : ''}`}
      {...(reveal ? { 'data-reveal': true } : {})}
    >
      <div className="mw-bar" onPointerDown={onBarPointerDown}>
        {onClose ? (
          <button type="button" className="mw-box mw-close mw-btn" onClick={onClose} aria-label="close window" />
        ) : (
          <span className="mw-box mw-close" aria-hidden="true" />
        )}
        <span className="mw-title">{title}</span>
        <span className="mw-box mw-zoom" aria-hidden="true" />
      </div>
      <div className="mw-body">{children}</div>
    </div>
  );
}

const TERM_INTRO = [
  { cmd: 'whoami', out: ['Shintaro Matsumoto — undergraduate, Keio University'] },
  { cmd: 'ls ~/projects', out: ['triton-3/   uminavi/   fish-pipeline/   aquawiz.org/'] },
  { cmd: 'cat ~/.motto', out: ['make the unseen observable'] },
  { cmd: 'uptime', out: ['building instruments since junior high · 8 awards · 89 m down'] },
];

const PROMPT = 'shintaro@sounding ~ %';

/* easter eggs share state with the engine through this little pocket */
const EGGS = { mono: false, fishUntil: 0 };

const WHALE = [
  '       .',
  '      ":"',
  '    ___:____     |"\\/"|',
  "  ,'        `.    \\  /",
  '  |  O        \\___/  |',
  '~^~^~^~^~^~^~^~^~^~^~^~^~',
];

/* a real (small) shell */
function termExec(raw, ctx) {
  const cmd = raw.trim();
  const [name, ...rest] = cmd.split(/\s+/);
  const arg = rest.join(' ');
  const PLACES = {
    about: '#about',
    'triton-3': '#triton',
    triton: '#triton',
    uminavi: '#uminavi',
    works: '#works',
    contact: '#contact',
  };
  switch (name) {
    case 'help':
      return [
        'whoami · ls · cat <file> · open <place> · dive · depth · pwd · date · uptime · echo · clear · exit',
        'places: about · triton-3 · uminavi · works · contact · aquawiz.org',
        '…and a few undocumented ones.',
      ];
    case 'whoami':
      return ['Shintaro Matsumoto — undergraduate, Keio University'];
    case 'ls':
      return ['triton-3/   uminavi/   fish-pipeline/   aquawiz.org/   .motto'];
    case 'cat':
      if (arg.includes('.motto')) return ['make the unseen observable'];
      if (!arg) return ['cat: missing file'];
      return [`cat: ${arg}: no such file`];
    case 'open':
      if (arg === 'aquawiz.org') {
        ctx.openUrl('https://aquawiz.org');
        return ['opening aquawiz.org…'];
      }
      if (PLACES[arg]) {
        ctx.go(PLACES[arg]);
        return [`opening ${arg}…`];
      }
      return [`open: no such place: ${arg || '(nothing)'}`];
    case 'dive':
      ctx.go('.waterline');
      return ['descending…'];
    case 'depth': {
      const g = document.querySelector('.gauge-num');
      return [`sounding: ${g ? g.textContent : '—'}`];
    }
    case 'pwd':
      return ['/Users/shintaro/sounding'];
    case 'date':
      return [`${new Date().toDateString().toLowerCase()} — 35 years after first boot`];
    case 'uptime':
      return ['building instruments since junior high · 8 awards · 89 m down'];
    case 'echo':
      return [arg];
    case 'sudo':
      return ['permission granted. welcome aboard, captain.'];
    case 'rm':
      if (arg.includes('-rf')) return ['rm: permission denied — the ocean is read-only.'];
      return [`rm: cannot remove '${arg || ''}': it already became documentation`];
    case 'whale':
      return [...WHALE, '(the instruments did not detect it. some things prefer not to be observed.)'];
    case 'fish':
      EGGS.fishUntil = performance.now() + 18000;
      return ['released the school — look around for a while.'];
    case 'biwa':
      return [
        'lake biwa — 670 km², max depth 103.6 m',
        'our deepest sounding: 89 m. the lake still keeps 14.6 m of secrets.',
      ];
    case 'hello':
      return ['hello, world — and everything beneath it.'];
    case 'coffee':
      return ['no coffee at this depth. only pressure.'];
    case 'credits':
      return [
        'SOUNDING — designed & built by shintaro matsumoto',
        'react · one shader · six typefaces · zero animation libraries',
      ];
    case 'konami':
      return ['↑ ↑ ↓ ↓ ← → ← → b a'];
    case '1991':
      EGGS.mono = !EGGS.mono;
      return EGGS.mono
        ? ['color hardware disabled. welcome back to 1991.']
        : ['color restored. welcome back to 2026.'];
    case 'exit':
    case 'quit':
      if (ctx.exit) {
        ctx.exit();
        return [];
      }
      return ['about.sh cannot be exited. it is who you are.'];
    default:
      return [`zsh: command not found: ${name}`];
  }
}

function Terminal({ overlay = false, onGo, onExit }) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [started, setStarted] = useState(overlay);
  const [pos, setPos] = useState(
    overlay ? { li: TERM_INTRO.length, ci: 0 } : { li: 0, ci: 0 }
  );
  const [hist, setHist] = useState(
    overlay ? [{ o: 'SOUNDING console — type help' }] : []
  );
  const [hideIntro, setHideIntro] = useState(overlay);
  const [val, setVal] = useState('');
  const introDone = pos.li >= TERM_INTRO.length;

  useEffect(() => {
    if (overlay) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [overlay]);

  useEffect(() => {
    if (!started || overlay) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPos({ li: TERM_INTRO.length, ci: 0 });
      return undefined;
    }
    if (pos.li >= TERM_INTRO.length) return undefined;
    const cmd = TERM_INTRO[pos.li].cmd;
    const t =
      pos.ci < cmd.length
        ? setTimeout(() => setPos({ li: pos.li, ci: pos.ci + 1 }), 26 + Math.random() * 44)
        : setTimeout(() => setPos({ li: pos.li + 1, ci: 0 }), 460);
    return () => clearTimeout(t);
  }, [started, overlay, pos]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [hist, pos, val]);

  useEffect(() => {
    if (overlay && inputRef.current) inputRef.current.focus();
  }, [overlay]);

  const run = () => {
    const raw = val;
    setVal('');
    const cmd = raw.trim();
    if (!cmd) {
      setHist((h) => [...h, { c: '' }]);
      return;
    }
    if (cmd === 'clear') {
      setHist([]);
      setHideIntro(true);
      return;
    }
    const outs = termExec(raw, {
      go: onGo,
      openUrl: (u) => window.open(u, '_blank', 'noopener'),
      exit: onExit,
    });
    setHist((h) => [...h, { c: raw }, ...outs.map((o) => ({ o }))]);
  };

  return (
    <div
      ref={rootRef}
      className="term-root"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      <div ref={scrollRef} className="term-scroll">
        {!hideIntro &&
          TERM_INTRO.slice(0, Math.min(pos.li + 1, TERM_INTRO.length)).map((l, i) => (
            <div key={i} className="term-block">
              <div className="term-cmd">
                <span className="term-prompt">{PROMPT}</span>{' '}
                {i < pos.li ? l.cmd : l.cmd.slice(0, pos.ci)}
                {i === pos.li && <span className="term-caret">▋</span>}
              </div>
              {i < pos.li && l.out.map((o) => <div key={o} className="term-out">{o}</div>)}
            </div>
          ))}
        {hist.map((h, i) =>
          h.c !== undefined ? (
            <div key={`h${i}`} className="term-cmd">
              <span className="term-prompt">{PROMPT}</span> {h.c}
            </div>
          ) : (
            <div key={`h${i}`} className="term-out">{h.o}</div>
          )
        )}
        {introDone && (
          <div className="term-cmd term-live">
            <span className="term-prompt">{PROMPT}</span>{' '}
            <input
              ref={inputRef}
              className="term-input"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') run();
              }}
              placeholder="help"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="terminal input"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* the summonable console — press ` anywhere, or File → Open Terminal */
function ConsoleWindow({ onClose, onGo }) {
  const [dp, setDp] = useState({ x: 0, y: 0 });

  const onBar = (e) => {
    if (e.target.closest('.mw-close')) return;
    e.preventDefault();
    const sx = e.clientX - dp.x;
    const sy = e.clientY - dp.y;
    const move = (ev) => setDp({ x: ev.clientX - sx, y: ev.clientY - sy });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="console-overlay" style={{ transform: `translate(${dp.x}px, ${dp.y}px)` }}>
      <MacWindow
        title="terminal — sounding"
        term
        reveal={false}
        onClose={onClose}
        onBarPointerDown={onBar}
      >
        <Terminal overlay onGo={onGo} onExit={onClose} />
      </MacWindow>
    </div>
  );
}

const MENUBAR = [
  { id: 'apple', label: '◆', items: [{ label: 'About This System…', action: 'about-sys' }] },
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Open Terminal', key: '`', action: 'terminal' },
      { label: 'Open aquawiz.org', action: 'aquawiz' },
      { sep: true },
      { label: 'Quit', key: '⌘Q', action: 'quit' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo Dive', key: '⌘Z', disabled: true },
      { label: 'Copy Motto', key: '⌘C', action: 'copy-motto' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'About Me', action: 'go:#about' },
      { label: 'Triton-3', action: 'go:#triton' },
      { label: 'UmiNavi', action: 'go:#uminavi' },
      { label: 'Works', action: 'go:#works' },
      { label: 'Contact', action: 'go:#contact' },
    ],
  },
  {
    id: 'special',
    label: 'Special',
    items: [
      { label: 'Dive to 0 m', key: '⌘D', action: 'dive' },
      { label: 'Empty Trash…', action: 'trash' },
      { sep: true },
      { label: 'Restart', action: 'top' },
    ],
  },
];

/* ------------------------------------------------------------
   Content data
   ------------------------------------------------------------ */

const FACTS = [
  ['now', 'Undergraduate at Keio University, Japan'],
  ['team', 'AquaWiz — managing director & software, low-cost underwater robotics'],
  ['building', 'Triton-3, an autonomous lake profiler · UmiNavi, underwater localization without GPS'],
  ['recognition', 'Mitou Junior 2025 Super Creator · eight awards since 2023'],
  ['toolbox', 'CAD & 3D printing · embedded C++ · Python & machine learning · React & Rust'],
];

const WORKS_ROWS = [
  {
    idx: '01',
    name: 'AquaWiz.org',
    desc: 'Bilingual home of our AUV team — news, awards and mission records driven by plain data files, prerendered to static HTML.',
    stack: 'React / Vite / Tailwind / Cloudflare',
    href: 'https://aquawiz.org',
  },
  {
    idx: '02',
    name: 'VCC-TUI',
    desc: 'VRChat package management for terminal people, built on a Redux-style action → reducer → effect loop.',
    stack: 'Rust / Ratatui / Tokio',
  },
  {
    idx: '03',
    name: 'Music Overlay',
    desc: 'Transparent now-playing overlay for OBS with album-art ambient light — 1080p and 4K presets, artwork fallback chain included.',
    stack: 'Python / OBS / HTML',
  },
];

const RECORD_ROWS = [
  { year: '2025', title: 'Mitou Junior — Mitou Foundation (UmiNavi)', rank: 'Super Creator' },
  { year: '2025', title: 'JSEC — Japan Science & Engineering Challenge', rank: 'Partner Company Award' },
  { year: '2025', title: 'Sasaki Yoshikazu Award — Weathernews', rank: 'Award' },
  { year: '2024', title: 'Weather Contest — Weathernews', rank: 'Grand Prize' },
  { year: '2024', title: 'MATLAB EXPO — MathWorks', rank: '2nd Place' },
  { year: '2023', title: 'MATLAB EXPO — MathWorks', rank: '1st Place' },
];

/* ------------------------------------------------------------
   App
   ------------------------------------------------------------ */

function App() {
  const glRef = useRef(null);
  const fieldRef = useRef(null);
  const gaugeNumRef = useRef(null);
  const gaugeDotRef = useRef(null);
  const gaugeTrackRef = useRef(null);
  const dissolveRef = useRef(null);
  const yearRef = useRef(null);
  const [retroMode, setRetroMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const trashRef = useRef(0);
  const emptyTrash = () => {
    const msgs = [
      'The Trash contains 0 failed prototypes.\nThey all became documentation.',
      'Still empty.\nFailure only counts if you don\'t log it.',
      'You keep emptying an empty Trash.\nThe lake appreciates your diligence.',
    ];
    const i = Math.min(trashRef.current, msgs.length - 1);
    trashRef.current += 1;
    setAlertMsg(msgs[i]);
  };

  const goTo = (sel) => {
    const el = document.querySelector(sel);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: sel === '.waterline' ? 'center' : 'start' });
    }
  };

  const runMenu = (action) => {
    setMenuOpen(null);
    if (!action) return;
    if (action.startsWith('go:')) {
      goTo(action.slice(3));
      return;
    }
    switch (action) {
      case 'terminal':
        setConsoleOpen(true);
        break;
      case 'aquawiz':
        window.open('https://aquawiz.org', '_blank', 'noopener');
        break;
      case 'quit':
        setAlertMsg("You can't quit the ocean.\nKeep scrolling.");
        break;
      case 'about-sys':
        setAlertMsg('SOUNDING — System 7.dive\nBuilt by Shintaro Matsumoto.\nMemory available: 89 m.');
        break;
      case 'copy-motto':
        try {
          if (navigator.clipboard) navigator.clipboard.writeText('make the unseen observable');
        } catch (e) { /* clipboard unavailable */ }
        setAlertMsg('"make the unseen observable"\ncopied to the Clipboard.');
        break;
      case 'trash':
        emptyTrash();
        break;
      case 'dive':
        goTo('.waterline');
        break;
      case 'top':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  /* hidden commands: ` summons the console; the old code does the old thing */
  useEffect(() => {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let buf = [];
    const onKey = (e) => {
      if (e.key === '`' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setConsoleOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setConsoleOpen(false);
        setMenuOpen(null);
        setAlertMsg(null);
        return;
      }
      buf = [...buf, e.key].slice(-KONAMI.length);
      if (KONAMI.every((k, i) => buf[i] === k)) {
        buf = [];
        EGGS.mono = !EGGS.mono;
        setAlertMsg(
          EGGS.mono
            ? 'SYSTEM 1991\nColor hardware disabled.\n(repeat the code — or type 1991 — to restore)'
            : 'SYSTEM 2026\nColor restored. Welcome back.'
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* click outside closes menus */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (!e.target.closest('.menubar')) setMenuOpen(null);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  /* Reveal observer */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.zone, .waterline').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* The descent engine — scroll → depth → atmosphere, field, gauge */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const glCanvas = glRef.current;
    const glCtx = initGL(glCanvas);

    const canvas = fieldRef.current;
    const ctx = canvas.getContext('2d');
    const dCanvas = dissolveRef.current;
    const dCtx = dCanvas.getContext('2d');
    let lastRetro = null;
    let dPattern = null;
    let dHidden = false;
    if (dCtx) {
      const pc = document.createElement('canvas');
      pc.width = 4;
      pc.height = 4;
      const pcx = pc.getContext('2d');
      if (pcx) {
        pcx.fillStyle = '#ece9df';
        pcx.fillRect(0, 0, 4, 4);
        pcx.fillStyle = '#d2cfc1';
        pcx.fillRect(0, 0, 2, 2);
        pcx.fillRect(2, 2, 2, 2);
        dPattern = dCtx.createPattern(pc, 'repeat');
      }
    }

    let raf = 0;
    let width = 0;
    let height = 0;
    let checkpoints = [];
    let dispDepth = 32000;
    let trackH = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glDpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (ctx) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (dCtx) {
        dCanvas.width = width;
        dCanvas.height = height;
      }
      if (glCtx) {
        glCanvas.width = width * glDpr;
        glCanvas.height = height * glDpr;
        glCtx.gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      }
      trackH = gaugeTrackRef.current ? gaugeTrackRef.current.offsetHeight : 0;
    };

    const mapCheckpoints = () => {
      checkpoints = Array.from(document.querySelectorAll('[data-depth]'))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { y: window.scrollY + r.top + r.height / 2, d: parseFloat(el.dataset.depth) };
        })
        .sort((a, b) => a.y - b.y);
    };


    const depthAtScroll = () => {
      if (!checkpoints.length) return 32000;
      const probe = window.scrollY + height / 2;
      if (probe <= checkpoints[0].y) return checkpoints[0].d;
      for (let i = 0; i < checkpoints.length - 1; i++) {
        const a = checkpoints[i];
        const b = checkpoints[i + 1];
        if (probe >= a.y && probe <= b.y) {
          const t = (probe - a.y) / Math.max(1, b.y - a.y);
          return lerp(a.d, b.d, t);
        }
      }
      return checkpoints[checkpoints.length - 1].d;
    };

    /* particles — stars above, marine snow below, faint life at depth */
    const rnd = (a, b) => a + Math.random() * (b - a);
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(), y: Math.random(), r: rnd(0.4, 1.4),
      tw: rnd(0.5, 2), ph: rnd(0, Math.PI * 2), z: rnd(0.2, 1),
    }));
    const snow = Array.from({ length: 100 }, () => ({
      x: Math.random(), y: Math.random(), r: rnd(0.5, 1.9),
      v: rnd(5, 22), sw: rnd(0.2, 1.1), ph: rnd(0, Math.PI * 2),
    }));
    const biolum = Array.from({ length: 12 }, () => ({
      x: Math.random(), y: Math.random(), r: rnd(1, 2.2),
      pu: rnd(0.3, 1), ph: rnd(0, Math.PI * 2), vx: rnd(-2, 2), vy: rnd(-1.5, 1.5),
    }));
    /* a school of fish — silhouettes drifting through the mid-water */
    const school = Array.from({ length: 26 }, () => ({
      x: rnd(0.2, 0.8), y: rnd(0.2, 0.8),
      vx: rnd(-30, 30), vy: rnd(-12, 12),
    }));

    const flock = (dt2) => {
      const W = width;
      const H = height;
      for (const f of school) {
        let cxn = 0; let cyn = 0; let n = 0;
        let ax = 0; let ay = 0;
        let sx = 0; let sy = 0;
        const fx = f.x * W;
        const fy = f.y * H;
        for (const o of school) {
          if (o === f) continue;
          const dx = o.x * W - fx;
          const dy = o.y * H - fy;
          const dsq = dx * dx + dy * dy;
          if (dsq < 4900) {
            cxn += dx; cyn += dy;
            ax += o.vx; ay += o.vy;
            n++;
            if (dsq < 500) { sx -= dx; sy -= dy; }
          }
        }
        if (n > 0) {
          f.vx += (cxn / n) * 0.012 + (ax / n - f.vx) * 0.045 + sx * 0.05;
          f.vy += (cyn / n) * 0.012 + (ay / n - f.vy) * 0.045 + sy * 0.05;
        }
        f.vx += (vNoise(f.x * 5 + last / 4000, 3.1) - 0.5) * 4;
        f.vy += (vNoise(f.y * 5 - last / 5000, 8.7) - 0.5) * 2.5;
        const sp = Math.hypot(f.vx, f.vy) || 1;
        const target = clamp(sp, 16, 42);
        f.vx = (f.vx / sp) * target;
        f.vy = (f.vy / sp) * target;
        f.x += (f.vx * dt2) / W;
        f.y += (f.vy * dt2) / H;
        if (f.x < -0.05) f.x = 1.05;
        if (f.x > 1.05) f.x = -0.05;
        if (f.y < 0.05) { f.y = 0.05; f.vy = Math.abs(f.vy); }
        if (f.y > 0.95) { f.y = 0.95; f.vy = -Math.abs(f.vy); }
      }
    };

    let last = performance.now();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = reduced ? 0 : now / 1000;

      const target = depthAtScroll();
      dispDepth = reduced ? target : dispDepth + (target - dispDepth) * 0.09;
      const d = dispDepth;

      /* atmosphere → CSS vars, cross-faded from the 1-bit boot world */
      const atmoRaw = sampleAtmosphere(d);
      const toGray = (c) => {
        const l = Math.round(c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114);
        return [l, l, l];
      };
      const atmo = EGGS.mono
        ? { bg: toGray(atmoRaw.bg), tint: toGray(atmoRaw.tint), hi: toGray(atmoRaw.hi), ink: toGray(atmoRaw.ink) }
        : atmoRaw;
      const pE = smooth(clamp(window.scrollY / Math.max(1, height * 0.85), 0, 1));
      const RETRO_BG = [233, 231, 222];
      const RETRO_INK = [18, 18, 18];
      const [br, bgc, bb] = atmo.bg.map((v, i) => Math.round(lerp(RETRO_BG[i], v, pE)));
      const [ir, ig, ib] = atmo.ink.map((v, i) => Math.round(lerp(RETRO_INK[i], v, pE)));
      const root = document.documentElement.style;
      root.setProperty('--bg', `rgb(${br}, ${bgc}, ${bb})`);
      root.setProperty('--ink', `${ir}, ${ig}, ${ib}`);
      root.setProperty('--line', `rgba(${ir}, ${ig}, ${ib}, 0.16)`);
      root.setProperty('--line-soft', `rgba(${ir}, ${ig}, ${ib}, 0.08)`);
      root.setProperty('--newp', pE.toFixed(3));
      root.setProperty('--accent', EGGS.mono ? '#2e2e2e' : '#ff4b26');
      root.setProperty('--glow', EGGS.mono ? '#c9c9c9' : '#6ef2d6');
      const retroNow = pE < 0.55;
      if (retroNow !== lastRetro) {
        lastRetro = retroNow;
        setRetroMode(retroNow);
      }
      if (yearRef.current) {
        yearRef.current.textContent = String(Math.round(lerp(1991, 2026, pE)));
      }

      /* the old OS dissolves, cell by cell — scroll back to reassemble it */
      if (dCtx && dPattern) {
        if (pE >= 1) {
          if (!dHidden) { dCanvas.style.display = 'none'; dHidden = true; }
        } else {
          if (dHidden) { dCanvas.style.display = 'block'; dHidden = false; }
          dCtx.clearRect(0, 0, width, height);
          dCtx.fillStyle = dPattern;
          dCtx.fillRect(0, 0, width, height);
          const cell = 16;
          const ncx = Math.ceil(width / cell);
          const ncy = Math.ceil(height / cell);
          for (let iy = 0; iy < ncy; iy++) {
            for (let ix = 0; ix < ncx; ix++) {
              if (vHash(ix * 7.31, iy * 3.77) < pE) {
                dCtx.clearRect(ix * cell, iy * cell, cell + 0.5, cell + 0.5);
              }
            }
          }
        }
      }

      /* gauge */
      if (gaugeNumRef.current) {
        gaugeNumRef.current.textContent =
          d >= 0
            ? `+${Math.round(d).toLocaleString('en-US').replace(/,/g, ' ')} m`
            : `−${Math.abs(d).toFixed(1)} m`;
      }
      if (gaugeDotRef.current && trackH > 0) {
        const doc = document.documentElement;
        const prog = clamp(window.scrollY / Math.max(1, doc.scrollHeight - height), 0, 1);
        gaugeDotRef.current.style.transform = `translateY(${prog * (trackH - 5)}px)`;
      }


      /* fluid field */
      if (glCtx) {
        const { gl, u } = glCtx;
        const under = -d;
        const rayAmt =
          smooth(clamp(under / 4, 0, 1)) * (1 - smooth(clamp((under - 25) / 20, 0, 1)));
        const mixAmt = 0.55 + 0.35 * smooth(clamp(under / 10, 0, 1));
        const auroraAmt = smooth(clamp((d - 3000) / 9000, 0, 1)) * 0.9 * (EGGS.mono ? 0 : 1);
        const causticAmt =
          smooth(clamp(under / 2.5, 0, 1)) * (1 - smooth(clamp((under - 8) / 10, 0, 1)));
        const scaleAmt =
          1.15 -
          0.5 * smooth(clamp((under - 15) / 75, 0, 1)) -
          0.22 * smooth(clamp((d - 8000) / 20000, 0, 1));
        gl.uniform2f(u.res, glCanvas.width, glCanvas.height);
        gl.uniform1f(u.time, time);
        gl.uniform3f(u.c0, atmo.bg[0] / 255, atmo.bg[1] / 255, atmo.bg[2] / 255);
        gl.uniform3f(u.c1, atmo.tint[0] / 255, atmo.tint[1] / 255, atmo.tint[2] / 255);
        gl.uniform3f(u.c2, atmo.hi[0] / 255, atmo.hi[1] / 255, atmo.hi[2] / 255);
        gl.uniform1f(u.ray, rayAmt);
        gl.uniform1f(u.mix, mixAmt);
        gl.uniform1f(u.aurora, auroraAmt);
        gl.uniform1f(u.caustic, causticAmt);
        gl.uniform1f(u.scale, scaleAmt);
        const paintAmt =
          0.32 + 0.42 * smooth(clamp(under / 15, 0, 1)) * (1 - 0.45 * smooth(clamp((under - 95) / 25, 0, 1)));
        gl.uniform1f(u.paint, paintAmt);
        const snellAmt = smooth(clamp(under / 6, 0, 1));
        const lum = (atmo.bg[0] * 0.299 + atmo.bg[1] * 0.587 + atmo.bg[2] * 0.114) / 255;
        const sunIAmt =
          0.92 * (1 - smooth(clamp((under - 6) / 85, 0, 1))) * (1 - 0.82 * smooth(lum));
        const sunRAmt = d >= 0
          ? 0.06 + 0.055 * (1 - clamp(d / 22000, 0, 1))
          : 0.125 + 0.05 * smooth(clamp(under / 40, 0, 1));
        gl.uniform2f(u.sun, 0.38, 0.33);
        gl.uniform1f(u.sunR, sunRAmt);
        gl.uniform1f(u.sunI, sunIAmt);
        gl.uniform1f(u.snell, snellAmt);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      /* particles */
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        const starA = clamp((d - 1500) / 12000, 0, 1) * 0.85;
        if (starA > 0.01) {
          const drift = (window.scrollY * 0.06) % height;
          for (const s of stars) {
            const a = starA * (0.4 + 0.6 * Math.sin(time * s.tw + s.ph) ** 2);
            const y = (s.y * height + drift * s.z + height) % height;
            ctx.globalAlpha = a;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(s.x * width, y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        const snowA = clamp((-d - 2) / 22, 0, 1) * 0.4;
        if (snowA > 0.01) {
          for (const p of snow) {
            p.y += (p.v * dt) / height;
            if (p.y > 1.02) { p.y = -0.02; p.x = Math.random(); }
            const x = p.x * width + Math.sin(time * p.sw + p.ph) * 14;
            ctx.globalAlpha = snowA;
            ctx.fillStyle = 'rgb(214, 232, 234)';
            ctx.beginPath();
            ctx.arc(x, p.y * height, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        /* the school — barely-there silhouettes in the mid-water */
        let fishA =
          clamp((-d - 22) / 12, 0, 1) * (1 - clamp((-d - 66) / 14, 0, 1)) * 0.45;
        if (now < EGGS.fishUntil) fishA = Math.max(fishA, 0.5);
        if (fishA > 0.01) {
          flock(dt);
          ctx.lineCap = 'round';
          for (let i = 0; i < school.length; i++) {
            const f = school[i];
            const sp = Math.hypot(f.vx, f.vy) || 1;
            const bx = f.x * width;
            const by = f.y * height;
            const L = 5 + (i % 3);
            ctx.globalAlpha = fishA * (0.6 + 0.4 * Math.sin(time * 0.8 + i));
            ctx.strokeStyle = 'rgb(3, 16, 22)';
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx - (f.vx / sp) * L, by - (f.vy / sp) * L);
            ctx.stroke();
          }
          ctx.lineCap = 'butt';
        }

        const bioA = clamp((-d - 58) / 25, 0, 1);
        if (bioA > 0.01) {
          for (const b of biolum) {
            b.x = (b.x + (b.vx * dt) / width + 1) % 1;
            b.y = (b.y + (b.vy * dt) / height + 1) % 1;
            const a = bioA * (0.2 + 0.8 * Math.sin(time * b.pu + b.ph) ** 2) * 0.8;
            ctx.globalAlpha = a;
            ctx.fillStyle = EGGS.mono ? '#cfcfcf' : '#6ef2d6';
            ctx.shadowColor = EGGS.mono ? '#cfcfcf' : '#6ef2d6';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(b.x * width, b.y * height, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        ctx.globalAlpha = 1;
      }
    };

    resize();
    mapCheckpoints();
    window.addEventListener('resize', resize);
    const ro = new ResizeObserver(mapCheckpoints);
    ro.observe(document.body);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`App${retroMode ? ' retro' : ''}`}>
      <canvas ref={glRef} className="gl-canvas" aria-hidden="true" />
      <canvas ref={fieldRef} className="field-canvas" aria-hidden="true" />
      <SoundingLine />
      <canvas ref={dissolveRef} className="dissolve-canvas" aria-hidden="true" />
      <div className="menubar">
        <div className="menubar-l">
          {MENUBAR.map((m) => (
            <div key={m.id} className={`mb-item${menuOpen === m.id ? ' open' : ''}`}>
              <button
                type="button"
                className="mb-title"
                aria-haspopup="menu"
                aria-expanded={menuOpen === m.id}
                onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)}
                onPointerEnter={() => {
                  if (menuOpen && menuOpen !== m.id) setMenuOpen(m.id);
                }}
              >
                {m.label}
              </button>
              {menuOpen === m.id && (
                <div className="mb-menu">
                  {m.items.map((it, i) =>
                    it.sep ? (
                      <div key={i} className="mb-sep" />
                    ) : (
                      <button
                        key={i}
                        type="button"
                        className={`mb-mi${it.disabled ? ' disabled' : ''}`}
                        disabled={it.disabled}
                        onClick={() => runMenu(it.action)}
                      >
                        <span>{it.label}</span>
                        {it.key && <span className="mb-key">{it.key}</span>}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="menubar-r">
          <button
            type="button"
            className="mb-year"
            onClick={() => setAlertMsg('Time is the scrollbar here.\n1991 at the surface — 2026 in the deep.')}
          >
            <span ref={yearRef}>1991</span>
          </button>
        </div>
      </div>
      <div className="desktop-icons">
        <button type="button" className="dicon" onDoubleClick={() => goTo('#about')} title="double-click to open">
          <span className="dicon-art art-hd" aria-hidden="true" />
          <span className="dicon-label">Macintosh HD</span>
        </button>
        <button type="button" className="dicon" onDoubleClick={() => goTo('#works')} title="double-click to open">
          <span className="dicon-art art-folder" aria-hidden="true" />
          <span className="dicon-label">Projects</span>
        </button>
        <button
          type="button"
          className="dicon"
          onDoubleClick={emptyTrash}
          title="double-click to open"
        >
          <span className="dicon-art art-trash" aria-hidden="true" />
          <span className="dicon-label">Trash</span>
        </button>
      </div>
      {consoleOpen && <ConsoleWindow onClose={() => setConsoleOpen(false)} onGo={goTo} />}
      {alertMsg && (
        <div className="mac-alert" role="alertdialog">
          <div className="mac-alert-inner">
            <p>{alertMsg}</p>
            <button type="button" className="mac-btn" onClick={() => setAlertMsg(null)} autoFocus>
              OK
            </button>
          </div>
        </div>
      )}
      <div className="noise-overlay" aria-hidden="true" />

      <nav className="topbar">
        <a className="topbar-name" href="#top">Shintaro Matsumoto</a>
        <div className="topbar-links">
          <a href="#about">about</a>
          <a href="#triton">triton-3</a>
          <a href="#uminavi">uminavi</a>
          <a href="#works">works</a>
          <a href="#contact">contact</a>
        </div>
      </nav>

      <aside className="gauge" aria-hidden="true">
        <span ref={gaugeNumRef} className="gauge-num">+32 000 m</span>
        <div ref={gaugeTrackRef} className="gauge-track">
          <div ref={gaugeDotRef} className="gauge-dot" />
        </div>
      </aside>

      {/* ================= hero / +32,000 m ================= */}
      <header id="top" className="zone hero in-view" data-depth="32000">
        <div className="zone-inner">
          <h1 className="hero-name" aria-label="Shintaro Matsumoto">
            <span className="mask"><span className="ri hn-a">Shintaro</span></span>
            <span className="mask"><span className="ri hn-b" style={{ '--rise-delay': '0.16s' }}>matsumoto</span></span>
          </h1>
          <p className="hero-line" data-reveal style={{ '--reveal-delay': '0.34s' }}>
            I build low-cost instruments that make Earth's unseen places{' '}
            <em>observable</em> — from the stratosphere to the floor of a lake.
          </p>
          <div className="retro-hint" data-reveal style={{ '--reveal-delay': '0.55s' }}>
            ▼ scroll to fast-forward 35 years
            <span className="hint-key">&nbsp;&nbsp;·&nbsp;&nbsp;press ` for terminal</span>
          </div>
        </div>
        <div className="scroll-line" aria-hidden="true" />
      </header>

      {/* ================= 01 / about ================= */}
      <section id="about" className="zone" data-depth="22000">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>01</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri">About <em>me</em></span></h2>
          <p className="lead-line" data-reveal style={{ '--reveal-delay': '0.1s' }}>
            I'm Shintaro — an engineering student who builds observation hardware,
            and the software that keeps it honest. This page descends the way my
            work does: sky first, then water.
          </p>
          <div className="about-split">
            <div className="facts">
              {FACTS.map(([k, v], i) => (
                <div key={k} className="fact-row" data-reveal style={{ '--reveal-delay': `${i * 0.05}s` }}>
                  <span className="fact-k">{k}</span>
                  <span className="fact-v">{v}</span>
                </div>
              ))}
            </div>
            <MacWindow title="terminal — about.sh" term>
              <Terminal onGo={goTo} />
            </MacWindow>
          </div>
        </div>
      </section>

      {/* ================= 02 / origins ================= */}
      <section id="origins" className="zone" data-depth="14000">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>02</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri">It started <em>above the weather</em></span></h2>
          <p className="lead-line" data-reveal style={{ '--reveal-delay': '0.1s' }}>
            A place no one measures is a place no one understands. I learned that at
            thirty kilometres, watching my first instrument fall back to Earth.
          </p>
          <div className="origin-grid">
            <article className="origin">
              <span className="origin-rule rule-draw" />
              <span className="origin-idx" data-reveal>a</span>
              <h3 data-reveal>A sensor at the edge of space</h3>
              <p data-reveal style={{ '--reveal-delay': '0.08s' }}>
                In junior high I led a team that flew a payload to the stratosphere on a
                weather balloon — light, temperature, pressure, position. Designing
                electronics that survive −60 °C taught me that the environment, not the
                datasheet, writes the spec.
              </p>
              <div className="origin-role" data-reveal>team lead · payload design</div>
            </article>
            <article className="origin">
              <span className="origin-rule rule-draw" style={{ '--reveal-delay': '0.1s' }} />
              <span className="origin-idx" data-reveal style={{ '--reveal-delay': '0.1s' }}>b</span>
              <h3 data-reveal style={{ '--reveal-delay': '0.1s' }}>Where are you, without GPS?</h3>
              <p data-reveal style={{ '--reveal-delay': '0.18s' }}>
                On the IWATO micro-satellite I evaluated onboard sensors and worked on
                ground operations. Inertial testing planted the question that still
                drives everything I build: how does a machine know where it is when no
                signal can reach it?
              </p>
              <div className="origin-role" data-reveal style={{ '--reveal-delay': '0.18s' }}>sensor evaluation · ground operations</div>
            </article>
            <article className="origin">
              <span className="origin-rule rule-draw" style={{ '--reveal-delay': '0.2s' }} />
              <span className="origin-idx" data-reveal style={{ '--reveal-delay': '0.2s' }}>c</span>
              <h3 data-reveal style={{ '--reveal-delay': '0.2s' }}>The bottleneck isn't the AI</h3>
              <p data-reveal style={{ '--reveal-delay': '0.28s' }}>
                I trained detection models to find coral reefs in aerial imagery. The
                models worked; the data didn't exist. The planet is drastically
                under-observed — so I stopped waiting for datasets and started building
                the instruments.
              </p>
              <div className="origin-role" data-reveal style={{ '--reveal-delay': '0.28s' }}>machine learning · remote sensing</div>
            </article>
          </div>
        </div>
      </section>

      {/* ================= 0 m ================= */}
      <Waterline />

      {/* ================= manifesto ================= */}
      <section className="zone manifesto" data-depth="-8">
        <div className="zone-inner">
          <div className="manifesto-kicker" data-reveal>manifesto</div>
          <p className="manifesto-big" data-reveal style={{ '--reveal-delay': '0.1s' }}>
            Observation should not be a <em>privilege</em>. The instruments that explain
            our changing planet must be cheap enough to lose, open enough to repair, and
            simple enough to hand to a child.
          </p>
          <div className="manifesto-cols">
            <p data-reveal>
              Lakes are losing their seasonal overturn. Fish are moving with the warming
              water. The evidence lives metres below the surface — where a commercial
              survey robot costs as much as a house, so almost nobody looks.
            </p>
            <p data-reveal style={{ '--reveal-delay': '0.12s' }}>
              I design underwater and atmospheric observation systems at roughly
              one-hundredth of commercial cost — hardware, firmware, radio protocols, and
              the analysis pipelines that turn raw sensor rows into decisions.
            </p>
            <p data-reveal style={{ '--reveal-delay': '0.24s' }}>
              Everything ships open: CAD, calibration procedures, failure logs included.
              Democratizing observation means strangers can rebuild, repair, and
              out-improve my work. That is success, not a threat.
            </p>
          </div>
          <div className="manifesto-jp" data-reveal>観測技術の民主化 — 誰もが、地球を測れるように。</div>
        </div>
      </section>

      {/* ================= 03 / triton-3 ================= */}
      <section id="triton" className="zone" data-depth="-32">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>03</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri">A deep lake, <em>on a student budget</em></span></h2>
          <div className="split">
            <div className="prose">
              <p data-reveal>
                <strong>Triton-3</strong> is an autonomous underwater profiler built with
                my team at AquaWiz. It dives by breathing — a CO₂-charged bladder and two
                valves instead of thrusters — so a mission spends milliwatts, not
                propellers, and there is almost nothing to break.
              </p>
              <p data-reveal style={{ '--reveal-delay': '0.12s' }}>
                The firmware is a non-blocking state machine: every mode change passes
                through a safe idle gate, the two valves are interlocked so they can
                never open together, and any anomaly makes the vehicle float home. In
                open water nobody gets to press reset — <strong>the failure modes are
                designed first</strong>.
              </p>
              <p data-reveal style={{ '--reveal-delay': '0.24s' }}>
                Its radio protocol was specified frame by frame and hardened with
                adversarial tests before it ever touched open water. Pressure-tested at
                JAMSTEC, proven at Osezaki and Lake Biwa — 89 metres down, twelve hours
                of continuous data.
              </p>
            </div>
            <MacWindow title="biwa — bathymetry.map">
              <ContourField light caption="generative bathymetry — the basin, breathing" />
            </MacWindow>
          </div>
          <div className="specs-strip">
            <div className="spec" data-reveal>
              <div className="spec-v">89 <span className="unit">m</span></div>
              <span className="spec-k">deepest sounding, Lake Biwa</span>
            </div>
            <div className="spec" data-reveal style={{ '--reveal-delay': '0.07s' }}>
              <div className="spec-v">100 <span className="unit">m</span></div>
              <span className="spec-k">design depth</span>
            </div>
            <div className="spec" data-reveal style={{ '--reveal-delay': '0.14s' }}>
              <div className="spec-v">12 <span className="unit">h</span></div>
              <span className="spec-k">continuous logging</span>
            </div>
            <div className="spec" data-reveal style={{ '--reveal-delay': '0.21s' }}>
              {/* no tilde: Syne renders "~" like a minus sign */}
              <div className="spec-v">1/100</div>
              <span className="spec-k">the cost of a commercial AUV</span>
            </div>
            <div className="spec" data-reveal style={{ '--reveal-delay': '0.28s' }}>
              <div className="spec-v">CO₂</div>
              <span className="spec-k">buoyancy, no moving thrust</span>
            </div>
            <div className="spec" data-reveal style={{ '--reveal-delay': '0.35s' }}>
              <div className="spec-v">30+</div>
              <span className="spec-k">river dives — Triton-Lite, for education</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 04 / uminavi ================= */}
      <section id="uminavi" className="zone" data-depth="-55">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>04</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri">Lost, <em>on purpose</em></span></h2>
          <div className="split rev">
            <MacWindow title="uminavi — position.log">
              <ContourField light path caption="estimated trajectory — position without gps" />
            </MacWindow>
            <div className="prose">
              <p data-reveal>
                Underwater, GPS dies at the surface. Every measurement my drones took was
                an answer missing its question: <em>where?</em> Acoustic positioning
                solves this for roughly the price of a car — which is to say, for almost
                nobody.
              </p>
              <p data-reveal style={{ '--reveal-delay': '0.12s' }}>
                UmiNavi is my answer: visual-inertial odometry fused with a pressure
                sensor — a camera, an inertial unit, and physics — estimating a vehicle's
                position and attitude with hardware anyone can buy. Not just code: the
                sensor mounts, print files and calibration procedures ship with it, so
                any lab can reproduce the result.
              </p>
              <p data-reveal style={{ '--reveal-delay': '0.24s' }}>
                It exists so that a fish census, a dam inspection, or a student's first
                dive can say not only what it saw — but exactly where.
              </p>
              <div className="credit" data-reveal style={{ '--reveal-delay': '0.3s' }}>
                <b>Mitou Junior 2025</b> — certified Super Creator
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 05 / perception ================= */}
      <section className="zone" data-depth="-68">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>05</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri">Teaching machines <em>to count fish</em></span></h2>
          <div className="prose">
            <p data-reveal>
              Observation without analysis is just wet storage. I built a pipeline that
              watches underwater video so humans don't have to: a detector finds the
              fish, a Kalman filter follows them between frames, and a large multimodal
              model settles what species just swam past.
            </p>
            <p data-reveal style={{ '--reveal-delay': '0.12s' }}>
              Now it is being distilled to run on a Raspberry Pi inside the drone itself —
              so the census happens at depth, in real time, on hardware that costs less
              than the fish finder it replaces.
            </p>
          </div>
          <div className="flow-line" data-reveal style={{ '--reveal-delay': '0.2s' }}>
            <span>video</span><span className="dash">——</span>
            <span>detect</span><span className="dash">——</span>
            <span>track</span><span className="dash">——</span>
            <span>classify</span><span className="dash">——</span>
            <span>count</span>
          </div>
        </div>
      </section>

      {/* ================= 06 / works ================= */}
      <section id="works" className="zone" data-depth="-100">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>06</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri">Selected <em>works</em></span></h2>
          <p className="lead-line" data-reveal style={{ '--reveal-delay': '0.1s' }}>
            Between dives I build tools — each one small enough to finish,
            real enough to be used.
          </p>
          <div className="works-table">
            {WORKS_ROWS.map((row, i) => {
              const Tag = row.href ? 'a' : 'div';
              return (
                <Tag
                  key={row.idx}
                  className="works-row"
                  data-reveal
                  style={{ '--reveal-delay': `${i * 0.05}s` }}
                  {...(row.href
                    ? { href: row.href, target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  <span className="works-idx">{row.idx}</span>
                  <span className="works-name">
                    {row.name}
                    {row.href && <span className="works-ext" aria-hidden="true">↗</span>}
                  </span>
                  <span className="works-desc">{row.desc}</span>
                  <span className="works-stack">{row.stack}</span>
                </Tag>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 07 / recognition ================= */}
      <section className="zone" data-depth="-110">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>07</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri"><em>Recognition</em></span></h2>
          <div className="record-list">
            {RECORD_ROWS.map((r, i) => (
              <div key={i} className="record-row" data-reveal style={{ '--reveal-delay': `${i * 0.04}s` }}>
                <span className="record-year">{r.year}</span>
                <span className="record-title">{r.title}</span>
                <span className="record-rank">{r.rank}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 08 / approach ================= */}
      <section className="zone" data-depth="-115">
        <div className="zone-inner">
          <div className="sec-head">
            <span className="sec-idx" data-reveal>08</span>
            <span className="sec-rule rule-draw" />
          </div>
          <h2 className="sec-title"><span className="ri"><em>Approach</em></span></h2>
          <div className="principles">
            <div className="principle" data-reveal>
              <span className="principle-no">i</span>
              <h3>Design the failure first.</h3>
              <p>
                In water there is no reset button. Interlocks, safe gates, lockouts —
                the most elegant part of my firmware is everything that happens when
                things go wrong.
              </p>
            </div>
            <div className="principle" data-reveal style={{ '--reveal-delay': '0.12s' }}>
              <span className="principle-no">ii</span>
              <h3>Data must outlive the mission.</h3>
              <p>
                A measurement that can't be found, trusted, and re-analyzed later never
                happened. Logs, checksums, timestamps — the boring parts are the product.
              </p>
            </div>
            <div className="principle" data-reveal style={{ '--reveal-delay': '0.24s' }}>
              <span className="principle-no">iii</span>
              <h3>Open enough for strangers to repair.</h3>
              <p>
                CAD files, calibration steps, protocol specs — if you can't rebuild my
                instrument without me, I haven't finished designing it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= −120 m / surfacing ================= */}
      <footer id="contact" className="zone outro" data-depth="-120">
        <div className="zone-inner">
          <button
            type="button"
            className="to-surface"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            return to surface ↑
          </button>
          <h2 className="outro-big">
            <span className="ob-a mask"><span className="ri">Surfacing</span></span>
            <span className="ob-b" data-reveal style={{ '--reveal-delay': '0.15s' }}>
              Have a lake, a question, or a machine that should exist? Write to me.
            </span>
          </h2>
          <div className="foot-links" data-reveal style={{ '--reveal-delay': '0.25s' }}>
            <a href="mailto:shintaro.soru@gmail.com">Email</a>
            <a href="https://github.com/m-shintaro" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://x.com/xyzmiku" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://aquawiz.org" target="_blank" rel="noopener noreferrer">AquaWiz.org</a>
          </div>
          <div className="foot-bottom">
            <span className="fb-c">© {new Date().getFullYear()} Shintaro Matsumoto</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
