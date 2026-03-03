/**
 * Adaptive cubic Bezier transfer curve system.
 *
 * Trains ALWAYS arrive at the target planet. The Bezier curve's endpoint (P3)
 * is the target planet's predicted position at arrival time, so at progress=1
 * the train is exactly at the target. Control points P2 and P3 are recomputed
 * live from the target planet's current orbital state, making the curve adapt
 * if the simulation parameters change.
 *
 * The transfer uses a Hohmann-estimate transit time and shapes the trajectory
 * with control points derived from each planet's orbital velocity direction.
 */

import { MU_SUN, type PlanetData } from "./constants";
import { getPlanetPosition3D, type Position3D } from "./orbits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransferArc {
  /** Simulation time (days) when the train departs */
  departureTime: number;
  /** Estimated transfer duration (days), Hohmann approximation */
  transferTime: number;
  /** Index into the PLANETS array for the origin */
  originIndex: number;
  /** Index into the PLANETS array for the target */
  targetIndex: number;
  /** Departure position in scene units (P0 of the Bezier) */
  p0: Position3D;
  /** Departure control point in scene units (P1 of the Bezier) */
  p1: Position3D;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Small time step (days) for finite-difference velocity estimation. */
const VELOCITY_DT = 0.1;

/** Fraction of transferTime used to scale control-point offsets. */
const CONTROL_SCALE = 0.3;

/**
 * Estimate a planet's velocity direction (unit vector) at a given time
 * via central finite difference:  v ~ (pos(t+dt) - pos(t-dt)) / (2*dt)
 *
 * Returns the raw velocity vector (not normalised) in scene units/day.
 */
function getPlanetVelocity(planet: PlanetData, time: number): Position3D {
  const pBefore = getPlanetPosition3D(planet, time - VELOCITY_DT);
  const pAfter = getPlanetPosition3D(planet, time + VELOCITY_DT);
  const inv2dt = 1 / (2 * VELOCITY_DT);
  return {
    x: (pAfter.x - pBefore.x) * inv2dt,
    y: (pAfter.y - pBefore.y) * inv2dt,
    z: (pAfter.z - pBefore.z) * inv2dt,
  };
}

/**
 * Evaluate a cubic Bezier curve at parameter t in [0, 1].
 *
 *   B(t) = (1-t)^3 * P0  +  3(1-t)^2 * t * P1
 *        + 3(1-t) * t^2 * P2  +  t^3 * P3
 */
function cubicBezier(
  p0: Position3D,
  p1: Position3D,
  p2: Position3D,
  p3: Position3D,
  t: number,
): Position3D {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;

  const c0 = uuu;
  const c1 = 3 * uu * t;
  const c2 = 3 * u * tt;
  const c3 = ttt;

  return {
    x: c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
    y: c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y,
    z: c0 * p0.z + c1 * p1.z + c2 * p2.z + c3 * p3.z,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the transfer arc (departure half of the Bezier) between two planets.
 *
 * Transfer time is the Hohmann estimate:  T = pi * sqrt(a^3 / mu)
 * where a = (r1 + r2) / 2 using each planet's semiMajorAxis.
 *
 * P0 is the origin planet's position at departure.
 * P1 extends from P0 in the direction of the origin planet's orbital velocity,
 * scaled by transferTime * CONTROL_SCALE.
 *
 * @param origin         Origin planet data
 * @param target         Target planet data
 * @param departureTime  Simulation time in days
 * @param originIndex    Index of origin in PLANETS array
 * @param targetIndex    Index of target in PLANETS array
 * @returns              A TransferArc with the departure-side Bezier data
 */
export function computeTransfer(
  origin: PlanetData,
  target: PlanetData,
  departureTime: number,
  originIndex: number,
  targetIndex: number,
): TransferArc {
  const r1 = origin.semiMajorAxis;
  const r2 = target.semiMajorAxis;
  const a = (r1 + r2) / 2;

  // Hohmann transfer time: half-period of the transfer ellipse (days)
  const transferTime = Math.PI * Math.sqrt((a * a * a) / MU_SUN);

  // P0: origin position at departure
  const p0 = getPlanetPosition3D(origin, departureTime);

  // Velocity direction of origin planet at departure
  const vel = getPlanetVelocity(origin, departureTime);
  const scale = transferTime * CONTROL_SCALE;

  // P1: departure control point — extend from P0 along velocity
  const p1: Position3D = {
    x: p0.x + vel.x * scale,
    y: p0.y + vel.y * scale,
    z: p0.z + vel.z * scale,
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
 * Get the position along the transfer curve at a given progress [0, 1].
 *
 * P2 and P3 are computed live from the target planet's predicted arrival state:
 *   P3 = target position at (departureTime + transferTime)
 *   P2 = P3 minus target's velocity direction * transferTime * CONTROL_SCALE
 *
 * At progress=1 the result is exactly P3, i.e. the target planet's position
 * at arrival time, guaranteeing the train always arrives.
 *
 * @param arc       The pre-computed transfer arc (departure side)
 * @param progress  Progress along the curve, 0 = departure, 1 = arrival
 * @param target    Target planet data (for live P2/P3 computation)
 * @param currentTime  Current sim time (unused but available for future use)
 * @returns         Position3D in scene units
 */
export function getTransferPosition(
  arc: TransferArc,
  progress: number,
  target: PlanetData,
  _currentTime: number,
): Position3D {
  const arrivalTime = arc.departureTime + arc.transferTime;

  // P3: target planet position at predicted arrival time
  const p3 = getPlanetPosition3D(target, arrivalTime);

  // Target velocity at arrival for the P2 control point
  const targetVel = getPlanetVelocity(target, arrivalTime);
  const scale = arc.transferTime * CONTROL_SCALE;

  // P2: arrival control point — approach from the target's velocity direction
  const p2: Position3D = {
    x: p3.x - targetVel.x * scale,
    y: p3.y - targetVel.y * scale,
    z: p3.z - targetVel.z * scale,
  };

  return cubicBezier(arc.p0, arc.p1, p2, p3, progress);
}

/**
 * Generate an array of 3D points along the transfer arc for rendering.
 *
 * Uses the same adaptive Bezier as getTransferPosition — P2/P3 are computed
 * live from the target planet state.
 *
 * @param arc       The pre-computed transfer arc
 * @param target    Target planet data
 * @param currentTime  Current sim time
 * @param segments  Number of line segments (default 64)
 * @returns         Array of [x, y, z] tuples in scene units
 */
export function getTransferArcPoints(
  arc: TransferArc,
  target: PlanetData,
  _currentTime: number,
  segments: number = 64,
): [number, number, number][] {
  const arrivalTime = arc.departureTime + arc.transferTime;

  // Compute P2 and P3 once for all segments
  const p3 = getPlanetPosition3D(target, arrivalTime);
  const targetVel = getPlanetVelocity(target, arrivalTime);
  const scale = arc.transferTime * CONTROL_SCALE;
  const p2: Position3D = {
    x: p3.x - targetVel.x * scale,
    y: p3.y - targetVel.y * scale,
    z: p3.z - targetVel.z * scale,
  };

  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pos = cubicBezier(arc.p0, arc.p1, p2, p3, t);
    points.push([pos.x, pos.y, pos.z]);
  }
  return points;
}
