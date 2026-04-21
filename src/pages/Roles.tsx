import { DashboardLayout } from "@/components/DashboardLayout";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { Shield, Plus, Trash2, Lock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const MODULES = ["dashboard","leads","projects","clients","sales","operations","financials","documents","reports","users"] as const;
const ACTIONS = ["can_view","can_create","can_edit","can_delete"] as const;
const ACTION_LABELS: Record<string, string> = { can_view: "View", can_create: "Create", can_edit: "Edit", can_delete: "Delete" };

interface CustomRole { id: string; name: string; description: string | null; is_system: boolean; base_role: string | null; }
interface RolePerm { id: string; role_id: string; module: string; can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean; }

export default function Roles() {
  const { role } = usePermissions();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [draft, setDraft] = useState<Record<string, RolePerm>>({});
  const [saving, setSaving] = useState(false);

  const { data: roles = [] } = useQuery({
    queryKey: ["custom_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_roles").select("*").order("is_system", { ascending: false }).order("name");
      if (error) throw error;
      return data as CustomRole[];
    },
  });

  const { data: perms = [] } = useQuery({
    queryKey: ["role_permissions_all", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase.from("role_permissions").select("*").eq("role_id", selectedId!);
      if (error) throw error;
      return data as RolePerm[];
    },
  });

  useEffect(() => {
    if (!selectedId) return;
    const map: Record<string, RolePerm> = {};
    MODULES.forEach((m) => {
      const found = perms.find((p) => p.module === m);
      map[m] = found ?? { id: "", role_id: selectedId, module: m, can_view: false, can_create: false, can_edit: false, can_delete: false };
    });
    setDraft(map);
  }, [perms, selectedId]);

  useEffect(() => {
    if (!selectedId && roles.length) setSelectedId(roles[0].id);
  }, [roles, selectedId]);

  if (role !== "admin") return <Navigate to="/" replace />;

  const selectedRole = roles.find((r) => r.id === selectedId);

  const toggle = (module: string, action: typeof ACTIONS[number]) => {
    setDraft((d) => ({ ...d, [module]: { ...d[module], [action]: !d[module][action] } }));
  };

  const handleSavePerms = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const rows = MODULES.map((m) => ({
        role_id: selectedId,
        module: m,
        can_view: draft[m].can_view,
        can_create: draft[m].can_create,
        can_edit: draft[m].can_edit,
        can_delete: draft[m].can_delete,
      }));
      await supabase.from("role_permissions").delete().eq("role_id", selectedId);
      const { error } = await supabase.from("role_permissions").insert(rows);
      if (error) throw error;
      toast({ title: "Permissions saved" });
      qc.invalidateQueries({ queryKey: ["role_permissions_all", selectedId] });
      qc.invalidateQueries({ queryKey: ["role_permissions"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!newRole.name.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("custom_roles").insert({
        name: newRole.name.trim(),
        description: newRole.description.trim() || null,
        is_system: false,
      }).select().single();
      if (error) throw error;
      // Seed empty perms
      await supabase.from("role_permissions").insert(
        MODULES.map((m) => ({ role_id: data.id, module: m, can_view: false, can_create: false, can_edit: false, can_delete: false }))
      );
      toast({ title: "Role created" });
      setCreateOpen(false);
      setNewRole({ name: "", description: "" });
      qc.invalidateQueries({ queryKey: ["custom_roles"] });
      setSelectedId(data.id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedRole || selectedRole.is_system) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("custom_roles").delete().eq("id", selectedRole.id);
      if (error) throw error;
      toast({ title: "Role deleted" });
      setDeleteOpen(false);
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["custom_roles"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage roles and configure module access</p>
          </div>
          <Button className="gradient-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />New Role
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-sm">Roles</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {roles.map((r) => (
                <button key={r.id} onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${selectedId === r.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Shield className="h-4 w-4 shrink-0" />
                    <span className="truncate text-sm font-medium">{r.name}</span>
                  </div>
                  {r.is_system && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {selectedRole?.name || "Select a role"}
                    {selectedRole?.is_system && <Badge variant="outline" className="text-[10px]">System</Badge>}
                  </CardTitle>
                  {selectedRole?.description && <p className="text-xs text-muted-foreground mt-1">{selectedRole.description}</p>}
                </div>
                <div className="flex gap-2">
                  {selectedRole && !selectedRole.is_system && (
                    <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  {selectedRole && (
                    <Button size="sm" onClick={handleSavePerms} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />Save
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedRole && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Module</th>
                        {ACTIONS.map((a) => (
                          <th key={a} className="text-center py-2 font-medium text-muted-foreground w-20">{ACTION_LABELS[a]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map((m) => (
                        <tr key={m} className="border-b last:border-0">
                          <td className="py-3 capitalize font-medium">{m}</td>
                          {ACTIONS.map((a) => (
                            <td key={a} className="text-center py-3">
                              <Checkbox
                                checked={draft[m]?.[a] ?? false}
                                onCheckedChange={() => toggle(m, a)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} placeholder="e.g. Site Supervisor" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} placeholder="What does this role do?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !newRole.name.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen}
        title={`Delete role "${selectedRole?.name}"?`}
        description="Users assigned to this role will lose its permissions. This cannot be undone."
        onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}