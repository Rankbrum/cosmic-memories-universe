import type { Memory } from "./universe-types";

export interface StarNode {
  memory: Memory;
  position: [number, number, number];
  size: number;
  constellationIndex: number;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const SIZES: Record<string, number> = { normal: 0.28, special: 0.42, legendary: 0.62 };

/**
 * Places each memory as a star. Memories of the same constellation cluster
 * around a shared anchor on a large sphere, so exploring feels spatial.
 */
export function layoutStars(memories: Memory[], categoryIds: string[]): StarNode[] {
  const groups = new Map<string, Memory[]>();
  for (const m of memories) {
    const key = m.category_id ?? "orphan";
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  const nodes: StarNode[] = [];
  const keys = [...groups.keys()];
  for (const key of keys) {
    const idx = Math.max(0, categoryIds.indexOf(key));
    const golden = Math.PI * (3 - Math.sqrt(5));
    const total = Math.max(categoryIds.length, 1);
    const y = 1 - (idx / total) * 1.5 - 0.25;
    const r = Math.sqrt(Math.max(0.05, 1 - y * y));
    const theta = golden * idx;
    const anchor: [number, number, number] = [
      Math.cos(theta) * r * 26,
      y * 12,
      Math.sin(theta) * r * 26,
    ];

    const list = groups.get(key) ?? [];
    list.forEach((memory, i) => {
      const hx = hash(memory.id + "x");
      const hy = hash(memory.id + "y");
      const hz = hash(memory.id + "z");
      const spread = 3.4 + Math.min(list.length, 12) * 0.35;
      nodes.push({
        memory,
        constellationIndex: idx,
        position: [
          anchor[0] + (hx - 0.5) * spread * 2,
          anchor[1] + (hy - 0.5) * spread + Math.sin(i) * 0.7,
          anchor[2] + (hz - 0.5) * spread * 2,
        ],
        size: (SIZES[memory.importance] ?? 0.28) * (memory.secret ? 0.8 : 1),
      });
    });
  }
  return nodes;
}
