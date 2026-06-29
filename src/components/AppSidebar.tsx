import {
  LayoutDashboard, Users, FolderKanban, UserCircle, TrendingUp,
  Wrench, DollarSign, FileText, BarChart3, HardHat, Settings, Shield, Activity, KeyRound, Trash2, Download, BadgeCheck, Receipt,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import companyLogo from "@/assets/branding/company-logo.png";
import { useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, module: "dashboard" as const },
  { title: "Leads", url: "/leads", icon: Users, module: "leads" as const },
  { title: "Projects", url: "/projects", icon: FolderKanban, module: "projects" as const },
  { title: "Clients", url: "/clients", icon: UserCircle, module: "clients" as const },
  { title: "Sales Pipeline", url: "/sales", icon: TrendingUp, module: "sales" as const },
];

const operationsItems = [
  { title: "Operations", url: "/operations", icon: Wrench, module: "operations" as const },
  { title: "Employees", url: "/employees", icon: BadgeCheck, module: "employees" as const },
  { title: "Financials", url: "/financials", icon: DollarSign, module: "financials" as const },
  { title: "Expenses", url: "/expenses", icon: Receipt, module: "expenses" as const },
  { title: "Documents", url: "/documents", icon: FileText, module: "documents" as const },
  { title: "Reports", url: "/reports", icon: BarChart3, module: "reports" as const },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { canAccessModule } = usePermissions();
  const { role } = useAuth();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white overflow-hidden shrink-0">
            <img src={companyLogo} alt="City Homes Technical Services" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in min-w-0">
              <h1 className="text-sm font-bold text-sidebar-primary-foreground tracking-tight truncate">City Homes</h1>
              <p className="text-[11px] text-sidebar-muted truncate">Technical Services LLC</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-semibold mb-1">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.filter(item => canAccessModule(item.module)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"} className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-semibold mb-1">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.filter(item => canAccessModule(item.module)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canAccessModule("users") && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-semibold mb-1">Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/users")}>
                    <NavLink to="/users" className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <Shield className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Users</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {role === "admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/activity")}>
                      <NavLink to="/activity" className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <Activity className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>Activity Log</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {role === "admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/roles")}>
                      <NavLink to="/roles" className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <KeyRound className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>Roles & Permissions</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {role === "admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/trash")}>
                      <NavLink to="/trash" className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <Trash2 className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>Trash</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {role === "admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/export-requests")}>
                      <NavLink to="/export-requests" className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <Download className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>Export Requests</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <NavLink to="/settings" className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
