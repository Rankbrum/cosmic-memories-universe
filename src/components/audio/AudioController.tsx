import { useEffect, useRef, useState } from "react";

/**
 * Ambient music. Browsers only allow playback after a user gesture, so this
 * starts only once the invitation has been opened.
 */
export function AudioController({ active }: { active: boolean }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!active || ctxRef.current) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    // A slow, warm drone chord — replaceable later with a real track per chapter.
    [110, 164.81, 220, 329.63].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      const voice = ctx.createGain();
      voice.gain.value = 0.06 / (i + 1);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.017;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain).connect(voice.gain);
      osc.connect(voice).connect(gain);
      osc.start();
      lfo.start();
    });

    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 6);
    ctxRef.current = ctx;
    gainRef.current = gain;
    return () => {
      void ctx.close();
    };
  }, [active]);

  useEffect(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    gain.gain.linearRampToValueAtTime(on ? 0.5 : 0, ctx.currentTime + 1.2);
  }, [on]);

  if (!active) return null;

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-label={on ? "Desligar a música" : "Ligar a música"}
      className="text-[0.6rem] tracking-cinema text-muted-foreground transition-colors hover:text-gold"
    >
      {on ? "Som ligado" : "Som desligado"}
    </button>
  );
}
