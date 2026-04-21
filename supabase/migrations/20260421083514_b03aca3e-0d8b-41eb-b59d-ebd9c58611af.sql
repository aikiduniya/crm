-- Activity log table to track non-admin user actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  module TEXT NOT NULL, -- 'leads', 'projects', etc.
  record_id TEXT,
  record_label TEXT,
  details JSONB,
  read_by_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_unread ON public.activity_logs(read_by_admin) WHERE read_by_admin = false;

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert their own activity
CREATE POLICY "Users can insert own activity"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only admins can view activity logs
CREATE POLICY "Admins view all activity"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update (mark as read)
CREATE POLICY "Admins update activity"
ON public.activity_logs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete activity logs
CREATE POLICY "Admins delete activity"
ON public.activity_logs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;