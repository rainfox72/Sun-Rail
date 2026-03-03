# Sun Rail v2 — Enhancement Design

## Context

Sun Rail v1 is a working 3D solar system train sim with 4 inner planets, Hohmann transfer arcs, click-to-launch timing gameplay, auto mode, and synthesized audio. v2 transforms it from a timing game into a **pure relaxing simulation** with a full solar system, realistic orbits, and dynamic train routes.

## 7 Enhancements

### 1. Dynamic Train Routes (Always Arrives)

Remove the timing challenge. When the player clicks Launch, the train always reaches the target.

**Implementation**: Replace fixed Hohmann arcs with adaptive **cubic Bezier curves**:
- P0 = departure position (fixed at launch)
- P1 = departure control point (tangent to origin planet's orbital velocity)
- P2 = arrival control point (opposite target's orbital velocity direction)
- P3 = target planet's predicted position at arrival time

The Bezier is recomputed periodically so the arc gently bends toward the moving target. At progress=1, the train is guaranteed to be at the target planet.

**Transfer time**: Still computed via Hohmann formula `T = π × sqrt(a³/μ)` for realistic duration.

**Files changed**: `simulation/transfer.ts`, `store/gameStore.ts`, `scene/TransferArc.tsx`

### 2. Sequential Auto Mode (Real Train Line)

Auto mode runs as a ping-pong line through the full solar system:

```
Mercury → Venus → Earth → Mars → Jupiter → Saturn → Uranus → Neptune
                                                                ↓
Mercury ← Venus ← Earth ← Mars ← Jupiter ← Saturn ← Uranus ← Neptune
```

- 2-second dwell at each station
- HUD shows "Next: [Planet] Station"
- No missed connections — purely relaxing
- Timetable shows full upcoming schedule

**Files changed**: `store/gameStore.ts`, `hud/Timetable.tsx`, `hud/HUD.tsx`

### 3. Classic Train Silhouette Sprite

Replace the gold octahedron with a 2D billboard sprite of a classic locomotive silhouette.

- SVG train silhouette rendered to a canvas texture
- Uses `<Billboard>` from drei to always face the camera
- Gold color with glow, rotated to point along travel direction
- Particle trail remains

**Files changed**: `scene/Train.tsx`

### 4. NASA Planet Textures

Add real NASA public domain texture maps (~512px) for all planets + Sun.

- Source: solarsystemscope.com/textures (CC BY 4.0) or NASA Visible Earth
- Load via `useTexture` from drei
- Apply as `map` on `meshStandardMaterial`, reduce emissive to let texture show
- Sun gets a photosphere texture with high emissive

**Files changed**: `scene/Planet.tsx`, `scene/Sun.tsx`, `public/textures/`

### 5. Full 3D Keplerian Orbits

Replace circular orbits with real elliptical orbits using Keplerian elements.

**New orbital parameters per planet**:
- `semiMajorAxis` (AU)
- `eccentricity`
- `inclination` (degrees)
- `longitudeAscendingNode` (degrees)
- `argumentOfPerihelion` (degrees)
- `meanAnomalyAtEpoch` (degrees)

**Kepler solver** (Newton-Raphson iteration):
1. M = M0 + (2π/T) × t
2. Solve M = E - e×sin(E) for E
3. True anomaly ν from E
4. r = a(1-e²)/(1+e×cos(ν))
5. Rotate (r, ν) into 3D via (i, Ω, ω) rotation matrices

**Orbit tracks**: 3D ellipses computed by sweeping mean anomaly 0→2π.

**Files changed**: `simulation/constants.ts`, `simulation/orbits.ts`, `scene/OrbitTrack.tsx`, `scene/Planet.tsx`

### 6. Full Solar System (8 Planets)

Add Jupiter, Saturn, Uranus, Neptune to the PLANETS array.

**Scale**: `AU_SCALE = 5` stays. Neptune at ~150 scene units from center.

**Camera**: Enable panning (`enablePan: true`). Increase max zoom distance to 250. Camera starts focused on inner system.

**Visual scaling**: Outer planets get larger `displayRadius` and `stationRadius` for visibility at distance. Gas giants are visually larger than terrestrial planets.

**Files changed**: `simulation/constants.ts`, `scene/Orrery.tsx`, `hud/RouteSelector.tsx`, `hud/Chronometer.tsx`

### 7. Add 50x Speed

Add 50x to time compression options: `[1, 50, 100, 1000]`.

**Files changed**: `simulation/constants.ts`, `hud/TimeSlider.tsx`

## Color Palette

No changes — keep existing cyan/gold/dark space palette.

## Removed Game Mechanics

- No more "missed connection" state
- No more station radius collision check (train always arrives)
- `GameState` simplified: `"idle" | "prelaunch" | "in_transit" | "arrived"`
- Remove `"missed"` state entirely
- EventSplash only shows arrival messages
