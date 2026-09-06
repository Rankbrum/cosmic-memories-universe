import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getGlowTexture } from "@/lib/three-helpers";

/** Cosmic dust: the depth of the universe, kept within a strict particle budget. */
export function GalaxyDust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const warm = new THREE.Color("#ffd9a8");
    const rose = new THREE.Color("#e0a0a8");
    for (let i = 0; i < count; i++) {
      const radius = 12 + Math.pow(Math.random(), 0.6) * 62;
      const branch = ((i % 3) / 3) * Math.PI * 2;
      const spin = radius * 0.055;
      const scatter = () => (Math.random() - 0.5) * radius * 0.16;
      positions[i * 3] = Math.cos(branch + spin) * radius + scatter();
      positions[i * 3 + 1] = scatter() * 0.6;
      positions[i * 3 + 2] = Math.sin(branch + spin) * radius + scatter();
      const c = warm.clone().lerp(rose, Math.random() * 0.7);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.32}
        vertexColors
        map={getGlowTexture()}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
