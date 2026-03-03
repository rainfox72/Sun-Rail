/**
 * Keplerian orbit solver for computing planet positions from orbital elements.
 *
 * Implements the standard two-body Keplerian solution:
 *   1. Mean anomaly from epoch + elapsed time
 *   2. Newton-Raphson iteration to solve Kepler's equation for eccentric anomaly
 *   3. True anomaly from eccentric anomaly
 *   4. Heliocentric distance from the orbit equation
 *   5. 3D rotation via inclination, longitude of ascending node, argument of perihelion
 *   6. Scaling from AU to scene units via AU_SCALE
 */

import { AU_SCALE, type PlanetData } from "./constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A position in 3D scene space. */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const TWO_PI = 2 * Math.PI;
const DEG_TO_RAD = Math.PI / 180;

/** Maximum Newton-Raphson iterations for Kepler's equation. */
const MAX_ITERATIONS = 30;

/** Convergence tolerance for eccentric anomaly (radians). */
const TOLERANCE = 1e-12;

/**
 * Solve Kepler's equation  M = E - e * sin(E)  for eccentric anomaly E
 * using Newton-Raphson iteration.
 *
 * @param M  Mean anomaly in radians
 * @param e  Eccentricity (0 <= e < 1)
 * @returns  Eccentric anomaly E in radians
 */
function solveKeplerEquation(M: number, e: number): number {
  // Normalize M into [0, 2pi)
  let Mnorm = M % TWO_PI;
  if (Mnorm < 0) Mnorm += TWO_PI;

  // Initial guess: E = M for low eccentricity, better start for higher e
  let E = Mnorm + e * Math.sin(Mnorm);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const sinE = Math.sin(E);
    const cosE = Math.cos(E);
    const f = E - e * sinE - Mnorm;
    const fPrime = 1 - e * cosE;

    // Guard against near-zero derivative (should not happen for e < 1)
    if (Math.abs(fPrime) < 1e-15) break;

    const dE = f / fPrime;
    E -= dE;

    if (Math.abs(dE) < TOLERANCE) break;
  }

  return E;
}

/**
 * Compute the true anomaly from the eccentric anomaly.
 *
 * Uses the half-angle formula:
 *   tan(nu/2) = sqrt((1+e)/(1-e)) * tan(E/2)
 *
 * @param E  Eccentric anomaly in radians
 * @param e  Eccentricity
 * @returns  True anomaly nu in radians
 */
function trueAnomalyFromEccentric(E: number, e: number): number {
  const halfE = E / 2;
  const factor = Math.sqrt((1 + e) / (1 - e));
  return 2 * Math.atan2(factor * Math.sin(halfE), Math.cos(halfE));
}

/**
 * Rotate an orbital-plane position (r, nu) into 3D ecliptic coordinates.
 *
 * The rotation applies three Euler angles in the standard order:
 *   1. Argument of perihelion (omega) — rotation in the orbital plane
 *   2. Inclination (i) — tilt of the orbital plane
 *   3. Longitude of ascending node (Omega) — orientation of the ascending node
 *
 * The combined rotation matrix is:
 *   R = Rz(-Omega) * Rx(-i) * Rz(-omega)
 *
 * Applied to the orbital-plane position vector [r*cos(nu), r*sin(nu), 0].
 *
 * @param r      Heliocentric distance (AU, then scaled)
 * @param nu     True anomaly in radians
 * @param iRad   Inclination in radians
 * @param OmRad  Longitude of ascending node in radians
 * @param wRad   Argument of perihelion in radians
 * @returns      Position3D in scene units
 */
function rotateToEcliptic(
  r: number,
  nu: number,
  iRad: number,
  OmRad: number,
  wRad: number,
): Position3D {
  // Position in the orbital plane
  const cosNu = Math.cos(nu);
  const sinNu = Math.sin(nu);
  const xOrb = r * cosNu;
  const yOrb = r * sinNu;

  // Pre-compute trig for rotation angles
  const cosW = Math.cos(wRad);
  const sinW = Math.sin(wRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  const cosOm = Math.cos(OmRad);
  const sinOm = Math.sin(OmRad);

  // Combined rotation matrix elements (row-by-row):
  // X_ecl = (cosOm*cosW - sinOm*sinW*cosI) * xOrb
  //       + (-cosOm*sinW - sinOm*cosW*cosI) * yOrb
  // Y_ecl = (sinOm*cosW + cosOm*sinW*cosI) * xOrb
  //       + (-sinOm*sinW + cosOm*cosW*cosI) * yOrb
  // Z_ecl = (sinW*sinI) * xOrb
  //       + (cosW*sinI) * yOrb

  const xEcl =
    (cosOm * cosW - sinOm * sinW * cosI) * xOrb +
    (-cosOm * sinW - sinOm * cosW * cosI) * yOrb;

  const yEcl =
    (sinOm * cosW + cosOm * sinW * cosI) * xOrb +
    (-sinOm * sinW + cosOm * cosW * cosI) * yOrb;

  const zEcl = sinW * sinI * xOrb + cosW * sinI * yOrb;

  // Map ecliptic coordinates to scene axes:
  //   scene X = ecliptic X
  //   scene Y = ecliptic Z  (up in the 3D scene)
  //   scene Z = ecliptic Y
  return { x: xEcl, y: zEcl, z: yEcl };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the full 3D heliocentric position of a planet at a given time.
 *
 * @param planet     Planet orbital element data
 * @param timeInDays Elapsed time since epoch in days
 * @returns          Position in scene units (AU_SCALE applied)
 */
export function getPlanetPosition3D(
  planet: PlanetData,
  timeInDays: number,
): Position3D {
  const {
    semiMajorAxis: a,
    eccentricity: e,
    inclination,
    longitudeAscendingNode,
    argumentOfPerihelion,
    meanAnomalyAtEpoch,
    orbitalPeriod: T,
  } = planet;

  // Step 1: Mean anomaly at time t
  const M0 = meanAnomalyAtEpoch * DEG_TO_RAD;
  const n = TWO_PI / T; // mean motion (rad/day)
  const M = M0 + n * timeInDays;

  // Step 2: Solve Kepler's equation for eccentric anomaly
  const E = solveKeplerEquation(M, e);

  // Step 3: True anomaly
  const nu = trueAnomalyFromEccentric(E, e);

  // Step 4: Heliocentric distance in AU
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

  // Step 5: Scale to scene units
  const rScene = r * AU_SCALE;

  // Step 6: Rotate into 3D ecliptic frame and then to scene axes
  const iRad = inclination * DEG_TO_RAD;
  const OmRad = longitudeAscendingNode * DEG_TO_RAD;
  const wRad = argumentOfPerihelion * DEG_TO_RAD;

  return rotateToEcliptic(rScene, nu, iRad, OmRad, wRad);
}

/**
 * Backward-compatible 2D position (x, z) projected onto the ecliptic plane.
 *
 * @param planet     Planet orbital element data
 * @param timeInDays Elapsed time since epoch in days
 * @returns          { x, z } position in scene units
 */
export function getPlanetPosition(
  planet: PlanetData,
  timeInDays: number,
): { x: number; z: number } {
  const pos = getPlanetPosition3D(planet, timeInDays);
  return { x: pos.x, z: pos.z };
}

/**
 * Get the orbital angle (true anomaly) of a planet at a given time.
 *
 * This returns the true anomaly in radians, useful for angular indicators
 * such as the Chronometer display.
 *
 * @param planet     Planet orbital element data
 * @param timeInDays Elapsed time since epoch in days
 * @returns          True anomaly in radians
 */
export function getPlanetAngle(
  planet: PlanetData,
  timeInDays: number,
): number {
  const {
    eccentricity: e,
    meanAnomalyAtEpoch,
    orbitalPeriod: T,
  } = planet;

  const M0 = meanAnomalyAtEpoch * DEG_TO_RAD;
  const n = TWO_PI / T;
  const M = M0 + n * timeInDays;

  const E = solveKeplerEquation(M, e);
  return trueAnomalyFromEccentric(E, e);
}

/**
 * Generate an array of 3D points tracing the full orbit ellipse.
 *
 * Used to render the visible orbit track (rail) in the scene. The points
 * are evenly spaced in eccentric anomaly, which gives a smooth curve
 * even for high-eccentricity orbits.
 *
 * @param planet   Planet orbital element data
 * @param segments Number of line segments (default 256)
 * @returns        Array of [x, y, z] tuples in scene units
 */
export function getOrbitTrackPoints(
  planet: PlanetData,
  segments: number = 256,
): [number, number, number][] {
  const {
    semiMajorAxis: a,
    eccentricity: e,
    inclination,
    longitudeAscendingNode,
    argumentOfPerihelion,
  } = planet;

  const iRad = inclination * DEG_TO_RAD;
  const OmRad = longitudeAscendingNode * DEG_TO_RAD;
  const wRad = argumentOfPerihelion * DEG_TO_RAD;
  const semiLatusRectum = a * (1 - e * e);

  const points: [number, number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    // Evenly space in eccentric anomaly for uniform point distribution
    const E = (TWO_PI * i) / segments;
    const nu = trueAnomalyFromEccentric(E, e);
    const r = semiLatusRectum / (1 + e * Math.cos(nu));
    const rScene = r * AU_SCALE;

    const pos = rotateToEcliptic(rScene, nu, iRad, OmRad, wRad);
    points.push([pos.x, pos.y, pos.z]);
  }

  return points;
}
