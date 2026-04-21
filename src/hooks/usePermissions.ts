import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type Module = "dashboard" | "leads" | "projects" | "clients" | "sales" | "operations" | "financials" | "documents" | "reports" | "users";
export type Permission = "view" | "create" | "edit" | "delete";

export function usePermissions() {
  const { role } = useAuth();

  const { data: permissions = [] } = useQuery({
    queryKey: ["role_permissions", role],
    enabled: !!role,
    staleTime: 60_000,
    queryFn: async () => {
      if (!role) return [];
      const { data: roleRow } = await supabase
        .from("custom_roles")
        .select("id")
        .eq("base_role", role)
        .maybeSingle();
      if (!roleRow) return [];
      const { data } = await supabase
        .from("role_permissions")
        .select("module, can_view, can_create, can_edit, can_delete")
        .eq("role_id", roleRow.id);
      return data ?? [];
    },
  });

  const can = (module: Module, permission: Permission): boolean => {
    if (!role) return false;
    const row = permissions.find((p) => p.module === module);
    if (!row) return false;
    return permission === "view" ? row.can_view
      : permission === "create" ? row.can_create
      : permission === "edit" ? row.can_edit
      : row.can_delete;
  };

  const canAccessModule = (module: Module): boolean => {
    if (!role) return false;
    const row = permissions.find((p) => p.module === module);
    return !!row && (row.can_view || row.can_create || row.can_edit || row.can_delete);
  };

  const canManage = (module: Module): boolean => can(module, "create") || can(module, "edit") || can(module, "delete");

  return { can, canAccessModule, canManage, role };
}
