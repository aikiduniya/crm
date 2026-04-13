import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Users, FolderKanban, DollarSign, TrendingUp, HardHat, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 420000, target: 400000 },
  { month: "Feb", revenue: 380000, target: 420000 },
  { month: "Mar", revenue: 510000, target: 450000 },
  { month: "Apr", revenue: 470000, target: 460000 },
  { month: "May", revenue: 530000, target: 480000 },
  { month: "Jun", revenue: 620000, target: 500000 },
];

const projectStatusData = [
  { name: "Active", value: 12, color: "hsl(213, 60%, 42%)" },
  { name: "Completed", value: 8, color: "hsl(152, 60%, 40%)" },
  { name: "On Hold", value: 3, color: "hsl(38, 92%, 50%)" },
  { name: "Delayed", value: 2, color: "hsl(0, 72%, 51%)" },
];

interface RecentProject {
  id: number;
  name: string;
  client: string;
  status: string;
  progress: number;
  value: string;
}

const recentProjects: RecentProject[] = [
  { id: 1, name: "Downtown Office Tower", client: "Metro Corp", status: "In Progress", progress: 65, value: "$2.4M" },
  { id: 2, name: "Harbor Bridge Repair", client: "City Council", status: "In Progress", progress: 42, value: "$890K" },
  { id: 3, name: "Riverside Apartments", client: "Prime Realty", status: "Pending", progress: 10, value: "$5.1M" },
  { id: 4, name: "Industrial Warehouse", client: "LogiCo", status: "Completed", progress: 100, value: "$1.2M" },
  { id: 5, name: "School Renovation", client: "Education Dept", status: "In Progress", progress: 78, value: "$650K" },
];

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
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, John. Here's your construction overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Projects" value="12" change="+2 this month" changeType="positive" icon={FolderKanban} variant="primary" />
          <StatCard title="Total Revenue" value="$2.93M" change="+18.2% vs last quarter" changeType="positive" icon={DollarSign} variant="accent" />
          <StatCard title="Open Leads" value="47" change="+12 new this week" changeType="positive" icon={Users} />
          <StatCard title="Win Rate" value="68%" change="+5% vs last month" changeType="positive" icon={TrendingUp} variant="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="col-span-1 lg:col-span-2 p-5 animate-fade-in">
            <h3 className="font-semibold mb-4">Revenue vs Target</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Bar dataKey="revenue" fill="hsl(213, 60%, 42%)" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="target" fill="hsl(214, 20%, 90%)" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 animate-fade-in">
            <h3 className="font-semibold mb-4">Project Status</h3>
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
                { icon: HardHat, label: "Workers On-Site", value: "142", color: "text-primary" },
                { icon: Clock, label: "Hours Logged Today", value: "1,284", color: "text-accent" },
                { icon: CheckCircle2, label: "Tasks Completed", value: "38", color: "text-success" },
                { icon: AlertTriangle, label: "Open Issues", value: "7", color: "text-destructive" },
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
