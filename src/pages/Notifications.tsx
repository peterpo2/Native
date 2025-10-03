import { useMemo, useState } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BellRing, CheckCheck } from "lucide-react";

const activityTimeline = [
  {
    id: "today",
    label: "Today",
    entries: [
      {
        id: "activity-1",
        user: { name: "Sarah Johnson", initials: "SJ", avatar: null, role: "Product Marketing" },
        action: "created task",
        target: "Launch announcement brief",
        context: "Go-to-market plan",
        time: "12 minutes ago",
        type: "Task",
        details: "Set due date for Oct 12 and assigned to launch squad",
        read: false,
      },
      {
        id: "activity-2",
        user: { name: "Mike Chen", initials: "MC", avatar: null, role: "Client Success" },
        action: "uploaded file",
        target: "Q4 client review deck.pdf",
        context: "Client Success > Q4 Reviews",
        time: "27 minutes ago",
        type: "File",
        details: "Version 3.1 added with updated revenue forecasts",
        read: false,
      },
      {
        id: "activity-3",
        user: { name: "Emma Davis", initials: "ED", avatar: null, role: "Talent" },
        action: "created candidate profile",
        target: "Alex Morgan",
        context: "Marketing Manager Hiring",
        time: "49 minutes ago",
        type: "People",
        details: "Imported from Lever and scheduled first round interview",
        read: true,
      },
    ],
  },
  {
    id: "yesterday",
    label: "Yesterday",
    entries: [
      {
        id: "activity-4",
        user: { name: "Alex Wilson", initials: "AW", avatar: null, role: "Product" },
        action: "published document",
        target: "Native roadmap v2.4",
        context: "Product Strategy",
        time: "Yesterday • 4:32 PM",
        type: "Document",
        details: "Shared with Leadership workspace and enabled change tracking",
        read: true,
      },
      {
        id: "activity-5",
        user: { name: "Lisa Brown", initials: "LB", avatar: null, role: "Finance" },
        action: "created approval workflow",
        target: "FY25 budget revisions",
        context: "Finance > Planning",
        time: "Yesterday • 11:18 AM",
        type: "Workflow",
        details: "Added approvers: Sarah Johnson, Mike Chen",
        read: false,
      },
    ],
  },
  {
    id: "week",
    label: "Earlier this week",
    entries: [
      {
        id: "activity-6",
        user: { name: "Priya Patel", initials: "PP", avatar: null, role: "Operations" },
        action: "moved project stage",
        target: "Enterprise onboarding",
        context: "Projects",
        time: "Monday • 9:02 AM",
        type: "Project",
        details: "Advanced from Discovery to Planning after client approval",
        read: true,
      },
      {
        id: "activity-7",
        user: { name: "Diego Martínez", initials: "DM", avatar: null, role: "Engineering" },
        action: "created incident report",
        target: "API latency spike",
        context: "Statuspage",
        time: "Monday • 7:46 AM",
        type: "Incident",
        details: "Documented mitigation steps and assigned follow-up tasks",
        read: true,
      },
    ],
  },
];

const Notifications = () => {
  const [timeline, setTimeline] = useState(activityTimeline);
  const { toast } = useToast();

  const unreadCount = useMemo(
    () =>
      timeline.reduce(
        (total, section) =>
          total + section.entries.reduce((count, entry) => count + (entry.read ? 0 : 1), 0),
        0,
      ),
    [timeline],
  );

  const handleMarkAll = () => {
    setTimeline((previous) =>
      previous.map((section) => ({
        ...section,
        entries: section.entries.map((entry) => ({ ...entry, read: true })),
      })),
    );

    toast({
      title: "Notifications updated",
      description: "Everything's now marked as read.",
    });
  };

  const handleToggleRead = (sectionId: string, entryId: string) => {
    setTimeline((previous) =>
      previous.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        return {
          ...section,
          entries: section.entries.map((entry) =>
            entry.id === entryId ? { ...entry, read: !entry.read } : entry,
          ),
        };
      }),
    );
  };

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
              <Badge
                variant={unreadCount === 0 ? "secondary" : "default"}
                className={cn(
                  "ml-auto text-[11px] font-semibold uppercase tracking-wide",
                  unreadCount === 0
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-accent text-white shadow-sm",
                )}
              >
                {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {timeline.map((section) => (
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
                        className={cn(
                          "flex gap-3 rounded-xl border border-border/60 bg-card/80 p-4 shadow-card/40 transition-all",
                          entry.read
                            ? "opacity-90"
                            : "border-accent/60 bg-accent/5 shadow-accent/20 backdrop-blur-sm",
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={entry.user.avatar || undefined} alt={entry.user.name} />
                          <AvatarFallback className="bg-gradient-accent text-white text-sm">
                            {entry.user.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                              <span className="font-semibold text-foreground">{entry.user.name}</span>
                              <span className="text-muted-foreground">{entry.action}</span>
                              <span className="font-semibold text-foreground">{entry.target}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={entry.read ? "secondary" : "default"}
                                className={cn(
                                  "text-[10px] font-semibold uppercase tracking-wide",
                                  entry.read
                                    ? "bg-muted/60 text-muted-foreground"
                                    : "bg-accent text-white",
                                )}
                              >
                                {entry.read ? "Read" : "Unread"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] font-semibold uppercase tracking-wide"
                                onClick={() => handleToggleRead(section.id, entry.id)}
                              >
                                {entry.read ? "Mark unread" : "Mark read"}
                              </Button>
                            </div>
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
