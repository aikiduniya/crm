import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { DeleteDialog } from "@/components/DeleteDialog";

const MODULES = [
  { key: "leads", label: "Leads", labelField: "company_name" },
  { key: "projects", label: "Projects", labelField: "name" },
  { key: "clients", label: "Clients", labelField: "company_name" },
  { key: "sales_deals", label: "Sales Deals", labelField: "title" },
  { key: "equipment", label: "Equipment", labelField: "name" },
  { key: "labor", label: "Labor", labelField: "worker_name" },
  { key: "invoices", label: "Invoices", labelField: "invoice_number" },
  { key: "documents", label: "Documents", labelField: "name" },
] as const;

export default function Trash() {
  const { role } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [purgeTarget, setPurgeTarget] = useState<{ table: string; id: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (role && role !== "admin") return <Navigate to="/" replace />;

  const { data: items = {}, isLoading } = useQuery({
    queryKey: ["trash"],
    queryFn: async () => {
      const result: Record<string, any[]> = {};
      for (const m of MODULES) {
        const { data } = await (supabase.from(m.key as any) as any)
          .select("*")
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false });
        result[m.key] = data || [];
      }
      return result;
    },
  });

  const handleRestore = async (table: string, id: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("restore_record" as any, { _table: table, _id: id });
      if (error) throw error;
      toast({ title: "Restored" });
      qc.invalidateQueries({ queryKey: ["trash"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setBusy(false);
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("purge_record" as any, { _table: purgeTarget.table, _id: purgeTarget.id });
      if (error) throw error;
      toast({ title: "Permanently deleted" });
      setPurgeTarget(null);
      qc.invalidateQueries({ queryKey: ["trash"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setBusy(false);
  };

  const totalCount = Object.values(items).reduce((s, arr) => s + arr.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trash2 className="h-6 w-6" />Trash
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Restore deleted records or remove them permanently. {totalCount} item{totalCount !== 1 ? "s" : ""} in trash.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <Tabs defaultValue={MODULES[0].key}>
            <TabsList className="flex-wrap h-auto">
              {MODULES.map((m) => (
                <TabsTrigger key={m.key} value={m.key}>
                  {m.label}
                  {(items[m.key]?.length || 0) > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 text-[10px]">{items[m.key].length}</Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {MODULES.map((m) => (
              <TabsContent key={m.key} value={m.key} className="mt-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Deleted {m.label}</CardTitle></CardHeader>
                  <CardContent>
                    {items[m.key]?.length ? (
                      <div className="space-y-2">
                        {items[m.key].map((row: any) => (
                          <div key={row.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 transition">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{row[m.labelField] || "(unnamed)"}</p>
                              <p className="text-xs text-muted-foreground">Deleted {new Date(row.deleted_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button variant="outline" size="sm" disabled={busy} onClick={() => handleRestore(m.key, row.id)}>
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restore
                              </Button>
                              <Button variant="destructive" size="sm" disabled={busy} onClick={() => setPurgeTarget({ table: m.key, id: row.id, label: row[m.labelField] || "" })}>
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete Forever
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground text-sm">
                        <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        No deleted {m.label.toLowerCase()}.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <DeleteDialog
        open={!!purgeTarget}
        onOpenChange={(o) => !o && setPurgeTarget(null)}
        title="Permanently delete?"
        description={`"${purgeTarget?.label}" will be permanently removed. This action cannot be undone.`}
        onConfirm={handlePurge}
        loading={busy}
      />
    </DashboardLayout>
  );
}