import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { TrendingUp, DollarSign, Target, CheckCircle2, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Deal = { id: string; title: string; client_name: string; stage: string; value: number | null; probability: number | null; expected_close: string | null };

const dealFields: FieldConfig[] = [
  { name: "title", label: "Deal Title", type: "text", required: true },
  { name: "client_name", label: "Client Name", type: "text", required: true },
  { name: "stage", label: "Stage", type: "select", options: [
    { label: "New", value: "New" }, { label: "Qualification", value: "Qualification" },
    { label: "Proposal", value: "Proposal" }, { label: "Negotiation", value: "Negotiation" },
    { label: "Won", value: "Won" }, { label: "Lost", value: "Lost" },
  ]},
  { name: "value", label: "Deal Value ($)", type: "number" },
  { name: "probability", label: "Probability (%)", type: "number" },
  { name: "expected_close", label: "Expected Close", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function Sales() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Deal | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["sales_deals"],
    queryFn: async () => { const { data, error } = await supabase.from("sales_deals").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as Deal[]; },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) { const { error } = await supabase.from("sales_deals").update(formData).eq("id", editItem.id); if (error) throw error; toast({ title: "Deal updated" }); }
      else { const { error } = await supabase.from("sales_deals").insert({ ...formData, created_by: user?.id }); if (error) throw error; toast({ title: "Deal created" }); }
      setDialogOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["sales_deals"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return; setSaving(true);
    try { const { error } = await supabase.from("sales_deals").delete().eq("id", editItem.id); if (error) throw error; toast({ title: "Deal deleted" }); setDeleteOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["sales_deals"] }); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const columns: Column<Deal>[] = [
    { header: "Deal", accessor: (r) => (<div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.client_name}</p></div>) },
    { header: "Stage", accessor: (r) => <StatusBadge status={r.stage} /> },
    { header: "Value", accessor: (r) => <span className="font-medium">{r.value ? `$${(r.value / 1000).toFixed(0)}K` : "—"}</span> },
    { header: "Probability", accessor: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${r.probability || 0}%` }} /></div>
        <span className="text-xs font-medium">{r.probability || 0}%</span>
      </div>
    )},
    ...(can("sales", "edit") ? [{ header: "Actions", accessor: (r: Deal) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
        {can("sales", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Deal>] : []),
  ];

  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === "Won");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold tracking-tight">Sales Pipeline</h2><p className="text-muted-foreground text-sm mt-1">Track deals, quotes, and proposals</p></div>
          {can("sales", "create") && <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Deal</Button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pipeline Value" value={`$${(totalValue / 1000000).toFixed(1)}M`} icon={DollarSign} variant="primary" />
          <StatCard title="Deals Won" value={String(wonDeals.length)} icon={CheckCircle2} variant="success" />
          <StatCard title="Win Rate" value={deals.length ? `${((wonDeals.length / deals.length) * 100).toFixed(0)}%` : "0%"} icon={Target} />
          <StatCard title="Total Deals" value={String(deals.length)} icon={TrendingUp} variant="accent" />
        </div>
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <DataTable title="Active Deals" columns={columns} data={deals} />}
      </div>
      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editItem ? "Edit Deal" : "New Deal"} fields={dealFields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Deal?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
