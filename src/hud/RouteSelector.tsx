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
        {/* Origin selector */}
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

        <span className="text-[#ffc107] text-xs">→</span>

        {/* Target selector */}
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

      {/* Launch / Reset button */}
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
