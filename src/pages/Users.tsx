import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, Trash2, Edit } from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  role: string | null;
}

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  hr: "bg-purple-100 text-purple-700 border-purple-200",
  project_manager: "bg-primary/10 text-primary border-primary/20",
  sales: "bg-accent/10 text-accent border-accent/20",
  finance: "bg-success/10 text-success border-success/20",
  operations: "bg-info/10 text-info border-info/20",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  hr: "HR",
  project_manager: "Project Manager",
  sales: "Sales",
  finance: "Finance",
  operations: "Operations",
};

const userFields: FieldConfig[] = [
  { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "john@company.com" },
  { name: "password", label: "Password", type: "text", required: true, placeholder: "Min 6 characters" },
  { name: "role", label: "Role", type: "select", required: true, options: [
    { label: "Admin", value: "admin" }, { label: "HR", value: "hr" },
    { label: "Project Manager", value: "project_manager" }, { label: "Sales", value: "sales" },
    { label: "Finance", value: "finance" }, { label: "Operations", value: "operations" },
  ]},
];

const editRoleFields: FieldConfig[] = [
  { name: "role", label: "Role", type: "select", required: true, options: [
    { label: "Admin", value: "admin" }, { label: "HR", value: "hr" },
    { label: "Project Manager", value: "project_manager" }, { label: "Sales", value: "sales" },
    { label: "Finance", value: "finance" }, { label: "Operations", value: "operations" },
  ]},
];

export default function Users() {
  const { can } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        is_active: p.is_active,
        role: roles?.find(r => r.user_id === p.user_id)?.role || null,
      }));
    },
  });

  const handleCreate = async (data: Record<string, any>) => {
    setSaving(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("create-user", {
        body: { email: data.email, password: data.password, full_name: data.full_name, role: data.role },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      toast({ title: "User created successfully" });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      toast({ title: "Error creating user", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleEditRole = async (data: Record<string, any>) => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      // Delete old role, insert new
      await supabase.from("user_roles").delete().eq("user_id", selectedUser.user_id);
      const { error } = await supabase.from("user_roles").insert({ user_id: selectedUser.user_id, role: data.role });
      if (error) throw error;
      toast({ title: "Role updated successfully" });
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      toast({ title: "Error updating role", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ is_active: false }).eq("user_id", selectedUser.user_id);
      if (error) throw error;
      toast({ title: "User deactivated" });
      setDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const columns: Column<UserRow>[] = [
    { header: "User", accessor: (r) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {r.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{r.full_name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      </div>
    )},
    { header: "Role", accessor: (r) => r.role ? (
      <Badge variant="outline" className={`text-xs font-medium ${roleColors[r.role] || ""}`}>
        <Shield className="h-3 w-3 mr-1" />{roleLabels[r.role] || r.role}
      </Badge>
    ) : <span className="text-muted-foreground text-xs">No role</span> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.is_active ? "Active" : "Inactive"} /> },
    ...(can("users", "edit") ? [{ header: "Actions", accessor: (r: UserRow) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedUser(r); setEditOpen(true); }}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedUser(r); setDeleteOpen(true); }}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ), className: "w-24" } as Column<UserRow>] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage users and role-based access</p>
          </div>
          {can("users", "create") && (
            <Button className="gradient-primary" onClick={() => setCreateOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />Create User
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(roleLabels).map(([key, label]) => {
            const count = users.filter(u => u.role === key && u.is_active).length;
            return (
              <div key={key} className="rounded-lg border p-3 bg-card text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <DataTable title="All Users" columns={columns} data={users} />
        )}
      </div>

      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="Create New User" fields={userFields} onSubmit={handleCreate} loading={saving} />
      <CrudDialog open={editOpen} onOpenChange={setEditOpen} title="Edit User Role" fields={editRoleFields} initialData={selectedUser ? { role: selectedUser.role } : undefined} onSubmit={handleEditRole} loading={saving} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Deactivate User?" description="This will deactivate the user account. They will no longer be able to log in." onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}
