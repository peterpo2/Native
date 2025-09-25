import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BellRing, CheckCheck } from "lucide-react";

const updates = [
  {
    title: "Sarah Johnson completed 'Onboarding playbook'",
    time: "Just now",
    type: "Task",
  },
  {
    title: "Mike Chen shared 'Q4 client review deck'",
    time: "15 minutes ago",
    type: "File",
  },
  {
    title: "Emma Davis scheduled an interview with Alex",
    time: "1 hour ago",
    type: "Calendar",
  },
];

const Notifications = () => {
  const { toast } = useToast();

  const handleMarkAll = () => {
    toast({
      title: "Notifications cleared",
      description: "You're all caught up on workspace activity.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Notifications"
          description="Review recent activity across tasks, files, and collaboration tools."
          actions={(
            <Button variant="outline" size="sm" onClick={handleMarkAll}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        />

        <div className="p-6">
          <Card className="shadow-card">
            <CardHeader className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg font-semibold text-foreground">Recent updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {updates.map((update) => (
                <div key={update.title} className="flex flex-col gap-1 rounded-lg border border-border/60 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{update.title}</p>
                    <p className="text-xs text-muted-foreground">{update.time}</p>
                  </div>
                  <Badge variant="secondary" className="self-start text-xs sm:self-auto">
                    {update.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
