# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a GitHub Pages personal portfolio website for Shintaro Matsumoto (Keio Univ / AquaWiz), presenting his work in underwater robotics, observation systems, and ML. The project consists of:

- **Root directory**: GitHub Pages configuration, `aboutme.md` (source-of-truth bio, Japanese), `Reference_materials/` (project repos used as factual references for site copy)
- **m-shinatro/**: The main React application directory with the portfolio website

## Development Commands

All development commands should be run from the `m-shinatro/` directory:

```bash
cd m-shinatro
```

### Core Commands
- `npm start` - Runs the development server at http://localhost:3000
- `npm run build` - Builds the production-ready application
- `npm test` - Runs the test suite in interactive watch mode
- `npm run deploy` - Deploys to GitHub Pages (runs predeploy build automatically)

### Deployment
The site is configured for GitHub Pages deployment with:
- Homepage: https://m-shintaro.github.io
- Deploy command automatically builds and deploys to gh-pages branch

## Design Concept — "SOUNDING VII — a working System 7"

The entire site is one continuous vertical descent from the stratosphere (+32,000 m) to the lakebed (−120 m). Scroll position maps to altitude/depth; a living, organic graphic system derives from that number. V4 is radically reduced: ONE light source, ONE thread, luminous color, huge confident type. Lesson learned in V3→V4 (owner: "全然だめ"): piling on art tricks (collage shards, title echoes, section tilts, fragmented hero) reads as clutter, not art — those were all REMOVED. Modernity = reduction + one strong idea executed perfectly.

Content rule: this is a SELF-INTRODUCTION site first (owner feedback, 2026-07: "本当に自己紹介"). The `#about` section near the top (intro line + `.facts` rows: now / team / building / recognition / toolbox / elsewhere) is the core; projects support it. Don't add monument/shrine sections celebrating single metrics — the −89 m monument was removed for this reason (the 89 m spec in the Triton grid is fine).

V4 layer:
- **The sun**: the shader carries one light source (`uSun`/`uSunR`/`uSunI`/`uSnell`) — a sharp glowing coin in the stratosphere, a soft glare at the surface, a noise-wobbled Snell's window underwater, gone by ~−90 m. Its intensity is modulated by background luminance so it never washes out text in bright zones.
- **Luminous palette**: `ATMO_STOPS` uses high-chroma stops (indigo/violet space → electric blue → near-white surface → emerald-teal → blue-black abyss). Avoid muddy grey-teals.
- **Painted atmosphere**: the shader posterizes its noise into paint planes with luminous seams (`uPaint`).
- **Display type = Syne** (`--disp`, 700/800) for hero/titles/works names/spec numerals — NOTE: Syne is very wide; size one-line displays conservatively (~9vw for 8-char words) or they overflow.
- **Mask-rise reveals**: titles and hero lines are wrapped in `.mask > .ri` (or `.sec-title > .ri`) and rise from `translateY(114%)` on `.in-view` with `--rise-delay` stagger.
- **Fault lines**: each `ContourField` basin is broken along a diagonal fault, the two halves displaced and reassembled.
- **Boot → Dive** (V6, the signature memorable move): the page OPENS as a 1991 System 7 desktop — warm-gray dither (`.dissolve-canvas`), a real menu bar (`.menubar`: ◆ File Edit View Special, clock at right). As you scroll the first ~0.85 viewport, the old OS dissolves cell-by-cell (classic Mac dissolve, `vHash`-ordered 16px cells) revealing the luminous shader world; `--bg`/`--ink` cross-fade from 1-bit paper/black to the atmosphere; the menu-bar clock morphs 1991 → 2026 (`yearRef`); the modern topbar cross-fades in via `--newp`. Scrolling back up reassembles the old OS. This old→new arc is the point — protect it.
- The JP phrase 「未知を、観測可能にする。」 was removed everywhere at the owner's request.
- **The desktop is FUNCTIONAL (V7)**: the menu bar has real System 7 dropdowns (`MENUBAR` data + `runMenu`) — ◆/About This System, File/Open Terminal · aquawiz.org · Quit(joke), Edit/Copy Motto, View/section navigation, Special/Dive · Empty Trash(joke) · Restart. Desktop icons (Macintosh HD → about, Projects → works, Trash → alert) open on DOUBLE-click. System 7 alert dialogs via `alertMsg` state (`.mac-alert`, double-ring OK button).
- **The terminal is a real shell** (`termExec`): after the auto-typed intro, both terminals accept input — help/whoami/ls/cat/open <place>/dive/depth/pwd/date/uptime/echo/sudo/clear/exit; unknown → `zsh: command not found`. `open` navigates sections; `dive` scrolls to the waterline.
- **Hidden command**: pressing ` anywhere toggles a draggable floating console (`ConsoleWindow`, drag via title bar pointer capture); Esc closes console/menus/alerts. Also reachable via File → Open Terminal. The hero hint line advertises it quietly.
- **Easter eggs** (shared state in the module-level `EGGS` object): Konami code (or terminal `1991`) toggles SYSTEM 1991 — the engine grayscales the whole world (atmosphere, shader uniforms, accent/glow vars, figure dots, aurora muted). Undocumented terminal commands: whale (ASCII art) · fish (temporarily releases the boids school at any depth via `EGGS.fishUntil`) · biwa · rm -rf / (refused) · hello · coffee · credits · konami (hint). Emptying the Trash repeatedly escalates through three messages (`trashRef`); clicking the menu-bar year shows the time-is-a-scrollbar line. Keep eggs playful and in-world; never let them break legibility.
- **System 7 chrome** (`MacWindow`, V5 — user-requested retro-computing layer): classic Mac windows (pinstriped title bar, close/zoom boxes, 2px border, hard offset shadow, DotGothic16 titles) frame the modern generative content — the bathymetry figures render as paper documents (`ContourField light`), and the About section holds a typing `Terminal` (`whoami` / `ls ~/projects` / `cat ~/.motto` / `uptime`, blinking caret). Retro chrome × generative graphics × CLI is deliberate and approved; the V1 ban was on FAKE telemetry cosplay, not on crafted retro-computing UI.
- The sounding line is now a bare meandering hairline — the red traveling lead/iris was removed (owner: 「スクロールと一緒に降りてくる赤いやつ必要ない」).
- **The waterline is a user favourite** (「水面のやつは気に入ってる」) — do not redesign it without being asked.

- **WebGL fluid field** (`.gl-canvas`, raw WebGL in `App.js`, no three.js): a domain-warped fbm noise shader renders the atmosphere. Per frame the CPU interpolates `ATMO_STOPS` (each stop has `bg`/`tint`/`hi`/`ink` colors keyed by depth) and feeds them as uniforms. Depth-keyed optical phenomena: aurora curtains above ~+3,000 m (`uAurora`), caustic light webbing between ~−2 m and −18 m (`uCaustic`), god rays −3 m to −45 m (`uRay`), and a structure-scale term (`uScale`) that makes deep-water currents larger and slower. If WebGL is unavailable the shader is skipped and the flat `--bg` body color shows.
- **The sounding line** (`SoundingLine`): a noise-meandering hairline SVG path spanning the whole document, drawn in by scroll progress — the site title made literal. Rebuilt on body resize; guarded for environments without `getTotalLength` (jsdom). (The red traveling lead was removed at the owner's request — keep it a bare line.)
- **Atmosphere → CSS vars**: the same loop writes `--bg`, `--ink`, `--line`, `--line-soft` every frame. Dark space → bright daylight aqua at 0 m (ink flips dark) → abyssal near-black.
- **Depth engine**: sections carry `data-depth` checkpoints; scroll is piecewise-linearly interpolated between section centers with exponential easing.
- **Depth gauge** (`.gauge`): the ONE remaining instrument — a hairline track, a progress dot, and a small vertical metre count, difference-blended. Deliberately minimal.
- **Generative bathymetry** (`ContourField`): 2D-canvas organic contour rings that breathe via value noise, with stacked translucent fills so the basin reads as tonal depth; `path` variant adds a descending spiral trajectory (UmiNavi). `Waterline` draws a hand-feeling organic threshold line at 0 m with pulsing sun-glitter glints.
- **Particles** (`.field-canvas`): stars above ~2,000 m, marine snow below −2 m, a boids fish school (silhouettes, ~−25 m to −70 m), bioluminescent cyan below −60 m — all subtle.

**IMPORTANT — design taste rules (owner feedback, 2026-07):** No fake-instrument cosplay. Do NOT add: fabricated coordinates/log numbers/boot sequences, custom cursors or click effects, fake telemetry readouts (pressure/GPS status), or cheap schematic line-art diagrams. These read as "AI-generated" kitsch. Prefer: sentence-case editorial typography, serif-italic/sans contrast, hairlines, generous space, and organic generative graphics. Simple structure, complex material.

Content is English-first with Japanese accents (vertical hero text, footer bookend). Facts (89 m Lake Biwa record, 12 h logging, Mitou Junior 2025 Super Creator, awards list) come from `aboutme.md` and `Reference_materials/` — keep numbers consistent with those sources when editing copy.

## Architecture

### React Application Structure
- **Single-file SPA**: all content and logic in `src/App.js`; all styling in `src/App.css`
- **No animation libraries**: one main `requestAnimationFrame` loop drives atmosphere, gauge, GL uniforms and particles; `ContourField`/`Waterline` run their own rAF gated by IntersectionObserver visibility
- **Reveal system**: `IntersectionObserver` adds `.in-view` to `.zone` sections; children opt in via `data-reveal` with staggered `--reveal-delay` inline styles; hairlines draw in via `.rule-draw`
- **Checkpoint remapping**: a `ResizeObserver` on `document.body` re-measures `data-depth` checkpoints when layout height changes

### Typography (loaded via Google Fonts in `public/index.html`)
- **Syne** (700/800 — all display: hero, section titles, works names, spec numerals; very wide font, size carefully)
- **Archivo** (body text)
- **Instrument Serif** (italic editorial voice, hero surname)
- **JetBrains Mono** (small labels/data only)
- **Shippori Mincho** (Japanese accents)

### Testing
`src/App.test.js` mocks `matchMedia`, `IntersectionObserver`, `ResizeObserver`, and canvas `getContext` (jsdom lacks them). Keep those mocks when adding tests.

## Development Notes

- **Beauty over UX is intentional** — this site optimizes for visual impact (award-style). `prefers-reduced-motion` is still respected (animations disabled, reveals instant).
- **Horizontal overflow**: wide decorative elements (ghost text, bands) rely on `overflow-x: hidden` on `html`/`body`; don't remove it.
- **Color variables mutate every frame** — never hardcode a background/text color in a section; use `var(--bg)` / `rgb(var(--ink))` / `var(--line)` so the depth transition stays coherent. Accents: `--accent` (signal red) and `--glow` (bioluminescent cyan) are constant.
- **Preview**: `.claude/launch.json` defines the `portfolio` dev server (port 3000, `BROWSER=none`).
