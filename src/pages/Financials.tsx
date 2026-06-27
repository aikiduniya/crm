import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { DollarSign, CreditCard, TrendingUp, FileText, Plus, Edit, Trash2, Eye, Printer } from "lucide-react";
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
import { ExportButton } from "@/components/ExportButton";
import { downloadCSV, printInvoice } from "@/lib/exportUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Invoice = { id: string; invoice_number: string; amount: number; status: string; due_date: string | null; paid_date: string | null; notes: string | null; client_id: string | null; project_id: string | null; vat_percent: number | null; payment_method: string | null };

export default function Financials() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Invoice | null>(null);
  const [viewItem, setViewItem] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => { const { data, error } = await supabase.from("invoices").select("*").is("deleted_at", null).order("created_at", { ascending: false }); if (error) throw error; return data as Invoice[]; },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients", "for-invoice"],
    queryFn: async () => { const { data } = await supabase.from("clients").select("id, company_name, contact_name, email, phone, address").is("deleted_at", null).order("company_name"); return data || []; },
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "for-invoice"],
    queryFn: async () => { const { data } = await supabase.from("projects").select("id, name, client_id").is("deleted_at", null).order("name"); return data || []; },
  });

  const invoiceFields: FieldConfig[] = [
    { name: "invoice_number", label: "Invoice Number", type: "text", required: true, placeholder: "INV-2025-001" },
    { name: "client_id", label: "Bill To (Client)", type: "select", options: clients.map((c: any) => ({ label: `${c.company_name}${c.contact_name ? ` — ${c.contact_name}` : ""}`, value: c.id })) },
    { name: "project_id", label: "Project", type: "select", options: projects.map((p: any) => ({ label: p.name, value: p.id })) },
    { name: "amount", label: "Amount (AED)", type: "number", required: true },
    { name: "vat_percent", label: "VAT % (optional — leave blank for no VAT)", type: "number", placeholder: "e.g. 5" },
    { name: "payment_method", label: "Payment Method", type: "select", options: [
      { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" },
      { label: "Bank Transfer", value: "Bank Transfer" }, { label: "Cheque", value: "Cheque" },
    ]},
    { name: "status", label: "Status", type: "select", options: [
      { label: "Draft", value: "Draft" }, { label: "Pending", value: "Pending" },
      { label: "Paid", value: "Paid" }, { label: "Overdue", value: "Overdue" },
    ]},
    { name: "due_date", label: "Due Date", type: "date" },
    { name: "paid_date", label: "Paid Date", type: "date" },
    { name: "notes", label: "Notes / Description", type: "textarea" },
  ];

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
    { header: "Amount", accessor: (r) => <span className="font-bold">AED {r.amount.toLocaleString()}</span> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Due", accessor: (r) => <span>{r.due_date || "—"}</span> },
    { header: "Actions", accessor: (r: Invoice) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" title="View" onClick={e => { e.stopPropagation(); setViewItem(r); }}><Eye className="h-4 w-4" /></Button>
        {can("financials", "edit") && <Button variant="ghost" size="sm" title="Edit" onClick={e => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>}
        {can("financials", "delete") && <Button variant="ghost" size="sm" title="Delete" onClick={e => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-32" },
  ];

  const handleExportAll = () => {
    downloadCSV(`invoices-${new Date().toISOString().slice(0,10)}.csv`,
      invoices.map(i => ({
        invoice_number: i.invoice_number, amount: i.amount, status: i.status,
        due_date: i.due_date || "", paid_date: i.paid_date || "", notes: i.notes || "",
      })),
      ["invoice_number","amount","status","due_date","paid_date","notes"]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div><h2 className="text-2xl font-bold tracking-tight">Financial Management</h2><p className="text-muted-foreground text-sm mt-1">Invoicing, payments, and financial reporting</p></div>
          <div className="flex items-center gap-2">
            <ExportButton module="financials" onExport={handleExportAll} label="Export CSV" />
            {can("financials", "create") && <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`AED ${(totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} variant="primary" />
          <StatCard title="Outstanding" value={`AED ${(outstanding / 1000).toFixed(0)}K`} icon={CreditCard} />
          <StatCard title="Overdue" value={`AED ${(overdue / 1000).toFixed(0)}K`} icon={FileText} />
          <StatCard title="Total Invoices" value={String(invoices.length)} icon={TrendingUp} variant="accent" />
        </div>
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <DataTable title="Invoices" columns={columns} data={invoices} searchKeys={["invoice_number","notes"]} searchPlaceholder="Search invoices..." filters={[{key:"status",label:"Status",options:[{label:"Draft",value:"Draft"},{label:"Pending",value:"Pending"},{label:"Paid",value:"Paid"},{label:"Overdue",value:"Overdue"}]}]} />}
      </div>
      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editItem ? "Edit Invoice" : "Create Invoice"} fields={invoiceFields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Invoice?" onConfirm={handleDelete} loading={saving} />

      <Dialog open={!!viewItem} onOpenChange={o => !o && setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{viewItem?.invoice_number}</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount</p>
                  <p className="text-3xl font-bold mt-1">AED {viewItem.amount.toLocaleString()}</p>
                </div>
                <StatusBadge status={viewItem.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Due Date</p><p className="font-medium">{viewItem.due_date || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paid Date</p><p className="font-medium">{viewItem.paid_date || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">VAT %</p><p className="font-medium">{viewItem.vat_percent ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Payment Method</p><p className="font-medium">{viewItem.payment_method || "—"}</p></div>
              </div>
              {viewItem.notes && (
                <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes</p><p className="text-sm">{viewItem.notes}</p></div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
            <ExportButton
              module="financials"
              label="Download / Print"
              onExport={() => {
                if (!viewItem) return;
                const client: any = clients.find((c: any) => c.id === viewItem.client_id);
                const project: any = projects.find((p: any) => p.id === viewItem.project_id);
                printInvoice({
                  invoice_number: viewItem.invoice_number,
                  amount: viewItem.amount,
                  status: viewItem.status,
                  due_date: viewItem.due_date,
                  paid_date: viewItem.paid_date,
                  notes: viewItem.notes,
                  client_name: client ? `${client.company_name}${client.contact_name ? ` (${client.contact_name})` : ""}` : undefined,
                  client_email: client?.email,
                  client_phone: client?.phone,
                  client_address: client?.address,
                  project_name: project?.name,
                  vat_percent: viewItem.vat_percent,
                  payment_method: viewItem.payment_method,
                });
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
