import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [bulkAction, setBulkAction] = useState<{ table: string; ids: string[]; mode: "restore" | "purge" } | null>(null);

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
      qc.invalidateQueries({ queryKey: [table] });
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
      qc.invalidateQueries({ queryKey: [purgeTarget.table] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setBusy(false);
  };

  const toggleRow = (table: string, id: string) => {
    setSelected((prev) => {
      const set = new Set(prev[table] || []);
      if (set.has(id)) set.delete(id); else set.add(id);
      return { ...prev, [table]: set };
    });
  };

  const toggleAll = (table: string, ids: string[]) => {
    setSelected((prev) => {
      const current = prev[table] || new Set<string>();
      const allSelected = ids.length > 0 && ids.every((id) => current.has(id));
      return { ...prev, [table]: allSelected ? new Set() : new Set(ids) };
    });
  };

  const runBulk = async () => {
    if (!bulkAction) return;
    setBusy(true);
    const rpc = bulkAction.mode === "restore" ? "restore_record" : "purge_record";
    let success = 0;
    let failed = 0;
    for (const id of bulkAction.ids) {
      const { error } = await supabase.rpc(rpc as any, { _table: bulkAction.table, _id: id });
      if (error) failed++; else success++;
    }
    toast({
      title: bulkAction.mode === "restore" ? "Bulk restore complete" : "Bulk delete complete",
      description: `${success} succeeded${failed ? `, ${failed} failed` : ""}.`,
      variant: failed && !success ? "destructive" : "default",
    });
    setSelected((prev) => ({ ...prev, [bulkAction.table]: new Set() }));
    const t = bulkAction.table;
    setBulkAction(null);
    qc.invalidateQueries({ queryKey: ["trash"] });
    qc.invalidateQueries({ queryKey: [t] });
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
                  <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle className="text-base">Deleted {m.label}</CardTitle>
                    {(selected[m.key]?.size || 0) > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{selected[m.key].size} selected</span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => setBulkAction({ table: m.key, ids: Array.from(selected[m.key]), mode: "restore" })}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restore selected
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={busy}
                          onClick={() => setBulkAction({ table: m.key, ids: Array.from(selected[m.key]), mode: "purge" })}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete selected
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {items[m.key]?.length ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground border-b">
                          <Checkbox
                            checked={items[m.key].length > 0 && items[m.key].every((r: any) => selected[m.key]?.has(r.id))}
                            onCheckedChange={() => toggleAll(m.key, items[m.key].map((r: any) => r.id))}
                          />
                          <span>Select all</span>
                        </div>
                        {items[m.key].map((row: any) => (
                          <div key={row.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 transition">
                            <div className="flex items-center gap-3 min-w-0">
                              <Checkbox
                                checked={selected[m.key]?.has(row.id) || false}
                                onCheckedChange={() => toggleRow(m.key, row.id)}
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{row[m.labelField] || "(unnamed)"}</p>
                                <p className="text-xs text-muted-foreground">Deleted {new Date(row.deleted_at).toLocaleString()}</p>
                              </div>
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

      <DeleteDialog
        open={!!bulkAction}
        onOpenChange={(o) => !o && setBulkAction(null)}
        title={bulkAction?.mode === "restore" ? "Restore selected records?" : "Permanently delete selected?"}
        description={
          bulkAction?.mode === "restore"
            ? `${bulkAction?.ids.length} record(s) will be restored.`
            : `${bulkAction?.ids.length} record(s) will be permanently removed. This action cannot be undone.`
        }
        onConfirm={runBulk}
        loading={busy}
      />
    </DashboardLayout>
  );
}