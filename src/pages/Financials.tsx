import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/DataTable";
import { DollarSign, CreditCard, TrendingUp, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const cashFlowData = [
  { month: "Jan", income: 520000, expenses: 380000 },
  { month: "Feb", income: 480000, expenses: 420000 },
  { month: "Mar", income: 610000, expenses: 390000 },
  { month: "Apr", income: 570000, expenses: 450000 },
  { month: "May", income: 690000, expenses: 480000 },
  { month: "Jun", income: 750000, expenses: 510000 },
];

interface Invoice {
  id: number;
  number: string;
  client: string;
  project: string;
  amount: string;
  status: string;
  dueDate: string;
  issuedDate: string;
}

const invoices: Invoice[] = [
  { id: 1, number: "INV-2025-001", client: "Metro Corp", project: "Downtown Tower", amount: "$245,000", status: "Paid", dueDate: "Mar 15", issuedDate: "Feb 15" },
  { id: 2, number: "INV-2025-002", client: "City Council", project: "Harbor Bridge", amount: "$89,000", status: "Pending", dueDate: "Apr 20", issuedDate: "Mar 20" },
  { id: 3, number: "INV-2025-003", client: "Prime Realty", project: "Riverside Apts", amount: "$510,000", status: "Paid", dueDate: "Apr 1", issuedDate: "Mar 1" },
  { id: 4, number: "INV-2025-004", client: "RetailMax", project: "Mall Extension", amount: "$328,000", status: "Overdue", dueDate: "Mar 30", issuedDate: "Feb 28" },
  { id: 5, number: "INV-2025-005", client: "Education Dept", project: "School Renovation", amount: "$67,500", status: "Pending", dueDate: "Apr 25", issuedDate: "Mar 25" },
];

const invoiceColumns: Column<Invoice>[] = [
  { header: "Invoice", accessor: (r) => (<div><p className="font-medium">{r.number}</p><p className="text-xs text-muted-foreground">{r.project}</p></div>) },
  { header: "Client", accessor: "client" },
  { header: "Amount", accessor: "amount", className: "font-bold" },
  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  { header: "Issued", accessor: "issuedDate" },
  { header: "Due", accessor: "dueDate" },
];

export default function Financials() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Financial Management</h2>
            <p className="text-muted-foreground text-sm mt-1">Invoicing, payments, and financial reporting</p>
          </div>
          <Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value="$3.62M" change="+22% vs last year" changeType="positive" icon={DollarSign} variant="primary" />
          <StatCard title="Outstanding" value="$484K" change="3 invoices pending" changeType="negative" icon={CreditCard} />
          <StatCard title="Profit Margin" value="31.2%" change="+3.1% vs Q1" changeType="positive" icon={TrendingUp} variant="success" />
          <StatCard title="Overdue" value="$328K" change="1 invoice overdue" changeType="negative" icon={FileText} />
        </div>

        <Card className="p-5 animate-fade-in">
          <h3 className="font-semibold mb-4">Cash Flow</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Area type="monotone" dataKey="income" stroke="hsl(152, 60%, 40%)" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="hsl(0, 72%, 51%)" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <DataTable title="Recent Invoices" columns={invoiceColumns} data={invoices} />
      </div>
    </DashboardLayout>
  );
}
