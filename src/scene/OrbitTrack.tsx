/** Glowing wireframe orbit ring — looks like a physical train track. */

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { PlanetData } from "../simulation/constants";
import { getOrbitTrackPoints } from "../simulation/orbits";

interface OrbitTrackProps {
  planet: PlanetData;
}

export function OrbitTrack({ planet }: OrbitTrackProps) {
  const points = useMemo(() => getOrbitTrackPoints(planet, 128), [planet]);

  return (
    <Line
      points={points}
      color="#00f3ff"
      lineWidth={1}
      transparent
      opacity={0.3}
      toneMapped={false}
    />
  );
}
