/** Distance and gravity-proximity helpers for train FX. */

import { AU_SCALE, type PlanetData } from "./constants";

/** Get distance between two {x, z} positions (scene units). */
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
