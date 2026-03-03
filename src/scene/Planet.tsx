/** Individual planet sphere with label, orbiting the Sun. */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { TextureLoader } from "three";
import type { Group } from "three";
import type { PlanetData } from "../simulation/constants";
import { getPlanetPosition3D } from "../simulation/orbits";
import { useGameStore } from "../store/gameStore";

interface PlanetProps {
  planet: PlanetData;
}

/** Loads a texture if the planet has a textureFile, returns null otherwise. */
function usePlanetTexture(textureFile: string | null) {
  const texture = useMemo(() => {
    if (!textureFile) return null;
    const loader = new TextureLoader();
    return loader.load(`/textures/${textureFile}`);
  }, [textureFile]);
  return texture;
}

export function Planet({ planet }: PlanetProps) {
  const groupRef = useRef<Group>(null);
  const texture = usePlanetTexture(planet.textureFile);

  useFrame(() => {
    const simTime = useGameStore.getState().simTime;
    const pos = getPlanetPosition3D(planet, simTime);
    if (groupRef.current) {
      groupRef.current.position.set(pos.x, pos.y, pos.z);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet sphere */}
      <mesh>
        <sphereGeometry args={[planet.displayRadius, 24, 24]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture}
            emissive={"#ffffff"}
            emissiveIntensity={1.0}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        )}
      </mesh>

      {/* Label */}
      <Html
        position={[0, planet.displayRadius + 0.3, 0]}
        center
        style={{
          color: planet.color,
          fontSize: "10px",
          fontFamily: "monospace",
          textTransform: "uppercase",
          letterSpacing: "2px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          textShadow: `0 0 8px ${planet.color}`,
        }}
      >
        {planet.name}
      </Html>
    </group>
  );
}
