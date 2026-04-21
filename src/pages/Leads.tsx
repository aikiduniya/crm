import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Users, UserPlus, Target, TrendingUp, Mail, Phone, Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Lead = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  value: number | null;
  notes: string | null;
  created_at: string;
};

const leadFields: FieldConfig[] = [
  { name: "company_name", label: "Company Name", type: "text", required: true },
  { name: "contact_name", label: "Contact Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "source", label: "Source", type: "select", options: [
    { label: "Website", value: "Website" }, { label: "Referral", value: "Referral" },
    { label: "Trade Show", value: "Trade Show" }, { label: "LinkedIn", value: "LinkedIn" },
    { label: "Direct", value: "Direct" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { label: "New", value: "New" }, { label: "Qualified", value: "Qualified" },
    { label: "Proposal", value: "Proposal" }, { label: "Negotiation", value: "Negotiation" },
    { label: "Won", value: "Won" }, { label: "Lost", value: "Lost" },
  ]},
  { name: "value", label: "Estimated Value ($)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function Leads() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").is("deleted_at", null).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("leads").update(formData as any).eq("id", editItem.id);
        if (error) throw error;
        log("update", "leads", { id: editItem.id, label: formData.company_name || editItem.company_name });
        toast({ title: "Lead updated" });
      } else {
        const { data: inserted, error } = await supabase.from("leads").insert({ ...formData, created_by: user?.id } as any).select().single();
        if (error) throw error;
        log("create", "leads", { id: inserted?.id, label: formData.company_name });
        toast({ title: "Lead created" });
      }
      setDialogOpen(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("leads").update({ deleted_at: new Date().toISOString(), deleted_by: user?.id }).eq("id", editItem.id);
      if (error) throw error;
      log("delete", "leads", { id: editItem.id, label: editItem.company_name });
      toast({ title: "Lead deleted" });
      setDeleteOpen(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const columns: Column<Lead>[] = [
    { header: "Name", accessor: (r) => (
      <div><p className="font-medium">{r.contact_name}</p><p className="text-xs text-muted-foreground">{r.company_name}</p></div>
    )},
    { header: "Contact", accessor: (r) => (
      <div className="space-y-1">
        {r.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{r.email}</div>}
        {r.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{r.phone}</div>}
      </div>
    )},
    { header: "Source", accessor: (r) => <span>{r.source || "—"}</span> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Value", accessor: (r) => <span className="font-medium">{r.value ? `$${r.value.toLocaleString()}` : "—"}</span> },
    ...(can("leads", "edit") ? [{ header: "Actions", accessor: (r: Lead) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
        {can("leads", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Lead>] : []),
  ];

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.status === "Qualified").length,
    won: leads.filter(l => l.status === "Won").length,
    totalValue: leads.reduce((s, l) => s + (l.value || 0), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Lead Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your construction leads</p>
          </div>
          {can("leads", "create") && (
            <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}>
              <UserPlus className="h-4 w-4 mr-2" />Add Lead
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Leads" value={String(stats.total)} icon={Users} />
          <StatCard title="Qualified" value={String(stats.qualified)} icon={Target} />
          <StatCard title="Won" value={String(stats.won)} icon={TrendingUp} variant="success" />
          <StatCard title="Total Value" value={`$${(stats.totalValue / 1000).toFixed(0)}K`} icon={Target} variant="accent" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="qualified">Qualified</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
            </TabsList>
            <TabsContent value="all"><DataTable columns={columns} data={leads} searchKeys={["company_name","contact_name","email","phone"]} searchPlaceholder="Search leads..." filters={[{key:"status",label:"Status",options:[{label:"New",value:"New"},{label:"Qualified",value:"Qualified"},{label:"Proposal",value:"Proposal"},{label:"Won",value:"Won"},{label:"Lost",value:"Lost"}]},{key:"source",label:"Source",options:[{label:"Website",value:"Website"},{label:"Referral",value:"Referral"},{label:"Cold Call",value:"Cold Call"},{label:"Event",value:"Event"}]}]} /></TabsContent>
            <TabsContent value="new"><DataTable columns={columns} data={leads.filter(l => l.status === "New")} searchKeys={["company_name","contact_name","email"]} searchPlaceholder="Search leads..." /></TabsContent>
            <TabsContent value="qualified"><DataTable columns={columns} data={leads.filter(l => l.status === "Qualified")} searchKeys={["company_name","contact_name","email"]} searchPlaceholder="Search leads..." /></TabsContent>
            <TabsContent value="won"><DataTable columns={columns} data={leads.filter(l => l.status === "Won")} searchKeys={["company_name","contact_name","email"]} searchPlaceholder="Search leads..." /></TabsContent>
          </Tabs>
        )}
      </div>

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editItem ? "Edit Lead" : "Add Lead"} fields={leadFields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Lead?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
