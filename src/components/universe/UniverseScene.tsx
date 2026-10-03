import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import * as THREE from "three";
import { GalaxyDust } from "./GalaxyDust";
import { MemoryStar } from "./MemoryStar";
import { DUST_BUDGET, detectQuality } from "@/lib/three-helpers";
import {
  getConstellationAnchor,
  layoutStars,
  type ConstellationAnchor,
  type StarNode,
} from "@/lib/star-layout";
import type { Category, Memory } from "@/lib/universe-types";

function ConstellationLines({
  nodes,
  activeCategoryId,
}: {
  nodes: StarNode[];
  activeCategoryId: string | null;
}) {
  const geometries = useMemo(() => {
    const groups = new Map<string, StarNode[]>();
    for (const n of nodes) {
      const list = groups.get(n.constellationId) ?? [];
      list.push(n);
      groups.set(n.constellationId, list);
    }
    return [...groups.entries()].map(([categoryId, list]) => {
      const points: number[] = [];
      const sorted = [...list].sort((a, b) => a.position[1] - b.position[1]);
      for (let i = 0; i < sorted.length - 1; i++) {
        points.push(...sorted[i]!.position, ...sorted[i + 1]!.position);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      return { categoryId, geometry };
    });
  }, [nodes]);

  return (
    <>
      {geometries.map(({ categoryId, geometry }) => (
        <lineSegments key={categoryId} geometry={geometry}>
          <lineBasicMaterial
            color="#e6b98a"
            transparent
            opacity={!activeCategoryId || activeCategoryId === categoryId ? 0.2 : 0.025}
            depthWrite={false}
          />
        </lineSegments>
      ))}
    </>
  );
}

export interface UniverseViewRequest {
  sequence: number;
  categoryId: string | null;
}

const INITIAL_POSITION: [number, number, number] = [0, 8, 42];
const CAMERA_OPTIONS = { position: INITIAL_POSITION, fov: 60 };

function UniverseControls({
  memoryOpen,
  constellationFocus,
  viewRequest,
  autoRotate,
  onManualControl,
}: {
  memoryOpen: boolean;
  constellationFocus: ConstellationAnchor | null;
  viewRequest: UniverseViewRequest;
  autoRotate: boolean;
  onManualControl: () => void;
}) {
  const { camera } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const handledRequest = useRef(0);

  useEffect(() => {
    const orbit = controls.current;
    // Only deliberate navigation may reposition the camera. Refetches and
    // opening/closing albums must preserve the view chosen by the visitor.
    if (!orbit || handledRequest.current === viewRequest.sequence) return;
    handledRequest.current = viewRequest.sequence;
    orbit.autoRotate = false;
    if (viewRequest.categoryId && constellationFocus) {
      orbit.target.set(...constellationFocus);
      const outward = orbit.target.clone().normalize().multiplyScalar(10);
      camera.position.copy(orbit.target).add(outward);
    } else {
      orbit.target.set(0, 0, 0);
      camera.position.set(...INITIAL_POSITION);
    }
    orbit.update();
  }, [camera, constellationFocus, viewRequest]);

  return (
    <OrbitControls
      ref={controls}
      enabled={!memoryOpen}
      enablePan
      enableDamping={false}
      rotateSpeed={0.45}
      zoomSpeed={0.7}
      minDistance={7}
      maxDistance={90}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      onStart={() => {
        if (controls.current) controls.current.autoRotate = false;
        onManualControl();
      }}
    />
  );
}

export interface UniverseSceneProps {
  memories: Memory[];
  categories: Category[];
  focusId: string | null;
  activeCategoryId: string | null;
  viewRequest: UniverseViewRequest;
  autoRotate: boolean;
  onManualControl: () => void;
  onSelect: (memory: Memory) => void;
}

export function UniverseScene({
  memories,
  categories,
  focusId,
  activeCategoryId,
  viewRequest,
  autoRotate,
  onManualControl,
  onSelect,
}: UniverseSceneProps) {
  const [quality] = useState(detectQuality);
  const nodes = useMemo(
    () =>
      layoutStars(
        memories,
        categories.map((c) => c.id),
      ),
    [memories, categories],
  );
  const constellationFocus = useMemo(() => {
    if (!activeCategoryId) return null;
    const index = categories.findIndex((category) => category.id === activeCategoryId);
    if (index < 0 || !nodes.some((node) => node.constellationId === activeCategoryId)) return null;
    return getConstellationAnchor(index, categories.length);
  }, [activeCategoryId, categories, nodes]);

  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  return (
    <Canvas
      camera={CAMERA_OPTIONS}
      className="cursor-grab active:cursor-grabbing"
      dpr={quality === "low" ? [1, 1.2] : [1, 1.9]}
      gl={{ antialias: quality !== "low" }}
    >
      <color attach="background" args={["#0a0507"]} />
      <fog attach="fog" args={["#0a0507", 55, 130]} />
      <ambientLight intensity={0.4} />
      <GalaxyDust count={DUST_BUDGET[quality]} />
      <ConstellationLines nodes={nodes} activeCategoryId={activeCategoryId} />
      {nodes.map((node) => (
        <MemoryStar
          key={node.memory.id}
          node={node}
          dimmed={
            (Boolean(focusId) && focusId !== node.memory.id) ||
            (Boolean(activeCategoryId) && activeCategoryId !== node.constellationId)
          }
          onSelect={(n) => onSelect(n.memory)}
        />
      ))}
      <UniverseControls
        memoryOpen={Boolean(focusId)}
        constellationFocus={constellationFocus}
        viewRequest={viewRequest}
        autoRotate={autoRotate}
        onManualControl={onManualControl}
      />
    </Canvas>
  );
}
