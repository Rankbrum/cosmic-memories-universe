import { useEffect, useState } from "react";
import { fetchMemoryMedia } from "@/lib/memories";
import type { Memory, MemoryMedia } from "@/lib/universe-types";

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Phase 4 — the star opens. Not a modal: the memory floats inside the universe
 * and contracts back into light when closed.
 */
export function MemoryExperience({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const [media, setMedia] = useState<MemoryMedia[]>([]);
  const [index, setIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMemoryMedia(memory.id)
      .then((rows) => active && setMedia(rows))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [memory.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, Math.max(media.length - 1, 0)));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.length]);

  function close() {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 700);
  }

  const slides = media.length
    ? media
    : memory.coverUrl
      ? [
          {
            id: "cover",
            memory_id: memory.id,
            type: "image",
            storage_path: memory.cover_image ?? "",
            caption: null,
            position: 0,
            url: memory.coverUrl,
          } as MemoryMedia,
        ]
      : [];
  const current = slides[Math.min(index, Math.max(slides.length - 1, 0))];

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center transition-all duration-700 sm:items-center ${
        closing ? "scale-90 opacity-0 blur-sm" : "scale-100 opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={memory.title}
    >
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
        onClick={close}
        aria-hidden
      />
      <article className="glass-panel relative m-3 w-full max-w-3xl overflow-hidden rounded-xl">
        {memory.secret && (
          <p className="bg-wine-deep/70 px-6 py-2 text-center text-[0.65rem] tracking-cinema text-gold">
            Você encontrou uma memória escondida. ❤️
          </p>
        )}
        <div className="relative aspect-[4/3] w-full bg-ink sm:aspect-[16/10]">
          {current?.url ? (
            current.type === "video" ? (
              <video src={current.url} controls className="h-full w-full object-contain" />
            ) : (
              <img
                src={current.url}
                alt={current.caption ?? memory.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Esta memória ainda é só luz.
            </div>
          )}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/60 px-3 py-2 text-gold"
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/60 px-3 py-2 text-gold"
                aria-label="Próxima foto"
              >
                ›
              </button>
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.65rem] tracking-cinema text-gold-soft/80">
                {index + 1} / {slides.length}
              </p>
            </>
          )}
        </div>

        <div className="space-y-3 px-6 py-6 sm:px-8">
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">{memory.title}</h2>
          <p className="text-[0.68rem] tracking-cinema text-gold/80">
            {[formatDate(memory.memory_date), memory.location].filter(Boolean).join(" · ")}
          </p>
          {memory.description && (
            <p className="font-display text-lg leading-relaxed text-foreground/85">
              {memory.description}
            </p>
          )}
          <button
            type="button"
            onClick={close}
            className="mt-2 border-b border-gold/40 pb-1 text-[0.65rem] tracking-cinema text-gold transition-colors hover:text-gold-soft"
          >
            Voltar ao universo
          </button>
        </div>
      </article>
    </div>
  );
}
