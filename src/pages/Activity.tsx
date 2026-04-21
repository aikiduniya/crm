import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable, type Column } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity as ActivityIcon, Trash2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  record_label: string | null;
  read_by_admin: boolean;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: "bg-success/10 text-success border-success/20",
  update: "bg-primary/10 text-primary border-primary/20",
  delete: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Activity() {
  const { role, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: role === "admin",
  });

  useEffect(() => {
    if (role !== "admin") return;
    const channel = supabase
      .channel("activity_logs_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        () => queryClient.invalidateQueries({ queryKey: ["activity_logs"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, queryClient]);

  if (!loading && role !== "admin") return <Navigate to="/" replace />;

  const handleClearAll = async () => {
    if (!confirm("Delete all activity history? This cannot be undone.")) return;
    const { error } = await supabase.from("activity_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Activity history cleared" });
      queryClient.invalidateQueries({ queryKey: ["activity_logs"] });
    }
  };

  const columns: Column<ActivityLog>[] = [
    { header: "When", accessor: (r) => (
      <div className="text-xs">
        <p className="font-medium">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
        <p className="text-muted-foreground">{format(new Date(r.created_at), "HH:mm")}</p>
      </div>
    )},
    { header: "User", accessor: (r) => (
      <div>
        <p className="font-medium text-sm">{r.user_name}</p>
        <p className="text-xs text-muted-foreground capitalize">{r.user_role.replace("_", " ")}</p>
      </div>
    )},
    { header: "Action", accessor: (r) => (
      <Badge variant="outline" className={`text-[10px] ${actionColors[r.action] || ""}`}>
        {r.action.toUpperCase()}
      </Badge>
    )},
    { header: "Module", accessor: (r) => <span className="capitalize text-sm">{r.module}</span> },
    { header: "Record", accessor: (r) => <span className="text-sm">{r.record_label || "—"}</span> },
    { header: "Status", accessor: (r) => r.read_by_admin
      ? <span className="text-xs text-muted-foreground">Read</span>
      : <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/20">NEW</Badge>
    },
  ];

  const today = logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const unread = logs.filter(l => !l.read_by_admin).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Activity History</h2>
            <p className="text-muted-foreground text-sm mt-1">All actions performed by non-admin users</p>
          </div>
          {logs.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />Clear History
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Actions" value={String(logs.length)} icon={ActivityIcon} />
          <StatCard title="Today" value={String(today)} icon={ActivityIcon} variant="primary" />
          <StatCard title="Unread" value={String(unread)} icon={ActivityIcon} variant="accent" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <DataTable
            title="All Activity"
            columns={columns}
            data={logs}
            searchKeys={["user_name", "module", "record_label", "action"]}
            searchPlaceholder="Search activity..."
            filters={[
              { key: "action", label: "Action", options: [
                { label: "Create", value: "create" },
                { label: "Update", value: "update" },
                { label: "Delete", value: "delete" },
              ]},
              { key: "module", label: "Module", options: [
                { label: "Leads", value: "leads" }, { label: "Projects", value: "projects" },
                { label: "Clients", value: "clients" }, { label: "Sales", value: "sales" },
                { label: "Operations", value: "operations" }, { label: "Financials", value: "financials" },
                { label: "Documents", value: "documents" }, { label: "Users", value: "users" },
              ]},
              { key: "user_role", label: "Role", options: [
                { label: "HR", value: "hr" }, { label: "Project Manager", value: "project_manager" },
                { label: "Sales", value: "sales" }, { label: "Finance", value: "finance" },
                { label: "Operations", value: "operations" },
              ]},
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}