import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const { user, profile, signInWithName } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: profile?.onboarded ? "/learn" : "/diagnostic" });
  }, [user, profile, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name");
      return;
    }
    signInWithName(trimmed);
    toast.success(`Welcome, ${trimmed}`);
    navigate({ to: "/diagnostic" });
  };

  return (
    <main className="min-h-screen bg-background grain flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full ember-gradient" />
          <span className="font-display text-lg font-semibold">NeuroLearnAI</span>
        </Link>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
          <h1 className="font-display text-3xl">What should we call you?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No accounts, no passwords — just tell us your name and start learning.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              maxLength={60}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
