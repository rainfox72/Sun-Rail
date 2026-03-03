# Sun Rail

3D interplanetary train simulation: Vite 7 + React 19 + React Three Fiber 9 + Zustand 5 + Tailwind 4 + TypeScript 5.9

## Commands

```bash
npm run dev          # Vite dev server on :5173
npx tsc --noEmit     # Type check (zero errors policy)
```

## Architecture

- `src/simulation/` — Pure TS orbital mechanics (Kepler solver, Bezier transfers). No React deps.
- `src/store/gameStore.ts` — Zustand: sim time, game state, train, auto mode
- `src/scene/` — R3F components (3D rendering, reads store via getState() in useFrame)
- `src/hud/` — React+Tailwind 2D overlay (reads store via selectors)
- `src/audio/` — Web Audio synthesizer, no external sound files
- `public/textures/` — NASA planet textures (2048x1024 JPEGs, CC BY 4.0)

## Key Patterns

- **Simulation is pure math** — orbits.ts, transfer.ts have zero framework deps
- **Store drives everything** — useFrame calls tick() which advances sim time
- **3D components**: `useGameStore.getState()` inside useFrame (avoids React re-renders)
- **HUD components**: `useGameStore((s) => s.property)` selectors (React subscriptions)
- **Train position**: set on parent `<group>` OUTSIDE `<Billboard>` — never set position inside Billboard
- **Planet textures**: use `emissiveMap={texture}` for self-illumination (not dependent on scene lighting)
- **Auto mode**: sequential Mercury<>Neptune ping-pong with 2-day station dwell

## Constants

- `AU_SCALE = 5` (1 AU = 5 scene units, Neptune at ~150 units)
- `SECONDS_PER_SIM_DAY = 1` (1 real second = 1 sim day at 1x)
- Keplerian orbital elements in PLANETS array (J2000 epoch)
- `TIME_SPEEDS: [1, 50, 100, 1000]`
- Camera: far=500, maxDistance=250 (needed for outer planets)

## Gotchas

- Billboard from drei rotates children to face camera — setting position on a mesh inside Billboard places it at a rotated world position. Always use a parent group for positioning.
- `autoLineIndex` in auto mode represents the NEXT DESTINATION, not current location. Must start at 1 (Venus), not 0 (Mercury), or fromIdx===toIdx and nothing launches.
- Textures with only `emissive` (no `emissiveMap`) show a flat color tint, not the texture detail.
