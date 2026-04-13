import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { TrendingUp, DollarSign, Target, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Deal {
  id: number;
  title: string;
  client: string;
  stage: string;
  value: string;
  probability: number;
  expectedClose: string;
  assignedTo: string;
}

const deals: Deal[] = [
  { id: 1, title: "Office Complex Phase 2", client: "Metro Corp", stage: "Negotiation", value: "$4.5M", probability: 75, expectedClose: "Jul 2025", assignedTo: "Mike R." },
  { id: 2, title: "Highway Overpass", client: "State DOT", stage: "Proposal", value: "$12.8M", probability: 40, expectedClose: "Sep 2025", assignedTo: "Sarah K." },
  { id: 3, title: "Hospital Wing Addition", client: "Regional Health", stage: "Qualified", value: "$6.2M", probability: 60, expectedClose: "Oct 2025", assignedTo: "John D." },
  { id: 4, title: "Parking Structure", client: "City Council", stage: "Won", value: "$3.1M", probability: 100, expectedClose: "Jun 2025", assignedTo: "Mike R." },
  { id: 5, title: "Solar Farm Install", client: "GreenEnergy Co", stage: "New", value: "$8.5M", probability: 20, expectedClose: "Dec 2025", assignedTo: "Lisa T." },
  { id: 6, title: "Condo Renovation", client: "Luxury Living", stage: "Proposal", value: "$2.3M", probability: 55, expectedClose: "Aug 2025", assignedTo: "Sarah K." },
];

const columns: Column<Deal>[] = [
  { header: "Deal", accessor: (r) => (<div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.client}</p></div>) },
  { header: "Stage", accessor: (r) => <StatusBadge status={r.stage} /> },
  { header: "Value", accessor: "value", className: "font-medium" },
  { header: "Probability", accessor: (r) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${r.probability}%` }} /></div>
      <span className="text-xs font-medium">{r.probability}%</span>
    </div>
  )},
  { header: "Expected Close", accessor: "expectedClose" },
  { header: "Owner", accessor: "assignedTo" },
];

const pipelineStages = [
  { name: "New", count: 8, value: "$18.2M", color: "bg-info" },
  { name: "Qualified", count: 5, value: "$12.5M", color: "bg-primary" },
  { name: "Proposal", count: 6, value: "$22.1M", color: "bg-accent" },
  { name: "Negotiation", count: 3, value: "$9.8M", color: "bg-warning" },
  { name: "Won", count: 12, value: "$38.4M", color: "bg-success" },
];

export default function Sales() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sales Pipeline</h2>
            <p className="text-muted-foreground text-sm mt-1">Track deals, quotes, and proposals</p>
          </div>
          <Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" />New Deal</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pipeline Value" value="$101M" change="+$12M this month" changeType="positive" icon={DollarSign} variant="primary" />
          <StatCard title="Deals Won" value="12" change="$38.4M total" changeType="positive" icon={CheckCircle2} variant="success" />
          <StatCard title="Win Rate" value="68%" change="+5% vs last quarter" changeType="positive" icon={Target} />
          <StatCard title="Avg Deal Size" value="$2.9M" change="+$300K vs Q1" changeType="positive" icon={TrendingUp} variant="accent" />
        </div>

        <Card className="p-5 animate-fade-in">
          <h3 className="font-semibold mb-4">Pipeline Overview</h3>
          <div className="flex gap-2 h-3 rounded-full overflow-hidden mb-4">
            {pipelineStages.map(s => (
              <div key={s.name} className={`${s.color} flex-1 transition-all hover:opacity-80`} title={`${s.name}: ${s.count} deals`} />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {pipelineStages.map(s => (
              <div key={s.name} className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{s.name}</p>
                <p className="text-lg font-bold">{s.count}</p>
                <p className="text-xs font-medium text-muted-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <DataTable title="Active Deals" columns={columns} data={deals} />
      </div>
    </DashboardLayout>
  );
}
