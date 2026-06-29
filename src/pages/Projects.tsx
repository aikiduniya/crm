import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/DataTable";
import { FolderKanban, Plus, Calendar, DollarSign, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Project = {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  spent: number | null;
  start_date: string | null;
  end_date: string | null;
  progress: number | null;
  description: string | null;
};

const projectFields: FieldConfig[] = [
  { name: "name", label: "Project Name", type: "text", required: true },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Planning", value: "Planning" }, { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" }, { label: "On Hold", value: "On Hold" },
  ]},
  { name: "budget", label: "Budget (AED)", type: "number" },
  { name: "spent", label: "Spent (AED)", type: "number" },
  { name: "progress", label: "Progress (%)", type: "number" },
  { name: "start_date", label: "Start Date", type: "date" },
  { name: "end_date", label: "End Date", type: "date" },
  { name: "description", label: "Description", type: "textarea" },
];

function ProjectCard({ project, canEdit, canDelete, onEdit, onDelete }: { project: Project; canEdit: boolean; canDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div><h4 className="font-semibold">{project.name}</h4></div>
        <div className="flex items-center gap-1">
          <StatusBadge status={project.status} />
          {canEdit && <Button variant="ghost" size="sm" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>}
          {canDelete && <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{project.progress || 0}%</span></div>
          <Progress value={project.progress || 0} className="h-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs"><DollarSign className="h-3 w-3 text-muted-foreground" /><span className="font-medium">AED {((project.budget || 0) / 1000).toFixed(0)}K</span></div>
          {project.start_date && <div className="flex items-center gap-1.5 text-xs"><Calendar className="h-3 w-3 text-muted-foreground" /><span>{project.start_date}</span></div>}
        </div>
      </div>
    </Card>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").is("deleted_at", null).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("projects").update(formData as any).eq("id", editItem.id);
        if (error) throw error;
        log("update", "projects", { id: editItem.id, label: formData.name || editItem.name });
        toast({ title: "Project updated" });
      } else {
        const { data: inserted, error } = await supabase.from("projects").insert({ ...formData, created_by: user?.id } as any).select().single();
        if (error) throw error;
        log("create", "projects", { id: inserted?.id, label: formData.name });
        toast({ title: "Project created" });
      }
      setDialogOpen(false); setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("projects").update({ deleted_at: new Date().toISOString(), deleted_by: user?.id } as any).eq("id", editItem.id);
      if (error) throw error;
      log("delete", "projects", { id: editItem.id, label: editItem.name });
      toast({ title: "Project deleted" });
      setDeleteOpen(false); setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const filterByStatus = (status: string) => projects.filter(p => p.status === status);
  const stats = { total: projects.length, active: filterByStatus("In Progress").length, budget: projects.reduce((s, p) => s + (p.budget || 0), 0) };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold tracking-tight">Project Management</h2><p className="text-muted-foreground text-sm mt-1">Manage timelines, budgets, and project milestones</p></div>
          {can("projects", "create") && <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Project</Button>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Projects" value={String(stats.total)} icon={FolderKanban} />
          <StatCard title="Active" value={String(stats.active)} icon={Calendar} variant="primary" />
          <StatCard title="Total Budget" value={`AED ${(stats.budget / 1000000).toFixed(1)}M`} icon={DollarSign} variant="accent" />
          <StatCard title="Completed" value={String(filterByStatus("Completed").length)} icon={Users} variant="success" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            {["all", "active", "completed"].map(tab => (
              <TabsContent key={tab} value={tab}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                  {(tab === "all" ? projects : tab === "active" ? filterByStatus("In Progress") : filterByStatus("Completed")).map(p => (
                    <ProjectCard key={p.id} project={p} canEdit={can("projects", "edit")} canDelete={can("projects", "delete")}
                      onEdit={() => { setEditItem(p); setDialogOpen(true); }} onDelete={() => { setEditItem(p); setDeleteOpen(true); }} />
                  ))}
                </div>
              </TabsContent>
            ))}
            <TabsContent value="timeline">
              <div className="mt-4">
                <ProjectTimeline projects={projects} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editItem ? "Edit Project" : "New Project"} fields={projectFields} initialData={editItem || undefined} onSubmit={handleSave} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Project?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
