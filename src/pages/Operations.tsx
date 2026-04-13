import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { Wrench, Truck, HardHat, Users, Calendar, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Equipment {
  id: number;
  name: string;
  type: string;
  status: string;
  assignedTo: string;
  lastMaintenance: string;
  utilization: number;
}

const equipment: Equipment[] = [
  { id: 1, name: "CAT 320 Excavator", type: "Heavy", status: "In Use", assignedTo: "Downtown Tower", lastMaintenance: "Mar 15", utilization: 92 },
  { id: 2, name: "Liebherr Tower Crane", type: "Crane", status: "In Use", assignedTo: "Riverside Apts", lastMaintenance: "Feb 28", utilization: 88 },
  { id: 3, name: "Volvo A40G Hauler", type: "Heavy", status: "Available", assignedTo: "—", lastMaintenance: "Apr 1", utilization: 45 },
  { id: 4, name: "JCB 3CX Backhoe", type: "Medium", status: "Maintenance", assignedTo: "Service Bay", lastMaintenance: "Apr 10", utilization: 72 },
  { id: 5, name: "Concrete Pump Truck", type: "Specialty", status: "In Use", assignedTo: "Mall Extension", lastMaintenance: "Mar 22", utilization: 80 },
  { id: 6, name: "Boom Lift 60ft", type: "Access", status: "Available", assignedTo: "—", lastMaintenance: "Mar 30", utilization: 35 },
];

const equipmentColumns: Column<Equipment>[] = [
  { header: "Equipment", accessor: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.type}</p></div>) },
  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  { header: "Assigned To", accessor: "assignedTo" },
  { header: "Utilization", accessor: (r) => (
    <div className="flex items-center gap-2 min-w-[100px]">
      <Progress value={r.utilization} className="h-1.5 flex-1" />
      <span className="text-xs font-medium">{r.utilization}%</span>
    </div>
  )},
  { header: "Last Service", accessor: "lastMaintenance" },
];

interface Worker {
  id: number;
  name: string;
  role: string;
  status: string;
  project: string;
  hoursThisWeek: number;
  certification: string;
}

const workers: Worker[] = [
  { id: 1, name: "James Wilson", role: "Site Foreman", status: "Active", project: "Downtown Tower", hoursThisWeek: 44, certification: "OSHA 30" },
  { id: 2, name: "Maria Garcia", role: "Electrician", status: "Active", project: "School Renovation", hoursThisWeek: 40, certification: "Licensed" },
  { id: 3, name: "Tom Anderson", role: "Crane Operator", status: "Active", project: "Riverside Apts", hoursThisWeek: 42, certification: "NCCCO" },
  { id: 4, name: "Alex Kim", role: "Plumber", status: "Active", project: "Mall Extension", hoursThisWeek: 38, certification: "Master" },
  { id: 5, name: "Dave Brown", role: "Welder", status: "Active", project: "Harbor Bridge", hoursThisWeek: 46, certification: "AWS D1.1" },
];

const workerColumns: Column<Worker>[] = [
  { header: "Name", accessor: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.role}</p></div>) },
  { header: "Project", accessor: "project" },
  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  { header: "Hours", accessor: (r) => <span className="font-medium">{r.hoursThisWeek}h</span> },
  { header: "Certification", accessor: "certification" },
];

export default function Operations() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operations Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage resources, equipment, and labor allocation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Equipment" value="48" change="42 operational" changeType="positive" icon={Truck} />
          <StatCard title="Workers On-Site" value="142" change="95% attendance" changeType="positive" icon={HardHat} variant="primary" />
          <StatCard title="Avg Utilization" value="76%" change="+8% this month" changeType="positive" icon={Wrench} variant="accent" />
          <StatCard title="Safety Incidents" value="0" change="45 days streak" changeType="positive" icon={Users} variant="success" />
        </div>

        <Tabs defaultValue="equipment">
          <TabsList>
            <TabsTrigger value="equipment"><Truck className="h-4 w-4 mr-2" />Equipment</TabsTrigger>
            <TabsTrigger value="labor"><HardHat className="h-4 w-4 mr-2" />Labor</TabsTrigger>
          </TabsList>
          <TabsContent value="equipment" className="mt-4">
            <DataTable title="Equipment Inventory" columns={equipmentColumns} data={equipment} />
          </TabsContent>
          <TabsContent value="labor" className="mt-4">
            <DataTable title="Workforce" columns={workerColumns} data={workers} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
