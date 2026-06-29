import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { UserCircle, UserPlus, Building2, Mail, Phone, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Client = { id: string; company_name: string; contact_name: string; email: string | null; phone: string | null; status: string; total_value: number | null; total_projects: number | null; satisfaction: number | null };

const clientFields: FieldConfig[] = [
  { name: "company_name", label: "Company Name", type: "text", required: true },
  { name: "contact_name", label: "Contact Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "address", label: "Address", type: "text" },
  { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] },
  { name: "total_value", label: "Total Value (AED)", type: "number" },
  { name: "satisfaction", label: "Satisfaction (1-5)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function Clients() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => { const { data, error } = await supabase.from("clients").select("*").is("deleted_at", null).order("created_at", { ascending: false }); if (error) throw error; return data as Client[]; },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("clients").update(formData as any).eq("id", editItem.id);
        if (error) throw error;
        log("update", "clients", { id: editItem.id, label: formData.company_name || editItem.company_name });
        toast({ title: "Client updated" });
      } else {
        const { data: inserted, error } = await supabase.from("clients").insert({ ...formData, created_by: user?.id } as any).select().single();
        if (error) throw error;
        log("create", "clients", { id: inserted?.id, label: formData.company_name });
        toast({ title: "Client created" });
      }
      setDialogOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["clients"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return; setSaving(true);
    try {
      const { error } = await supabase.from("clients").update({ deleted_at: new Date().toISOString(), deleted_by: user?.id } as any).eq("id", editItem.id);
      if (error) throw error;
      log("delete", "clients", { id: editItem.id, label: editItem.company_name });
      toast({ title: "Client deleted" });
      setDeleteOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["clients"] });
    }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const columns: Column<Client>[] = [
    { header: "Client", accessor: (r) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{r.company_name.slice(0, 2)}</AvatarFallback></Avatar>
        <div><p className="font-medium">{r.company_name}</p><p className="text-xs text-muted-foreground">{r.contact_name}</p></div>
      </div>
    )},
    { header: "Contact", accessor: (r) => (
      <div className="space-y-1">
        {r.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{r.email}</div>}
        {r.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{r.phone}</div>}
      </div>
    )},
    { header: "Value", accessor: (r) => <span className="font-medium">{r.total_value ? `AED ${(r.total_value / 1000).toFixed(0)}K` : "—"}</span> },
    { header: "Rating", accessor: (r) => (
      <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < (r.satisfaction || 0) ? "text-accent fill-accent" : "text-muted"}`} />)}</div>
    )},
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    ...(can("clients", "edit") ? [{ header: "Actions", accessor: (r: Client) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
        {can("clients", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Client>] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold tracking-tight">Client Management</h2><p className="text-muted-foreground text-sm mt-1">Manage client relationships</p></div>
          {can("clients", "create") && <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}><UserPlus className="h-4 w-4 mr-2" />Add Client</Button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Clients" value={String(clients.length)} icon={UserCircle} />
          <StatCard title="Active" value={String(clients.filter(c => c.status === "Active").length)} icon={Building2} variant="primary" />
          <StatCard title="Total Value" value={`AED ${(clients.reduce((s, c) => s + (c.total_value || 0), 0) / 1000000).toFixed(1)}M`} icon={Star} variant="accent" />
          <StatCard title="Avg Satisfaction" value={clients.length ? (clients.reduce((s, c) => s + (c.satisfaction || 0), 0) / clients.length).toFixed(1) : "0"} icon={Star} variant="success" />
        </div>
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <DataTable title="All Clients" columns={columns} data={clients} searchKeys={["company_name","contact_name","email","phone"]} searchPlaceholder="Search clients..." filters={[{key:"status",label:"Status",options:[{label:"Active",value:"Active"},{label:"Inactive",value:"Inactive"},{label:"Prospect",value:"Prospect"}]}]} />}
      </div>
      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editItem ? "Edit Client" : "Add Client"} fields={clientFields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Client?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
