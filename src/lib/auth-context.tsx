import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type FakeUser = { id: string; name: string };
type Profile = {
  id: string;
  display_name: string | null;
  learning_style: string | null;
  onboarded: boolean;
};

type AuthCtx = {
  user: FakeUser | null;
  session: null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithName: (name: string) => void;
  setOnboarded: (style?: string | null) => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

const STORAGE_KEY = "lumen.localUser";

type Stored = { id: string; name: string; onboarded: boolean; learning_style: string | null };

function load(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function save(s: Stored | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  else localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Stored | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStored(load());
    setLoading(false);
  }, []);

  const user: FakeUser | null = stored ? { id: stored.id, name: stored.name } : null;
  const profile: Profile | null = stored
    ? {
        id: stored.id,
        display_name: stored.name,
        learning_style: stored.learning_style,
        onboarded: stored.onboarded,
      }
    : null;

  const signInWithName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = load();
    const next: Stored = existing
      ? { ...existing, name: trimmed }
      : { id: crypto.randomUUID(), name: trimmed, onboarded: false, learning_style: null };
    save(next);
    setStored(next);
  };

  const setOnboarded = (style?: string | null) => {
    const cur = load();
    if (!cur) return;
    const next = { ...cur, onboarded: true, learning_style: style ?? cur.learning_style };
    save(next);
    setStored(next);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        session: null,
        profile,
        loading,
        refreshProfile: async () => {},
        signOut: async () => {
          save(null);
          setStored(null);
        },
        signInWithName,
        setOnboarded,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
