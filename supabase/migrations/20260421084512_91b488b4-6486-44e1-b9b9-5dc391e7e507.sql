
-- 1. custom_roles table
CREATE TABLE public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  base_role app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View roles" ON public.custom_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert roles" ON public.custom_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update roles" ON public.custom_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete non-system roles" ON public.custom_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') AND is_system = false);

CREATE TRIGGER update_custom_roles_updated_at BEFORE UPDATE ON public.custom_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. role_permissions table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  module text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  UNIQUE(role_id, module)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert perms" ON public.role_permissions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update perms" ON public.role_permissions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete perms" ON public.role_permissions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- 3. Add custom_role_id to user_roles
ALTER TABLE public.user_roles ADD COLUMN custom_role_id uuid REFERENCES public.custom_roles(id) ON DELETE SET NULL;

-- 4. Seed 6 system roles
INSERT INTO public.custom_roles (name, description, is_system, base_role) VALUES
  ('Admin', 'Full system access', true, 'admin'),
  ('HR', 'Human resources management', true, 'hr'),
  ('Project Manager', 'Manages projects and documents', true, 'project_manager'),
  ('Sales', 'Manages leads, clients and deals', true, 'sales'),
  ('Finance', 'Manages invoices and financials', true, 'finance'),
  ('Operations', 'Manages equipment and labor', true, 'operations');

-- 5. Seed role_permissions matching current usePermissions matrix
DO $$
DECLARE
  r RECORD;
  modules text[] := ARRAY['dashboard','leads','projects','clients','sales','operations','financials','documents','reports','users'];
  m text;
BEGIN
  FOR r IN SELECT id, base_role FROM public.custom_roles LOOP
    FOREACH m IN ARRAY modules LOOP
      INSERT INTO public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
      VALUES (
        r.id, m,
        -- can_view
        CASE
          WHEN r.base_role = 'admin' THEN true
          WHEN r.base_role = 'hr' AND m IN ('dashboard','documents','reports','users') THEN true
          WHEN r.base_role = 'project_manager' AND m IN ('dashboard','leads','projects','clients','operations','financials','documents','reports') THEN true
          WHEN r.base_role = 'sales' AND m IN ('dashboard','leads','projects','clients','sales','financials','documents','reports') THEN true
          WHEN r.base_role = 'finance' AND m IN ('dashboard','projects','clients','sales','financials','documents','reports') THEN true
          WHEN r.base_role = 'operations' AND m IN ('dashboard','projects','operations','documents','reports') THEN true
          ELSE false
        END,
        -- can_create
        CASE
          WHEN r.base_role = 'admin' AND m <> 'dashboard' AND m <> 'reports' THEN true
          WHEN r.base_role = 'project_manager' AND m IN ('projects','documents') THEN true
          WHEN r.base_role = 'sales' AND m IN ('leads','clients','sales') THEN true
          WHEN r.base_role = 'finance' AND m = 'financials' THEN true
          WHEN r.base_role = 'operations' AND m = 'operations' THEN true
          ELSE false
        END,
        -- can_edit
        CASE
          WHEN r.base_role = 'admin' AND m <> 'dashboard' AND m <> 'reports' THEN true
          WHEN r.base_role = 'project_manager' AND m IN ('projects','documents') THEN true
          WHEN r.base_role = 'sales' AND m IN ('leads','clients','sales') THEN true
          WHEN r.base_role = 'finance' AND m = 'financials' THEN true
          WHEN r.base_role = 'operations' AND m = 'operations' THEN true
          ELSE false
        END,
        -- can_delete
        CASE
          WHEN r.base_role = 'admin' AND m <> 'dashboard' AND m <> 'reports' THEN true
          WHEN r.base_role = 'project_manager' AND m IN ('projects','documents') THEN true
          WHEN r.base_role = 'sales' AND m IN ('leads','clients','sales') THEN true
          WHEN r.base_role = 'finance' AND m = 'financials' THEN true
          WHEN r.base_role = 'operations' AND m = 'operations' THEN true
          ELSE false
        END
      );
    END LOOP;
  END LOOP;
END $$;
