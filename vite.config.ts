// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { loadEnv, type ConfigEnv } from "vite";

const publicSupabaseKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;

function isPublishableKey(value: string): boolean {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return true;
  const parts = value.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) return false;
  try {
    const payload: unknown = JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8"));
    return (
      typeof payload === "object" &&
      payload !== null &&
      "role" in payload &&
      payload.role === "anon"
    );
  } catch {
    return false;
  }
}

function publicSupabaseDefines(mode: string): Record<string, string> {
  const environment = loadEnv(mode, process.cwd(), "VITE_");
  let fallback: Record<string, string | undefined> = {};
  if (publicSupabaseKeys.some((key) => !environment[key]?.trim())) {
    // Read the tracked defaults directly: empty deployment variables override loadEnv's file values.
    try {
      fallback = parseEnv(readFileSync(".env", "utf8"));
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
  }

  const define: Record<string, string> = {};
  for (const key of publicSupabaseKeys) {
    const value = environment[key]?.trim() || fallback[key]?.trim();
    if (!value) throw new Error(`Missing public environment variable: ${key}`);
    if (key === "VITE_SUPABASE_URL") {
      let valid = false;
      try {
        const url = new URL(value);
        valid = ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
      } catch {
        // Invalid values are reported by name only, never included in build logs.
      }
      if (!valid) throw new Error(`Invalid public environment variable: ${key}`);
    } else if (!isPublishableKey(value)) {
      throw new Error(`Expected a publishable key or anon JWT for ${key}`);
    }
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }
  return define;
}

export default (env: ConfigEnv) =>
  defineConfig({
    vite: { define: publicSupabaseDefines(env.mode) },
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
    },
  })(env);
