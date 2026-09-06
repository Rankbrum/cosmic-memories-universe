import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — O Universo de Renan & Michele" },
      {
        name: "description",
        content: "Área privada para administrar as memórias do nosso universo.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Entrar — O Universo de Renan & Michele" },
      { property: "og:description", content: "Área privada do nosso universo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function afterAuth() {
    await supabase.rpc("claim_admin");
    navigate({ to: "/admin" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setMessage("Conta criada. Confirme o e-mail e entre novamente.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await afterAuth();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      setMessage("Não foi possível entrar com o Google.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    await afterAuth();
  }

  return (
    <main className="night-veil flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-sm rounded-xl p-8">
        <p className="text-[0.6rem] tracking-cinema text-gold/80">Área privada</p>
        <h1 className="mt-2 font-display text-2xl">O Universo de Renan &amp; Michele</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs text-muted-foreground">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="mt-3 w-full rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent/40"
        >
          Continuar com Google
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-[0.6rem] tracking-cinema text-muted-foreground hover:text-gold"
        >
          {mode === "signin" ? "Criar a primeira conta" : "Já tenho conta"}
        </button>

        {message && <p className="mt-4 text-xs text-destructive">{message}</p>}
      </div>
    </main>
  );
}
