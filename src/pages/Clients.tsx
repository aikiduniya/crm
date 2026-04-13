import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { UserCircle, UserPlus, Building2, Mail, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  projects: number;
  totalValue: string;
  status: string;
  rating: number;
}

const clients: Client[] = [
  { id: 1, name: "Metro Corp", company: "Commercial", email: "info@metro.com", phone: "(555) 100-0001", projects: 3, totalValue: "$7.2M", status: "Active", rating: 5 },
  { id: 2, name: "City Council", company: "Government", email: "projects@city.gov", phone: "(555) 100-0002", projects: 5, totalValue: "$4.8M", status: "Active", rating: 4 },
  { id: 3, name: "Prime Realty", company: "Residential", email: "dev@prime.com", phone: "(555) 100-0003", projects: 2, totalValue: "$8.1M", status: "Active", rating: 5 },
  { id: 4, name: "LogiCo", company: "Industrial", email: "ops@logico.com", phone: "(555) 100-0004", projects: 1, totalValue: "$1.2M", status: "Completed", rating: 4 },
  { id: 5, name: "Education Dept", company: "Government", email: "facilities@edu.gov", phone: "(555) 100-0005", projects: 4, totalValue: "$2.8M", status: "Active", rating: 3 },
  { id: 6, name: "RetailMax", company: "Commercial", email: "expand@retailmax.com", phone: "(555) 100-0006", projects: 1, totalValue: "$8.2M", status: "Active", rating: 4 },
];

const columns: Column<Client>[] = [
  { header: "Client", accessor: (r) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{r.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.company}</p>
      </div>
    </div>
  )},
  { header: "Contact", accessor: (r) => (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{r.email}</div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{r.phone}</div>
    </div>
  )},
  { header: "Projects", accessor: (r) => <span className="font-medium">{r.projects}</span> },
  { header: "Total Value", accessor: "totalValue", className: "font-medium" },
  { header: "Rating", accessor: (r) => (
    <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "text-accent fill-accent" : "text-muted"}`} />)}</div>
  )},
  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
];

const topClients = clients.sort((a, b) => parseFloat(b.totalValue.replace(/[$MK,]/g, "")) - parseFloat(a.totalValue.replace(/[$MK,]/g, ""))).slice(0, 4);

export default function Clients() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Client Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage client relationships and communication history</p>
          </div>
          <Button className="gradient-primary"><UserPlus className="h-4 w-4 mr-2" />Add Client</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Clients" value="42" change="+6 this quarter" changeType="positive" icon={UserCircle} />
          <StatCard title="Active Clients" value="28" change="67% of total" changeType="positive" icon={Building2} />
          <StatCard title="Total Revenue" value="$32.3M" change="From all clients" changeType="neutral" icon={Star} variant="accent" />
          <StatCard title="Avg Satisfaction" value="4.2/5" change="+0.3 vs last year" changeType="positive" icon={Star} variant="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <DataTable title="All Clients" columns={columns} data={clients} />
          </div>
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Top Clients by Value</h3>
            <div className="space-y-3">
              {topClients.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.projects} projects</p>
                  </div>
                  <span className="text-sm font-bold">{c.totalValue}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
