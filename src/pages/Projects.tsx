import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/DataTable";
import { FolderKanban, Plus, Calendar, DollarSign, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: number;
  name: string;
  client: string;
  location: string;
  status: string;
  progress: number;
  budget: string;
  spent: string;
  startDate: string;
  endDate: string;
  team: number;
}

const projects: Project[] = [
  { id: 1, name: "Downtown Office Tower", client: "Metro Corp", location: "123 Main St", status: "In Progress", progress: 65, budget: "$2.4M", spent: "$1.56M", startDate: "Jan 2025", endDate: "Dec 2025", team: 28 },
  { id: 2, name: "Harbor Bridge Repair", client: "City Council", location: "Harbor Bay", status: "In Progress", progress: 42, budget: "$890K", spent: "$374K", startDate: "Mar 2025", endDate: "Sep 2025", team: 15 },
  { id: 3, name: "Riverside Apartments", client: "Prime Realty", location: "River Rd", status: "Pending", progress: 10, budget: "$5.1M", spent: "$510K", startDate: "May 2025", endDate: "Jun 2026", team: 42 },
  { id: 4, name: "Industrial Warehouse", client: "LogiCo", location: "Industrial Park", status: "Completed", progress: 100, budget: "$1.2M", spent: "$1.15M", startDate: "Aug 2024", endDate: "Feb 2025", team: 18 },
  { id: 5, name: "School Renovation", client: "Education Dept", location: "Oak Ave", status: "In Progress", progress: 78, budget: "$650K", spent: "$507K", startDate: "Nov 2024", endDate: "Jul 2025", team: 12 },
  { id: 6, name: "Shopping Mall Extension", client: "RetailMax", location: "Commerce Blvd", status: "In Progress", progress: 30, budget: "$8.2M", spent: "$2.46M", startDate: "Feb 2025", endDate: "Mar 2026", team: 55 },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{project.name}</h4>
          <p className="text-sm text-muted-foreground">{project.client}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{project.location}</div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs"><DollarSign className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{project.budget}</span></div>
          <div className="flex items-center gap-1.5 text-xs"><Users className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{project.team} members</span></div>
          <div className="flex items-center gap-1.5 text-xs col-span-2"><Calendar className="h-3 w-3 text-muted-foreground" /><span>{project.startDate} – {project.endDate}</span></div>
        </div>
      </div>
    </Card>
  );
}

export default function Projects() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage timelines, budgets, and project milestones</p>
          </div>
          <Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" />New Project</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Projects" value="25" change="6 active" changeType="positive" icon={FolderKanban} />
          <StatCard title="On Schedule" value="83%" change="+5% vs last quarter" changeType="positive" icon={Calendar} />
          <StatCard title="Total Budget" value="$18.4M" change="$6.5M spent" changeType="neutral" icon={DollarSign} variant="accent" />
          <StatCard title="Team Members" value="170" change="142 on-site today" changeType="positive" icon={Users} />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>
          </TabsContent>
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">{projects.filter(p => p.status === "In Progress").map(p => <ProjectCard key={p.id} project={p} />)}</div>
          </TabsContent>
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">{projects.filter(p => p.status === "Completed").map(p => <ProjectCard key={p.id} project={p} />)}</div>
          </TabsContent>
          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">{projects.filter(p => p.status === "Pending").map(p => <ProjectCard key={p.id} project={p} />)}</div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
