import { useEffect, useState } from "react";

/**
 * Phase 1 — the invitation. A dark room, an envelope, a wax seal.
 * Touching the seal breaks it and hands control to the portal.
 */
export function EnvelopeIntro({ onEnter }: { onEnter: () => void }) {
  const [step, setStep] = useState(0);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 3400),
      setTimeout(() => setStep(3), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  function handleEnter() {
    if (opening) return;
    setOpening(true);
    setTimeout(onEnter, 1800);
  }

  return (
    <div className="night-veil fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 55%)",
        }}
        aria-hidden
      />

      <div
        className={`relative transition-all duration-[1600ms] ease-out ${
          opening ? "scale-[3.2] opacity-0 blur-md" : "scale-100 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={handleEnter}
          aria-label="Abrir o convite e entrar no nosso universo"
          className="group relative block w-[min(86vw,26rem)] cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* envelope body */}
          <div
            className="relative aspect-[7/5] w-full rounded-[3px] border border-gold/25 shadow-[var(--shadow-cinema)]"
            style={{
              background:
                "linear-gradient(155deg, var(--wine) 0%, var(--wine-deep) 55%, oklch(0.16 0.05 14) 100%)",
            }}
          >
            {/* flap */}
            <div
              className={`absolute inset-x-0 top-0 origin-top transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] ${
                opening ? "[transform:rotateX(168deg)]" : ""
              }`}
              style={{
                height: "58%",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background:
                  "linear-gradient(180deg, oklch(0.3 0.1 14), oklch(0.2 0.08 14))",
                borderBottom: "1px solid color-mix(in oklab, var(--gold) 25%, transparent)",
              }}
            />
            {/* light escaping */}
            <div
              className={`absolute inset-x-6 bottom-6 top-[42%] transition-opacity duration-1000 ${
                opening ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background:
                  "radial-gradient(ellipse at 50% 100%, var(--gold-soft), transparent 70%)",
                filter: "blur(6px)",
              }}
              aria-hidden
            />
            {/* corner florals */}
            <div className="pointer-events-none absolute inset-3 rounded-[2px] border border-gold/15" />

            {/* wax seal */}
            <div
              className={`absolute left-1/2 top-[54%] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-700 ${
                opening ? "scale-125 opacity-0" : "animate-breathe"
              }`}
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, oklch(0.48 0.16 22), oklch(0.28 0.12 18))",
                boxShadow: "var(--shadow-glow), inset 0 2px 6px oklch(1 0 0 / 12%)",
              }}
            >
              <span className="font-display text-2xl tracking-widest text-gold-soft">R &amp; M</span>
            </div>
          </div>
        </button>
      </div>

      <div className="relative mt-12 max-w-md space-y-4 text-center">
        {step >= 1 && (
          <p className="animate-fade-rise font-display text-2xl leading-snug text-foreground/90 sm:text-3xl">
            “Existem histórias que não cabem em um álbum.”
          </p>
        )}
        {step >= 2 && (
          <p className="animate-fade-rise font-display text-xl text-gold/90">Esta é a nossa.</p>
        )}
        {step >= 3 && !opening && (
          <button
            type="button"
            onClick={handleEnter}
            className="animate-fade-rise mt-6 inline-flex items-center gap-3 border-b border-gold/40 pb-1 text-[0.7rem] tracking-cinema text-gold transition-colors hover:text-gold-soft"
          >
            Toque para entrar
          </button>
        )}
      </div>
    </div>
  );
}
