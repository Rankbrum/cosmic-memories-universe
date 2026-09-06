import * as THREE from "three";

let glowTexture: THREE.Texture | null = null;

/** Soft radial glow sprite, generated once on the client. */
export function getGlowTexture(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,241,214,0.9)");
  g.addColorStop(0.45, "rgba(255,206,138,0.32)");
  g.addColorStop(1, "rgba(255,180,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  glowTexture = tex;
  return tex;
}

export type QualityTier = "high" | "balanced" | "low";

export function detectQuality(): QualityTier {
  if (typeof navigator === "undefined") return "balanced";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return "low";
  if (mobile && cores <= 4) return "low";
  if (mobile || cores <= 6) return "balanced";
  return "high";
}

export const DUST_BUDGET: Record<QualityTier, number> = {
  high: 9000,
  balanced: 4500,
  low: 1800,
};

export function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}
