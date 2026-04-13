import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  hr: "HR",
  project_manager: "PM",
  sales: "Sales",
  finance: "Finance",
  operations: "Ops",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, role, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search projects, clients..." className="pl-9 w-64 h-9 bg-muted border-none text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
              </button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{role ? roleLabels[role] || role : ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} title="Sign out">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
