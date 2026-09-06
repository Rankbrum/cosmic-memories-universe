import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GalaxyDust } from "./GalaxyDust";
import { MemoryStar } from "./MemoryStar";
import { DUST_BUDGET, detectQuality } from "@/lib/three-helpers";
import { layoutStars, type StarNode } from "@/lib/star-layout";
import type { Category, Memory } from "@/lib/universe-types";

function ConstellationLines({ nodes }: { nodes: StarNode[] }) {
  const geometry = useMemo(() => {
    const groups = new Map<number, StarNode[]>();
    for (const n of nodes) {
      const list = groups.get(n.constellationIndex) ?? [];
      list.push(n);
      groups.set(n.constellationIndex, list);
    }
    const points: number[] = [];
    for (const list of groups.values()) {
      const sorted = [...list].sort((a, b) => a.position[1] - b.position[1]);
      for (let i = 0; i < sorted.length - 1; i++) {
        points.push(...sorted[i]!.position, ...sorted[i + 1]!.position);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [nodes]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#e6b98a" transparent opacity={0.13} depthWrite={false} />
    </lineSegments>
  );
}

function CameraRig({ focus }: { focus: StarNode | null }) {
  const { camera } = useThree();
  const home = useRef(new THREE.Vector3(0, 8, 42));
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (focus) {
      const star = new THREE.Vector3(...focus.position);
      const dir = star.clone().sub(camera.position).normalize();
      const dest = star.clone().sub(dir.multiplyScalar(3.4));
      camera.position.lerp(dest, 1 - Math.exp(-2.6 * dt));
      target.current.lerp(star, 1 - Math.exp(-3 * dt));
      camera.lookAt(target.current);
    } else if (home.current.distanceTo(camera.position) > 0.4) {
      // gently released back into the universe
      target.current.lerp(new THREE.Vector3(0, 0, 0), 1 - Math.exp(-1.2 * dt));
    }
  });
  return null;
}

export interface UniverseSceneProps {
  memories: Memory[];
  categories: Category[];
  focusId: string | null;
  onSelect: (memory: Memory) => void;
}

export function UniverseScene({ memories, categories, focusId, onSelect }: UniverseSceneProps) {
  const [quality] = useState(detectQuality);
  const nodes = useMemo(
    () =>
      layoutStars(
        memories,
        categories.map((c) => c.id),
      ),
    [memories, categories],
  );
  const focus = useMemo(() => nodes.find((n) => n.memory.id === focusId) ?? null, [nodes, focusId]);

  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 8, 42], fov: 60 }}
      dpr={quality === "low" ? [1, 1.2] : [1, 1.9]}
      gl={{ antialias: quality !== "low" }}
    >
      <color attach="background" args={["#0a0507"]} />
      <fog attach="fog" args={["#0a0507", 55, 130]} />
      <ambientLight intensity={0.4} />
      <GalaxyDust count={DUST_BUDGET[quality]} />
      <ConstellationLines nodes={nodes} />
      {nodes.map((node) => (
        <MemoryStar
          key={node.memory.id}
          node={node}
          dimmed={Boolean(focusId) && focusId !== node.memory.id}
          onSelect={(n) => onSelect(n.memory)}
        />
      ))}
      <CameraRig focus={focus} />
      <OrbitControls
        enabled={!focus}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.45}
        zoomSpeed={0.7}
        minDistance={7}
        maxDistance={90}
        autoRotate
        autoRotateSpeed={0.12}
      />
    </Canvas>
  );
}
