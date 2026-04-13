import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { BarChart3, TrendingUp, DollarSign, Users, Star, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const projectPerformance = [
  { project: "Tower", onTime: 92, onBudget: 88, quality: 95, safety: 100 },
  { project: "Bridge", onTime: 78, onBudget: 95, quality: 88, safety: 100 },
  { project: "Apts", onTime: 85, onBudget: 80, quality: 90, safety: 95 },
  { project: "Warehouse", onTime: 100, onBudget: 96, quality: 92, safety: 100 },
  { project: "School", onTime: 88, onBudget: 78, quality: 94, safety: 100 },
];

const monthlyRevenue = [
  { month: "Jul", value: 380 }, { month: "Aug", value: 420 }, { month: "Sep", value: 510 },
  { month: "Oct", value: 470 }, { month: "Nov", value: 390 }, { month: "Dec", value: 450 },
  { month: "Jan", value: 520 }, { month: "Feb", value: 480 }, { month: "Mar", value: 610 },
  { month: "Apr", value: 570 }, { month: "May", value: 690 }, { month: "Jun", value: 750 },
];

const satisfactionData = [
  { subject: "Communication", score: 92 },
  { subject: "Quality", score: 88 },
  { subject: "Timeliness", score: 82 },
  { subject: "Budget", score: 85 },
  { subject: "Safety", score: 98 },
  { subject: "Cleanliness", score: 90 },
];

const salesBySource = [
  { source: "Referrals", value: 42 },
  { source: "Website", value: 24 },
  { source: "Trade Shows", value: 15 },
  { source: "LinkedIn", value: 12 },
  { source: "Direct", value: 7 },
];

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
            <p className="text-muted-foreground text-sm mt-1">Track project performance, sales, and client satisfaction</p>
          </div>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Report</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="On-Time Delivery" value="88%" change="+4% vs last quarter" changeType="positive" icon={BarChart3} variant="primary" />
          <StatCard title="Revenue Growth" value="+22%" change="Year over year" changeType="positive" icon={TrendingUp} variant="success" />
          <StatCard title="Avg Project Margin" value="31.2%" change="Above 28% target" changeType="positive" icon={DollarSign} variant="accent" />
          <StatCard title="Client Satisfaction" value="4.3/5" change="+0.2 vs last year" changeType="positive" icon={Star} />
        </div>

        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Project Performance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="satisfaction">Client Satisfaction</TabsTrigger>
            <TabsTrigger value="sales">Sales Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Project KPIs (%)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={projectPerformance} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                  <XAxis dataKey="project" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="onTime" fill="hsl(213, 60%, 42%)" radius={[3, 3, 0, 0]} name="On Time" />
                  <Bar dataKey="onBudget" fill="hsl(38, 92%, 50%)" radius={[3, 3, 0, 0]} name="On Budget" />
                  <Bar dataKey="quality" fill="hsl(152, 60%, 40%)" radius={[3, 3, 0, 0]} name="Quality" />
                  <Bar dataKey="safety" fill="hsl(262, 52%, 55%)" radius={[3, 3, 0, 0]} name="Safety" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Monthly Revenue ($K)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <Tooltip formatter={(v: number) => `$${v}k`} />
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
              <h3 className="font-semibold mb-4">Sales by Source (%)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={salesBySource} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" width={80} />
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
