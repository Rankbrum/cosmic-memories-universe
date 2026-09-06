import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DUST_BUDGET, detectQuality, getGlowTexture } from "@/lib/three-helpers";

function heartPoint(t: number): [number, number] {
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [x * 0.55, y * 0.55];
}

function HeartField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const progress = useRef(0);

  const { start, end } = useMemo(() => {
    const start = new Float32Array(count * 3);
    const end = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 40;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      start[i * 3] = Math.sin(b) * Math.cos(a) * r;
      start[i * 3 + 1] = Math.cos(b) * r * 0.5;
      start[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r;
      const [hx, hy] = heartPoint(Math.random() * Math.PI * 2);
      const jitter = Math.pow(Math.random(), 0.6);
      end[i * 3] = hx * jitter + (Math.random() - 0.5) * 0.5;
      end[i * 3 + 1] = hy * jitter + (Math.random() - 0.5) * 0.5;
      end[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }
    return { start, end };
  }, [count]);

  const positions = useMemo(() => Float32Array.from(start), [start]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    progress.current = Math.min(progress.current + dt * 0.16, 1);
    const eased = 1 - Math.pow(1 - progress.current, 3);
    const geo = ref.current?.geometry;
    if (!geo) return;
    const attr = geo.attributes["position"] as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (start[i] ?? 0) * (1 - eased) + (end[i] ?? 0) * eased;
    }
    attr.needsUpdate = true;
    if (ref.current) ref.current.rotation.y = Math.sin(performance.now() * 0.00012) * 0.25;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        map={getGlowTexture()}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ffcfae"
        sizeAttenuation
      />
    </points>
  );
}

const FINAL_LINES = [
  "Entre bilhões de pessoas,\nnossas histórias se encontraram.",
  "Renan & Michele",
  "E isso ainda é só o começo.",
];

/** Phase 5 — the camera pulls back and the stars rearrange into R ♥ M. */
export function FinalScene({ onContinue }: { onContinue: () => void }) {
  const [line, setLine] = useState(-1);
  const count = Math.round(DUST_BUDGET[detectQuality()] * 0.6);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLine(0), 2600),
      setTimeout(() => setLine(1), 6200),
      setTimeout(() => setLine(2), 9400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-ink">
      <Canvas camera={{ position: [0, 0, 34], fov: 55 }} dpr={[1, 1.8]}>
        <HeartField count={count} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-6 px-8 pb-24 text-center">
        <p className="font-display text-3xl tracking-[0.3em] text-gold">R ♥ M</p>
        {line >= 0 && (
          <p
            key={line}
            className="animate-fade-rise max-w-lg whitespace-pre-line font-display text-2xl text-foreground/95"
          >
            {FINAL_LINES[line]}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 border-b border-gold/40 pb-1 text-[0.65rem] tracking-cinema text-gold"
      >
        Continuar nossa história
      </button>
    </div>
  );
}
