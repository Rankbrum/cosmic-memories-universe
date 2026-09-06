import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchCategories, fetchMemories } from "@/lib/memories";
import { MemoryExperience } from "@/components/memories/MemoryExperience";
import type { Memory } from "@/lib/universe-types";

export const Route = createFileRoute("/timeline")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nossa linha do tempo — Renan & Michele" },
      {
        name: "description",
        content: "Todas as memórias de Renan e Michele em ordem, ano a ano.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Nossa linha do tempo — Renan & Michele" },
      { property: "og:description", content: "Cada estrela guarda um pedaço da nossa história." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimelinePage,
});

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function TimelinePage() {
  const [selected, setSelected] = useState<Memory | null>(null);
  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: fetchMemories,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? null;

  const years = useMemo(() => {
    const visible = memories.filter((m) => m.visibility !== "private");
    const map = new Map<string, Memory[]>();
    for (const m of visible) {
      const year = m.memory_date ? m.memory_date.slice(0, 4) : "Sem data";
      const list = map.get(year) ?? [];
      list.push(m);
      map.set(year, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [memories]);

  return (
    <main className="night-veil min-h-screen px-6 py-14 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-[0.6rem] tracking-cinema text-gold/80">Our Universe</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Nossa linha do tempo</h1>
        <Link
          to="/"
          className="mt-4 inline-block text-[0.6rem] tracking-cinema text-muted-foreground hover:text-gold"
        >
          ← Voltar ao universo
        </Link>

        {isLoading && (
          <p className="mt-12 text-sm text-muted-foreground">Recuperando nossas memórias…</p>
        )}
        {!isLoading && years.length === 0 && (
          <p className="mt-12 font-display text-xl text-foreground/80">
            Algumas memórias ainda não aconteceram.
          </p>
        )}

        <div className="mt-12 space-y-14">
          {years.map(([year, list]) => (
            <section key={year}>
              <h2 className="font-display text-2xl text-gold">{year}</h2>
              <ol className="mt-5 space-y-6 border-l border-gold/20 pl-6">
                {list.map((m) => {
                  const month = m.memory_date
                    ? MONTHS[Number(m.memory_date.slice(5, 7)) - 1]
                    : null;
                  return (
                    <li key={m.id} className="relative">
                      <span
                        className="absolute -left-[1.68rem] top-2 h-2 w-2 rounded-full bg-gold"
                        style={{ boxShadow: "var(--shadow-glow)" }}
                        aria-hidden
                      />
                      <button
                        type="button"
                        onClick={() => setSelected(m)}
                        className="text-left transition-colors hover:text-gold"
                      >
                        {month && (
                          <span className="block text-[0.6rem] tracking-cinema text-muted-foreground">
                            {month}
                          </span>
                        )}
                        <span className="font-display text-xl">{m.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {[categoryName(m.category_id), m.location].filter(Boolean).join(" · ")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </div>
      {selected && <MemoryExperience memory={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
