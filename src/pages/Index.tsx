import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Users, FolderKanban, DollarSign, TrendingUp, HardHat, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface RecentProject {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  value: string;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "hsl(213, 60%, 42%)",
  "In Progress": "hsl(213, 60%, 42%)",
  Completed: "hsl(152, 60%, 40%)",
  "On Hold": "hsl(38, 92%, 50%)",
  Pending: "hsl(38, 92%, 50%)",
  Delayed: "hsl(0, 72%, 51%)",
  Cancelled: "hsl(0, 72%, 51%)",
};

const formatAED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

const projectColumns: Column<RecentProject>[] = [
  { header: "Project", accessor: (r) => <span className="font-medium">{r.name}</span> },
  { header: "Client", accessor: "client" },
  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  {
    header: "Progress",
    accessor: (r) => (
      <div className="flex items-center gap-2 min-w-[120px]">
        <Progress value={r.progress} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground w-8">{r.progress}%</span>
      </div>
    ),
  },
  { header: "Value", accessor: "value", className: "text-right font-medium" },
];

export default function Index() {
  const { profile } = useAuth();

  const { data: projects = [] } = useQuery({
    queryKey: ["dashboard", "projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, budget, progress, client_id, created_at, clients(company_name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["dashboard", "leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("id, status, value").is("deleted_at", null);
      return data || [];
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["dashboard", "invoices"],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("amount, status, paid_date, created_at").is("deleted_at", null);
      return data || [];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["dashboard", "deals"],
    queryFn: async () => {
      const { data } = await supabase.from("sales_deals").select("stage").is("deleted_at", null);
      return data || [];
    },
  });

  // Stat cards
  const activeProjects = projects.filter((p: any) => p.status === "Active" || p.status === "In Progress").length;
  const totalRevenue = invoices.filter((i: any) => i.status === "Paid").reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  const openLeads = leads.filter((l: any) => l.status !== "Won" && l.status !== "Lost" && l.status !== "Closed").length;
  const wonDeals = deals.filter((d: any) => d.stage === "Won" || d.stage === "Closed Won").length;
  const lostDeals = deals.filter((d: any) => d.stage === "Lost" || d.stage === "Closed Lost").length;
  const decided = wonDeals + lostDeals;
  const winRate = decided > 0 ? Math.round((wonDeals / decided) * 100) : 0;

  // Revenue chart - last 6 months from paid invoices
  const revenueData = (() => {
    const months: { key: string; month: string; revenue: number; target: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({ key, month: d.toLocaleString("en", { month: "short" }), revenue: 0, target: 0 });
    }
    invoices.forEach((inv: any) => {
      if (inv.status !== "Paid") return;
      const dateStr = inv.paid_date || inv.created_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find(x => x.key === key);
      if (m) m.revenue += Number(inv.amount || 0);
    });
    const avg = months.reduce((s, m) => s + m.revenue, 0) / 6 || 0;
    months.forEach(m => { m.target = Math.round(avg * 1.1); });
    return months;
  })();

  // Project status pie
  const projectStatusData = (() => {
    const counts: Record<string, number> = {};
    projects.forEach((p: any) => { counts[p.status || "Unknown"] = (counts[p.status || "Unknown"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || "hsl(215, 14%, 50%)" }));
  })();

  const recentProjects: RecentProject[] = projects.slice(0, 5).map((p: any) => ({
    id: p.id,
    name: p.name,
    client: p.clients?.company_name || "—",
    status: p.status || "—",
    progress: p.progress || 0,
    value: formatAED(Number(p.budget || 0)),
  }));

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {firstName}. Here's your construction overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Projects" value={String(activeProjects)} icon={FolderKanban} variant="primary" />
          <StatCard title="Total Revenue" value={formatAED(totalRevenue)} icon={DollarSign} variant="accent" />
          <StatCard title="Open Leads" value={String(openLeads)} icon={Users} />
          <StatCard title="Win Rate" value={`${winRate}%`} icon={TrendingUp} variant="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="col-span-1 lg:col-span-2 p-5 animate-fade-in">
            <h3 className="font-semibold mb-4">Revenue vs Target</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" tickFormatter={(v) => `AED ${v / 1000}k`} />
                <Tooltip formatter={(v: number) => `AED ${(v / 1000).toFixed(0)}k`} />
                <Bar dataKey="revenue" fill="hsl(213, 60%, 42%)" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="target" fill="hsl(214, 20%, 90%)" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 animate-fade-in">
            <h3 className="font-semibold mb-4">Project Status</h3>
            {projectStatusData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No projects yet</div>
            ) : (<>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {projectStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {projectStatusData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
            </>)}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <DataTable title="Recent Projects" columns={projectColumns} data={recentProjects} />
          </div>
          <Card className="p-5 animate-fade-in">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              {[
                { icon: HardHat, label: "Total Projects", value: String(projects.length), color: "text-primary" },
                { icon: Clock, label: "Pending Invoices", value: String(invoices.filter((i: any) => i.status === "Pending").length), color: "text-accent" },
                { icon: CheckCircle2, label: "Paid Invoices", value: String(invoices.filter((i: any) => i.status === "Paid").length), color: "text-success" },
                { icon: AlertTriangle, label: "Overdue Invoices", value: String(invoices.filter((i: any) => i.status === "Overdue").length), color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-bold">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
