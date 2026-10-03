import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getGlowTexture } from "@/lib/three-helpers";
import type { StarNode } from "@/lib/star-layout";

const REVEAL_FAR = 16;
const REVEAL_NEAR = 6;

/**
 * A star IS a memory. Far away it is only light; as the camera approaches the
 * photograph slowly surfaces from inside the glow.
 */
export function MemoryStar({
  node,
  onSelect,
  dimmed,
}: {
  node: StarNode;
  onSelect: (node: StarNode) => void;
  dimmed: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Sprite>(null);
  const photo = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [near, setNear] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();
  const legendary = node.memory.importance === "legendary";

  useEffect(() => {
    if (!near || texture || !node.memory.coverUrl) return;
    let cancelled = false;
    new THREE.TextureLoader().load(node.memory.coverUrl, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      if (!cancelled) setTexture(t);
    });
    return () => {
      cancelled = true;
    };
  }, [near, texture, node.memory.coverUrl]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const g = group.current;
    if (!g) return;
    g.quaternion.copy(camera.quaternion);
    const dist = camera.position.distanceTo(g.position);
    if (dist < REVEAL_FAR && !near) setNear(true);
    else if (dist > REVEAL_FAR * 1.6 && near) setNear(false);

    const proximity = THREE.MathUtils.clamp((REVEAL_FAR - dist) / (REVEAL_FAR - REVEAL_NEAR), 0, 1);
    const pulse =
      1 + Math.sin(state.clock.elapsedTime * (legendary ? 1.1 : 1.8) + node.size * 20) * 0.06;
    const target = node.size * (1 + proximity * 2.6) * pulse * (hovered ? 1.18 : 1);

    if (glow.current) {
      const s = THREE.MathUtils.damp(glow.current.scale.x, target * 3.2, 6, dt);
      glow.current.scale.setScalar(s);
      const mat = glow.current.material as THREE.SpriteMaterial;
      mat.opacity = THREE.MathUtils.damp(
        mat.opacity,
        (dimmed ? 0.18 : 0.75) + proximity * 0.25,
        6,
        dt,
      );
    }
    if (photo.current) {
      const mat = photo.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, texture ? proximity * 0.95 : 0, 4, dt);
      const s = THREE.MathUtils.damp(photo.current.scale.x, target * 2.1, 6, dt);
      photo.current.scale.set(s, s * 0.72, 1);
    }
  });

  return (
    <group ref={group} position={node.position}>
      <sprite
        ref={glow}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 4) return;
          if (dimmed) return;
          onSelect(node);
        }}
        onPointerOver={() => {
          if (!dimmed) setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <spriteMaterial
          map={getGlowTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color={
            node.memory.secret
              ? "#ffc2d4"
              : legendary
                ? "#ffd9a1"
                : node.memory.importance === "special"
                  ? "#ffe9c9"
                  : "#fff6e8"
          }
          opacity={0.7}
        />
      </sprite>
      {texture && (
        <mesh ref={photo} position={[0, 0, 0.01]} raycast={() => null}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} transparent opacity={0} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
