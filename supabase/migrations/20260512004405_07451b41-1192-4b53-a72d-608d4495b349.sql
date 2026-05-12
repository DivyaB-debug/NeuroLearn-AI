
CREATE TABLE public.sign_letter_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  letter text NOT NULL CHECK (char_length(letter) = 1),
  practice_count integer NOT NULL DEFAULT 0,
  mastered boolean NOT NULL DEFAULT false,
  last_practiced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, letter)
);

CREATE TABLE public.sign_topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  topic_key text NOT NULL,
  total_letters integer NOT NULL DEFAULT 0,
  letters_completed integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_practiced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_key)
);

CREATE INDEX idx_sign_topic_progress_user_recent
  ON public.sign_topic_progress (user_id, last_practiced_at DESC);

ALTER TABLE public.sign_letter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sign_topic_progress  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own letter progress" ON public.sign_letter_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own letter progress" ON public.sign_letter_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own letter progress" ON public.sign_letter_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users view own topic progress" ON public.sign_topic_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own topic progress" ON public.sign_topic_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own topic progress" ON public.sign_topic_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_sign_letter_progress_touch
  BEFORE UPDATE ON public.sign_letter_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_sign_topic_progress_touch
  BEFORE UPDATE ON public.sign_topic_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
