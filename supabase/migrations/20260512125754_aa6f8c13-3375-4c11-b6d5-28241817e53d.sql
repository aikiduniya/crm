
-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  passport_number TEXT,
  emirates_id TEXT,
  job_title TEXT,
  nationality TEXT,
  card_number TEXT,
  card_expiry DATE,
  card_type TEXT,
  contract_type TEXT DEFAULT 'Limited',
  status TEXT NOT NULL DEFAULT 'Active',
  phone TEXT,
  email TEXT,
  join_date DATE,
  notes TEXT,
  created_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View employees" ON public.employees FOR SELECT TO authenticated
USING (((deleted_at IS NULL) OR has_role(auth.uid(),'admin'))
  AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operations') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'finance')));

CREATE POLICY "Insert employees" ON public.employees FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operations'));

CREATE POLICY "Update employees" ON public.employees FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operations'));

CREATE POLICY "Delete employees" ON public.employees FOR DELETE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operations'));

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow trash module to handle employees
CREATE OR REPLACE FUNCTION public.purge_record(_table text, _id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can permanently delete records';
  END IF;
  IF _table NOT IN ('leads','projects','clients','sales_deals','equipment','labor','invoices','documents','employees') THEN
    RAISE EXCEPTION 'Invalid table %', _table;
  END IF;
  EXECUTE format('DELETE FROM public.%I WHERE id = $1', _table) USING _id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_record(_table text, _id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can restore records';
  END IF;
  IF _table NOT IN ('leads','projects','clients','sales_deals','equipment','labor','invoices','documents','employees') THEN
    RAISE EXCEPTION 'Invalid table %', _table;
  END IF;
  EXECUTE format('UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1', _table) USING _id;
END;
$function$;

-- Grant employees module permissions to admin and operations roles
INSERT INTO public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT id, 'employees', true, true, true, true FROM public.custom_roles WHERE base_role = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT id, 'employees', true, true, true, true FROM public.custom_roles WHERE base_role = 'operations'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT id, 'employees', true, false, false, false FROM public.custom_roles WHERE base_role IN ('project_manager','finance')
ON CONFLICT DO NOTHING;

-- Seed the 14 employees from the uploaded list
INSERT INTO public.employees (full_name, passport_number, emirates_id, job_title, nationality, card_number, card_expiry, card_type, contract_type) VALUES
('MUHAMMAD AKMAL MUHAMMAD ASLAM','AH1356434','20001018578743','Brick Mason','PAKISTAN','120344253','2026-11-29','New Electronic Work Permit','Limited'),
('RANA MUHAMMAD ZEESHAN RANA ABDUL SHAKOOR','AL5848982','20022079310818','Carpenter','PAKISTAN','119047718','2026-10-22','New Electronic Work Permit','Limited'),
('USMAN ALI NIAMAT ALI','WV1801363','20025039191894','Civil Engineer','PAKISTAN','125170690','2027-04-14','New Electronic Work Permit','Limited'),
('MUHAMMAD ABU HURARA QADEER AHMED SIDDIQUI','AB6924771','20024030018119','Electrician','PAKISTAN','109198907','2025-10-24','New Electronic Work Permit','Limited'),
('MUHAMMAD NADEEM ABDUL LATIF','EU9458142','20001019571169','Electrician Assistant','PAKISTAN','115149776','2026-06-09','New Electronic Work Permit','Limited'),
('MUHAMMAD IMRAN SADIQ HUSSAIN','PU1226041','20001020532504','Brick Mason','PAKISTAN','132688312','2027-09-23','Renew Electronic Work Permit','Limited'),
('NADIR HUSSAIN MUHAMMAD HUSSAIN','GN6911701','20025050385249','Brick Mason','PAKISTAN','126856444','2027-04-14','Renew Electronic Work Permit','Limited'),
('SHAHBAZ ALI IMTIAZ AHMAD','WU1823561','20027010290504','Carpenter','PAKISTAN','120572334','2026-10-29','Renew Electronic Work Permit','Limited'),
('MAZHAR ABBAS KARAM HUSSAIN','TL1010621','20016079690507','Electrician','PAKISTAN','120572595','2026-10-24','Renew Electronic Work Permit','Limited'),
('MUHAMMAD MAQSOOD GHOURI MUHAMMAD ISLAM GHOURI','BQ4194434','20025038660596','Painter','PAKISTAN','128330464','2027-05-13','Renew Electronic Work Permit','Limited'),
('MUHAMMAD REHMAN GHOURI MUHAMMAD YASIN GHOURI','ES4192721','20001030233343','Painter','PAKISTAN','132615453','2027-09-09','Renew Electronic Work Permit','Limited'),
('SAFEER SULTAN MUHAMMAD SIDDIQUE','CX5772072','20024059229766','Plumber','PAKISTAN','122439806','2026-11-30','Renew Electronic Work Permit','Limited'),
('GULL SHAIR TALIB HUSSAIN','MH5190702','20015090041933','Stonemason','PAKISTAN','120578057','2026-10-11','Renew Electronic Work Permit','Limited'),
('RANJHA SABIR HUSSAIN','AD9788713','20026028765679','Stonemason','PAKISTAN','130144744','2027-06-25','Renew Electronic Work Permit','Limited');
