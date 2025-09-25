import { type ComponentType } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Filter, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";

const tasks = [
  {
    title: "Finalize onboarding playbook",
    owner: "Sarah Johnson",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-600",
    progress: 64,
    due: "Due today",
  },
  {
    title: "Prepare Q4 client review",
    owner: "Mike Chen",
    status: "At Risk",
    statusColor: "bg-amber-100 text-amber-700",
    progress: 38,
    due: "Due in 2 days",
  },
  {
    title: "Publish operations scorecard",
    owner: "Emma Davis",
    status: "Completed",
    statusColor: "bg-emerald-100 text-emerald-700",
    progress: 100,
    due: "Completed yesterday",
  },
];

const statusIcons: Record<string, ComponentType<{ className?: string }>> = {
  "In Progress": Clock3,
  "At Risk": AlertTriangle,
  Completed: CheckCircle2,
};

const taskHighlights = [
  {
    label: "Active projects",
    value: "12",
    trend: "+3 this week",
  },
  {
    label: "Tasks completed",
    value: "47",
    trend: "92% on time",
  },
  {
    label: "Blockers",
    value: "2",
    trend: "Escalated to leadership",
  },
];

const TaskStatusIcon = ({ status }: { status: string }) => {
  const Icon = statusIcons[status] ?? Clock3;
  return <Icon className="h-4 w-4" />;
};

const Tasks = () => {
  const { toast } = useToast();

  const handleCreateTask = () => {
    toast({
      title: "Create task",
      description: "Task composer will open in a future release.",
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filters",
      description: "Use tags and owners to narrow the task list.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Tasks"
          description="Track ownership, progress, and upcoming deadlines across your active work."
          actions={(
            <>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button size="sm" onClick={handleCreateTask} className="bg-gradient-primary text-white shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </>
          )}
        />

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          {taskHighlights.map((highlight) => (
            <Card key={highlight.label} className="shadow-card">
              <CardHeader className="pb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {highlight.label}
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{highlight.value}</div>
                <p className="text-sm text-muted-foreground">{highlight.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4 p-6 pt-0">
          <h2 className="text-lg font-semibold text-foreground">Active work</h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.title} className="shadow-card">
                <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {task.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Owner: {task.owner}</p>
                  </div>
                  <Badge className={`flex items-center gap-1 px-3 py-1 text-xs font-medium ${task.statusColor}`}>
                    <TaskStatusIcon status={task.status} />
                    {task.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <Progress value={task.progress} />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{task.progress}% complete</span>
                    <span>{task.due}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
