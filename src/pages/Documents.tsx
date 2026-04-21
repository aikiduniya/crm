import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { FileText, Upload, FolderOpen, File, Edit, Trash2, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Document = { id: string; name: string; type: string; status: string; file_size: number | null; file_url: string | null };

const TYPES = ["Contract","Report","Blueprint","Financial","Certificate","Change Order","Other"];
const STATUSES = ["Draft","In Review","Approved","Rejected"];

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

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
  const [form, setForm] = useState({ name: "", type: "Other", status: "Draft" });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (dialogOpen) {
      setForm({
        name: editItem?.name || "",
        type: editItem?.type || "Other",
        status: editItem?.status || "Draft",
      });
      setFile(null);
    }
  }, [dialogOpen, editItem]);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => { const { data, error } = await supabase.from("documents").select("*").is("deleted_at", null).order("created_at", { ascending: false }); if (error) throw error; return data as Document[]; },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let file_url = editItem?.file_url ?? null;
      let file_size = editItem?.file_size ?? null;
      if (file) {
        const path = `${user?.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
        if (upErr) throw upErr;
        file_url = path;
        file_size = file.size;
      }
      const payload = { name: form.name, type: form.type, status: form.status, file_url, file_size };
      if (editItem) {
        const { error } = await supabase.from("documents").update(payload).eq("id", editItem.id);
        if (error) throw error;
        log("update", "documents", { id: editItem.id, label: form.name });
        toast({ title: "Document updated" });
      } else {
        const { data: inserted, error } = await supabase.from("documents").insert({ ...payload, uploaded_by: user?.id }).select().single();
        if (error) throw error;
        log("create", "documents", { id: inserted?.id, label: form.name });
        toast({ title: "Document uploaded" });
      }
      setDialogOpen(false); setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.file_url) { toast({ title: "No file attached", variant: "destructive" }); return; }
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.file_url, 60);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async () => {
    if (!editItem) return; setSaving(true);
    try {
      const { error } = await supabase.from("documents").update({ deleted_at: new Date().toISOString(), deleted_by: user?.id }).eq("id", editItem.id);
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
    { header: "Size", accessor: (r) => <span className="text-xs text-muted-foreground">{formatSize(r.file_size)}</span> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Actions", accessor: (r: Document) => (
      <div className="flex gap-1">
        {r.file_url && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDownload(r); }}><Download className="h-4 w-4" /></Button>}
        {can("documents", "edit") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>}
        {can("documents", "delete") && <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-32" },
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
      {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <DataTable title="All Documents" columns={columns} data={documents} searchKeys={["name","type"]} searchPlaceholder="Search documents..." filters={[{key:"status",label:"Status",options:STATUSES.map(s=>({label:s,value:s}))},{key:"type",label:"Type",options:TYPES.map(t=>({label:t,value:t}))}]} />}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Document" : "Upload Document"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label>Document Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>File {editItem?.file_url && <span className="text-xs text-muted-foreground">(leave empty to keep current)</span>}</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition cursor-pointer relative">
                <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm">{file ? file.name : "Click or drag file to upload"}</p>
                {file && <p className="text-xs text-muted-foreground mt-1">{formatSize(file.size)}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Document?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
