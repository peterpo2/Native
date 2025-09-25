import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
            <SidebarTrigger className="h-9 w-9 rounded-lg border border-border/60 bg-card/80 text-foreground hover:bg-card" />
            <Link to="/" className="text-sm font-semibold text-foreground">
              Native CRM
            </Link>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}