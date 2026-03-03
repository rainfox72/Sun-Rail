/** Time compression control: 1x / 100x / 1000x. */

import { useGameStore } from "../store/gameStore";
import { TIME_SPEEDS, type TimeSpeed } from "../simulation/constants";

export function TimeSlider() {
  const speedMultiplier = useGameStore((s) => s.speedMultiplier);
  const simTime = useGameStore((s) => s.simTime);
  const paused = useGameStore((s) => s.paused);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const togglePause = useGameStore((s) => s.togglePause);

  const simDays = Math.floor(simTime);
  const simYears = (simTime / 365.25).toFixed(1);

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-[#00f3ff33] rounded-lg px-3 py-2 flex items-center gap-3">
      {/* Pause button */}
      <button
        onClick={togglePause}
        className="text-[#00f3ff] hover:text-[#ffc107] transition-colors text-sm"
        title={paused ? "Resume" : "Pause"}
      >
        {paused ? "▶" : "❚❚"}
      </button>

      {/* Speed buttons */}
      <div className="flex gap-1">
        {TIME_SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => setSpeed(speed as TimeSpeed)}
            className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
              speedMultiplier === speed
                ? "border-[#ffc107] text-[#ffc107] bg-[#ffc10720]"
                : "border-[#00f3ff33] text-[#00f3ff80] hover:text-[#00f3ff]"
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Sim time display */}
      <div className="text-[10px] tabular-nums opacity-60">
        Day {simDays} ({simYears}y)
      </div>
    </div>
  );
}
