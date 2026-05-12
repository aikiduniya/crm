import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Users, UserPlus, Edit, Trash2, Upload, FileSpreadsheet, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import * as XLSX from "xlsx";

type Employee = {
  id: string;
  full_name: string;
  passport_number: string | null;
  emirates_id: string | null;
  job_title: string | null;
  nationality: string | null;
  card_number: string | null;
  card_expiry: string | null;
  card_type: string | null;
  contract_type: string | null;
  status: string;
  phone: string | null;
  email: string | null;
  join_date: string | null;
  notes: string | null;
};

const employeeFields: FieldConfig[] = [
  { name: "full_name", label: "Full Name", type: "text", required: true },
  { name: "job_title", label: "Job Title", type: "text" },
  { name: "nationality", label: "Nationality", type: "text" },
  { name: "passport_number", label: "Passport Number", type: "text" },
  { name: "emirates_id", label: "Emirates ID", type: "text" },
  { name: "card_number", label: "Work Permit / Card Number", type: "text" },
  { name: "card_expiry", label: "Card Expiry", type: "date" },
  { name: "card_type", label: "Card Type", type: "select", options: [
    { label: "New Electronic Work Permit", value: "New Electronic Work Permit" },
    { label: "Renew Electronic Work Permit", value: "Renew Electronic Work Permit" },
    { label: "Other", value: "Other" },
  ]},
  { name: "contract_type", label: "Contract Type", type: "select", options: [
    { label: "Limited", value: "Limited" },
    { label: "Unlimited", value: "Unlimited" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { label: "Active", value: "Active" },
    { label: "On Leave", value: "On Leave" },
    { label: "Inactive", value: "Inactive" },
  ]},
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "join_date", label: "Join Date", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

function parseDateFlexible(v: any): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  // dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/);
  if (m) {
    const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${yyyy}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export default function Employees() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const { log } = useActivityLogger();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees" as any)
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown) as Employee[];
    },
  });

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("employees" as any).update(formData).eq("id", editItem.id);
        if (error) throw error;
        log("update", "users", { id: editItem.id, label: formData.full_name || editItem.full_name });
        toast({ title: "Employee updated" });
      } else {
        const { data: inserted, error } = await supabase
          .from("employees" as any)
          .insert({ ...formData, created_by: user?.id })
          .select()
          .single();
        if (error) throw error;
        log("create", "users", { id: (inserted as any)?.id, label: formData.full_name });
        toast({ title: "Employee added" });
      }
      setDialogOpen(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("employees" as any)
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
        .eq("id", editItem.id);
      if (error) throw error;
      log("delete", "users", { id: editItem.id, label: editItem.full_name });
      toast({ title: "Employee deleted" });
      setDeleteOpen(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
      if (!rows.length) {
        toast({ title: "Empty file", description: "No rows found", variant: "destructive" });
        return;
      }
      const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");
      const map: Record<string, string> = {
        fullname: "full_name", name: "full_name", personname: "full_name", employeename: "full_name",
        passport: "passport_number", passportnumber: "passport_number", passportno: "passport_number",
        emiratesid: "emirates_id", eid: "emirates_id",
        jobtitle: "job_title", jobname: "job_title", profession: "job_title", role: "job_title",
        nationality: "nationality", country: "nationality",
        cardnumber: "card_number", cardno: "card_number", workpermit: "card_number", workpermitnumber: "card_number",
        cardexpiry: "card_expiry", expiry: "card_expiry", expirydate: "card_expiry",
        cardtype: "card_type", permittype: "card_type",
        contracttype: "contract_type", contract: "contract_type",
        status: "status", phone: "phone", mobile: "phone", email: "email", joindate: "join_date", notes: "notes",
      };
      const payload = rows.map((r) => {
        const obj: Record<string, any> = { status: "Active", contract_type: "Limited" };
        Object.entries(r).forEach(([k, v]) => {
          const target = map[norm(k)];
          if (!target) return;
          if (target === "card_expiry" || target === "join_date") obj[target] = parseDateFlexible(v);
          else obj[target] = v === "" ? null : String(v).trim();
        });
        if (obj.full_name) obj.created_by = user?.id;
        return obj;
      }).filter((r) => r.full_name);

      if (!payload.length) {
        toast({ title: "No valid rows", description: "Could not detect a Full Name / Person Name column", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("employees" as any).insert(payload);
      if (error) throw error;
      toast({ title: `Imported ${payload.length} employees` });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const columns: Column<Employee>[] = [
    { header: "Employee", accessor: (r) => (
      <div>
        <p className="font-medium leading-tight">{r.full_name}</p>
        {r.emirates_id && <p className="text-[11px] text-muted-foreground mt-0.5">EID: {r.emirates_id}</p>}
      </div>
    )},
    { header: "Job Title", accessor: (r) => <span className="text-sm">{r.job_title || "—"}</span> },
    { header: "Nationality", accessor: (r) => <span className="text-sm">{r.nationality || "—"}</span> },
    { header: "Passport", accessor: (r) => <span className="font-mono text-xs">{r.passport_number || "—"}</span> },
    { header: "Card #", accessor: (r) => <span className="font-mono text-xs">{r.card_number || "—"}</span> },
    { header: "Card Expiry", accessor: (r) => r.card_expiry ? new Date(r.card_expiry).toLocaleDateString() : "—" },
    { header: "Contract", accessor: (r) => <span className="text-xs">{r.contract_type || "—"}</span> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    ...(can("users", "edit") || can("users", "delete") ? [{ header: "Actions", accessor: (r: Employee) => (
      <div className="flex gap-1">
        {can("users", "edit") && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(r); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>}
        {can("users", "delete") && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(r); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
      </div>
    ), className: "w-24" } as Column<Employee>] : []),
  ];

  const expiringSoon = employees.filter((e) => {
    if (!e.card_expiry) return false;
    const days = (new Date(e.card_expiry).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 90;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage workforce, work permits and contracts</p>
          </div>
          <div className="flex gap-2">
            {can("users", "create") && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); }}
                />
                <Button variant="outline" disabled={importing} onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />{importing ? "Importing..." : "Import Excel/CSV"}
                </Button>
                <Button className="gradient-primary" onClick={() => { setEditItem(null); setDialogOpen(true); }}>
                  <UserPlus className="h-4 w-4 mr-2" />Add Employee
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={String(employees.length)} icon={Users} />
          <StatCard title="Active" value={String(employees.filter((e) => e.status === "Active").length)} icon={Users} variant="primary" />
          <StatCard title="Permits Expiring (90d)" value={String(expiringSoon)} icon={IdCard} variant="accent" />
          <StatCard title="Nationalities" value={String(new Set(employees.map((e) => e.nationality).filter(Boolean)).size)} icon={FileSpreadsheet} variant="success" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <DataTable
            title="All Employees"
            columns={columns}
            data={employees}
            searchKeys={["full_name", "job_title", "nationality", "passport_number", "emirates_id", "card_number"]}
            searchPlaceholder="Search employees..."
            filters={[
              { key: "status", label: "Status", options: [
                { label: "Active", value: "Active" },
                { label: "On Leave", value: "On Leave" },
                { label: "Inactive", value: "Inactive" },
              ]},
              { key: "contract_type", label: "Contract", options: [
                { label: "Limited", value: "Limited" },
                { label: "Unlimited", value: "Unlimited" },
              ]},
            ]}
          />
        )}
      </div>
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editItem ? "Edit Employee" : "Add Employee"}
        fields={employeeFields}
        initialData={editItem || undefined}
        onSubmit={handleSave}
        loading={saving}
      />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Employee?" onConfirm={handleDelete} loading={saving} />
    </DashboardLayout>
  );
}