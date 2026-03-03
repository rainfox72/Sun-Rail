/** Vertical fuel/momentum gauge that pulses near gravity wells. */

import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";
import { getPlanetPosition } from "../simulation/orbits";
import { getTransferPosition } from "../simulation/transfer";
import { getGravityProximity } from "../simulation/collision";

export function FuelGauge() {
  const [proximity, setProximity] = useState(0);
  const activeTrain = useGameStore((s) => s.activeTrain);
  const simTime = useGameStore((s) => s.simTime);
  const gameState = useGameStore((s) => s.gameState);

  useEffect(() => {
    if (gameState !== "in_transit" || !activeTrain) {
      setProximity(0);
      return;
    }

    const target = PLANETS[activeTrain.targetIndex];
    const trainPos = getTransferPosition(activeTrain.arc, activeTrain.progress, target, simTime);
    const planetPositions = PLANETS.map((p) => getPlanetPosition(p, simTime));
    const prox = getGravityProximity(trainPos, PLANETS, planetPositions);
    setProximity(prox);
  }, [activeTrain?.progress, simTime, gameState]);

  const fillHeight = 20 + proximity * 80; // 20% base, up to 100%
  const glowIntensity = proximity * 20;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[9px] tracking-widest opacity-60">MOMENTUM</div>

      <div
        className="relative w-4 h-32 rounded-full border border-[#00f3ff33] bg-black/60 backdrop-blur-sm overflow-hidden"
      >
        {/* Fill bar */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300"
          style={{
            height: `${fillHeight}%`,
            background: `linear-gradient(to top, #00f3ff, #ffc107)`,
            opacity: 0.4 + proximity * 0.6,
            boxShadow: `0 0 ${glowIntensity}px #00f3ff`,
          }}
        />

        {/* Pulsing overlay when near gravity well */}
        {proximity > 0.3 && (
          <div
            className="absolute bottom-0 left-0 right-0 animate-pulse"
            style={{
              height: `${fillHeight}%`,
              background: `linear-gradient(to top, transparent, #ffc107)`,
              opacity: proximity * 0.5,
            }}
          />
        )}
      </div>

      <div className="text-[9px] tabular-nums opacity-60">
        {(proximity * 100).toFixed(0)}%
      </div>
    </div>
  );
}
