-- Allow anyone to insert visits (since we don't have real auth yet, users log in with just email)
CREATE POLICY "Allow anyone to insert visits" ON public.visits
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to read visits
CREATE POLICY "Allow anyone to read visits" ON public.visits
FOR SELECT TO anon, authenticated
USING (true);

-- Allow anyone to update visits (admin editing)
CREATE POLICY "Allow anyone to update visits" ON public.visits
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to delete visits
CREATE POLICY "Allow anyone to delete visits" ON public.visits
FOR DELETE TO anon, authenticated
USING (true);

-- Enable RLS on visits
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;