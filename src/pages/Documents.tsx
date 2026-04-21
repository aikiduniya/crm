import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { FileText, Upload, FolderOpen, File, Edit, Trash2, Plus } from "lucide-react";
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

type Document = { id: string; name: string; type: string; status: string; file_size: number | null; file_url: string | null };

const documentFields: FieldConfig[] = [
  { name: "name", label: "Document Name", type: "text", required: true },
  { name: "type", label: "Type", type: "select", required: true, options: [
    { label: "Contract", value: "Contract" }, { label: "Report", value: "Report" },
    { label: "Blueprint", value: "Blueprint" }, { label: "Financial", value: "Financial" },
    { label: "Certificate", value: "Certificate" }, { label: "Change Order", value: "Change Order" },
    { label: "Other", value: "Other" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { label: "Draft", value: "Draft" }, { label: "In Review", value: "In Review" },
    { label: "Approved", value: "Approved" }, { label: "Rejected", value: "Rejected" },
  ]},
  { name: "file_url", label: "File URL", type: "text", placeholder: "https://..." },
];

export default function Documents() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Document | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => { const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as Document[]; },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("documents").update(formData as any).eq("id", editItem.id);
        if (error) throw error;
        log("update", "documents", { id: editItem.id, label: formData.name || editItem.name });
        toast({ title: "Document updated" });
      } else {
        const { data: inserted, error } = await supabase.from("documents").insert({ ...formData, uploaded_by: user?.id } as any).select().single();
        if (error) throw error;
        log("create", "documents", { id: inserted?.id, label: formData.name });
        toast({ title: "Document created" });
      }
      setDialogOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return; setSaving(true);
    try {
      const { error } = await supabase.from("documents").delete().eq("id", editItem.id);
      if (error) throw error;
      log("delete", "documents", { id: editItem.id, label: editItem.name });
      toast({ title: "Document deleted" });
      setDeleteOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const columns: Column<Document>[] = [
    { header: "Document", accessor: (r) => (
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted"><FileText className="h-4 w-4 text-primary" /></div>
        <div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.type}</p></div>
      </div>
    )},
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    ...(can("documents", "edit") ? [{ header: "Actions", accessor: (r: Document) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
        {can("documents", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Document>] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold tracking-tight">Document Management</h2><p className="text-muted-foreground text-sm mt-1">Store and manage project documents</p></div>
          {can("documents", "create") && <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Document</Button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Documents" value={String(documents.length)} icon={FileText} />
          <StatCard title="Approved" value={String(documents.filter(d => d.status === "Approved").length)} icon={FolderOpen} variant="success" />
          <StatCard title="In Review" value={String(documents.filter(d => d.status === "In Review").length)} icon={Upload} variant="accent" />
          <StatCard title="Draft" value={String(documents.filter(d => d.status === "Draft").length)} icon={File} />
        </div>
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <DataTable title="All Documents" columns={columns} data={documents} searchKeys={["name","type"]} searchPlaceholder="Search documents..." filters={[{key:"status",label:"Status",options:[{label:"Draft",value:"Draft"},{label:"In Review",value:"In Review"},{label:"Approved",value:"Approved"},{label:"Rejected",value:"Rejected"}]},{key:"type",label:"Type",options:[{label:"Contract",value:"Contract"},{label:"Report",value:"Report"},{label:"Blueprint",value:"Blueprint"},{label:"Financial",value:"Financial"},{label:"Certificate",value:"Certificate"},{label:"Change Order",value:"Change Order"},{label:"Other",value:"Other"}]}]} />}
      </div>
      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editItem ? "Edit Document" : "Add Document"} fields={documentFields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Document?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
