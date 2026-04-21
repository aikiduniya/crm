
-- 1. Add soft-delete columns to all major tables
ALTER TABLE public.leads        ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.projects     ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.clients      ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.sales_deals  ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.equipment    ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.labor        ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.invoices     ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.documents    ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;

-- 2. Update SELECT policies to hide soft-deleted rows for non-admins.
-- Strategy: drop existing SELECT policies and recreate with deleted_at IS NULL clause; admins see everything via separate policy.

-- LEADS
DROP POLICY IF EXISTS "View leads" ON public.leads;
CREATE POLICY "View leads" ON public.leads FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin'))
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'project_manager')));

-- PROJECTS
DROP POLICY IF EXISTS "View projects" ON public.projects;
CREATE POLICY "View projects" ON public.projects FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin'))
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'finance') OR has_role(auth.uid(),'operations')));

-- CLIENTS
DROP POLICY IF EXISTS "View clients" ON public.clients;
CREATE POLICY "View clients" ON public.clients FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin'))
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'finance')));

-- SALES_DEALS
DROP POLICY IF EXISTS "View sales_deals" ON public.sales_deals;
CREATE POLICY "View sales_deals" ON public.sales_deals FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin'))
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'finance')));

-- EQUIPMENT
DROP POLICY IF EXISTS "View equipment" ON public.equipment;
CREATE POLICY "View equipment" ON public.equipment FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin'))
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operations') OR has_role(auth.uid(),'project_manager')));

-- LABOR
DROP POLICY IF EXISTS "View labor" ON public.labor;
CREATE POLICY "View labor" ON public.labor FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin'))
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operations') OR has_role(auth.uid(),'project_manager')));

-- INVOICES
DROP POLICY IF EXISTS "View invoices" ON public.invoices;
CREATE POLICY "View invoices" ON public.invoices FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin'))
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'finance') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'sales')));

-- DOCUMENTS (uses dynamic matrix)
DROP POLICY IF EXISTS "View documents dyn" ON public.documents;
CREATE POLICY "View documents dyn" ON public.documents FOR SELECT TO authenticated
  USING ((deleted_at IS NULL OR has_role(auth.uid(),'admin')) AND public.user_can('documents','view'));

-- 3. Restore + purge admin functions
CREATE OR REPLACE FUNCTION public.restore_record(_table text, _id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can restore records';
  END IF;
  IF _table NOT IN ('leads','projects','clients','sales_deals','equipment','labor','invoices','documents') THEN
    RAISE EXCEPTION 'Invalid table %', _table;
  END IF;
  EXECUTE format('UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1', _table) USING _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_record(_table text, _id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can permanently delete records';
  END IF;
  IF _table NOT IN ('leads','projects','clients','sales_deals','equipment','labor','invoices','documents') THEN
    RAISE EXCEPTION 'Invalid table %', _table;
  END IF;
  EXECUTE format('DELETE FROM public.%I WHERE id = $1', _table) USING _id;
END;
$$;
