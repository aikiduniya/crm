
-- Allow inserts on profiles for the auth trigger
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Also allow service role / trigger inserts (anon for the trigger context)
CREATE POLICY "Service insert profiles" ON public.profiles FOR INSERT TO anon WITH CHECK (true);
