import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Importance, Memory, Visibility } from "@/lib/universe-types";

function slugName(file: File) {
  return file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

async function uploadFile(file: File, dateValue: string) {
  const year = (dateValue || new Date().toISOString()).slice(0, 4);
  const path = `memories/${year}/${crypto.randomUUID()}-${slugName(file)}`;
  const { error } = await supabase.storage.from("memories").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export interface MemoryFormProps {
  categories: Category[];
  memory?: Memory | null;
  onDone: () => void;
  onCancel: () => void;
}

export function MemoryForm({ categories, memory, onDone, onCancel }: MemoryFormProps) {
  const [title, setTitle] = useState(memory?.title ?? "");
  const [description, setDescription] = useState(memory?.description ?? "");
  const [date, setDate] = useState(memory?.memory_date ?? "");
  const [location, setLocation] = useState(memory?.location ?? "");
  const [categoryId, setCategoryId] = useState(memory?.category_id ?? categories[0]?.id ?? "");
  const [importance, setImportance] = useState<Importance>(memory?.importance ?? "normal");
  const [secret, setSecret] = useState(memory?.secret ?? false);
  const [visibility, setVisibility] = useState<Visibility>(memory?.visibility ?? "public");
  const [cover, setCover] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const coverPreview = cover ? URL.createObjectURL(cover) : (memory?.coverUrl ?? null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("Enviando fotografias…");
    try {
      let coverPath = memory?.cover_image ?? null;
      if (cover) coverPath = await uploadFile(cover, date);

      const payload = {
        title,
        description: description || null,
        memory_date: date || null,
        location: location || null,
        category_id: categoryId || null,
        importance,
        secret,
        visibility,
        cover_image: coverPath,
        updated_at: new Date().toISOString(),
      };

      let memoryId = memory?.id;
      if (memoryId) {
        const { error } = await supabase.from("memories").update(payload).eq("id", memoryId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("memories")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        memoryId = data.id;
      }

      if (gallery.length && memoryId) {
        setStatus(`Enviando ${gallery.length} fotografias do álbum…`);
        const { count } = await supabase
          .from("memory_media")
          .select("id", { count: "exact", head: true })
          .eq("memory_id", memoryId);
        let position = count ?? 0;
        for (const file of gallery) {
          const path = await uploadFile(file, date);
          const { error } = await supabase.from("memory_media").insert({
            memory_id: memoryId,
            type: file.type.startsWith("video") ? "video" : "image",
            storage_path: path,
            position: position++,
          });
          if (error) throw error;
        }
      }

      setStatus("Uma nova estrela nasceu no nosso universo. ✨");
      onDone();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Algo deu errado ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={submit} className="glass-panel space-y-5 rounded-xl p-6">
      <h2 className="font-display text-2xl">{memory ? "Editar memória" : "Adicionar memória"}</h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) setCover(file);
        }}
        className={`rounded-lg border border-dashed p-4 text-center text-xs transition-colors ${
          dragging ? "border-gold bg-accent/30" : "border-border"
        }`}
      >
        {coverPreview ? (
          <img
            src={coverPreview}
            alt="Prévia da foto principal"
            className="mx-auto max-h-44 rounded-md object-cover"
          />
        ) : (
          <p className="text-muted-foreground">Arraste a foto principal ou escolha do celular</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          className="mt-3 w-full text-xs text-muted-foreground"
          aria-label="Foto principal"
        />
      </div>

      <label className="block text-xs text-muted-foreground">
        Título
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={field}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-muted-foreground">
          Data
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Local (opcional)
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
        </label>
      </div>

      <label className="block text-xs text-muted-foreground">
        A história
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={field}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-muted-foreground">
          Constelação
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={field}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-muted-foreground">
          Importância
          <select
            value={importance}
            onChange={(e) => setImportance(e.target.value as Importance)}
            className={field}
          >
            <option value="normal">Normal</option>
            <option value="special">Especial</option>
            <option value="legendary">Lendária</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-muted-foreground">
          Visibilidade
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className={field}
          >
            <option value="public">Pública</option>
            <option value="secret">Secreta (só quem encontrar)</option>
            <option value="private">Privada (só no painel)</option>
          </select>
        </label>
        <label className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
          <input type="checkbox" checked={secret} onChange={(e) => setSecret(e.target.checked)} />
          Memória escondida
        </label>
      </div>

      <label className="block text-xs text-muted-foreground">
        Álbum — várias fotos e vídeos desta mesma memória
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => setGallery(Array.from(e.target.files ?? []))}
          className="mt-1 w-full text-xs"
        />
      </label>
      {gallery.length > 0 && (
        <p className="text-xs text-gold">
          {gallery.length} arquivos serão adicionados a esta estrela.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Adicionar ao nosso universo
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[0.6rem] tracking-cinema text-muted-foreground hover:text-gold"
        >
          Cancelar
        </button>
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </div>
    </form>
  );
}
