// Local sign-language progress store. Persists per-user (by local user id) to localStorage,
// since the app uses name-only local auth (no real Supabase session, so RLS would reject writes).

export type LetterRow = { letter: string; mastered: boolean; practice_count: number };
export type TopicRow = {
  topic: string;
  topic_key: string;
  total_letters: number;
  letters_completed: number;
  completed: boolean;
  last_practiced_at: string;
};

type SignState = {
  letters: Record<string, LetterRow>;
  topics: Record<string, TopicRow>;
};

const KEY = (userId: string) => `lumen.sign.${userId}`;

function read(userId: string): SignState {
  if (typeof window === "undefined") return { letters: {}, topics: {} };
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return { letters: {}, topics: {} };
    const parsed = JSON.parse(raw) as Partial<SignState>;
    return { letters: parsed.letters ?? {}, topics: parsed.topics ?? {} };
  } catch {
    return { letters: {}, topics: {} };
  }
}

function write(userId: string, s: SignState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY(userId), JSON.stringify(s));
}

export function loadSignProgress(userId: string) {
  const s = read(userId);
  const topics = Object.values(s.topics).sort((a, b) =>
    b.last_practiced_at.localeCompare(a.last_practiced_at)
  );
  return { letters: s.letters, topics };
}

export function toggleLetterMastered(userId: string, letter: string): LetterRow {
  const s = read(userId);
  const cur = s.letters[letter];
  const next: LetterRow = {
    letter,
    mastered: !(cur?.mastered),
    practice_count: (cur?.practice_count ?? 0) + (cur?.mastered ? 0 : 1),
  };
  s.letters[letter] = next;
  write(userId, s);
  return next;
}

export function saveTopicProgress(userId: string, row: Omit<TopicRow, "last_practiced_at">) {
  const s = read(userId);
  s.topics[row.topic_key] = { ...row, last_practiced_at: new Date().toISOString() };
  write(userId, s);
}
