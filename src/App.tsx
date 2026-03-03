/** Sun Rail — Interplanetary train simulation. */

import { useEffect } from "react";
import { Orrery } from "./scene/Orrery";
import { HUD } from "./hud/HUD";
import { initAudio } from "./audio/AudioManager";

function App() {
  useEffect(() => {
    // Init audio on first user interaction (required by browsers)
    const handler = () => {
      initAudio();
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
    };
    document.addEventListener("click", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <Orrery />
      <HUD />
    </div>
  );
}

export default App;
