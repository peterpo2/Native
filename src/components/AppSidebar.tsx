import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Briefcase,
  Settings,
  Search,
  Plus,
  Bell,
  ChevronLeft,
  ChevronRight,
  Layout,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const workspaceNavItems = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Goals", url: "/goals", icon: Target },
];

const spaceNavItems = [
  { title: "Everything", url: "/tasks", gradient: "from-emerald-500 to-teal-500", initials: "EV" },
  { title: "Development", url: "/calendar", gradient: "from-sky-500 to-indigo-500", initials: "DE" },
  { title: "Marketing", url: "/people", gradient: "from-amber-500 to-orange-500", initials: "MK" },
  { title: "Product", url: "/files", gradient: "from-fuchsia-500 to-purple-500", initials: "PR" },
];

const resourcesNavItems = [
  { title: "Careers", url: "/careers", icon: Briefcase },
  { title: "Dashboards", url: "/demo", icon: Layout },
  { title: "Docs", url: "/files", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group relative flex items-center rounded-xl border border-transparent transition-all duration-300",
      collapsed ? "justify-center p-2" : "px-3 py-2",
      isActive
        ? "bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5 text-sidebar-primary shadow-[0_18px_40px_-28px_rgba(56,189,248,0.9)] border-primary/40"
        : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50",
      collapsed && !isActive && "hover:bg-sidebar-accent/40",
    );

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-sidebar-border/60 bg-sidebar/95 shadow-[0_18px_48px_-20px_rgba(15,23,42,0.9)] backdrop-blur-xl transition-[background,box-shadow,border] duration-300",
        "data-[state=collapsed]:border-sidebar-border/30 data-[state=collapsed]:bg-sidebar/60 data-[state=collapsed]:shadow-[0_20px_60px_-32px_rgba(15,23,42,0.85)]",
      )}
    >
      <SidebarHeader
        className={cn(
          "p-4 border-b border-sidebar-border/60 transition-all duration-300",
          collapsed && "items-center gap-3 p-3 border-sidebar-border/30",
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className={cn(
              "group flex w-full items-center rounded-2xl px-2 transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              collapsed ? "justify-center" : "gap-3",
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-lg font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              N
            </div>
            {!collapsed && (
              <div className="text-left">
                <h2 className="font-semibold text-sidebar-foreground">Native CRM</h2>
                <p className="text-xs text-sidebar-foreground/60">Workspace</p>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 p-0 transition-colors hover:bg-sidebar-accent",
              collapsed &&
                "bg-sidebar/70 text-sidebar-foreground shadow-[0_12px_36px_-28px_rgba(94,234,212,0.8)] hover:bg-sidebar-accent/70",
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {!collapsed && (
          <div className="mt-4 space-y-2">
            <Button
              className="w-full bg-gradient-primary hover:opacity-90 shadow-sm"
              onClick={() => navigate("/tasks")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New task
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    navigate("/search", { state: { query: event.currentTarget.value } });
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={cn("px-2 py-4 transition-all duration-300", collapsed && "px-2 py-6")}> 
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : "uppercase tracking-wide text-xs text-muted-foreground"}>
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {workspaceNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      title={collapsed ? item.title : undefined}
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 flex-1">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "uppercase tracking-wide text-xs text-muted-foreground"}>
            Spaces
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {spaceNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      title={collapsed ? item.title : undefined}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 transition-all duration-300",
                          collapsed ? "justify-center" : "px-3",
                          getNavCls({ isActive }),
                        )
                      }
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} text-xs font-semibold text-white`}
                      >
                        {item.initials}
                      </div>
                      {!collapsed && <span className="flex-1">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "uppercase tracking-wide text-xs text-muted-foreground"}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {resourcesNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      title={collapsed ? item.title : undefined}
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "p-4 border-t border-sidebar-border/60 transition-all duration-300",
          collapsed && "items-center border-sidebar-border/30",
        )}
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt={user?.fullName ?? "User"} />
            <AvatarFallback className="bg-gradient-accent text-white text-sm font-medium">
              {user?.fullName
                ?.split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "NA"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.fullName ?? "Guest"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{user?.role ?? "Member"}</p>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="sm" onClick={logout} className="h-8 px-3 text-xs">
              Sign out
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}