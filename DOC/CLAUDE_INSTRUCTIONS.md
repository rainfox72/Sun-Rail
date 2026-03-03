# Sun Rail — Claude Instructions

## Project Overview

Sun Rail is a 3D interplanetary train simulation built with Vite + React + React Three Fiber + Tailwind + TypeScript. The player launches trains between inner solar system planets along Hohmann transfer orbits.

## Architecture

- `src/simulation/` — Pure TypeScript orbital mechanics (no React dependency). Testable independently.
- `src/store/gameStore.ts` — Zustand store: single source of truth for sim time, game state, train state.
- `src/scene/` — React Three Fiber components: 3D rendering only, reads from store.
- `src/hud/` — React + Tailwind: 2D overlay, reads from store, dispatches actions.
- `src/audio/` — Web Audio API synthesizer. No external sound files.

## Key Patterns

- **Simulation is pure math** — `orbits.ts`, `transfer.ts`, `collision.ts` have zero framework dependencies
- **Store drives everything** — `useFrame` calls `tick()` which advances time and updates train
- **3D components subscribe to store** — via `useGameStore.getState()` inside `useFrame` (no re-renders)
- **HUD components use React subscriptions** — via `useGameStore((s) => s.property)` selectors

## Development

```bash
npm run dev          # Start Vite dev server
npx tsc -b --noEmit  # Type check
```

## Constants to Tune

- `src/simulation/constants.ts`: Planet radii, orbital periods, station radii, display sizes
- `AU_SCALE`: Controls visual spacing (currently 5 = 1 AU maps to 5 scene units)
- `SECONDS_PER_SIM_DAY`: Real-time speed at 1x (currently 1 second = 1 sim day)
- Station radius per planet: Controls difficulty (larger = easier)

## Color Palette

All colors defined in `constants.ts` COLORS object and `src/index.css` @theme block.
