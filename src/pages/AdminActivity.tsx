import { useMemo } from "react";
import { ShieldCheck, ListFilter, ListOrdered } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityTimeline } from "@/data/activityTimeline";

const AdminActivity = () => {
  const flattenedEntries = useMemo(
    () =>
      activityTimeline.flatMap((section) =>
        section.entries.map((entry) => ({
          ...entry,
          sectionId: section.id,
        })),
      ),
    [],
  );

  const totalMovements = flattenedEntries.length;
  const adminOnlyMovements = flattenedEntries.filter((entry) => entry.audience === "admin").length;

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Admin activity monitor"
          description="Review a complete audit feed of every workspace movement, including security events and sensitive updates."
        />

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-border/40 bg-card/70 shadow-card/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total tracked movements</CardTitle>
                <ListOrdered className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{totalMovements}</p>
                <p className="text-xs text-muted-foreground">Includes tasks, files, incidents, and audit events</p>
              </CardContent>
            </Card>

            <Card className="border border-border/40 bg-card/70 shadow-card/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Admin-only events</CardTitle>
                <ListFilter className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{adminOnlyMovements}</p>
                <p className="text-xs text-muted-foreground">Security reviews, revocations, and compliance exports</p>
              </CardContent>
            </Card>

            <Card className="border border-border/40 bg-card/70 shadow-card/70 md:col-span-2 xl:col-span-2">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <div>
                  <CardTitle className="text-sm font-medium text-foreground">Admin guidance</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Sensitive items are highlighted. Only administrators with elevated privileges can view this feed.
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg font-semibold text-foreground">Workspace movements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activityTimeline.map((section) => (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</p>
                    <div className="ml-4 h-px flex-1 rounded bg-border/60" aria-hidden="true" />
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
                            {entry.audience === "admin" && (
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                Admin only
                              </Badge>
                            )}
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

export default AdminActivity;
