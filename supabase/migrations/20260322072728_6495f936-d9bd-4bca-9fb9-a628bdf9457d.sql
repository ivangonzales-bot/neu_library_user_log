
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  blocked_at timestamp with time zone DEFAULT now(),
  blocked_by text
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to read blocked_users" ON public.blocked_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anyone to insert blocked_users" ON public.blocked_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anyone to delete blocked_users" ON public.blocked_users FOR DELETE TO anon, authenticated USING (true);
