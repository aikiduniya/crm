import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { FileText, Upload, FolderOpen, File, Image, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Document {
  id: number;
  name: string;
  type: string;
  project: string;
  uploadedBy: string;
  date: string;
  size: string;
  status: string;
}

const documents: Document[] = [
  { id: 1, name: "Downtown Tower - Contract.pdf", type: "Contract", project: "Downtown Tower", uploadedBy: "John D.", date: "Apr 10", size: "2.4 MB", status: "Approved" },
  { id: 2, name: "Bridge Inspection Report.pdf", type: "Report", project: "Harbor Bridge", uploadedBy: "Sarah K.", date: "Apr 8", size: "5.1 MB", status: "In Review" },
  { id: 3, name: "Riverside - Blueprint v3.dwg", type: "Blueprint", project: "Riverside Apts", uploadedBy: "Mike R.", date: "Apr 5", size: "18.3 MB", status: "Approved" },
  { id: 4, name: "Mall Extension - Budget.xlsx", type: "Financial", project: "Mall Extension", uploadedBy: "Lisa T.", date: "Apr 3", size: "890 KB", status: "Pending" },
  { id: 5, name: "Safety Compliance Cert.pdf", type: "Certificate", project: "All Projects", uploadedBy: "Admin", date: "Mar 28", size: "1.2 MB", status: "Approved" },
  { id: 6, name: "Change Order #14.pdf", type: "Change Order", project: "Downtown Tower", uploadedBy: "John D.", date: "Mar 25", size: "340 KB", status: "Pending" },
  { id: 7, name: "Subcontractor Agreement.pdf", type: "Contract", project: "School Renovation", uploadedBy: "Sarah K.", date: "Mar 22", size: "1.8 MB", status: "Approved" },
];

const typeIcons: Record<string, React.ReactNode> = {
  Contract: <FileText className="h-4 w-4 text-primary" />,
  Report: <File className="h-4 w-4 text-info" />,
  Blueprint: <Image className="h-4 w-4 text-accent" />,
  Financial: <FileSpreadsheet className="h-4 w-4 text-success" />,
  Certificate: <FileText className="h-4 w-4 text-warning" />,
  "Change Order": <File className="h-4 w-4 text-destructive" />,
};

const columns: Column<Document>[] = [
  { header: "Document", accessor: (r) => (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-muted">{typeIcons[r.type] || <File className="h-4 w-4" />}</div>
      <div>
        <p className="font-medium text-sm">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.type} • {r.size}</p>
      </div>
    </div>
  )},
  { header: "Project", accessor: "project" },
  { header: "Uploaded By", accessor: "uploadedBy" },
  { header: "Date", accessor: "date" },
  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  { header: "", accessor: () => <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>, className: "w-12" },
];

const folderStats = [
  { name: "Contracts", count: 24, icon: FileText },
  { name: "Blueprints", count: 18, icon: Image },
  { name: "Reports", count: 31, icon: File },
  { name: "Financial", count: 15, icon: FileSpreadsheet },
];

export default function Documents() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Document Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Store and manage project documents, contracts, and approvals</p>
          </div>
          <Button className="gradient-primary"><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Documents" value="156" change="+12 this month" changeType="positive" icon={FileText} />
          <StatCard title="Pending Approval" value="8" change="3 urgent" changeType="negative" icon={FolderOpen} />
          <StatCard title="Storage Used" value="4.2 GB" change="of 50 GB" changeType="neutral" icon={Upload} variant="accent" />
          <StatCard title="Shared Files" value="42" change="Across 6 projects" changeType="neutral" icon={File} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {folderStats.map(f => (
            <Card key={f.name} className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer animate-fade-in">
              <div className="p-2.5 rounded-lg bg-primary/10"><f.icon className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.count} files</p>
              </div>
            </Card>
          ))}
        </div>

        <DataTable title="Recent Documents" columns={columns} data={documents} />
      </div>
    </DashboardLayout>
  );
}
