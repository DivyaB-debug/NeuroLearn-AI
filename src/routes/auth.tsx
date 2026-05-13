import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({ component: AuthPage });

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  name: z.string().trim().min(1).max(60).optional(),
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parsed = schema.safeParse({ email, password, name: mode === "signup" ? name : undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        // Navigate immediately — don't wait for the auth listener / useEffect to fire,
        // and check the profile here so we land on the right page even if context is still hydrating.
        if (data.user) {
          const { data: prof } = await supabase
            .from("profiles").select("onboarded").eq("id", data.user.id).maybeSingle();
          navigate({ to: prof?.onboarded ? "/learn" : "/diagnostic" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  };

  const google = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) toast.error("Google sign-in failed");
    } catch {
      toast.error("Google sign-in is not configured yet");
    }
  };

  return (
    <main className="min-h-screen bg-background grain flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full ember-gradient" />
          <span className="font-display text-lg font-semibold">Lumen</span>
        </Link>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
          <h1 className="font-display text-3xl">{mode === "signup" ? "Start learning your way" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Create an account to find your learning style." : "Sign in to continue."}
          </p>

          <button onClick={google} className="mt-6 w-full rounded-full border border-border bg-background py-2.5 text-sm font-medium hover:bg-secondary">
            Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password (6+ chars)" required
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
            <button type="submit" disabled={busy} className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
