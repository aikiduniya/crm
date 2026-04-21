import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ActivityAction = "create" | "update" | "delete";
export type ActivityModule =
  | "leads" | "projects" | "clients" | "sales" | "operations"
  | "financials" | "documents" | "users";

export function useActivityLogger() {
  const { user, role, profile } = useAuth();

  const log = async (
    action: ActivityAction,
    module: ActivityModule,
    record: { id?: string; label?: string; details?: Record<string, any> } = {}
  ) => {
    // Do not log admin actions
    if (!user || role === "admin" || !role) return;
    try {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        user_name: profile?.full_name || user.email || "Unknown",
        user_role: role,
        action,
        module,
        record_id: record.id ?? null,
        record_label: record.label ?? null,
        details: (record.details as any) ?? null,
      } as any);
    } catch (err) {
      // Silent fail — logging shouldn't block UX
      console.warn("Activity log failed", err);
    }
  };

  return { log };
}