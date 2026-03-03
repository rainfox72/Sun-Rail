/** Main 3D scene: the solar system orrery with bloom postprocessing. */

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { OrbitTrack } from "./OrbitTrack";
import { Train } from "./Train";
import { GhostArc, ActiveArc } from "./TransferArc";
import { Stars } from "./Stars";
import { PLANETS } from "../simulation/constants";
import { useGameStore } from "../store/gameStore";

/** Simulation tick driver — runs inside the Canvas. */
function SimulationTick() {
  useFrame((_, delta) => {
    useGameStore.getState().tick(delta);
  });
  return null;
}

export function Orrery() {
  return (
    <Canvas
      camera={{ position: [0, 18, 3], fov: 50, near: 0.1, far: 500 }}
      style={{ position: "absolute", top: 0, left: 0 }}
      gl={{ antialias: true, toneMappingExposure: 1 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#020205");
      }}
    >
      {/* Simulation driver */}
      <SimulationTick />

      {/* Lights */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#fff4e0" />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        minDistance={4}
        maxDistance={250}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.2}
      />

      {/* Stars background */}
      <Stars />

      {/* Sun */}
      <Sun />

      {/* Orbit tracks */}
      {PLANETS.map((planet) => (
        <OrbitTrack key={planet.name} planet={planet} />
      ))}

      {/* Planets */}
      {PLANETS.map((planet) => (
        <Planet key={planet.name} planet={planet} />
      ))}

      {/* Transfer arcs */}
      <GhostArc />
      <ActiveArc />

      {/* Train */}
      <Train />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
