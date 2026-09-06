export type Importance = "normal" | "special" | "legendary";
export type Visibility = "public" | "private" | "secret";

export interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
}

export interface MemoryMedia {
  id: string;
  memory_id: string;
  type: string;
  storage_path: string;
  caption: string | null;
  position: number;
  url?: string | undefined;
}

export interface Memory {
  id: string;
  title: string;
  description: string | null;
  memory_date: string | null;
  location: string | null;
  category_id: string | null;
  importance: Importance;
  secret: boolean;
  visibility: Visibility;
  cover_image: string | null;
  created_at: string;
  coverUrl?: string | null | undefined;
  media?: MemoryMedia[] | undefined;
}
