import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "@/components/DashboardLayout";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { TasksOverview } from "@/components/TasksOverview";
import { CalendarOverview } from "@/components/CalendarOverview";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { TeamOverview } from "@/components/TeamOverview";
import { CareersPipeline } from "@/components/CareersPipeline";
import { DropboxUsage } from "@/components/DropboxUsage";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Search } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={() => navigate("/search")}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/notifications")}>
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          {/* Welcome Banner */}
          <WelcomeBanner />

          {/* Tasks Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Tasks & Progress</h2>
            <TasksOverview />
          </section>

          {/* Calendar & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
              <CalendarOverview />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <QuickActions />
            </div>
          </div>

          {/* Operations Hub */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="space-y-6 xl:col-span-2">
              <IntegrationStatus />
              <CareersPipeline />
            </div>
            <div className="space-y-6">
              <TeamOverview />
              <DropboxUsage />
            </div>
          </div>

          {/* Recent Activity */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Team Activity</h2>
            <RecentActivity />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
