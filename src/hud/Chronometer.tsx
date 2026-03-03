/** Circular dial showing current angle of all planets. */

import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";
import { getPlanetAngle } from "../simulation/orbits";

export function Chronometer() {
  const simTime = useGameStore((s) => s.simTime);

  const radius = 40;
  const cx = 50;
  const cy = 50;

  return (
    <div className="rounded-full border border-[#00f3ff33] bg-black/60 backdrop-blur-sm p-2">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#00f3ff"
          strokeWidth="0.5"
          opacity="0.3"
        />
        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.6}
          fill="none"
          stroke="#00f3ff"
          strokeWidth="0.3"
          opacity="0.15"
        />

        {/* Planet dots */}
        {PLANETS.map((planet) => {
          const angle = getPlanetAngle(planet, simTime);
          // Logarithmic scale so inner planets are visible among outer planets
          const maxLogR = Math.log(PLANETS[PLANETS.length - 1].semiMajorAxis + 1);
          const logR = Math.log(planet.semiMajorAxis + 1) / maxLogR;
          const normalizedR = logR * radius * 0.85 + radius * 0.1;
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
