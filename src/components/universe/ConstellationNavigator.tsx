import { Button } from "@/components/ui/button";
import type { Category, Memory } from "@/lib/universe-types";

interface ConstellationNavigatorProps {
  categories: Category[];
  memories: Memory[];
  activeId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function ConstellationNavigator({
  categories,
  memories,
  activeId,
  onSelect,
}: ConstellationNavigatorProps) {
  const counts = new Map<string, number>();
  for (const memory of memories) {
    if (memory.category_id) {
      counts.set(memory.category_id, (counts.get(memory.category_id) ?? 0) + 1);
    }
  }

  const active = categories.find((category) => category.id === activeId);

  return (
    <section
      aria-label="Explorar constelações"
      className="pointer-events-none absolute inset-x-0 bottom-16 z-10 sm:bottom-20"
    >
      <div className="pointer-events-auto mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mb-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.55rem] tracking-cinema text-gold/70">Constelações</p>
            <p className="mt-1 font-display text-lg text-foreground sm:text-xl">
              {active?.name ?? "Todos os capítulos"}
            </p>
          </div>
          {active && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelect(null)}
              className="h-8 shrink-0 px-2 text-[0.6rem] tracking-cinema text-muted-foreground hover:text-gold"
            >
              Ver todas
            </Button>
          )}
        </div>

        <div className="constellation-scroll flex gap-2 overflow-x-auto pb-2" role="list">
          {categories.map((category, index) => {
            const count = counts.get(category.id) ?? 0;
            const selected = activeId === category.id;
            return (
              <Button
                key={category.id}
                type="button"
                role="listitem"
                variant="outline"
                size="sm"
                disabled={count === 0}
                aria-pressed={selected}
                aria-label={`${category.name}, ${count} ${count === 1 ? "memória" : "memórias"}`}
                onClick={() => onSelect(selected ? null : category.id)}
                className={`h-9 shrink-0 border-gold/20 bg-background/55 px-3 backdrop-blur-md ${
                  selected
                    ? "border-gold/70 bg-secondary text-gold"
                    : "text-muted-foreground hover:border-gold/50 hover:text-foreground"
                }`}
              >
                <span className="text-[0.58rem] text-gold/60">{String(index + 1).padStart(2, "0")}</span>
                <span className="max-w-48 truncate text-xs">{category.name}</span>
                <span className="text-[0.6rem] tabular-nums text-muted-foreground">{count}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}