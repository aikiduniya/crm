import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export type ExportModule = "reports" | "financials" | "documents" | "leads" | "clients" | "projects" | "operations";

export type ExportRequest = {
  id: string; user_id: string; user_name: string; module: string; export_type: string;
  reason: string | null; status: string; reviewed_by: string | null; reviewed_at: string | null;
  reviewer_note: string | null; approved_until: string | null; created_at: string;
};

export function useExportPermission(module: ExportModule) {
  const { user, role, profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isAdmin = role === "admin";

  const { data: requests = [] } = useQuery({
    queryKey: ["export_requests", "mine", module, user?.id],
    enabled: !!user && !isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("export_requests" as any)
        .select("*").eq("user_id", user!.id).eq("module", module)
        .order("created_at", { ascending: false }).limit(5);
      return (data || []) as unknown as ExportRequest[];
    },
  });

  const activeApproval = requests.find(
    r => r.status === "approved" && (!r.approved_until || new Date(r.approved_until) > new Date())
  );
  const pending = requests.find(r => r.status === "pending");
  const canExport = isAdmin || !!activeApproval;

  const requestExport = async (reason: string, exportType: "csv" | "pdf" | "any" = "csv") => {
    if (!user) return;
    const { error } = await supabase.from("export_requests" as any).insert({
      user_id: user.id,
      user_name: profile?.full_name || user.email || "Unknown",
      module, export_type: exportType, reason, status: "pending",
    } as any);
    if (error) { toast({ title: "Request failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Request submitted", description: "An admin will review your request shortly." });
    qc.invalidateQueries({ queryKey: ["export_requests"] });
  };

  return { isAdmin, canExport, pending, activeApproval, requestExport };
}
