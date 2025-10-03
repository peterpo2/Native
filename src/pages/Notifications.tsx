import { useMemo } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { activityTimeline } from "@/data/activityTimeline";
import { BellRing, CheckCheck } from "lucide-react";

const Notifications = () => {
  const { toast } = useToast();

  const handleMarkAll = () => {
    toast({
      title: "Notifications cleared",
      description: "You're all caught up on workspace activity.",
    });
  };

  const visibleTimeline = useMemo(
    () =>
      activityTimeline
        .map((section) => ({
          ...section,
          entries: section.entries.filter((entry) => entry.audience !== "admin"),
        }))
        .filter((section) => section.entries.length > 0),
    [],
  );

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Notifications"
          description="Review every workspace update with creator details and precise timelines."
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
            <CardContent className="space-y-6">
              {visibleTimeline.map((section) => (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.label}
                    </p>
                    <div className="h-px flex-1 rounded bg-border/60 ml-4" aria-hidden="true" />
                  </div>

                  <div className="space-y-2">
                    {section.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex gap-3 rounded-xl border border-border/60 bg-card/80 p-4 shadow-card/40"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={entry.user.avatar || undefined} alt={entry.user.name} />
                          <AvatarFallback className="bg-gradient-accent text-white text-sm">
                            {entry.user.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span className="font-semibold text-foreground">{entry.user.name}</span>
                            <span className="text-muted-foreground">{entry.action}</span>
                            <span className="font-semibold text-foreground">{entry.target}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                              {entry.type}
                            </Badge>
                            <span>{entry.time}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{entry.context}</span>
                          </div>
                          <p className="text-xs text-muted-foreground/90">{entry.details}</p>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                            {entry.user.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
