import { CheckSquare, Clock, Users, AlertCircle } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentTasks = [
  {
    id: "b9cc2e3e-0cc3-4fdd-9c33-d5f3b0b322d8",
    title: "Update CRM dashboard design",
    priority: "High",
    assignee: { name: "Sarah Johnson", avatar: null, initials: "SJ" },
    dueDate: "Today",
    status: "In Progress"
  },
  {
    id: "3a9b644d-934f-48c0-92db-3c841ae04fd7",
    title: "Integrate Dropbox API",
    priority: "Medium",
    assignee: { name: "Mike Chen", avatar: null, initials: "MC" },
    dueDate: "Tomorrow",
    status: "Todo"
  },
  {
    id: "2c7f56fe-f01f-4ab6-a1d5-796769a49316",
    title: "Review job applications",
    priority: "Low",
    assignee: { name: "Emma Davis", avatar: null, initials: "ED" },
    dueDate: "Dec 28",
    status: "Review"
  }
];

export function TasksOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Tasks"
          value="47"
          change="+12% from last week"
          changeType="positive"
          icon={CheckSquare}
        />
        <DashboardCard
          title="In Progress"
          value="12"
          change="3 due today"
          changeType="neutral"
          icon={Clock}
        />
        <DashboardCard
          title="Overdue"
          value="3"
          change="-2 from yesterday"
          changeType="positive"
          icon={AlertCircle}
        />
        <DashboardCard
          title="Team Members"
          value="8"
          change="2 active now"
          changeType="neutral"
          icon={Users}
        />
      </div>

      <DashboardCard
        title="Recent Tasks"
        icon={CheckSquare}
        className="col-span-full"
      >
        <div className="space-y-4 mt-4">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignee.avatar || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-accent text-white">
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Due {task.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "secondary"}>
                  {task.priority}
                </Badge>
                <Badge variant="outline">
                  {task.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}