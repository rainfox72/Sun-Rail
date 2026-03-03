/** Arrival splash overlay. */

import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export function EventSplash() {
  const splashMessage = useGameStore((s) => s.splashMessage);
  const dismissSplash = useGameStore((s) => s.dismissSplash);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (!splashMessage) return;
    const timer = setTimeout(() => {
      dismissSplash();
    }, 3000);
    return () => clearTimeout(timer);
  }, [splashMessage]);

  if (!splashMessage) return null;

  const color = "#00e676";

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className="text-center animate-in fade-in zoom-in duration-500"
        style={{
          textShadow: `0 0 40px ${color}, 0 0 80px ${color}`,
        }}
      >
        <div
          className="text-3xl font-bold tracking-[0.3em] mb-2"
          style={{ color }}
        >
          {splashMessage}
        </div>
        <div className="text-sm opacity-60" style={{ color }}>
          Connection successful
        </div>
      </div>
    </div>
  );
}
