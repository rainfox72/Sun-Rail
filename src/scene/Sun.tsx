/** Central Sun with bloom glow. */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import type { Mesh } from "three";
import { SUN } from "../simulation/constants";

export function Sun() {
  const meshRef = useRef<Mesh>(null);

  const texture = useMemo(() => {
    const loader = new TextureLoader();
    return loader.load("/textures/sun.jpg");
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[SUN.displayRadius, 32, 32]} />
      {texture ? (
        <meshStandardMaterial
          map={texture}
          color={SUN.color}
          emissive={SUN.emissiveColor}
          emissiveIntensity={2}
          toneMapped={false}
        />
      ) : (
        <meshStandardMaterial
          color={SUN.color}
          emissive={SUN.emissiveColor}
          emissiveIntensity={2}
          toneMapped={false}
        />
      )}
    </mesh>
  );
}
