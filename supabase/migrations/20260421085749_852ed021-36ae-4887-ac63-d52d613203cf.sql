
-- Helper that reads dynamic permission matrix
CREATE OR REPLACE FUNCTION public.user_can(_module text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.custom_roles cr ON cr.base_role = ur.role
    JOIN public.role_permissions rp ON rp.role_id = cr.id
    WHERE ur.user_id = auth.uid()
      AND rp.module = _module
      AND CASE _action
        WHEN 'view'   THEN rp.can_view
        WHEN 'create' THEN rp.can_create
        WHEN 'edit'   THEN rp.can_edit
        WHEN 'delete' THEN rp.can_delete
        ELSE false
      END
  )
$$;

-- Replace documents policies with dynamic checks
DROP POLICY IF EXISTS "Insert documents" ON public.documents;
DROP POLICY IF EXISTS "Update documents" ON public.documents;
DROP POLICY IF EXISTS "Delete documents" ON public.documents;
DROP POLICY IF EXISTS "View documents" ON public.documents;

CREATE POLICY "View documents dyn" ON public.documents FOR SELECT TO authenticated
  USING (public.user_can('documents','view'));
CREATE POLICY "Insert documents dyn" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.user_can('documents','create'));
CREATE POLICY "Update documents dyn" ON public.documents FOR UPDATE TO authenticated
  USING (public.user_can('documents','edit'));
CREATE POLICY "Delete documents dyn" ON public.documents FOR DELETE TO authenticated
  USING (public.user_can('documents','delete'));

-- Seed dummy documents
INSERT INTO public.documents (name, type, status, file_size) VALUES
  ('Master Service Agreement.pdf', 'Contract', 'Approved', 245678),
  ('Q1 Financial Report.xlsx', 'Financial', 'In Review', 89234),
  ('Building A - Foundation Blueprint', 'Blueprint', 'Approved', 1245789),
  ('Safety Certification 2026', 'Certificate', 'Approved', 67890),
  ('Change Order #14 - Roofing', 'Change Order', 'Draft', 34521);
