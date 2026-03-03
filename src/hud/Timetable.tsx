/** Sequential train schedule display for auto mode. */

import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";

export function Timetable() {
  const autoMode = useGameStore((s) => s.autoMode);
  const autoLineIndex = useGameStore((s) => s.autoLineIndex);
  const autoDirection = useGameStore((s) => s.autoDirection);
  const gameState = useGameStore((s) => s.gameState);
  const activeTrain = useGameStore((s) => s.activeTrain);

  if (!autoMode) return null;

  // Build upcoming 5 stops by walking forward from current autoLineIndex
  const stops: number[] = [];
  let idx = autoLineIndex;
  let dir = autoDirection;

  for (let i = 0; i < 5; i++) {
    stops.push(idx);
    let next = idx + dir;
    // Bounce at array ends
    if (next >= PLANETS.length) {
      dir = -1;
      next = PLANETS.length - 2;
    } else if (next < 0) {
      dir = 1;
      next = 1;
    }
    idx = next;
  }

  const currentDest =
    gameState === "in_transit" && activeTrain
      ? PLANETS[activeTrain.targetIndex].name
      : null;

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-[#00f3ff33] rounded-lg px-3 py-2">
      <div className="text-[9px] tracking-widest opacity-60 mb-2">
        SCHEDULE
      </div>

      {gameState === "in_transit" && currentDest && (
        <div className="text-[10px] text-[#ffc107] mb-1.5">
          Next: {currentDest} Station
        </div>
      )}

      <div className="flex items-center gap-1">
        {stops.map((stopIdx, i) => {
          const planet = PLANETS[stopIdx];
          // First stop = current destination (gold), second = next (cyan), rest = dim
          const isCurrentDest = i === 0;
          const isNext = i === 1;

          let color = "#ffffff30";
          let fontWeight = "normal";
          if (isCurrentDest) {
            color = "#ffc107";
            fontWeight = "bold";
          } else if (isNext) {
            color = "#00f3ff";
          }

          return (
            <span key={`${stopIdx}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <span className="text-[8px]" style={{ color: "#ffffff30" }}>
                  →
                </span>
              )}
              <span
                className="text-[10px]"
                style={{ color, fontWeight }}
              >
                {planet.name}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
