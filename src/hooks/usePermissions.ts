import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

type Module = "dashboard" | "leads" | "projects" | "clients" | "sales" | "operations" | "financials" | "documents" | "reports" | "users";

type Permission = "view" | "create" | "edit" | "delete";

const permissionMatrix: Record<AppRole, Record<Module, Permission[]>> = {
  admin: {
    dashboard: ["view"], leads: ["view", "create", "edit", "delete"], projects: ["view", "create", "edit", "delete"],
    clients: ["view", "create", "edit", "delete"], sales: ["view", "create", "edit", "delete"],
    operations: ["view", "create", "edit", "delete"], financials: ["view", "create", "edit", "delete"],
    documents: ["view", "create", "edit", "delete"], reports: ["view"], users: ["view", "create", "edit", "delete"],
  },
  hr: {
    dashboard: ["view"], leads: [], projects: [], clients: [], sales: [],
    operations: [], financials: [], documents: ["view"],
    reports: ["view"], users: ["view"],
  },
  project_manager: {
    dashboard: ["view"], leads: ["view"], projects: ["view", "create", "edit", "delete"],
    clients: ["view"], sales: [], operations: ["view"],
    financials: ["view"], documents: ["view", "create", "edit", "delete"],
    reports: ["view"], users: [],
  },
  sales: {
    dashboard: ["view"], leads: ["view", "create", "edit", "delete"], projects: ["view"],
    clients: ["view", "create", "edit", "delete"], sales: ["view", "create", "edit", "delete"],
    operations: [], financials: ["view"], documents: ["view"],
    reports: ["view"], users: [],
  },
  finance: {
    dashboard: ["view"], leads: [], projects: ["view"],
    clients: ["view"], sales: ["view"],
    operations: [], financials: ["view", "create", "edit", "delete"],
    documents: ["view"], reports: ["view"], users: [],
  },
  operations: {
    dashboard: ["view"], leads: [], projects: ["view"],
    clients: [], sales: [],
    operations: ["view", "create", "edit", "delete"], financials: [],
    documents: ["view"], reports: ["view"], users: [],
  },
};

export function usePermissions() {
  const { role } = useAuth();

  const can = (module: Module, permission: Permission): boolean => {
    if (!role) return false;
    return permissionMatrix[role]?.[module]?.includes(permission) ?? false;
  };

  const canAccessModule = (module: Module): boolean => {
    if (!role) return false;
    return (permissionMatrix[role]?.[module]?.length ?? 0) > 0;
  };

  const canManage = (module: Module): boolean => can(module, "create") || can(module, "edit") || can(module, "delete");

  return { can, canAccessModule, canManage, role };
}
