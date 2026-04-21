
-- Export request workflow
CREATE TABLE public.export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  module TEXT NOT NULL,
  export_type TEXT NOT NULL DEFAULT 'csv',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | used
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewer_note TEXT,
  approved_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own requests"
  ON public.export_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own requests"
  ON public.export_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update requests"
  ON public.export_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete requests"
  ON public.export_requests FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER export_requests_updated_at
  BEFORE UPDATE ON public.export_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: does the current user have an active approval for a module?
CREATE OR REPLACE FUNCTION public.has_export_approval(_module TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.export_requests
    WHERE user_id = auth.uid()
      AND module = _module
      AND status = 'approved'
      AND (approved_until IS NULL OR approved_until > now())
  );
$$;
