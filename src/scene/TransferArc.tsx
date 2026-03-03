/** Ghost preview and active transfer arc paths. */

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";
import { getPlanetPosition3D } from "../simulation/orbits";
import {
  computeTransfer,
  getTransferArcPoints,
} from "../simulation/transfer";

/** Ghost preview arc shown in prelaunch state. */
export function GhostArc() {
  const simTime = useGameStore((s) => s.simTime);
  const gameState = useGameStore((s) => s.gameState);
  const originIdx = useGameStore((s) => s.selectedOrigin);
  const targetIdx = useGameStore((s) => s.selectedTarget);

  const arcData = useMemo(() => {
    if (gameState !== "prelaunch" && gameState !== "idle") return null;
    const origin = PLANETS[originIdx];
    const target = PLANETS[targetIdx];
    const arc = computeTransfer(origin, target, simTime, originIdx, targetIdx);
    const points = getTransferArcPoints(arc, target, simTime);
    const arrivalPos = getPlanetPosition3D(target, simTime + arc.transferTime);
    return { points, arrivalPos };
  }, [gameState, originIdx, targetIdx, Math.floor(simTime)]);

  if (!arcData) return null;

  return (
    <group>
      {/* Ghost transfer arc */}
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
      {/* Predicted target position */}
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
  }, [activeTrain?.arc, Math.floor(simTime)]);

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
