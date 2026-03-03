# Sun Rail — Task Tracker

## Phase 1: Project Scaffold + Core Simulation — COMPLETE

- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies (R3F, drei, postprocessing, zustand, tailwind, howler types)
- [x] Configure Tailwind CSS 4 with @tailwindcss/vite
- [x] Create directory structure (simulation, store, scene, hud, audio)
- [x] Implement simulation/constants.ts — planet data, AU scale, color palette
- [x] Implement simulation/orbits.ts — circular orbit positions, track generation
- [x] Implement simulation/transfer.ts — Hohmann arc computation, position along arc
- [x] Implement simulation/collision.ts — station radius check, gravity proximity
- [x] Implement store/gameStore.ts — Zustand state with tick, launch, reset

## Phase 2: 3D Scene (Orrery) — COMPLETE

- [x] Canvas setup with dark background and bloom postprocessing
- [x] Sun component with emissive glow
- [x] Planet components with orbital motion, labels, station radius indicators
- [x] Orbit track rings (cyan wireframe with transparency)
- [x] Star field background
- [x] OrbitControls with constraints

## Phase 3: Train + Transfer Arcs — COMPLETE

- [x] Ghost preview arc (dashed cyan) with predicted arrival position
- [x] Active transfer arc (solid gold) during transit
- [x] Train entity (gold octahedron) with particle trail
- [x] Launch → transit → arrival/miss game flow

## Phase 4: HUD Overlay — COMPLETE

- [x] Route selector (origin/destination dropdowns)
- [x] Launch button with pulse animation
- [x] Chronometer (SVG circular dial with planet dots)
- [x] Fuel/Momentum gauge (vertical bar, gravity proximity)
- [x] Timetable (upcoming launch windows)
- [x] Time compression slider (1x / 100x / 1000x)
- [x] Event splash ("ARRIVED" / "MISSED CONNECTION")
- [x] "SUN RAIL" title

## Phase 5: Audio — COMPLETE

- [x] Web Audio API synthesizer (no external sound files needed)
- [x] Ambient space drone
- [x] Launch whoosh (rising tone + noise burst)
- [x] Arrival chime (ascending C-E-G)
- [x] Miss klaxon (descending A-F-C)
- [x] UI click blip
- [x] Audio init on first user interaction

## Phase 6: Auto Mode — COMPLETE

- [x] Two-pass window finder (coarse 5-day scan + fine 0.5-day refinement)
- [x] Auto-launch at optimal window
- [x] Auto-reset after arrival/miss
- [x] Route cycling through all inner planet pairs
- [x] UI hides route selector in auto mode

## Phase 7: Polish — COMPLETE

- [x] Camera position tuned for full orrery visibility
- [x] Ghost arc visible in idle state (not just prelaunch)
- [x] Clean TypeScript build (zero errors)
- [x] Zero console errors at runtime

## Phase 8: v2 Enhancements — COMPLETE

- [x] Add 50x time compression speed (TIME_SPEEDS = [1, 50, 100, 1000])
- [x] Expand PlanetData to Keplerian orbital elements (semiMajorAxis, eccentricity, inclination, etc.)
- [x] Add all 8 planets (Mercury through Neptune) with real J2000 orbital parameters
- [x] Implement Keplerian orbit solver (Newton-Raphson Kepler equation, 3D rotation matrices)
- [x] Replace Hohmann arcs with adaptive cubic Bezier transfer curves (train always arrives)
- [x] Remove "missed" game state — pure relaxing simulation
- [x] Rewrite auto mode as sequential train line (Mercury→Venus→...→Neptune→...→Mercury)
- [x] Add 2-second station dwell time in auto mode
- [x] Replace gold octahedron with classic train silhouette billboard sprite
- [x] Add NASA planet texture support (TextureLoader with color fallback)
- [x] Generate placeholder texture files for all planets + Sun
- [x] Update orbit tracks to 3D elliptical paths
- [x] Enable camera pan + extend zoom range to 250 (Neptune visible)
- [x] Update camera far plane to 500
- [x] Update Chronometer to log-scale for 8 planets
- [x] Rewrite Timetable as sequential schedule display (auto mode only)
- [x] Simplify EventSplash (arrival only, no miss)
- [x] Update RouteSelector for 8 planets
- [x] Remove playMiss from AudioManager
- [x] Remove checkArrival from collision module
- [x] Clean TypeScript build (zero errors)
- [x] Zero console errors at runtime
- [x] Full visual verification — all 8 planets visible with zoom/pan
