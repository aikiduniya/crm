
-- Add contract_url to employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS contract_url text;

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  amount numeric NOT NULL DEFAULT 0,
  expense_date date,
  vendor text,
  payment_method text,
  reference_no text,
  project_id uuid,
  status text NOT NULL DEFAULT 'Pending',
  notes text,
  receipt_url text,
  created_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View expenses" ON public.expenses FOR SELECT TO authenticated
USING (((deleted_at IS NULL) OR has_role(auth.uid(), 'admin'::app_role))
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role) OR has_role(auth.uid(), 'operations'::app_role)));

CREATE POLICY "Insert expenses" ON public.expenses FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role) OR has_role(auth.uid(), 'operations'::app_role));

CREATE POLICY "Update expenses" ON public.expenses FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

CREATE POLICY "Delete expenses" ON public.expenses FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed permissions for expenses module
INSERT INTO public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT cr.id, 'expenses',
  CASE cr.base_role WHEN 'admin' THEN true WHEN 'finance' THEN true WHEN 'hr' THEN true WHEN 'operations' THEN true WHEN 'project_manager' THEN true ELSE false END,
  CASE cr.base_role WHEN 'admin' THEN true WHEN 'finance' THEN true WHEN 'hr' THEN true WHEN 'operations' THEN true ELSE false END,
  CASE cr.base_role WHEN 'admin' THEN true WHEN 'finance' THEN true WHEN 'hr' THEN true ELSE false END,
  CASE cr.base_role WHEN 'admin' THEN true WHEN 'finance' THEN true ELSE false END
FROM public.custom_roles cr
WHERE NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = cr.id AND rp.module = 'expenses');

-- Update purge/restore allowlist to include expenses
CREATE OR REPLACE FUNCTION public.purge_record(_table text, _id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can permanently delete records';
  END IF;
  IF _table NOT IN ('leads','projects','clients','sales_deals','equipment','labor','invoices','documents','employees','expenses') THEN
    RAISE EXCEPTION 'Invalid table %', _table;
  END IF;
  EXECUTE format('DELETE FROM public.%I WHERE id = $1', _table) USING _id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_record(_table text, _id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can restore records';
  END IF;
  IF _table NOT IN ('leads','projects','clients','sales_deals','equipment','labor','invoices','documents','employees','expenses') THEN
    RAISE EXCEPTION 'Invalid table %', _table;
  END IF;
  EXECUTE format('UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1', _table) USING _id;
END;
$function$;
