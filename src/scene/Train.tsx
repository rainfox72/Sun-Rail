/** Train entity moving along a transfer arc with particle trail. */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import type { BufferAttribute } from "three";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { PLANETS } from "../simulation/constants";
import { getTransferPosition } from "../simulation/transfer";

const TRAIL_LENGTH = 40;

/** Create a 64x32 canvas texture with a gold locomotive silhouette. */
function createTrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  const gold = "#ffc107";

  // Body
  ctx.fillStyle = gold;
  ctx.fillRect(8, 8, 40, 16);

  // Cab (taller rear section)
  ctx.fillRect(36, 2, 16, 22);

  // Smokestack
  ctx.fillRect(14, 2, 6, 8);

  // Cowcatcher (front wedge)
  ctx.beginPath();
  ctx.moveTo(8, 24);
  ctx.lineTo(2, 28);
  ctx.lineTo(8, 28);
  ctx.closePath();
  ctx.fill();

  // Wheels
  ctx.beginPath();
  ctx.arc(16, 28, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, 28, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(44, 28, 4, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Train() {
  // Position ref — the GROUP that moves, outside Billboard
  const posGroupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef(new Float32Array(TRAIL_LENGTH * 3));
  const trailIndex = useRef(0);

  const trainTexture = useMemo(() => createTrainTexture(), []);

  const trailGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_LENGTH * 3);
    const opacities = new Float32Array(TRAIL_LENGTH);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
    return geom;
  }, []);

  useFrame(() => {
    const { activeTrain, gameState, simTime } = useGameStore.getState();

    if (!activeTrain || gameState === "idle" || gameState === "prelaunch") {
      if (posGroupRef.current) posGroupRef.current.visible = false;
      if (trailRef.current) trailRef.current.visible = false;
      return;
    }

    const target = PLANETS[activeTrain.targetIndex];
    const pos = getTransferPosition(activeTrain.arc, activeTrain.progress, target, simTime);

    // Move the PARENT GROUP (not the mesh inside Billboard)
    // This ensures Billboard rotation only affects orientation, not position.
    if (posGroupRef.current) {
      posGroupRef.current.visible = true;
      posGroupRef.current.position.set(pos.x, pos.y, pos.z);
    }

    // Update trail
    if (trailRef.current) {
      trailRef.current.visible = true;
      const idx = trailIndex.current % TRAIL_LENGTH;
      trailPositions.current[idx * 3] = pos.x;
      trailPositions.current[idx * 3 + 1] = pos.y;
      trailPositions.current[idx * 3 + 2] = pos.z;
      trailIndex.current++;

      const posAttr = trailGeometry.getAttribute(
        "position"
      ) as BufferAttribute;
      const opacityAttr = trailGeometry.getAttribute(
        "opacity"
      ) as BufferAttribute;

      for (let i = 0; i < TRAIL_LENGTH; i++) {
        posAttr.setXYZ(
          i,
          trailPositions.current[i * 3],
          trailPositions.current[i * 3 + 1],
          trailPositions.current[i * 3 + 2]
        );
        // Fade older points
        const age =
          (trailIndex.current - i + TRAIL_LENGTH) % TRAIL_LENGTH;
        opacityAttr.setX(i, Math.max(0, 1 - age / TRAIL_LENGTH));
      }

      posAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Positioned group moves through space; Billboard inside only rotates */}
      <group ref={posGroupRef} visible={false}>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <mesh>
            <planeGeometry args={[0.5, 0.25]} />
            <meshBasicMaterial
              map={trainTexture}
              transparent
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </group>

      {/* Particle trail */}
      <points ref={trailRef} visible={false} geometry={trailGeometry}>
        <pointsMaterial
          color="#ffc107"
          size={0.06}
          transparent
          opacity={0.6}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
    </group>
  );
}
