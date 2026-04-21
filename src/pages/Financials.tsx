import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { DollarSign, CreditCard, TrendingUp, FileText, Plus, Edit, Trash2 } from "lucide-react";
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
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Invoice = { id: string; invoice_number: string; amount: number; status: string; due_date: string | null; paid_date: string | null; notes: string | null; client_id: string | null; project_id: string | null };

const invoiceFields: FieldConfig[] = [
  { name: "invoice_number", label: "Invoice Number", type: "text", required: true, placeholder: "INV-2025-001" },
  { name: "amount", label: "Amount ($)", type: "number", required: true },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Draft", value: "Draft" }, { label: "Pending", value: "Pending" },
    { label: "Paid", value: "Paid" }, { label: "Overdue", value: "Overdue" },
  ]},
  { name: "due_date", label: "Due Date", type: "date" },
  { name: "paid_date", label: "Paid Date", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function Financials() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => { const { data, error } = await supabase.from("invoices").select("*").is("deleted_at", null).order("created_at", { ascending: false }); if (error) throw error; return data as Invoice[]; },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("invoices").update(formData as any).eq("id", editItem.id);
        if (error) throw error;
        log("update", "financials", { id: editItem.id, label: formData.invoice_number || editItem.invoice_number });
        toast({ title: "Invoice updated" });
      } else {
        const { data: inserted, error } = await supabase.from("invoices").insert({ ...formData, created_by: user?.id } as any).select().single();
        if (error) throw error;
        log("create", "financials", { id: inserted?.id, label: formData.invoice_number });
        toast({ title: "Invoice created" });
      }
      setDialogOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return; setSaving(true);
    try {
      const { error } = await supabase.from("invoices").update({ deleted_at: new Date().toISOString(), deleted_by: user?.id } as any).eq("id", editItem.id);
      if (error) throw error;
      log("delete", "financials", { id: editItem.id, label: editItem.invoice_number });
      toast({ title: "Invoice deleted" });
      setDeleteOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["invoices"] });
    }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  const columns: Column<Invoice>[] = [
    { header: "Invoice", accessor: (r) => <span className="font-medium">{r.invoice_number}</span> },
    { header: "Amount", accessor: (r) => <span className="font-bold">${r.amount.toLocaleString()}</span> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Due", accessor: (r) => <span>{r.due_date || "—"}</span> },
    ...(can("financials", "edit") ? [{ header: "Actions", accessor: (r: Invoice) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
        {can("financials", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Invoice>] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold tracking-tight">Financial Management</h2><p className="text-muted-foreground text-sm mt-1">Invoicing, payments, and financial reporting</p></div>
          {can("financials", "create") && <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} variant="primary" />
          <StatCard title="Outstanding" value={`$${(outstanding / 1000).toFixed(0)}K`} icon={CreditCard} />
          <StatCard title="Overdue" value={`$${(overdue / 1000).toFixed(0)}K`} icon={FileText} />
          <StatCard title="Total Invoices" value={String(invoices.length)} icon={TrendingUp} variant="accent" />
        </div>
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <DataTable title="Invoices" columns={columns} data={invoices} searchKeys={["invoice_number","notes"]} searchPlaceholder="Search invoices..." filters={[{key:"status",label:"Status",options:[{label:"Draft",value:"Draft"},{label:"Pending",value:"Pending"},{label:"Paid",value:"Paid"},{label:"Overdue",value:"Overdue"}]}]} />}
      </div>
      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editItem ? "Edit Invoice" : "Create Invoice"} fields={invoiceFields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Invoice?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
