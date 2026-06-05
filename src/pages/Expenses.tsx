import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { DollarSign, Receipt, Plus, Edit, Trash2, FileText, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number | null;
  expense_date: string | null;
  vendor: string | null;
  payment_method: string | null;
  reference_no: string | null;
  status: string;
  notes: string | null;
  receipt_url: string | null;
};

const fields: FieldConfig[] = [
  { name: "title", label: "Title / Description", type: "text", required: true },
  { name: "category", label: "Category", type: "select", options: [
    { label: "General", value: "General" }, { label: "Office", value: "Office" }, { label: "Travel", value: "Travel" },
    { label: "Equipment", value: "Equipment" }, { label: "Material", value: "Material" }, { label: "Salary", value: "Salary" },
    { label: "Utilities", value: "Utilities" }, { label: "Maintenance", value: "Maintenance" }, { label: "Other", value: "Other" },
  ]},
  { name: "amount", label: "Amount (AED)", type: "number", required: true },
  { name: "expense_date", label: "Expense Date", type: "date" },
  { name: "vendor", label: "Vendor / Payee", type: "text" },
  { name: "payment_method", label: "Payment Method", type: "select", options: [
    { label: "Cash", value: "Cash" }, { label: "Bank Transfer", value: "Bank Transfer" },
    { label: "Credit Card", value: "Credit Card" }, { label: "Cheque", value: "Cheque" }, { label: "Other", value: "Other" },
  ]},
  { name: "reference_no", label: "Reference / Invoice No", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Pending", value: "Pending" }, { label: "Approved", value: "Approved" },
    { label: "Paid", value: "Paid" }, { label: "Rejected", value: "Rejected" },
  ]},
  { name: "receipt_url", label: "Receipt", type: "file", bucket: "expense-receipts", placeholder: "Upload receipt (PDF, image)" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function Expenses() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses" as any).select("*").is("deleted_at", null).order("expense_date", { ascending: false });
      if (error) throw error;
      return (data as unknown) as Expense[];
    },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("expenses" as any).update(formData).eq("id", editItem.id);
        if (error) throw error;
        log("update", "financials", { id: editItem.id, label: `Expense: ${formData.title || editItem.title}` });
        toast({ title: "Expense updated" });
      } else {
        const { data: inserted, error } = await supabase.from("expenses" as any).insert({ ...formData, created_by: user?.id }).select().single();
        if (error) throw error;
        log("create", "financials", { id: (inserted as any)?.id, label: `Expense: ${formData.title}` });
        toast({ title: "Expense added" });
      }
      setDialogOpen(false); setEditItem(null);
      qc.invalidateQueries({ queryKey: ["expenses"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("expenses" as any)
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id }).eq("id", editItem.id);
      if (error) throw error;
      log("delete", "financials", { id: editItem.id, label: `Expense: ${editItem.title}` });
      toast({ title: "Expense deleted" });
      setDeleteOpen(false); setEditItem(null);
      qc.invalidateQueries({ queryKey: ["expenses"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const columns: Column<Expense>[] = [
    { header: "Date", accessor: (r) => <span className="text-sm">{r.expense_date ? new Date(r.expense_date).toLocaleDateString() : "—"}</span> },
    { header: "Title", accessor: (r) => (
      <div>
        <p className="font-medium leading-tight">{r.title}</p>
        {r.vendor && <p className="text-[11px] text-muted-foreground mt-0.5">{r.vendor}</p>}
      </div>
    )},
    { header: "Category", accessor: (r) => <span className="text-xs px-2 py-0.5 rounded bg-muted">{r.category}</span> },
    { header: "Amount", accessor: (r) => <span className="font-semibold">AED {Number(r.amount || 0).toLocaleString()}</span> },
    { header: "Payment", accessor: (r) => <span className="text-xs">{r.payment_method || "—"}</span> },
    { header: "Ref #", accessor: (r) => <span className="font-mono text-xs">{r.reference_no || "—"}</span> },
    { header: "Receipt", accessor: (r) => r.receipt_url ? (
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={async (e) => {
        e.stopPropagation();
        const { data } = await supabase.storage.from("expense-receipts").createSignedUrl(r.receipt_url!, 60);
        if (data?.signedUrl) window.open(data.signedUrl, "_blank");
      }}><FileText className="h-4 w-4 mr-1 text-primary" /><span className="text-xs">View</span></Button>
    ) : <span className="text-xs text-muted-foreground">—</span> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    ...(can("expenses", "edit") || can("expenses", "delete") ? [{ header: "Actions", accessor: (r: Expense) => (
      <div className="flex gap-1">
        {can("expenses", "edit") && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>}
        {can("expenses", "delete") && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Expense>] : []),
  ];

  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const pending = expenses.filter(e => e.status === "Pending").reduce((s, e) => s + Number(e.amount || 0), 0);
  const paid = expenses.filter(e => e.status === "Paid").reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisMonth = expenses.filter(e => e.expense_date && new Date(e.expense_date).getMonth() === new Date().getMonth() && new Date(e.expense_date).getFullYear() === new Date().getFullYear()).reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Expense Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Track and manage company expenses</p>
          </div>
          {can("expenses", "create") && (
            <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Expense
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Expenses" value={`AED ${total.toLocaleString()}`} icon={DollarSign} />
          <StatCard title="This Month" value={`AED ${thisMonth.toLocaleString()}`} icon={TrendingDown} variant="primary" />
          <StatCard title="Pending" value={`AED ${pending.toLocaleString()}`} icon={Receipt} variant="accent" />
          <StatCard title="Paid" value={`AED ${paid.toLocaleString()}`} icon={Wallet} variant="success" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <DataTable
            title="All Expenses"
            columns={columns}
            data={expenses}
            searchKeys={["title", "vendor", "reference_no", "category"]}
            searchPlaceholder="Search expenses..."
            filters={[
              { key: "status", label: "Status", options: [
                { label: "Pending", value: "Pending" }, { label: "Approved", value: "Approved" },
                { label: "Paid", value: "Paid" }, { label: "Rejected", value: "Rejected" },
              ]},
              { key: "category", label: "Category", options: [
                { label: "General", value: "General" }, { label: "Office", value: "Office" }, { label: "Travel", value: "Travel" },
                { label: "Equipment", value: "Equipment" }, { label: "Material", value: "Material" }, { label: "Salary", value: "Salary" },
                { label: "Utilities", value: "Utilities" }, { label: "Maintenance", value: "Maintenance" }, { label: "Other", value: "Other" },
              ]},
            ]}
          />
        )}
      </div>
      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen}
        title={editItem ? "Edit Expense" : "Add Expense"}
        fields={fields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Expense?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}