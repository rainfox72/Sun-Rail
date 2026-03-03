/** Main HUD overlay container. */

import { useGameStore } from "../store/gameStore";
import { Chronometer } from "./Chronometer";
import { FuelGauge } from "./FuelGauge";
import { Timetable } from "./Timetable";
import { TimeSlider } from "./TimeSlider";
import { RouteSelector } from "./RouteSelector";
import { EventSplash } from "./EventSplash";

export function HUD() {
  const autoMode = useGameStore((s) => s.autoMode);
  const toggleAutoMode = useGameStore((s) => s.toggleAutoMode);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top-left: Route selector */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <RouteSelector />
      </div>

      {/* Top-right: Chronometer */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <Chronometer />
      </div>

      {/* Right side: Fuel gauge */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
        <FuelGauge />
      </div>

      {/* Bottom center: Timetable */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-auto">
        <Timetable />
      </div>

      {/* Bottom-right: Time controls */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <TimeSlider />
      </div>

      {/* Bottom-left: Auto mode toggle */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <button
          onClick={toggleAutoMode}
          className={`px-3 py-1.5 text-[10px] tracking-widest rounded border transition-all ${
            autoMode
              ? "border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff20] animate-pulse"
              : "border-[#00f3ff33] text-[#00f3ff60] hover:text-[#00f3ff]"
          }`}
        >
          {autoMode ? "AUTO MODE ●" : "AUTO MODE"}
        </button>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <h1
          className="text-lg font-bold tracking-[0.5em] text-[#ffc107]"
          style={{ textShadow: "0 0 20px #ffc10780" }}
        >
          SUN RAIL
        </h1>
      </div>

      {/* Event splash */}
      <EventSplash />
    </div>
  );
}
