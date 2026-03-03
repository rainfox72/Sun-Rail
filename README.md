# Sun Rail

A high-style 3D simulation of an interplanetary train system spanning the entire solar system. Built with React Three Fiber, Zustand, and Tailwind CSS.

## Status

**v1 (Phases 1-7): COMPLETE** — Inner solar system with timing-based gameplay.
**v2 (Phase 8): COMPLETE** — Full 8-planet solar system, Keplerian orbits, always-arrive Bezier routes, sequential auto mode.

## Features

- **Full Solar System Orrery**: Sun + all 8 planets (Mercury through Neptune) with Keplerian elliptical orbits, 3D inclination, and glowing cyan wireframe tracks
- **Adaptive Bezier Train Routes**: Launch trains along smooth cubic Bezier curves that dynamically track the target planet — trains always arrive
- **All-Planet Routes**: Select any origin → destination pair from 8 planets
- **Ghost Preview Arc**: See the projected Bezier transfer path and target arrival position before launching
- **Sequential Auto Mode**: Trains run as a real rail line — Mercury → Venus → Earth → Mars → Jupiter → Saturn → Uranus → Neptune and back, with station dwell times
- **Tactical HUD**: Chronometer (log-scale 8-planet dial), momentum gauge, schedule display, route selector
- **Time Compression**: 1x / 50x / 100x / 1000x speed control
- **Classic Train Sprite**: 2D billboard locomotive silhouette that always faces the camera with gold particle trail
- **NASA Planet Textures**: Texture-mapped planet spheres (with color fallback)
- **3D Keplerian Orbits**: Real orbital elements (eccentricity, inclination, ascending node) with Newton-Raphson Kepler equation solver
- **Zoom & Pan Camera**: Orbit controls with pan enabled — zoom from inner planets to Neptune's orbit
- **Synthesized Audio**: Web Audio API sound effects (launch whoosh, arrival chime, ambient drone)
- **Bloom Postprocessing**: Neon-on-black aesthetic with UnrealBloom

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| 3D Rendering | Three.js via React Three Fiber 9 |
| UI Framework | React 19 + TypeScript 5.9 |
| State Management | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Postprocessing | @react-three/postprocessing (Bloom) |
| Audio | Web Audio API (synthesized) |
| Build Tool | Vite 7 |

## Color Palette

- Background: `#020205` (deep space)
- Cyan: `#00f3ff` (orbits, UI borders, ghost arcs)
- Gold: `#ffc107` (train, launch button, active elements)
- Success: `#00e676` (arrival splash)
- Planet colors: Mercury `#a0a0a0`, Venus `#e8a735`, Earth `#4fc3f7`, Mars `#d4603a`, Jupiter `#c88b3a`, Saturn `#e0c068`, Uranus `#7de3f4`, Neptune `#3f51b5`

## How to Play

1. Select origin and destination planets from the dropdowns (all 8 planets available)
2. Watch the ghost preview arc and the predicted arrival position
3. Speed up time with the compression controls (1x / 50x / 100x / 1000x)
4. Click **LAUNCH** — the train will follow a Bezier curve and always arrive
5. Zoom out to see outer planets, pan to explore the solar system

Or toggle **AUTO MODE** to watch the train run as a sequential rail line through the entire solar system.

## Architecture

```
src/
  simulation/    Pure TS — Keplerian orbits, Bezier transfers, proximity detection
  store/         Zustand game state with sequential auto mode
  scene/         React Three Fiber 3D components (planets, train, arcs)
  hud/           React + Tailwind 2D overlay (route selector, schedule, gauges)
  audio/         Web Audio API synthesizer
```
