import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, fetchMemories } from "@/lib/memories";
import { MemoryForm } from "@/components/admin/MemoryForm";
import { ConstellationManager } from "@/components/admin/ConstellationManager";
import type { Memory } from "@/lib/universe-types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel de memórias — Renan & Michele" },
      {
        name: "description",
        content: "Painel privado para adicionar e organizar as memórias do universo.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel de memórias — Renan & Michele" },
      { property: "og:description", content: "Painel privado do nosso universo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");
  const [importance, setImportance] = useState("all");
  const [onlySecret, setOnlySecret] = useState(false);

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: fetchMemories,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data } = await supabase.rpc("claim_admin");
      return Boolean(data);
    },
  });

  const { data: mediaCount = 0 } = useQuery({
    queryKey: ["media-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("memory_media")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const years = useMemo(
    () =>
      [
        ...new Set(memories.map((m) => m.memory_date?.slice(0, 4)).filter(Boolean) as string[]),
      ].sort(),
    [memories],
  );

  const filtered = useMemo(
    () =>
      memories.filter((m) => {
        const q = search.trim().toLowerCase();
        const matchesQuery =
          !q ||
          m.title.toLowerCase().includes(q) ||
          (m.description ?? "").toLowerCase().includes(q) ||
          (m.memory_date ?? "").includes(q);
        return (
          matchesQuery &&
          (year === "all" || m.memory_date?.startsWith(year)) &&
          (category === "all" || m.category_id === category) &&
          (importance === "all" || m.importance === importance) &&
          (!onlySecret || m.secret)
        );
      }),
    [memories, search, year, category, importance, onlySecret],
  );

  const last = memories[memories.length - 1];

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["memories"] });
    void queryClient.invalidateQueries({ queryKey: ["media-count"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  async function remove(memory: Memory) {
    if (!confirm(`Excluir “${memory.title}”? Esta estrela desaparece do universo.`)) return;
    await supabase.from("memories").delete().eq("id", memory.id);
    refresh();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ categories, memories }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `universo-renan-michele-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const field =
    "rounded-md border border-input bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="night-veil min-h-screen px-5 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.6rem] tracking-cinema text-gold/80">
              O Universo de Renan &amp; Michele
            </p>
            <h1 className="mt-1 font-display text-3xl">Painel de memórias</h1>
          </div>
          <div className="flex items-center gap-4 text-[0.6rem] tracking-cinema">
            <Link to="/" className="text-muted-foreground hover:text-gold">
              Ver universo
            </Link>
            <button
              type="button"
              onClick={exportJson}
              className="text-muted-foreground hover:text-gold"
            >
              Exportar nossas memórias
            </button>
            <button
              type="button"
              onClick={signOut}
              className="text-muted-foreground hover:text-gold"
            >
              Sair
            </button>
          </div>
        </header>

        {isAdmin === false && (
          <p className="rounded-md border border-destructive/40 p-4 text-xs text-destructive">
            Esta conta não tem permissão de administrador.
          </p>
        )}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Memórias", memories.length],
            ["Fotos e vídeos", mediaCount],
            ["Constelações", categories.length],
            ["Secretas", memories.filter((m) => m.secret).length],
          ].map(([label, value]) => (
            <div key={String(label)} className="glass-panel rounded-lg p-4">
              <p className="font-display text-3xl text-gold">{value}</p>
              <p className="text-[0.6rem] tracking-cinema text-muted-foreground">{label}</p>
            </div>
          ))}
        </section>

        {last && (
          <p className="text-xs text-muted-foreground">
            Última memória adicionada: <span className="text-foreground">{last.title}</span>
          </p>
        )}

        {formOpen ? (
          <MemoryForm
            categories={categories}
            memory={editing}
            onDone={() => {
              refresh();
              setFormOpen(false);
              setEditing(null);
            }}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            + Adicionar memória
          </button>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Buscar por título, história ou data"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${field} flex-1 min-w-[12rem]`}
            />
            <select value={year} onChange={(e) => setYear(e.target.value)} className={field}>
              <option value="all">Todos os anos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={field}
            >
              <option value="all">Todas as constelações</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className={field}
            >
              <option value="all">Toda importância</option>
              <option value="normal">Normal</option>
              <option value="special">Especial</option>
              <option value="legendary">Lendária</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={onlySecret}
                onChange={(e) => setOnlySecret(e.target.checked)}
              />
              Secretas
            </label>
          </div>

          {isLoading && (
            <p className="text-xs text-muted-foreground">Recuperando nossas memórias…</p>
          )}

          <ul className="space-y-2">
            {filtered.map((m) => (
              <li key={m.id} className="glass-panel flex items-center gap-4 rounded-lg p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {m.coverUrl && (
                    <img src={m.coverUrl} alt={m.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg">{m.title}</p>
                  <p className="truncate text-[0.6rem] tracking-cinema text-muted-foreground">
                    {[
                      m.memory_date,
                      m.location,
                      m.importance,
                      m.secret ? "secreta" : null,
                      m.visibility,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(m);
                    setFormOpen(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-[0.6rem] tracking-cinema text-muted-foreground hover:text-gold"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(m)}
                  className="text-[0.6rem] tracking-cinema text-muted-foreground hover:text-destructive"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
