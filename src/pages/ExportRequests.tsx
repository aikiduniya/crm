import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Check, X, Clock, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

type Req = {
  id: string; user_id: string; user_name: string; module: string; export_type: string;
  reason: string | null; status: string; reviewer_note: string | null;
  approved_until: string | null; created_at: string; reviewed_at: string | null;
};

const statusBadge: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  used: "bg-muted text-muted-foreground border-border",
};

export default function ExportRequests() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  if (role && role !== "admin") return <Navigate to="/" replace />;

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["export_requests", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("export_requests" as any)
        .select("*").order("created_at", { ascending: false });
      return (data || []) as unknown as Req[];
    },
  });

  const review = async (id: string, status: "approved" | "rejected", days = 7) => {
    setBusy(id);
    const update: any = {
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };
    if (status === "approved") {
      update.approved_until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }
    const { error } = await supabase.from("export_requests" as any).update(update).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: status === "approved" ? "Request approved" : "Request rejected" });
    qc.invalidateQueries({ queryKey: ["export_requests"] });
    setBusy(null);
  };

  const groups = {
    pending: requests.filter(r => r.status === "pending"),
    approved: requests.filter(r => r.status === "approved"),
    rejected: requests.filter(r => r.status === "rejected"),
    all: requests,
  };

  const renderList = (rows: Req[]) => rows.length ? (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.id} className="flex items-start justify-between p-4 border rounded-xl bg-card hover:bg-muted/30 transition">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{r.user_name}</span>
              <Badge variant="outline" className="capitalize text-[11px]">{r.module}</Badge>
              <Badge variant="outline" className={`text-[11px] capitalize ${statusBadge[r.status] || ""}`}>{r.status}</Badge>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            {r.reason && <p className="text-sm text-muted-foreground">{r.reason}</p>}
            {r.approved_until && r.status === "approved" && (
              <p className="text-[11px] text-success">Valid until {new Date(r.approved_until).toLocaleString()}</p>
            )}
          </div>
          {r.status === "pending" && (
            <div className="flex gap-2 shrink-0 ml-3">
              <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => review(r.id, "rejected")}>
                <X className="h-3.5 w-3.5 mr-1" />Reject
              </Button>
              <Button size="sm" disabled={busy === r.id} onClick={() => review(r.id, "approved")}>
                <Check className="h-3.5 w-3.5 mr-1" />Approve (7d)
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="py-10 text-center text-sm text-muted-foreground">
      <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />No requests in this view.
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />Export Requests
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Approve or reject export & download requests from team members.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending {groups.pending.length > 0 && <Badge variant="secondary" className="ml-2 h-5 text-[10px]">{groups.pending.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4"><Card><CardContent className="pt-6">{renderList(groups.pending)}</CardContent></Card></TabsContent>
            <TabsContent value="approved" className="mt-4"><Card><CardContent className="pt-6">{renderList(groups.approved)}</CardContent></Card></TabsContent>
            <TabsContent value="rejected" className="mt-4"><Card><CardContent className="pt-6">{renderList(groups.rejected)}</CardContent></Card></TabsContent>
            <TabsContent value="all" className="mt-4"><Card><CardContent className="pt-6">{renderList(groups.all)}</CardContent></Card></TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
