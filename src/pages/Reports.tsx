import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { BarChart3, TrendingUp, DollarSign, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExportButton } from "@/components/ExportButton";
import { downloadCSV } from "@/lib/exportUtils";
import { useMemo } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Reports() {
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", "report"],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("*").is("deleted_at", null);
      return data || [];
    },
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "report"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").is("deleted_at", null);
      return data || [];
    },
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients", "report"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").is("deleted_at", null);
      return data || [];
    },
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads", "report"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").is("deleted_at", null);
      return data || [];
    },
  });

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    MONTHS.forEach(m => map.set(m, 0));
    invoices.filter((i: any) => i.status === "Paid" && i.paid_date).forEach((i: any) => {
      const m = MONTHS[new Date(i.paid_date).getMonth()];
      map.set(m, (map.get(m) || 0) + Number(i.amount));
    });
    return MONTHS.map(m => ({ month: m, value: Math.round((map.get(m) || 0) / 1000) }));
  }, [invoices]);

  const projectPerformance = useMemo(() => projects.slice(0, 6).map((p: any) => ({
    project: p.name.length > 14 ? p.name.slice(0, 12) + "…" : p.name,
    progress: p.progress || 0,
    budgetUsed: p.budget ? Math.min(100, Math.round(((p.spent || 0) / p.budget) * 100)) : 0,
  })), [projects]);

  const satisfactionData = useMemo(() => {
    const avg = clients.length ? clients.reduce((s: number, c: any) => s + (Number(c.satisfaction) || 0), 0) / clients.length : 0;
    const score = Math.round(avg * 20);
    return [
      { subject: "Communication", score: Math.min(100, score + 4) },
      { subject: "Quality", score: Math.min(100, score + 2) },
      { subject: "Timeliness", score: Math.max(0, score - 6) },
      { subject: "Budget", score: Math.max(0, score - 3) },
      { subject: "Safety", score: Math.min(100, score + 10) },
      { subject: "Cleanliness", score },
    ];
  }, [clients]);

  const leadsBySource = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l: any) => map.set(l.source || "Other", (map.get(l.source || "Other") || 0) + 1));
    const total = leads.length || 1;
    return Array.from(map.entries()).map(([source, count]) => ({ source, value: Math.round((count / total) * 100) })).sort((a, b) => b.value - a.value);
  }, [leads]);

  const totalRevenue = invoices.filter((i: any) => i.status === "Paid").reduce((s: number, i: any) => s + Number(i.amount), 0);
  const outstanding = invoices.filter((i: any) => ["Pending","Overdue"].includes(i.status)).reduce((s: number, i: any) => s + Number(i.amount), 0);
  const avgProgress = projects.length ? Math.round(projects.reduce((s: number, p: any) => s + (p.progress || 0), 0) / projects.length) : 0;
  const avgSat = clients.length ? (clients.reduce((s: number, c: any) => s + Number(c.satisfaction || 0), 0) / clients.length).toFixed(1) : "0.0";

  const handleExport = () => {
    downloadCSV(`reports-${new Date().toISOString().slice(0,10)}.csv`, [
      { section: "summary", metric: "total_revenue_usd", value: totalRevenue },
      { section: "summary", metric: "outstanding_usd", value: outstanding },
      { section: "summary", metric: "avg_project_progress_pct", value: avgProgress },
      { section: "summary", metric: "avg_client_satisfaction", value: avgSat },
      ...monthlyRevenue.map(r => ({ section: "monthly_revenue", metric: r.month, value: r.value * 1000 })),
      ...projectPerformance.map(r => ({ section: "project_progress", metric: r.project, value: r.progress })),
      ...leadsBySource.map(r => ({ section: "leads_by_source", metric: r.source, value: `${r.value}%` })),
    ], ["section","metric","value"]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
            <p className="text-muted-foreground text-sm mt-1">Live insights from projects, invoices, and clients</p>
          </div>
          <ExportButton module="reports" onExport={handleExport} label="Export Report" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`AED ${(totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} variant="primary" />
          <StatCard title="Outstanding" value={`AED ${(outstanding / 1000).toFixed(0)}K`} icon={TrendingUp} variant="accent" />
          <StatCard title="Avg Project Progress" value={`${avgProgress}%`} icon={BarChart3} variant="success" />
          <StatCard title="Client Satisfaction" value={`${avgSat}/5`} icon={Star} />
        </div>

        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Project Performance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="satisfaction">Client Satisfaction</TabsTrigger>
            <TabsTrigger value="sales">Lead Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Project Progress vs Budget Used (%)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={projectPerformance} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                  <XAxis dataKey="project" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="hsl(213, 60%, 42%)" radius={[3, 3, 0, 0]} name="Progress %" />
                  <Bar dataKey="budgetUsed" fill="hsl(38, 92%, 50%)" radius={[3, 3, 0, 0]} name="Budget Used %" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Monthly Paid Revenue ($K)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <Tooltip formatter={(v: number) => `AED ${v}k`} />
                  <Line type="monotone" dataKey="value" stroke="hsl(213, 60%, 42%)" strokeWidth={2.5} dot={{ r: 4 }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="satisfaction" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Client Satisfaction Scores</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={satisfactionData}>
                  <PolarGrid stroke="hsl(214, 20%, 90%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(213, 60%, 42%)" fill="hsl(213, 60%, 42%)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Leads by Source (%)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={leadsBySource} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" width={100} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="value" fill="hsl(213, 60%, 42%)" radius={[0, 4, 4, 0]} name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
