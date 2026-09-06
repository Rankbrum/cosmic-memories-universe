import { useEffect, useState } from "react";

const MESSAGES = [
  "Construindo nosso universo…",
  "Organizando nossas estrelas…",
  "Recuperando nossas memórias…",
  "Quase lá…",
];

/** Thematic loading: a small star that grows. */
export function UniverseLoader() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="night-veil fixed inset-0 flex flex-col items-center justify-center gap-8">
      <div
        className="h-3 w-3 animate-breathe rounded-full"
        style={{ background: "var(--gold-soft)", boxShadow: "var(--shadow-glow)" }}
        aria-hidden
      />
      <p className="text-[0.65rem] tracking-cinema text-muted-foreground">{MESSAGES[i]}</p>
    </div>
  );
}
