import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/universe-types";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface Props {
  categories: Category[];
  onDone: () => void;
}

export function ConstellationManager({ categories, onDone }: Props) {
  const [rows, setRows] = useState<Category[]>(categories);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows([...categories].sort((a, b) => a.position - b.position));
  }, [categories]);

  const field =
    "rounded-md border border-input bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring";

  async function add() {
    const title = name.trim();
    if (!title) return;
    setBusy(true);
    setError(null);
    const position = rows.length ? Math.max(...rows.map((r) => r.position)) + 1 : 0;
    const { error: err } = await supabase
      .from("categories")
      .insert({ name: title, slug: slugify(title) || `constelacao-${position}`, position });
    setBusy(false);
    if (err) return setError(err.message);
    setName("");
    onDone();
  }

  async function rename(row: Category, next: string) {
    const title = next.trim();
    if (!title || title === row.name) return;
    const { error: err } = await supabase
      .from("categories")
      .update({ name: title, slug: slugify(title) })
      .eq("id", row.id);
    if (err) setError(err.message);
    else onDone();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    setRows(next);
    setBusy(true);
    for (let i = 0; i < next.length; i++) {
      await supabase.from("categories").update({ position: i }).eq("id", next[i]!.id);
    }
    setBusy(false);
    onDone();
  }

  async function remove(row: Category) {
    if (!confirm(`Excluir a constelação “${row.name}”? As memórias dela ficam sem capítulo.`))
      return;
    setBusy(true);
    const { error: err } = await supabase.from("categories").delete().eq("id", row.id);
    setBusy(false);
    if (err) setError(err.message);
    else onDone();
  }

  return (
    <section className="glass-panel space-y-4 rounded-lg p-5">
      <div>
        <h2 className="font-display text-2xl">Constelações</h2>
        <p className="text-[0.6rem] tracking-cinema text-muted-foreground">
          Os capítulos da nossa história, na ordem em que serão vividos
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void add();
          }}
          placeholder="Nome da nova constelação"
          className={`${field} flex-1 min-w-[14rem]`}
        />
        <button
          type="button"
          disabled={busy || !name.trim()}
          onClick={() => void add()}
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          + Criar constelação
        </button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <ol className="space-y-2">
        {rows.map((row, index) => (
          <li key={row.id} className="flex items-center gap-3 rounded-md border border-border/40 p-2">
            <span className="w-8 shrink-0 text-center font-display text-lg text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <input
              defaultValue={row.name}
              onBlur={(e) => void rename(row, e.target.value)}
              className={`${field} min-w-0 flex-1`}
              aria-label={`Nome da constelação ${row.name}`}
            />
            <button
              type="button"
              disabled={busy || index === 0}
              onClick={() => void move(index, -1)}
              className="px-2 text-xs text-muted-foreground hover:text-gold disabled:opacity-30"
              aria-label="Mover para cima"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={busy || index === rows.length - 1}
              onClick={() => void move(index, 1)}
              className="px-2 text-xs text-muted-foreground hover:text-gold disabled:opacity-30"
              aria-label="Mover para baixo"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => void remove(row)}
              className="text-[0.6rem] tracking-cinema text-muted-foreground hover:text-destructive"
            >
              Excluir
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
