import { CalendarDays, Cloud, RefreshCw, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const integrations = [
  {
    name: "Google Calendar",
    description: "Sync meetings, deadlines, and reminders across workspaces.",
    status: "Connected",
    lastSynced: "5 minutes ago",
    icon: CalendarDays,
    accent: "bg-gradient-primary",
    actionLabel: "Manage"
  },
  {
    name: "Microsoft 365",
    description: "Two-way sync with Outlook calendars for hybrid teams.",
    status: "Connected",
    lastSynced: "12 minutes ago",
    icon: RefreshCw,
    accent: "bg-gradient-accent",
    actionLabel: "Manage"
  },
  {
    name: "Dropbox",
    description: "Attach folders, collect uploads, and keep docs in sync.",
    status: "Requires attention",
    lastSynced: "Authentication expires in 2 days",
    icon: Cloud,
    accent: "bg-muted",
    actionLabel: "Reconnect"
  }
];

export function IntegrationStatus() {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">Integrations</CardTitle>
        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isHealthy = integration.status === "Connected";

          return (
            <div
              key={integration.name}
              className="flex items-start justify-between rounded-xl border border-border/60 bg-muted/20 p-4 transition-all hover:border-border hover:bg-background"
            >
              <div className="flex items-start space-x-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${integration.accent}`}>
                  <Icon className={`h-5 w-5 ${integration.accent === "bg-muted" ? "text-muted-foreground" : "text-white"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                    <Badge variant={isHealthy ? "secondary" : "destructive"}>
                      {integration.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/80">
                    Last sync: {integration.lastSynced}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={isHealthy ? "outline" : "default"}
                className={isHealthy ? "" : "bg-gradient-primary hover:opacity-90"}
              >
                {integration.actionLabel}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
