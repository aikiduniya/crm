import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Users, UserPlus, Target, TrendingUp, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  value: string;
  lastContact: string;
}

const leads: Lead[] = [
  { id: 1, name: "Robert Chen", company: "Pacific Developments", email: "r.chen@pacific.com", phone: "(555) 123-4567", source: "Referral", status: "Qualified", value: "$1.8M", lastContact: "2 hours ago" },
  { id: 2, name: "Sarah Williams", company: "Urban Housing Co", email: "s.williams@urban.com", phone: "(555) 234-5678", source: "Website", status: "New", value: "$3.2M", lastContact: "1 day ago" },
  { id: 3, name: "Michael Torres", company: "Torres & Sons", email: "m.torres@ts.com", phone: "(555) 345-6789", source: "Trade Show", status: "Proposal", value: "$950K", lastContact: "3 days ago" },
  { id: 4, name: "Emily Park", company: "GreenBuild Inc", email: "e.park@greenbuild.com", phone: "(555) 456-7890", source: "LinkedIn", status: "Negotiation", value: "$4.5M", lastContact: "5 hours ago" },
  { id: 5, name: "David Miller", company: "Miller Properties", email: "d.miller@mp.com", phone: "(555) 567-8901", source: "Referral", status: "New", value: "$2.1M", lastContact: "1 week ago" },
  { id: 6, name: "Lisa Johnson", company: "Metro Realty Group", email: "l.johnson@metro.com", phone: "(555) 678-9012", source: "Website", status: "Qualified", value: "$1.5M", lastContact: "2 days ago" },
];

const columns: Column<Lead>[] = [
  { header: "Name", accessor: (r) => (
    <div>
      <p className="font-medium">{r.name}</p>
      <p className="text-xs text-muted-foreground">{r.company}</p>
    </div>
  )},
  { header: "Contact", accessor: (r) => (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{r.email}</div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{r.phone}</div>
    </div>
  )},
  { header: "Source", accessor: "source" },
  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  { header: "Est. Value", accessor: "value", className: "font-medium" },
  { header: "Last Contact", accessor: (r) => (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{r.lastContact}</div>
  )},
];

const conversionStages = [
  { stage: "Leads Generated", count: 124, percent: 100 },
  { stage: "Qualified", count: 67, percent: 54 },
  { stage: "Proposal Sent", count: 34, percent: 27 },
  { stage: "Negotiation", count: 18, percent: 15 },
  { stage: "Won", count: 12, percent: 10 },
];

export default function Leads() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Lead Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your construction leads</p>
          </div>
          <Button className="gradient-primary"><UserPlus className="h-4 w-4 mr-2" />Add Lead</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Leads" value="124" change="+18 this month" changeType="positive" icon={Users} />
          <StatCard title="Qualified Leads" value="67" change="54% qualification rate" changeType="positive" icon={Target} />
          <StatCard title="Conversion Rate" value="10.2%" change="+2.1% vs last month" changeType="positive" icon={TrendingUp} />
          <StatCard title="Avg Deal Size" value="$2.3M" change="+$400K vs Q1" changeType="positive" icon={Target} variant="accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Tabs defaultValue="all">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Leads</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="qualified">Qualified</TabsTrigger>
                  <TabsTrigger value="proposal">Proposal</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all">
                <DataTable columns={columns} data={leads} />
              </TabsContent>
              <TabsContent value="new">
                <DataTable columns={columns} data={leads.filter(l => l.status === "New")} />
              </TabsContent>
              <TabsContent value="qualified">
                <DataTable columns={columns} data={leads.filter(l => l.status === "Qualified")} />
              </TabsContent>
              <TabsContent value="proposal">
                <DataTable columns={columns} data={leads.filter(l => l.status === "Proposal")} />
              </TabsContent>
            </Tabs>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {conversionStages.map((s) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.stage}</span>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                  <Progress value={s.percent} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
