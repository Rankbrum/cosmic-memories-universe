import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { EnvelopeIntro } from "@/components/intro/EnvelopeIntro";
import { PortalTransition } from "@/components/universe/PortalTransition";
import { UniverseScene, type UniverseViewRequest } from "@/components/universe/UniverseScene";
import { Button } from "@/components/ui/button";
import { MemoryExperience } from "@/components/memories/MemoryExperience";
import { FinalScene } from "@/components/universe/FinalScene";
import { UniverseLoader } from "@/components/universe/UniverseLoader";
import { AudioController } from "@/components/audio/AudioController";
import { ConstellationNavigator } from "@/components/universe/ConstellationNavigator";
import { fetchPublicUniverse } from "@/lib/memories";
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
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [viewRequest, setViewRequest] = useState<UniverseViewRequest>({
    sequence: 0,
    categoryId: null,
  });
  const [autoRotate, setAutoRotate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => setWebgl(supportsWebGL()), []);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setAutoRotate(false);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const universeQuery = useQuery({
    queryKey: ["public-universe"],
    queryFn: fetchPublicUniverse,
  });

  const memories = useMemo(
    () => (universeQuery.data?.memories ?? []).filter((m) => m.visibility !== "private"),
    [universeQuery.data],
  );
  const categories = universeQuery.data?.categories ?? [];
  const loading = universeQuery.isLoading;

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
        <Link
          to="/timeline"
          className="border-b border-gold/40 pb-1 text-[0.65rem] tracking-cinema text-gold"
        >
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
        activeCategoryId={activeCategoryId}
        viewRequest={viewRequest}
        autoRotate={autoRotate && !reducedMotion}
        onManualControl={() => setAutoRotate(false)}
        onSelect={setSelected}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-8">
        <div>
          <p className="text-[0.6rem] tracking-cinema text-gold/80">Nosso Universo</p>
          <h1 className="font-display text-xl text-foreground sm:text-2xl">Renan &amp; Michele</h1>
          {universeQuery.data?.managedDataUnavailable && (
            <p role="status" className="mt-2 max-w-xs text-xs text-muted-foreground">
              Algumas memórias não puderam ser carregadas. Tente recarregar a página.
            </p>
          )}
        </div>
        <p className="text-right text-[0.6rem] tracking-cinema text-muted-foreground">
          {memories.length} {memories.length === 1 ? "memória" : "memórias"}
        </p>
      </header>

      <div className="pointer-events-auto absolute left-5 top-24 z-10 flex flex-wrap items-center gap-2 sm:left-8">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={autoRotate}
          disabled={reducedMotion}
          onClick={() => setAutoRotate((rotating) => !rotating)}
          className="border-gold/20 bg-background/55 text-xs text-muted-foreground backdrop-blur-md hover:text-gold"
        >
          {autoRotate ? "Pausar giro" : "Giro automático"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setAutoRotate(false);
            setActiveCategoryId(null);
            setViewRequest((request) => ({ sequence: request.sequence + 1, categoryId: null }));
          }}
          className="border-gold/20 bg-background/55 text-xs text-muted-foreground backdrop-blur-md hover:text-gold"
        >
          Visão inicial
        </Button>
        <p className="pointer-events-none basis-full text-[0.65rem] text-muted-foreground">
          Arraste para girar. Role ou use dois dedos para aproximar.
        </p>
      </div>

      <ConstellationNavigator
        categories={categories}
        memories={memories}
        activeId={activeCategoryId}
        onSelect={(categoryId) => {
          setSelected(null);
          setActiveCategoryId(categoryId);
          setAutoRotate(false);
          setViewRequest((request) => ({ sequence: request.sequence + 1, categoryId }));
        }}
      />

      <nav className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-5 sm:p-8">
        <div className="flex items-center gap-5">
          <Link
            to="/timeline"
            className="text-[0.6rem] tracking-cinema text-muted-foreground hover:text-gold"
          >
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
