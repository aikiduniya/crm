import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Wrench, Truck, HardHat, Users, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Equipment = { id: string; name: string; type: string; status: string; condition: string | null; daily_rate: number | null; last_maintenance: string | null };
type Labor = { id: string; worker_name: string; role: string; status: string; hourly_rate: number | null; hours_logged: number | null; phone: string | null };

const equipmentFields: FieldConfig[] = [
  { name: "name", label: "Equipment Name", type: "text", required: true },
  { name: "type", label: "Type", type: "select", required: true, options: [
    { label: "Heavy", value: "Heavy" }, { label: "Medium", value: "Medium" },
    { label: "Crane", value: "Crane" }, { label: "Specialty", value: "Specialty" }, { label: "Access", value: "Access" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { label: "Available", value: "Available" }, { label: "In Use", value: "In Use" }, { label: "Maintenance", value: "Maintenance" },
  ]},
  { name: "condition", label: "Condition", type: "select", options: [
    { label: "Excellent", value: "Excellent" }, { label: "Good", value: "Good" }, { label: "Fair", value: "Fair" }, { label: "Poor", value: "Poor" },
  ]},
  { name: "daily_rate", label: "Daily Rate ($)", type: "number" },
  { name: "last_maintenance", label: "Last Maintenance", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

const laborFields: FieldConfig[] = [
  { name: "worker_name", label: "Worker Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text", required: true },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Available", value: "Available" }, { label: "Active", value: "Active" }, { label: "On Leave", value: "On Leave" },
  ]},
  { name: "hourly_rate", label: "Hourly Rate ($)", type: "number" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function Operations() {
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const [eqDialogOpen, setEqDialogOpen] = useState(false);
  const [eqDeleteOpen, setEqDeleteOpen] = useState(false);
  const [editEq, setEditEq] = useState<Equipment | null>(null);
  const [lbDialogOpen, setLbDialogOpen] = useState(false);
  const [lbDeleteOpen, setLbDeleteOpen] = useState(false);
  const [editLb, setEditLb] = useState<Labor | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: equipment = [] } = useQuery({ queryKey: ["equipment"], queryFn: async () => { const { data } = await supabase.from("equipment").select("*").order("created_at", { ascending: false }); return (data || []) as Equipment[]; } });
  const { data: labor = [] } = useQuery({ queryKey: ["labor"], queryFn: async () => { const { data } = await supabase.from("labor").select("*").order("created_at", { ascending: false }); return (data || []) as Labor[]; } });

  const saveEquipment = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editEq) {
        await supabase.from("equipment").update(formData as any).eq("id", editEq.id);
        log("update", "operations", { id: editEq.id, label: `Equipment: ${formData.name || editEq.name}` });
        toast({ title: "Equipment updated" });
      } else {
        const { data: inserted } = await supabase.from("equipment").insert(formData as any).select().single();
        log("create", "operations", { id: inserted?.id, label: `Equipment: ${formData.name}` });
        toast({ title: "Equipment added" });
      }
      setEqDialogOpen(false); setEditEq(null); queryClient.invalidateQueries({ queryKey: ["equipment"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const deleteEquipment = async () => {
    if (!editEq) return; setSaving(true);
    try {
      await supabase.from("equipment").update({ deleted_at: new Date().toISOString() }).eq("id", editEq.id);
      log("delete", "operations", { id: editEq.id, label: `Equipment: ${editEq.name}` });
      toast({ title: "Equipment deleted" });
      setEqDeleteOpen(false); setEditEq(null); queryClient.invalidateQueries({ queryKey: ["equipment"] });
    }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const saveLabor = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editLb) {
        await supabase.from("labor").update(formData as any).eq("id", editLb.id);
        log("update", "operations", { id: editLb.id, label: `Worker: ${formData.worker_name || editLb.worker_name}` });
        toast({ title: "Worker updated" });
      } else {
        const { data: inserted } = await supabase.from("labor").insert(formData as any).select().single();
        log("create", "operations", { id: inserted?.id, label: `Worker: ${formData.worker_name}` });
        toast({ title: "Worker added" });
      }
      setLbDialogOpen(false); setEditLb(null); queryClient.invalidateQueries({ queryKey: ["labor"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const deleteLabor = async () => {
    if (!editLb) return; setSaving(true);
    try {
      await supabase.from("labor").update({ deleted_at: new Date().toISOString() }).eq("id", editLb.id);
      log("delete", "operations", { id: editLb.id, label: `Worker: ${editLb.worker_name}` });
      toast({ title: "Worker deleted" });
      setLbDeleteOpen(false); setEditLb(null); queryClient.invalidateQueries({ queryKey: ["labor"] });
    }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const eqColumns: Column<Equipment>[] = [
    { header: "Equipment", accessor: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.type}</p></div>) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Condition", accessor: (r) => <span>{r.condition || "—"}</span> },
    { header: "Daily Rate", accessor: (r) => <span className="font-medium">{r.daily_rate ? `$${r.daily_rate}` : "—"}</span> },
    ...(can("operations", "edit") ? [{ header: "Actions", accessor: (r: Equipment) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditEq(r); setEqDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
        {can("operations", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditEq(r); setEqDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Equipment>] : []),
  ];

  const lbColumns: Column<Labor>[] = [
    { header: "Name", accessor: (r) => (<div><p className="font-medium">{r.worker_name}</p><p className="text-xs text-muted-foreground">{r.role}</p></div>) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Rate", accessor: (r) => <span className="font-medium">{r.hourly_rate ? `$${r.hourly_rate}/hr` : "—"}</span> },
    { header: "Hours", accessor: (r) => <span>{r.hours_logged || 0}h</span> },
    ...(can("operations", "edit") ? [{ header: "Actions", accessor: (r: Labor) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditLb(r); setLbDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
        {can("operations", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditLb(r); setLbDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Labor>] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold tracking-tight">Operations Management</h2><p className="text-muted-foreground text-sm mt-1">Manage resources, equipment, and labor</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Equipment" value={String(equipment.length)} icon={Truck} />
          <StatCard title="Workers" value={String(labor.length)} icon={HardHat} variant="primary" />
          <StatCard title="Available Equipment" value={String(equipment.filter(e => e.status === "Available").length)} icon={Wrench} variant="accent" />
          <StatCard title="Active Workers" value={String(labor.filter(w => w.status === "Active").length)} icon={Users} variant="success" />
        </div>
        <Tabs defaultValue="equipment">
          <TabsList>
            <TabsTrigger value="equipment"><Truck className="h-4 w-4 mr-2" />Equipment</TabsTrigger>
            <TabsTrigger value="labor"><HardHat className="h-4 w-4 mr-2" />Labor</TabsTrigger>
          </TabsList>
          <TabsContent value="equipment" className="mt-4">
            {can("operations", "create") && <div className="flex justify-end mb-3"><Button className="gradient-primary" onClick={() => { setEditEq(null); setEqDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Equipment</Button></div>}
            <DataTable title="Equipment Inventory" columns={eqColumns} data={equipment} searchKeys={["name","type"]} searchPlaceholder="Search equipment..." filters={[{key:"status",label:"Status",options:[{label:"Available",value:"Available"},{label:"In Use",value:"In Use"},{label:"Maintenance",value:"Maintenance"}]}]} />
          </TabsContent>
          <TabsContent value="labor" className="mt-4">
            {can("operations", "create") && <div className="flex justify-end mb-3"><Button className="gradient-primary" onClick={() => { setEditLb(null); setLbDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Worker</Button></div>}
            <DataTable title="Workforce" columns={lbColumns} data={labor} searchKeys={["worker_name","role"]} searchPlaceholder="Search workers..." filters={[{key:"status",label:"Status",options:[{label:"Available",value:"Available"},{label:"Active",value:"Active"},{label:"On Leave",value:"On Leave"}]}]} />
          </TabsContent>
        </Tabs>
      </div>
      <CrudDialog open={eqDialogOpen} onOpenChange={setEqDialogOpen} title={editEq ? "Edit Equipment" : "Add Equipment"} fields={equipmentFields} initialData={editEq || undefined} onSubmit={saveEquipment} loading={saving} />
      <DeleteDialog open={eqDeleteOpen} onOpenChange={setEqDeleteOpen} title="Delete Equipment?" onConfirm={deleteEquipment} loading={saving} />
      <CrudDialog open={lbDialogOpen} onOpenChange={setLbDialogOpen} title={editLb ? "Edit Worker" : "Add Worker"} fields={laborFields} initialData={editLb || undefined} onSubmit={saveLabor} loading={saving} />
      <DeleteDialog open={lbDeleteOpen} onOpenChange={setLbDeleteOpen} title="Delete Worker?" onConfirm={deleteLabor} loading={saving} />
    </DashboardLayout>
  );
}
