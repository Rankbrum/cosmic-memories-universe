import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DUST_BUDGET, detectQuality, getGlowTexture } from "@/lib/three-helpers";

const LINES = [
  "Cada estrela guarda uma memória.",
  "Cada memória guarda uma parte de nós.",
  "Bem-vinda ao nosso universo, Michele.",
];

function Warp({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const speed = useRef(0);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1 + Math.random() * 14;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
      arr[i * 3 + 2] = -Math.random() * 220;
    }
    return arr;
  }, [count]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    speed.current = Math.min(speed.current + dt * 26, 70);
    const geo = ref.current?.geometry;
    if (!geo) return;
    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 2; i < arr.length; i += 3) {
      const z = (arr[i] ?? 0) + speed.current * dt;
      arr[i] = z > 6 ? -220 : z;
    }
    pos.needsUpdate = true;
    if (ref.current) ref.current.rotation.z += dt * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.42}
        map={getGlowTexture()}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ffe6bd"
        sizeAttenuation
      />
    </points>
  );
}

/** Phase 2 — the camera travels inside the envelope into a dimensional corridor. */
export function PortalTransition({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(-1);
  const count = Math.round(DUST_BUDGET[detectQuality()] * 0.7);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLine(0), 700),
      setTimeout(() => setLine(1), 3400),
      setTimeout(() => setLine(2), 6200),
      setTimeout(onDone, 9400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-ink">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }} dpr={[1, 1.8]}>
        <fog attach="fog" args={["#140a0c", 20, 160]} />
        <Warp count={count} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
        {line >= 0 && (
          <p
            key={line}
            className="animate-fade-rise max-w-lg text-center font-display text-2xl text-foreground/95 sm:text-4xl"
          >
            {LINES[line]}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDone}
        className="absolute bottom-8 right-8 text-[0.6rem] tracking-cinema text-muted-foreground transition-colors hover:text-gold"
      >
        Pular
      </button>
    </div>
  );
}
