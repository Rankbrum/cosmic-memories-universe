import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { EnvelopeIntro } from "@/components/intro/EnvelopeIntro";
import { PortalTransition } from "@/components/universe/PortalTransition";
import { UniverseScene } from "@/components/universe/UniverseScene";
import { MemoryExperience } from "@/components/memories/MemoryExperience";
import { FinalScene } from "@/components/universe/FinalScene";
import { UniverseLoader } from "@/components/universe/UniverseLoader";
import { AudioController } from "@/components/audio/AudioController";
import { fetchCategories, fetchMemories } from "@/lib/memories";
import { supportsWebGL } from "@/lib/three-helpers";
import type { Memory } from "@/lib/universe-types";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "O Universo de Renan & Michele" },
      {
        name: "description",
        content:
          "Uma experiência interdimensional onde cada estrela guarda uma memória da história de Renan e Michele.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "O Universo de Renan & Michele" },
      {
        property: "og:description",
        content: "Cada estrela guarda um pedaço da nossa história.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UniversePage,
});

type Phase = "invitation" | "portal" | "universe" | "finale";

function UniversePage() {
  const [phase, setPhase] = useState<Phase>("invitation");
  const [selected, setSelected] = useState<Memory | null>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => setWebgl(supportsWebGL()), []);

  const memoriesQuery = useQuery({ queryKey: ["memories"], queryFn: fetchMemories });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const memories = useMemo(
    () => (memoriesQuery.data ?? []).filter((m) => m.visibility !== "private"),
    [memoriesQuery.data],
  );
  const categories = categoriesQuery.data ?? [];
  const loading = memoriesQuery.isLoading || categoriesQuery.isLoading;

  if (phase === "invitation") {
    return <EnvelopeIntro onEnter={() => setPhase("portal")} />;
  }
  if (phase === "portal") {
    return <PortalTransition onDone={() => setPhase("universe")} />;
  }
  if (phase === "finale") {
    return <FinalScene onContinue={() => setPhase("universe")} />;
  }
  if (loading) return <UniverseLoader />;

  if (!webgl) {
    return (
      <div className="night-veil flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center">
        <h1 className="font-display text-3xl">Nosso universo em forma de linha do tempo</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Este aparelho não consegue desenhar a galáxia em 3D, mas todas as memórias continuam aqui.
        </p>
        <Link to="/timeline" className="border-b border-gold/40 pb-1 text-[0.65rem] tracking-cinema text-gold">
          Ver nossa linha do tempo
        </Link>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 bg-ink">
      <UniverseScene
        memories={memories}
        categories={categories}
        focusId={selected?.id ?? null}
        onSelect={setSelected}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-8">
        <div>
          <p className="text-[0.6rem] tracking-cinema text-gold/80">Our Universe</p>
          <h1 className="font-display text-xl text-foreground sm:text-2xl">Renan &amp; Michele</h1>
        </div>
        <p className="text-right text-[0.6rem] tracking-cinema text-muted-foreground">
          {memories.length} {memories.length === 1 ? "memória" : "memórias"}
        </p>
      </header>

      <nav className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-5 sm:p-8">
        <div className="flex items-center gap-5">
          <Link to="/timeline" className="text-[0.6rem] tracking-cinema text-muted-foreground hover:text-gold">
            Linha do tempo
          </Link>
          <AudioController active />
        </div>
        <button
          type="button"
          onClick={() => setPhase("finale")}
          className="text-[0.6rem] tracking-cinema text-muted-foreground transition-colors hover:text-gold"
        >
          R ♥ M
        </button>
      </nav>

      {memories.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="max-w-sm font-display text-xl text-foreground/80">
            Nosso céu ainda está escuro. Algumas memórias ainda não aconteceram.
          </p>
        </div>
      )}

      {selected && <MemoryExperience memory={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
