# Sun Rail v2 Enhancements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Sun Rail from a 4-planet timing game into a full 8-planet relaxing simulation with Keplerian orbits, adaptive Bezier train routes, NASA textures, and sequential auto mode.

**Architecture:** Simulation layer (pure TS) changes first, then store, then 3D scene, then HUD. Each layer only depends on layers below it.

**Tech Stack:** Vite 7, React 19, React Three Fiber 9, Three.js 0.183, Zustand 5, Tailwind CSS 4, TypeScript 5.9

---

## Task 1: Add 50x Speed Option

**Files:**
- Modify: `src/simulation/constants.ts:82-83`
- Modify: `src/hud/TimeSlider.tsx` (no code changes needed — already reads TIME_SPEEDS dynamically)

**Step 1: Update TIME_SPEEDS in constants.ts**

In `src/simulation/constants.ts`, change line 82:

```ts
// OLD
export const TIME_SPEEDS = [1, 100, 1000] as const;
// NEW
export const TIME_SPEEDS = [1, 50, 100, 1000] as const;
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors. TimeSlider.tsx already maps over TIME_SPEEDS dynamically, so no further changes needed.

**Step 3: Commit**

```bash
git add src/simulation/constants.ts
git commit -m "feat: add 50x time compression speed option"
```

---

## Task 2: Expand PlanetData + Add All 8 Planets

**Files:**
- Modify: `src/simulation/constants.ts`

**Step 1: Update PlanetData interface**

Replace the existing `PlanetData` interface with Keplerian orbital elements:

```ts
export interface PlanetData {
  name: string;
  /** Semi-major axis in AU */
  semiMajorAxis: number;
  /** Eccentricity (0 = circle, <1 = ellipse) */
  eccentricity: number;
  /** Inclination in degrees (relative to ecliptic) */
  inclination: number;
  /** Longitude of ascending node in degrees */
  longitudeAscendingNode: number;
  /** Argument of perihelion in degrees */
  argumentOfPerihelion: number;
  /** Mean anomaly at epoch (J2000) in degrees */
  meanAnomalyAtEpoch: number;
  /** Orbital period in Earth days */
  orbitalPeriod: number;
  /** Display color hex */
  color: string;
  /** Visual sphere radius (scene units) */
  displayRadius: number;
  /** Station radius — zone around planet for proximity FX */
  stationRadius: number;
  /** Texture filename in public/textures/ (null = use color only) */
  textureFile: string | null;
}
```

**Step 2: Replace PLANETS array with all 8 planets**

Remove the old 4-planet array. Add all 8 planets with real Keplerian elements (J2000 epoch):

```ts
export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    semiMajorAxis: 0.387,
    eccentricity: 0.2056,
    inclination: 7.005,
    longitudeAscendingNode: 48.331,
    argumentOfPerihelion: 29.124,
    meanAnomalyAtEpoch: 174.796,
    orbitalPeriod: 87.97,
    color: "#a0a0a0",
    displayRadius: 0.10,
    stationRadius: 0.25,
    textureFile: "mercury.jpg",
  },
  {
    name: "Venus",
    semiMajorAxis: 0.723,
    eccentricity: 0.0068,
    inclination: 3.395,
    longitudeAscendingNode: 76.680,
    argumentOfPerihelion: 54.884,
    meanAnomalyAtEpoch: 50.115,
    orbitalPeriod: 224.70,
    color: "#e8a735",
    displayRadius: 0.18,
    stationRadius: 0.35,
    textureFile: "venus.jpg",
  },
  {
    name: "Earth",
    semiMajorAxis: 1.000,
    eccentricity: 0.0167,
    inclination: 0.000,
    longitudeAscendingNode: 0.0,
    argumentOfPerihelion: 102.937,
    meanAnomalyAtEpoch: 357.517,
    orbitalPeriod: 365.25,
    color: "#4fc3f7",
    displayRadius: 0.20,
    stationRadius: 0.40,
    textureFile: "earth.jpg",
  },
  {
    name: "Mars",
    semiMajorAxis: 1.524,
    eccentricity: 0.0934,
    inclination: 1.850,
    longitudeAscendingNode: 49.558,
    argumentOfPerihelion: 286.502,
    meanAnomalyAtEpoch: 19.373,
    orbitalPeriod: 686.97,
    color: "#d4603a",
    displayRadius: 0.15,
    stationRadius: 0.40,
    textureFile: "mars.jpg",
  },
  {
    name: "Jupiter",
    semiMajorAxis: 5.203,
    eccentricity: 0.0489,
    inclination: 1.303,
    longitudeAscendingNode: 100.464,
    argumentOfPerihelion: 273.867,
    meanAnomalyAtEpoch: 20.020,
    orbitalPeriod: 4332.59,
    color: "#c88b3a",
    displayRadius: 0.45,
    stationRadius: 1.0,
    textureFile: "jupiter.jpg",
  },
  {
    name: "Saturn",
    semiMajorAxis: 9.537,
    eccentricity: 0.0565,
    inclination: 2.489,
    longitudeAscendingNode: 113.665,
    argumentOfPerihelion: 339.392,
    meanAnomalyAtEpoch: 317.020,
    orbitalPeriod: 10759.22,
    color: "#e0c068",
    displayRadius: 0.40,
    stationRadius: 0.9,
    textureFile: "saturn.jpg",
  },
  {
    name: "Uranus",
    semiMajorAxis: 19.191,
    eccentricity: 0.0473,
    inclination: 0.773,
    longitudeAscendingNode: 74.006,
    argumentOfPerihelion: 96.998,
    meanAnomalyAtEpoch: 142.238,
    orbitalPeriod: 30688.5,
    color: "#7de3f4",
    displayRadius: 0.32,
    stationRadius: 0.8,
    textureFile: "uranus.jpg",
  },
  {
    name: "Neptune",
    semiMajorAxis: 30.069,
    eccentricity: 0.0086,
    inclination: 1.770,
    longitudeAscendingNode: 131.784,
    argumentOfPerihelion: 276.336,
    meanAnomalyAtEpoch: 256.228,
    orbitalPeriod: 60182.0,
    color: "#3f51b5",
    displayRadius: 0.30,
    stationRadius: 0.8,
    textureFile: "neptune.jpg",
  },
];
```

**Step 3: Remove old deprecated fields**

Delete the `orbitalRadius` and `initialAngle` fields entirely from the interface and data. These are replaced by Keplerian elements.

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: Many errors in files that reference old `orbitalRadius`/`initialAngle` fields. This is expected — we fix them in subsequent tasks.

**Step 5: Commit**

```bash
git add src/simulation/constants.ts
git commit -m "feat: expand PlanetData to Keplerian elements with all 8 planets"
```

---

## Task 3: Keplerian Orbit Solver

**Files:**
- Rewrite: `src/simulation/orbits.ts`

**Step 1: Rewrite orbits.ts with Kepler equation solver**

Replace entire file with:

```ts
/** Keplerian orbital mechanics — planet position from orbital elements. */

import { AU_SCALE, type PlanetData } from "./constants";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

const DEG2RAD = Math.PI / 180;

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E.
 * Uses Newton-Raphson iteration.
 */
function solveKepler(M: number, e: number, tolerance: number = 1e-8): number {
  let E = M; // initial guess
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
}

/** Get the true anomaly from eccentric anomaly and eccentricity. */
function trueAnomalyFromE(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
}

/**
 * Get the 3D position of a planet at a given time (days from epoch).
 * Returns position in scene units (AU * AU_SCALE).
 */
export function getPlanetPosition3D(
  planet: PlanetData,
  timeInDays: number
): Position3D {
  const a = planet.semiMajorAxis;
  const e = planet.eccentricity;
  const i = planet.inclination * DEG2RAD;
  const Omega = planet.longitudeAscendingNode * DEG2RAD;
  const omega = planet.argumentOfPerihelion * DEG2RAD;

  // Mean anomaly at time t
  const n = (2 * Math.PI) / planet.orbitalPeriod; // mean motion
  const M0 = planet.meanAnomalyAtEpoch * DEG2RAD;
  let M = (M0 + n * timeInDays) % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKepler(M, e);

  // True anomaly
  const nu = trueAnomalyFromE(E, e);

  // Distance from focus
  const r = a * (1 - e * Math.cos(E));

  // Position in orbital plane
  const xOrb = r * Math.cos(nu);
  const yOrb = r * Math.sin(nu);

  // Rotate to 3D ecliptic coordinates
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);

  const x =
    (cosOmega * cosW - sinOmega * sinW * cosI) * xOrb +
    (-cosOmega * sinW - sinOmega * cosW * cosI) * yOrb;
  const y =
    (sinI * sinW) * xOrb +
    (sinI * cosW) * yOrb;
  const z =
    (sinOmega * cosW + cosOmega * sinW * cosI) * xOrb +
    (-sinOmega * sinW + cosOmega * cosW * cosI) * yOrb;

  return {
    x: x * AU_SCALE,
    y: y * AU_SCALE,
    z: z * AU_SCALE,
  };
}

/** Backward-compatible 2D position (projects y=0 for legacy callers). */
export function getPlanetPosition(
  planet: PlanetData,
  timeInDays: number
): { x: number; z: number } {
  const pos = getPlanetPosition3D(planet, timeInDays);
  return { x: pos.x, z: pos.z };
}

/** Get the orbital angle of a planet (for Chronometer display). */
export function getPlanetAngle(
  planet: PlanetData,
  timeInDays: number
): number {
  const pos = getPlanetPosition3D(planet, timeInDays);
  return Math.atan2(pos.z, pos.x);
}

/**
 * Generate points along the full 3D orbit for rendering the track.
 * Sweeps mean anomaly from 0 to 2pi.
 */
export function getOrbitTrackPoints(
  planet: PlanetData,
  segments: number = 256
): [number, number, number][] {
  const a = planet.semiMajorAxis;
  const e = planet.eccentricity;
  const inc = planet.inclination * DEG2RAD;
  const Omega = planet.longitudeAscendingNode * DEG2RAD;
  const omega = planet.argumentOfPerihelion * DEG2RAD;

  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);

  const points: [number, number, number][] = [];

  for (let s = 0; s <= segments; s++) {
    const M = (2 * Math.PI * s) / segments;
    const E = solveKepler(M, e);
    const nu = trueAnomalyFromE(E, e);
    const r = a * (1 - e * Math.cos(E));

    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);

    const x =
      (cosOmega * cosW - sinOmega * sinW * cosI) * xOrb +
      (-cosOmega * sinW - sinOmega * cosW * cosI) * yOrb;
    const y =
      (sinI * sinW) * xOrb +
      (sinI * cosW) * yOrb;
    const z =
      (sinOmega * cosW + cosOmega * sinW * cosI) * xOrb +
      (-sinOmega * sinW + cosOmega * cosW * cosI) * yOrb;

    points.push([x * AU_SCALE, y * AU_SCALE, z * AU_SCALE]);
  }

  return points;
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: Errors in other files that still reference `Position2D` — these are fixed in subsequent tasks. The orbits module itself should be clean.

**Step 3: Commit**

```bash
git add src/simulation/orbits.ts
git commit -m "feat: Keplerian orbit solver with Newton-Raphson and 3D positions"
```

---

## Task 4: Adaptive Bezier Transfer Routes

**Files:**
- Rewrite: `src/simulation/transfer.ts`

**Step 1: Rewrite transfer.ts with adaptive Bezier curves**

Replace entire file:

```ts
/** Adaptive cubic Bezier transfer curves — train always arrives. */

import { AU_SCALE, MU_SUN, type PlanetData } from "./constants";
import { getPlanetPosition3D, type Position3D } from "./orbits";

export interface TransferArc {
  /** Departure time in sim days */
  departureTime: number;
  /** Transfer duration in sim days */
  transferTime: number;
  /** Origin planet index */
  originIndex: number;
  /** Target planet index */
  targetIndex: number;
  /** Departure position (scene units) */
  p0: Position3D;
  /** Departure control point (scene units) */
  p1: Position3D;
}

/**
 * Compute transfer arc between two planets.
 * Transfer time uses Hohmann estimate for realistic duration.
 */
export function computeTransfer(
  origin: PlanetData,
  target: PlanetData,
  departureTime: number,
  originIndex: number,
  targetIndex: number
): TransferArc {
  const r1 = origin.semiMajorAxis;
  const r2 = target.semiMajorAxis;
  const a = (r1 + r2) / 2;

  // Hohmann transfer time estimate
  const transferTime = Math.PI * Math.sqrt((a * a * a) / MU_SUN);

  // Departure position
  const p0 = getPlanetPosition3D(origin, departureTime);

  // Control point: extend in the direction of the origin planet's orbital velocity
  // Velocity direction is tangent to orbit (perpendicular to radial direction)
  const dt = 0.1;
  const pNext = getPlanetPosition3D(origin, departureTime + dt);
  const vx = (pNext.x - p0.x) / dt;
  const vy = (pNext.y - p0.y) / dt;
  const vz = (pNext.z - p0.z) / dt;

  // Scale control point distance proportional to transfer time
  const controlScale = transferTime * 0.3;
  const p1: Position3D = {
    x: p0.x + vx * controlScale,
    y: p0.y + vy * controlScale,
    z: p0.z + vz * controlScale,
  };

  return {
    departureTime,
    transferTime,
    originIndex,
    targetIndex,
    p0,
    p1,
  };
}

/**
 * Get the current Bezier control points for a transfer arc.
 * P2 and P3 are computed live based on current sim time (target planet moves).
 */
function getBezierPoints(
  arc: TransferArc,
  target: PlanetData,
  currentTime: number
): { p0: Position3D; p1: Position3D; p2: Position3D; p3: Position3D } {
  const arrivalTime = arc.departureTime + arc.transferTime;

  // P3 = target planet's position at arrival time
  const p3 = getPlanetPosition3D(target, arrivalTime);

  // P2 = arrival control point — opposite of target's velocity direction
  const dt = 0.1;
  const pPrev = getPlanetPosition3D(target, arrivalTime - dt);
  const vx = (p3.x - pPrev.x) / dt;
  const vy = (p3.y - pPrev.y) / dt;
  const vz = (p3.z - pPrev.z) / dt;

  const controlScale = arc.transferTime * 0.3;
  const p2: Position3D = {
    x: p3.x - vx * controlScale,
    y: p3.y - vy * controlScale,
    z: p3.z - vz * controlScale,
  };

  return { p0: arc.p0, p1: arc.p1, p2, p3 };
}

/** Evaluate cubic Bezier at parameter t in [0,1]. */
function bezierPoint(
  p0: Position3D,
  p1: Position3D,
  p2: Position3D,
  p3: Position3D,
  t: number
): Position3D {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    z: uuu * p0.z + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z,
  };
}

/**
 * Get position along the transfer arc at a given progress [0, 1].
 * Uses adaptive Bezier — target planet position at arrival time is baked in.
 */
export function getTransferPosition(
  arc: TransferArc,
  progress: number,
  target: PlanetData,
  currentTime: number
): Position3D {
  const { p0, p1, p2, p3 } = getBezierPoints(arc, target, currentTime);
  return bezierPoint(p0, p1, p2, p3, progress);
}

/** Generate an array of points along the transfer arc for rendering. */
export function getTransferArcPoints(
  arc: TransferArc,
  target: PlanetData,
  currentTime: number,
  segments: number = 64
): [number, number, number][] {
  const { p0, p1, p2, p3 } = getBezierPoints(arc, target, currentTime);
  const points: [number, number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pos = bezierPoint(p0, p1, p2, p3, t);
    points.push([pos.x, pos.y, pos.z]);
  }

  return points;
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: Errors in gameStore.ts and scene components that call old transfer API. Fixed in next tasks.

**Step 3: Commit**

```bash
git add src/simulation/transfer.ts
git commit -m "feat: adaptive cubic Bezier transfer curves (train always arrives)"
```

---

## Task 5: Simplify collision.ts

**Files:**
- Modify: `src/simulation/collision.ts`

**Step 1: Remove checkArrival, update getGravityProximity**

Replace entire file:

```ts
/** Proximity detection for gravity well FX. */

import { AU_SCALE, type PlanetData } from "./constants";

/** Get distance between two 3D positions (scene units). */
export function getDistance(
  a: { x: number; z: number },
  b: { x: number; z: number }
): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/** Get proximity factor (0..1) to the nearest planet. Used for gravity well FX. */
export function getGravityProximity(
  pos: { x: number; z: number },
  planets: PlanetData[],
  planetPositions: { x: number; z: number }[]
): number {
  let maxInfluence = 0;

  for (let i = 0; i < planets.length; i++) {
    const dx = pos.x - planetPositions[i].x;
    const dz = pos.z - planetPositions[i].z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const influenceRadius = planets[i].semiMajorAxis * AU_SCALE * 0.3;

    if (dist < influenceRadius) {
      const proximity = 1 - dist / influenceRadius;
      maxInfluence = Math.max(maxInfluence, proximity);
    }
  }

  return maxInfluence;
}
```

**Step 2: Commit**

```bash
git add src/simulation/collision.ts
git commit -m "refactor: simplify collision to proximity-only (remove checkArrival)"
```

---

## Task 6: Rewrite Game Store

**Files:**
- Rewrite: `src/store/gameStore.ts`

**Step 1: Rewrite gameStore.ts**

This is the largest change. Key differences from v1:
- Remove "missed" state — trains always arrive
- Replace autoLaunch with sequential line: Mercury→Venus→...→Neptune→...→Mercury
- Update tick() to use new transfer API (pass target planet to getTransferPosition)
- Add `autoLineIndex` and `autoDirection` to track sequential auto mode state
- 2-second dwell at each station in auto mode
- Remove getMissDistance helper

Replace entire file with:

```ts
/** Zustand game state store for Sun Rail v2. */

import { create } from "zustand";
import {
  PLANETS,
  SECONDS_PER_SIM_DAY,
  type TimeSpeed,
} from "../simulation/constants";
import { getPlanetPosition } from "../simulation/orbits";
import {
  computeTransfer,
  getTransferPosition,
  type TransferArc,
} from "../simulation/transfer";
import { playLaunch, playArrival, playClick } from "../audio/AudioManager";

export type GameState = "idle" | "prelaunch" | "in_transit" | "arrived";

export interface ActiveTrain {
  arc: TransferArc;
  departureTime: number;
  progress: number; // 0..1
  originIndex: number;
  targetIndex: number;
}

export interface GameStore {
  // Simulation time
  simTime: number;
  speedMultiplier: TimeSpeed;
  paused: boolean;

  // Game state
  gameState: GameState;
  selectedOrigin: number;
  selectedTarget: number;
  activeTrain: ActiveTrain | null;

  // Auto mode
  autoMode: boolean;
  autoLineIndex: number; // current station index in PLANETS (0..7)
  autoDirection: 1 | -1; // 1 = outbound, -1 = inbound
  autoDwellUntil: number; // sim time when dwell ends

  // Event splash
  splashMessage: string | null;
  splashType: "success" | null;

  // Actions
  tick: (deltaSeconds: number) => void;
  setSpeed: (speed: TimeSpeed) => void;
  selectRoute: (origin: number, target: number) => void;
  launch: () => void;
  reset: () => void;
  toggleAutoMode: () => void;
  togglePause: () => void;
  dismissSplash: () => void;
}

/** Dwell time at each station in auto mode (sim days at 1x). */
const AUTO_DWELL_DAYS = 2;

export const useGameStore = create<GameStore>((set, get) => ({
  simTime: 0,
  speedMultiplier: 1 as TimeSpeed,
  paused: false,

  gameState: "idle",
  selectedOrigin: 2, // Earth
  selectedTarget: 3, // Mars
  activeTrain: null,

  autoMode: false,
  autoLineIndex: 0, // Start at Mercury
  autoDirection: 1,  // Outbound
  autoDwellUntil: 0,

  splashMessage: null,
  splashType: null,

  tick: (deltaSeconds: number) => {
    const state = get();
    if (state.paused) return;

    const simDelta =
      (deltaSeconds / SECONDS_PER_SIM_DAY) * state.speedMultiplier;
    const newTime = state.simTime + simDelta;

    // Update train if in transit
    if (state.gameState === "in_transit" && state.activeTrain) {
      const train = state.activeTrain;
      const elapsed = newTime - train.departureTime;
      const newProgress = Math.min(elapsed / train.arc.transferTime, 1);

      if (newProgress >= 1) {
        // Train arrived (always arrives with Bezier curves)
        const targetPlanet = PLANETS[train.targetIndex];
        playArrival();
        set({
          simTime: newTime,
          gameState: "arrived",
          activeTrain: { ...train, progress: 1 },
          splashMessage: `ARRIVED AT ${targetPlanet.name.toUpperCase()} STATION`,
          splashType: "success",
        });
        return;
      }

      set({
        simTime: newTime,
        activeTrain: { ...train, progress: newProgress },
      });
    } else {
      set({ simTime: newTime });
    }

    // Auto mode logic
    const currentState = get().gameState;
    if (state.autoMode) {
      if (currentState === "arrived") {
        // Move to next station in the line
        const nextIndex = state.autoLineIndex + state.autoDirection;
        let newDirection = state.autoDirection;
        let actualNext = nextIndex;

        // Bounce at ends
        if (nextIndex >= PLANETS.length) {
          newDirection = -1;
          actualNext = PLANETS.length - 2;
        } else if (nextIndex < 0) {
          newDirection = 1;
          actualNext = 1;
        }

        set({
          gameState: "idle",
          activeTrain: null,
          splashMessage: null,
          splashType: null,
          autoLineIndex: actualNext,
          autoDirection: newDirection as 1 | -1,
          autoDwellUntil: newTime + AUTO_DWELL_DAYS,
        });
      } else if (currentState === "idle" && newTime >= state.autoDwellUntil) {
        // Launch to next station
        const fromIdx = state.autoLineIndex - state.autoDirection;
        // Clamp fromIdx
        const safeFrom = Math.max(0, Math.min(PLANETS.length - 1,
          state.autoLineIndex - state.autoDirection
        ));
        const toIdx = state.autoLineIndex;

        // On first launch, go from index 0 to index 1
        const origin = PLANETS[safeFrom];
        const target = PLANETS[toIdx];

        if (safeFrom === toIdx) return; // safety guard

        const arc = computeTransfer(
          origin, target, newTime, safeFrom, toIdx
        );

        playLaunch();
        set({
          selectedOrigin: safeFrom,
          selectedTarget: toIdx,
          gameState: "in_transit",
          activeTrain: {
            arc,
            departureTime: newTime,
            progress: 0,
            originIndex: safeFrom,
            targetIndex: toIdx,
          },
        });
      }
    }
  },

  setSpeed: (speed: TimeSpeed) => {
    playClick();
    set({ speedMultiplier: speed });
  },

  selectRoute: (origin: number, target: number) => {
    if (origin === target) return;
    set({
      selectedOrigin: origin,
      selectedTarget: target,
      gameState: "prelaunch",
      activeTrain: null,
    });
  },

  launch: () => {
    const state = get();
    if (
      state.gameState !== "prelaunch" &&
      state.gameState !== "idle"
    )
      return;

    const origin = PLANETS[state.selectedOrigin];
    const target = PLANETS[state.selectedTarget];
    const arc = computeTransfer(
      origin, target, state.simTime,
      state.selectedOrigin, state.selectedTarget
    );

    playLaunch();
    set({
      gameState: "in_transit",
      activeTrain: {
        arc,
        departureTime: state.simTime,
        progress: 0,
        originIndex: state.selectedOrigin,
        targetIndex: state.selectedTarget,
      },
    });
  },

  reset: () =>
    set({
      gameState: "idle",
      activeTrain: null,
      splashMessage: null,
      splashType: null,
    }),

  toggleAutoMode: () => {
    const state = get();
    set({
      autoMode: !state.autoMode,
      gameState: "idle",
      activeTrain: null,
      splashMessage: null,
      splashType: null,
      autoLineIndex: 0,
      autoDirection: 1,
      autoDwellUntil: state.simTime,
    });
  },

  togglePause: () => set({ paused: !get().paused }),

  dismissSplash: () => set({ splashMessage: null, splashType: null }),
}));
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: Errors in scene/HUD components referencing old types. Fixed in subsequent tasks.

**Step 3: Commit**

```bash
git add src/store/gameStore.ts
git commit -m "feat: v2 game store — always-arrive trains, sequential auto mode"
```

---

## Task 7: Remove playMiss from AudioManager

**Files:**
- Modify: `src/audio/AudioManager.ts`

**Step 1: Remove the playMiss export**

Delete the `playMiss` function (lines 114-133) and its export.

**Step 2: Commit**

```bash
git add src/audio/AudioManager.ts
git commit -m "refactor: remove playMiss sound (trains always arrive now)"
```

---

## Task 8: Download Planet Textures

**Files:**
- Create: `public/textures/` directory
- Create: `public/textures/README.md` (attribution)

**Step 1: Create textures directory**

```bash
mkdir -p public/textures
```

**Step 2: Download NASA/Solar System Scope textures**

Download ~512px texture maps for all planets + Sun from Solar System Scope (CC BY 4.0) or similar public domain sources. Save as:
- `public/textures/sun.jpg`
- `public/textures/mercury.jpg`
- `public/textures/venus.jpg`
- `public/textures/earth.jpg`
- `public/textures/mars.jpg`
- `public/textures/jupiter.jpg`
- `public/textures/saturn.jpg`
- `public/textures/uranus.jpg`
- `public/textures/neptune.jpg`

If textures cannot be downloaded (offline), generate colored placeholder images (solid color spheres).

**Step 3: Add attribution file**

Create `public/textures/README.md`:
```markdown
# Planet Textures

Textures sourced from Solar System Scope (https://www.solarsystemscope.com/textures/)
License: CC BY 4.0 (Creative Commons Attribution 4.0 International)
```

**Step 4: Commit**

```bash
git add public/textures/
git commit -m "feat: add planet texture assets (CC BY 4.0)"
```

---

## Task 9: Update 3D Scene — Orrery, Camera, Orbit Tracks

**Files:**
- Modify: `src/scene/Orrery.tsx`
- Modify: `src/scene/OrbitTrack.tsx`

**Step 1: Update Orrery camera and controls**

In `src/scene/Orrery.tsx`:
- Change camera far to 500: `far: 500`
- Enable pan: `enablePan={true}`
- Increase maxDistance: `maxDistance={250}`

```tsx
<Canvas
  camera={{ position: [0, 18, 3], fov: 50, near: 0.1, far: 500 }}
  ...
>
  <OrbitControls
    enablePan={true}
    minDistance={4}
    maxDistance={250}
    maxPolarAngle={Math.PI / 2.2}
    minPolarAngle={0.2}
  />
```

**Step 2: Update OrbitTrack for 3D elliptical orbits**

No code changes needed — `getOrbitTrackPoints` already returns `[x, y, z]` tuples and the new orbits.ts produces 3D points. The Line component handles 3D.

**Step 3: Verify**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/scene/Orrery.tsx
git commit -m "feat: enable pan, extend camera range for full solar system"
```

---

## Task 10: Update Planet.tsx with Textures + 3D Position

**Files:**
- Modify: `src/scene/Planet.tsx`

**Step 1: Rewrite Planet.tsx**

Update to use `getPlanetPosition3D` for 3D positioning and conditionally load textures:

```tsx
/** Individual planet sphere with label, orbiting the Sun. */

import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { TextureLoader } from "three";
import type { Group } from "three";
import type { PlanetData } from "../simulation/constants";
import { getPlanetPosition3D } from "../simulation/orbits";
import { useGameStore } from "../store/gameStore";

interface PlanetProps {
  planet: PlanetData;
}

export function Planet({ planet }: PlanetProps) {
  const groupRef = useRef<Group>(null);

  // Load texture if available
  const texture = useMemo(() => {
    if (!planet.textureFile) return null;
    try {
      const loader = new TextureLoader();
      return loader.load(`/textures/${planet.textureFile}`);
    } catch {
      return null;
    }
  }, [planet.textureFile]);

  useFrame(() => {
    const simTime = useGameStore.getState().simTime;
    const pos = getPlanetPosition3D(planet, simTime);
    if (groupRef.current) {
      groupRef.current.position.set(pos.x, pos.y, pos.z);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet sphere */}
      <mesh>
        <sphereGeometry args={[planet.displayRadius, 32, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissive={planet.color}
            emissiveIntensity={0.3}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        )}
      </mesh>

      {/* Label */}
      <Html
        position={[0, planet.displayRadius + 0.3, 0]}
        center
        style={{
          color: planet.color,
          fontSize: "10px",
          fontFamily: "monospace",
          textTransform: "uppercase",
          letterSpacing: "2px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          textShadow: `0 0 8px ${planet.color}`,
        }}
      >
        {planet.name}
      </Html>
    </group>
  );
}
```

Note: Station radius ring is removed — trains always arrive, no need for catch zone visualization.

**Step 2: Commit**

```bash
git add src/scene/Planet.tsx
git commit -m "feat: 3D planet positions with texture support"
```

---

## Task 11: Update Sun.tsx with Texture

**Files:**
- Modify: `src/scene/Sun.tsx`

**Step 1: Update Sun to load texture**

```tsx
/** Central Sun with bloom glow and optional texture. */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import type { Mesh } from "three";
import { SUN } from "../simulation/constants";

export function Sun() {
  const meshRef = useRef<Mesh>(null);

  const texture = useMemo(() => {
    try {
      const loader = new TextureLoader();
      return loader.load("/textures/sun.jpg");
    } catch {
      return null;
    }
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[SUN.displayRadius, 32, 32]} />
      {texture ? (
        <meshStandardMaterial
          map={texture}
          emissive={SUN.emissiveColor}
          emissiveIntensity={2}
          toneMapped={false}
        />
      ) : (
        <meshStandardMaterial
          color={SUN.color}
          emissive={SUN.emissiveColor}
          emissiveIntensity={2}
          toneMapped={false}
        />
      )}
    </mesh>
  );
}
```

**Step 2: Commit**

```bash
git add src/scene/Sun.tsx
git commit -m "feat: Sun texture support with fallback"
```

---

## Task 12: Train Billboard Sprite

**Files:**
- Rewrite: `src/scene/Train.tsx`

**Step 1: Rewrite Train.tsx with billboard sprite**

Replace the gold octahedron with a 2D locomotive silhouette using a canvas texture and Billboard from drei. Also update to use new transfer API with target planet parameter.

```tsx
/** Train entity — 2D billboard sprite with particle trail. */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import type { BufferAttribute } from "three";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";
import { getTransferPosition } from "../simulation/transfer";

const TRAIL_LENGTH = 40;

/** Generate a canvas texture of a classic train silhouette. */
function createTrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Gold color
  ctx.fillStyle = "#ffc107";
  ctx.strokeStyle = "#ffc107";
  ctx.lineWidth = 1;

  // Locomotive body
  ctx.fillRect(8, 8, 36, 16);

  // Cab (rear, taller)
  ctx.fillRect(4, 4, 12, 20);

  // Smokestack
  ctx.fillRect(36, 2, 6, 8);

  // Cowcatcher (front)
  ctx.beginPath();
  ctx.moveTo(44, 24);
  ctx.lineTo(56, 28);
  ctx.lineTo(56, 16);
  ctx.lineTo(44, 8);
  ctx.closePath();
  ctx.fill();

  // Wheels
  ctx.beginPath();
  ctx.arc(14, 26, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(28, 26, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(40, 26, 3, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Train() {
  const spriteRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef(new Float32Array(TRAIL_LENGTH * 3));
  const trailIndex = useRef(0);

  const trainTexture = useMemo(() => createTrainTexture(), []);

  const trailGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_LENGTH * 3);
    const opacities = new Float32Array(TRAIL_LENGTH);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
    return geom;
  }, []);

  useFrame(() => {
    const { activeTrain, gameState, simTime } = useGameStore.getState();

    if (!activeTrain || gameState === "idle" || gameState === "prelaunch") {
      if (spriteRef.current) spriteRef.current.visible = false;
      if (trailRef.current) trailRef.current.visible = false;
      return;
    }

    const target = PLANETS[activeTrain.targetIndex];
    const pos = getTransferPosition(
      activeTrain.arc, activeTrain.progress, target, simTime
    );

    if (spriteRef.current) {
      spriteRef.current.visible = true;
      spriteRef.current.position.set(pos.x, pos.y, pos.z);
    }

    // Update trail
    if (trailRef.current) {
      trailRef.current.visible = true;
      const idx = trailIndex.current % TRAIL_LENGTH;
      trailPositions.current[idx * 3] = pos.x;
      trailPositions.current[idx * 3 + 1] = pos.y;
      trailPositions.current[idx * 3 + 2] = pos.z;
      trailIndex.current++;

      const posAttr = trailGeometry.getAttribute("position") as BufferAttribute;
      const opacityAttr = trailGeometry.getAttribute("opacity") as BufferAttribute;

      for (let i = 0; i < TRAIL_LENGTH; i++) {
        posAttr.setXYZ(
          i,
          trailPositions.current[i * 3],
          trailPositions.current[i * 3 + 1],
          trailPositions.current[i * 3 + 2]
        );
        const age = (trailIndex.current - i + TRAIL_LENGTH) % TRAIL_LENGTH;
        opacityAttr.setX(i, Math.max(0, 1 - age / TRAIL_LENGTH));
      }

      posAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Train billboard sprite */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh ref={spriteRef} visible={false}>
          <planeGeometry args={[0.5, 0.25]} />
          <meshBasicMaterial
            map={trainTexture}
            transparent
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>

      {/* Particle trail */}
      <points ref={trailRef} visible={false} geometry={trailGeometry}>
        <pointsMaterial
          color="#ffc107"
          size={0.06}
          transparent
          opacity={0.6}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
    </group>
  );
}
```

**Step 2: Commit**

```bash
git add src/scene/Train.tsx
git commit -m "feat: classic train silhouette billboard sprite"
```

---

## Task 13: Update TransferArc.tsx

**Files:**
- Modify: `src/scene/TransferArc.tsx`

**Step 1: Rewrite TransferArc.tsx for new Bezier API**

```tsx
/** Ghost preview and active transfer arc paths (Bezier curves). */

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";
import { computeTransfer, getTransferArcPoints } from "../simulation/transfer";
import { getPlanetPosition3D } from "../simulation/orbits";

/** Ghost preview arc shown in idle/prelaunch state. */
export function GhostArc() {
  const simTime = useGameStore((s) => s.simTime);
  const gameState = useGameStore((s) => s.gameState);
  const originIdx = useGameStore((s) => s.selectedOrigin);
  const targetIdx = useGameStore((s) => s.selectedTarget);
  const autoMode = useGameStore((s) => s.autoMode);

  const arcData = useMemo(() => {
    if (autoMode) return null;
    if (gameState !== "prelaunch" && gameState !== "idle") return null;
    const origin = PLANETS[originIdx];
    const target = PLANETS[targetIdx];
    const arc = computeTransfer(origin, target, simTime, originIdx, targetIdx);
    const points = getTransferArcPoints(arc, target, simTime);
    const arrivalPos = getPlanetPosition3D(
      target,
      simTime + arc.transferTime
    );
    return { points, arrivalPos };
  }, [gameState, originIdx, targetIdx, Math.floor(simTime), autoMode]);

  if (!arcData) return null;

  return (
    <group>
      <Line
        points={arcData.points}
        color="#00f3ff"
        lineWidth={1.5}
        transparent
        opacity={0.25}
        dashed
        dashSize={0.2}
        gapSize={0.1}
        toneMapped={false}
      />
      <mesh position={[arcData.arrivalPos.x, arcData.arrivalPos.y, arcData.arrivalPos.z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial
          color="#00f3ff"
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Active transfer arc when train is in transit. */
export function ActiveArc() {
  const activeTrain = useGameStore((s) => s.activeTrain);
  const gameState = useGameStore((s) => s.gameState);
  const simTime = useGameStore((s) => s.simTime);

  const points = useMemo(() => {
    if (!activeTrain) return null;
    const target = PLANETS[activeTrain.targetIndex];
    return getTransferArcPoints(activeTrain.arc, target, simTime);
  }, [activeTrain?.arc, Math.floor(simTime / 5)]);

  if (!points || (gameState !== "in_transit" && gameState !== "arrived")) {
    return null;
  }

  return (
    <Line
      points={points}
      color="#ffc107"
      lineWidth={2}
      transparent
      opacity={0.6}
      toneMapped={false}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/scene/TransferArc.tsx
git commit -m "feat: Bezier-based ghost and active transfer arcs"
```

---

## Task 14: Update HUD — RouteSelector

**Files:**
- Modify: `src/hud/RouteSelector.tsx`

**Step 1: Update RouteSelector**

- Remove `computeTransfer` import and transfer time display (transfer time is now computed at launch, not preview)
- Simplify to just show dropdowns and launch button
- Remove "missed" state references

```tsx
/** Route selection: origin and destination planet pickers + launch button. */

import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";

export function RouteSelector() {
  const selectedOrigin = useGameStore((s) => s.selectedOrigin);
  const selectedTarget = useGameStore((s) => s.selectedTarget);
  const gameState = useGameStore((s) => s.gameState);
  const autoMode = useGameStore((s) => s.autoMode);
  const selectRoute = useGameStore((s) => s.selectRoute);
  const launch = useGameStore((s) => s.launch);
  const reset = useGameStore((s) => s.reset);

  if (autoMode) return null;

  const canLaunch = gameState === "prelaunch" || gameState === "idle";
  const isTransit = gameState === "in_transit";
  const isFinished = gameState === "arrived";

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-[#00f3ff33] rounded-lg px-4 py-3">
      <div className="text-[9px] tracking-widest opacity-60 mb-2">
        ROUTE
      </div>

      <div className="flex items-center gap-2 mb-2">
        <select
          value={selectedOrigin}
          onChange={(e) => selectRoute(Number(e.target.value), selectedTarget)}
          disabled={isTransit}
          className="bg-black/80 border border-[#00f3ff33] text-[#00f3ff] text-xs px-2 py-1 rounded"
        >
          {PLANETS.map((p, i) => (
            <option key={p.name} value={i} disabled={i === selectedTarget}>
              {p.name}
            </option>
          ))}
        </select>

        <span className="text-[#ffc107] text-xs">&rarr;</span>

        <select
          value={selectedTarget}
          onChange={(e) => selectRoute(selectedOrigin, Number(e.target.value))}
          disabled={isTransit}
          className="bg-black/80 border border-[#00f3ff33] text-[#00f3ff] text-xs px-2 py-1 rounded"
        >
          {PLANETS.map((p, i) => (
            <option key={p.name} value={i} disabled={i === selectedOrigin}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {isFinished ? (
        <button
          onClick={reset}
          className="w-full py-1.5 text-xs font-bold tracking-widest rounded border-2 border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff20] transition-all"
        >
          NEW ROUTE
        </button>
      ) : (
        <button
          onClick={launch}
          disabled={!canLaunch}
          className={`w-full py-1.5 text-xs font-bold tracking-widest rounded border-2 transition-all ${
            canLaunch
              ? "border-[#ffc107] text-[#ffc107] hover:bg-[#ffc10720] animate-pulse"
              : "border-[#ffffff20] text-[#ffffff30] cursor-not-allowed"
          }`}
        >
          {isTransit ? "IN TRANSIT..." : "LAUNCH"}
        </button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/hud/RouteSelector.tsx
git commit -m "refactor: RouteSelector for 8 planets, remove missed state"
```

---

## Task 15: Update HUD — Chronometer

**Files:**
- Modify: `src/hud/Chronometer.tsx`

**Step 1: Update Chronometer for 8 planets**

The normalization radius must change from 1.52 (Mars) to 30.069 (Neptune). Use logarithmic scaling so inner planets are still visible:

```tsx
/** Circular dial showing current angle of all planets. */

import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";
import { getPlanetAngle } from "../simulation/orbits";

export function Chronometer() {
  const simTime = useGameStore((s) => s.simTime);

  const outerRadius = 40;
  const cx = 50;
  const cy = 50;

  // Use log scale so inner planets aren't crushed at center
  const maxLogR = Math.log(PLANETS[PLANETS.length - 1].semiMajorAxis + 1);

  return (
    <div className="rounded-full border border-[#00f3ff33] bg-black/60 backdrop-blur-sm p-2">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius}
          fill="none"
          stroke="#00f3ff"
          strokeWidth="0.5"
          opacity="0.3"
        />
        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius * 0.3}
          fill="none"
          stroke="#00f3ff"
          strokeWidth="0.3"
          opacity="0.15"
        />

        {/* Planet dots */}
        {PLANETS.map((planet) => {
          const angle = getPlanetAngle(planet, simTime);
          // Log-scale radius for better visibility
          const logR = Math.log(planet.semiMajorAxis + 1) / maxLogR;
          const normalizedR = logR * outerRadius * 0.85 + outerRadius * 0.1;
          const dotX = cx + normalizedR * Math.cos(angle - Math.PI / 2);
          const dotY = cy + normalizedR * Math.sin(angle - Math.PI / 2);

          return (
            <g key={planet.name}>
              <circle
                cx={dotX}
                cy={dotY}
                r={2.5}
                fill={planet.color}
                opacity="0.9"
              />
              <circle
                cx={dotX}
                cy={dotY}
                r={4}
                fill={planet.color}
                opacity="0.2"
              />
            </g>
          );
        })}

        {/* Center dot (Sun) */}
        <circle cx={cx} cy={cy} r={3} fill="#fff4e0" opacity="0.8" />
      </svg>

      <div className="text-center text-[9px] tracking-widest opacity-60 mt-1">
        CHRONOMETER
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/hud/Chronometer.tsx
git commit -m "feat: Chronometer log-scale for 8 planets"
```

---

## Task 16: Update HUD — Timetable (Auto Mode Schedule)

**Files:**
- Rewrite: `src/hud/Timetable.tsx`

**Step 1: Rewrite Timetable as sequential schedule display**

Replace the launch window scanner with a sequential schedule showing the auto mode's upcoming stops:

```tsx
/** Auto mode train schedule display. */

import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";

export function Timetable() {
  const autoMode = useGameStore((s) => s.autoMode);
  const autoLineIndex = useGameStore((s) => s.autoLineIndex);
  const autoDirection = useGameStore((s) => s.autoDirection);
  const gameState = useGameStore((s) => s.gameState);
  const activeTrain = useGameStore((s) => s.activeTrain);

  if (!autoMode) return null;

  // Build upcoming schedule (next 4 stops)
  const stops: { name: string; status: "current" | "next" | "upcoming" }[] = [];
  let idx = autoLineIndex;
  let dir = autoDirection;

  for (let s = 0; s < 5; s++) {
    const planet = PLANETS[idx];
    if (!planet) break;

    if (s === 0) {
      stops.push({
        name: planet.name,
        status: gameState === "in_transit" ? "current" : "next",
      });
    } else {
      stops.push({ name: planet.name, status: "upcoming" });
    }

    // Advance to next stop
    const nextIdx = idx + dir;
    if (nextIdx >= PLANETS.length) {
      dir = -1;
      idx = PLANETS.length - 2;
    } else if (nextIdx < 0) {
      dir = 1;
      idx = 1;
    } else {
      idx = nextIdx;
    }
  }

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-[#00f3ff33] rounded-lg px-3 py-2">
      <div className="text-[9px] tracking-widest opacity-60 mb-2">
        SCHEDULE
      </div>

      <div className="flex gap-3">
        {stops.map((stop, i) => (
          <div key={i} className="text-[10px] flex items-center gap-1">
            {i > 0 && (
              <span className="text-[#ffc107] opacity-40">&rarr;</span>
            )}
            <span
              className={
                stop.status === "current"
                  ? "text-[#ffc107] font-bold"
                  : stop.status === "next"
                    ? "text-[#00f3ff]"
                    : "opacity-40"
              }
            >
              {stop.name}
            </span>
          </div>
        ))}
      </div>

      {gameState === "in_transit" && activeTrain && (
        <div className="text-[9px] opacity-50 mt-1">
          Next: {PLANETS[activeTrain.targetIndex]?.name} Station
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/hud/Timetable.tsx
git commit -m "feat: sequential train schedule display for auto mode"
```

---

## Task 17: Update HUD — EventSplash + FuelGauge

**Files:**
- Modify: `src/hud/EventSplash.tsx`
- Modify: `src/hud/FuelGauge.tsx`

**Step 1: Simplify EventSplash (remove miss handling)**

In `src/hud/EventSplash.tsx`, remove the `splashType` check for failure. Always show success styling:

```tsx
/** Arrival splash overlay. */

import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export function EventSplash() {
  const splashMessage = useGameStore((s) => s.splashMessage);
  const dismissSplash = useGameStore((s) => s.dismissSplash);
  const autoMode = useGameStore((s) => s.autoMode);
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    if (!splashMessage) return;
    const timer = setTimeout(() => {
      dismissSplash();
      if (autoMode) reset();
    }, 3000);
    return () => clearTimeout(timer);
  }, [splashMessage, autoMode]);

  if (!splashMessage) return null;

  const color = "#00e676";

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className="text-center animate-in fade-in zoom-in duration-500"
        style={{
          textShadow: `0 0 40px ${color}, 0 0 80px ${color}`,
        }}
      >
        <div
          className="text-3xl font-bold tracking-[0.3em] mb-2"
          style={{ color }}
        >
          {splashMessage}
        </div>
        <div className="text-sm opacity-60" style={{ color }}>
          Connection successful
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update FuelGauge to use semiMajorAxis**

In `src/hud/FuelGauge.tsx`, the `getGravityProximity` call already works since we updated collision.ts. But the `getTransferPosition` call needs to pass the target planet now.

Update the `useEffect` to pass the target planet:

```tsx
  useEffect(() => {
    if (gameState !== "in_transit" || !activeTrain) {
      setProximity(0);
      return;
    }

    const target = PLANETS[activeTrain.targetIndex];
    const trainPos = getTransferPosition(
      activeTrain.arc, activeTrain.progress, target, simTime
    );
    const planetPositions = PLANETS.map((p) => getPlanetPosition(p, simTime));
    const prox = getGravityProximity(trainPos, PLANETS, planetPositions);
    setProximity(prox);
  }, [activeTrain?.progress, simTime, gameState]);
```

Also update the import to include `PLANETS` from constants:

```tsx
import { PLANETS } from "../simulation/constants";
```

**Step 3: Commit**

```bash
git add src/hud/EventSplash.tsx src/hud/FuelGauge.tsx
git commit -m "refactor: simplify EventSplash (arrival only), update FuelGauge for new API"
```

---

## Task 18: TypeScript Compilation Fix + Integration

**Files:**
- All files as needed

**Step 1: Run TypeScript compiler**

Run: `npx tsc --noEmit`

Fix any remaining type errors. Common issues to expect:
- Old `orbitalRadius` references in any file
- `Position2D` type references (replaced by `Position3D` or inline `{x, z}`)
- Old `computeTransfer` signature (now takes 5 args instead of 3)
- Old `getTransferPosition` signature (now takes 4 args instead of 2)
- `playMiss` import in gameStore (removed)
- `"missed"` string in any state check

**Step 2: Fix all errors**

Address each error methodically until `npx tsc --noEmit` produces 0 errors.

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: resolve all TypeScript compilation errors for v2"
```

---

## Task 19: Visual Verification + Tuning

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Visual checks**

1. All 8 planets visible and orbiting (zoom out to see outer planets)
2. Orbit tracks are 3D ellipses (slight inclination visible)
3. Camera pan works (drag with right mouse button or shift+drag)
4. Camera zoom reaches Neptune orbit
5. Click Launch — train follows Bezier curve to target
6. Train always arrives (no "MISSED CONNECTION" possible)
7. Auto mode cycles Mercury→Venus→...→Neptune→...→Mercury
8. 50x speed button appears and works
9. Chronometer shows 8 planet dots
10. Timetable shows schedule in auto mode
11. Planet textures load (if available) or fallback to colors
12. Sun texture loads
13. Train is billboard sprite
14. No console errors

**Step 3: Tune parameters if needed**

- Adjust `displayRadius` for outer planets if too big/small
- Adjust `stationRadius` values
- Adjust auto mode dwell time
- Tune Bezier control scale factor if arcs look wrong
- Increase/decrease bloom if needed for outer planets

**Step 4: Commit any tuning changes**

```bash
git add -A
git commit -m "polish: tune visual parameters for full solar system"
```

---

## Task 20: Update Documentation

**Files:**
- Modify: `DOC/README.md`
- Modify: `DOC/TASKS.md`

**Step 1: Update README**

Add v2 features:
- Full 8-planet solar system with Keplerian orbits
- Adaptive Bezier train routes (always arrives)
- Sequential auto mode (Mercury↔Neptune)
- NASA planet textures
- 3D elliptical orbit tracks
- Classic train silhouette sprite
- Pan/zoom camera controls

**Step 2: Update TASKS.md**

Mark v1 phases complete, add v2 phase with task checklist.

**Step 3: Commit**

```bash
git add DOC/
git commit -m "docs: update README and TASKS for v2 enhancements"
```

---

## Dependency Order

```
Task 1 (50x speed) — standalone
Task 2 (constants) — foundation for everything
Task 3 (orbits) — depends on Task 2
Task 4 (transfer) — depends on Task 3
Task 5 (collision) — depends on Task 2
Task 6 (gameStore) — depends on Tasks 3, 4, 5
Task 7 (audio) — depends on Task 6
Task 8 (textures) — standalone, can run in parallel
Tasks 9-13 (scene) — depend on Tasks 2, 3, 4, 6
Tasks 14-17 (HUD) — depend on Tasks 2, 6
Task 18 (integration) — depends on all above
Task 19 (verification) — depends on Task 18
Task 20 (docs) — last
```

**Parallelizable groups:**
- Task 1 + Task 8 (standalone)
- Tasks 9, 10, 11, 12, 13 (scene components, after simulation layer)
- Tasks 14, 15, 16, 17 (HUD components, after store)
