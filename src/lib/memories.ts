import { supabase } from "@/integrations/supabase/client";
import type { Category, Memory, MemoryMedia } from "./universe-types";

const SIGNED_TTL = 60 * 60 * 6;
const urlCache = new Map<string, string>();

/** Signed URLs keep private photos unreachable by guessing a path. */
export async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const missing: string[] = [];
  for (const p of paths) {
    const cached = urlCache.get(p);
    if (cached) result[p] = cached;
    else if (p) missing.push(p);
  }
  if (missing.length) {
    const { data } = await supabase.storage.from("memories").createSignedUrls(missing, SIGNED_TTL);
    for (const row of data ?? []) {
      if (row.signedUrl && row.path) {
        urlCache.set(row.path, row.signedUrl);
        result[row.path] = row.signedUrl;
      }
    }
  }
  return result;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,position")
    .order("position");
  if (error) throw error;
  return data as Category[];
}

/** Public universe read: covers only (thumbnails), full album loads on demand. */
export async function fetchMemories(): Promise<Memory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select(
      "id,title,description,memory_date,location,category_id,importance,secret,visibility,cover_image,created_at",
    )
    .order("memory_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  const memories = (data ?? []) as Memory[];
  const covers = memories.map((m) => m.cover_image).filter(Boolean) as string[];
  const signed = covers.length ? await signPaths(covers) : {};
  return memories.map((m) => ({ ...m, coverUrl: m.cover_image ? signed[m.cover_image] : null }));
}

export async function fetchMemoryMedia(memoryId: string): Promise<MemoryMedia[]> {
  const { data, error } = await supabase
    .from("memory_media")
    .select("id,memory_id,type,storage_path,caption,position")
    .eq("memory_id", memoryId)
    .order("position");
  if (error) throw error;
  const media = (data ?? []) as MemoryMedia[];
  const signed = await signPaths(media.map((m) => m.storage_path));
  return media.map((m) => ({ ...m, url: signed[m.storage_path] }));
}
