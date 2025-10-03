import { useCallback, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays, Cloud, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDropboxStatus } from "@/hooks/use-dropbox-status";
import { disconnectDropbox } from "@/lib/api";

interface IntegrationItem {
  name: string;
  description: string;
  status: string;
  lastSynced: string;
  icon: typeof CalendarDays;
  accent: string;
  actionLabel: string;
  actionVariant?: "default" | "outline";
  actionDisabled?: boolean;
  statusVariant: "secondary" | "destructive";
  onAction?: () => void;
  showSpinner?: boolean;
}

export function IntegrationStatus() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const dropboxStatusQuery = useDropboxStatus(token);
  const {
    data: dropboxStatus,
    isLoading: dropboxLoading,
    isError: dropboxError,
    refetch: refetchDropbox,
  } = dropboxStatusQuery;

  const handleOpenConfigurationHelp = useCallback(() => {
    toast({
      title: "Add Dropbox credentials",
      description: "Set Dropbox__ClientId, Dropbox__ClientSecret, and Dropbox__RedirectUri before connecting.",
    });
  }, [toast]);

  const handleOpenAuthorization = useCallback(() => {
    if (!dropboxStatus?.authorizationUrl) {
      toast({
        variant: "destructive",
        title: "Unable to start Dropbox authorization",
        description: dropboxStatus?.isConfigured
          ? "The authorization URL could not be generated. Try refreshing the page."
          : "Add Dropbox credentials to the backend configuration first.",
      });
      return;
    }

    if (typeof window !== "undefined") {
      window.open(dropboxStatus.authorizationUrl, "_blank", "noopener,noreferrer");
    }

    toast({
      title: "Dropbox authorization started",
      description: "Complete the OAuth flow, then exchange the code for tokens and call the connect endpoint.",
    });
  }, [dropboxStatus, toast]);

  const handleDisconnect = useCallback(async () => {
    if (!token) return;
    try {
      setIsDisconnecting(true);
      await disconnectDropbox(token);
      toast({
        title: "Dropbox disconnected",
        description: "The integration was removed for this user.",
      });
      await refetchDropbox();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to disconnect Dropbox",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  }, [refetchDropbox, toast, token]);

  const dropboxIntegration: IntegrationItem = useMemo(() => {
    if (dropboxLoading) {
      return {
        name: "Dropbox",
        description: "Checking Dropbox integration status...",
        status: "Checking...",
        lastSynced: "Loading",
        icon: Cloud,
        accent: "bg-muted",
        actionLabel: "Loading",
        actionVariant: "default",
        actionDisabled: true,
        statusVariant: "secondary",
      };
    }

    if (dropboxError) {
      return {
        name: "Dropbox",
        description: "We couldn't reach the Dropbox integration service.",
        status: "Error",
        lastSynced: "Tap retry",
        icon: Cloud,
        accent: "bg-muted",
        actionLabel: "Retry",
        actionVariant: "default",
        actionDisabled: false,
        statusVariant: "destructive",
        onAction: () => refetchDropbox(),
      };
    }

    if (!dropboxStatus?.isConfigured) {
      return {
        name: "Dropbox",
        description: "Attach folders, collect uploads, and keep docs in sync once Dropbox OAuth is configured.",
        status: "Not configured",
        lastSynced: "Add credentials to enable",
        icon: Cloud,
        accent: "bg-muted",
        actionLabel: "Configure",
        actionVariant: "default",
        actionDisabled: false,
        statusVariant: "destructive",
        onAction: handleOpenConfigurationHelp,
      };
    }

    if (!dropboxStatus.isConnected) {
      return {
        name: "Dropbox",
        description: "Attach folders, collect uploads, and keep docs in sync.",
        status: "Requires connection",
        lastSynced: "Authorize Dropbox to finish setup",
        icon: Cloud,
        accent: "bg-muted",
        actionLabel: "Connect",
        actionVariant: "default",
        actionDisabled: false,
        statusVariant: "destructive",
        onAction: handleOpenAuthorization,
      };
    }

    const lastConnected = dropboxStatus.connectedAt
      ? `Connected ${formatDistanceToNow(new Date(dropboxStatus.connectedAt), { addSuffix: true })}`
      : "Connected";

    return {
      name: "Dropbox",
      description: dropboxStatus.accountId
        ? `Connected to Dropbox account ${dropboxStatus.accountId}.`
        : "Dropbox is connected and ready to sync attachments.",
      status: "Connected",
      lastSynced: lastConnected,
      icon: Cloud,
      accent: "bg-gradient-primary",
      actionLabel: "Disconnect",
      actionVariant: "default",
      actionDisabled: isDisconnecting,
      statusVariant: "secondary",
      onAction: handleDisconnect,
      showSpinner: isDisconnecting,
    };
  }, [
    dropboxError,
    dropboxLoading,
    dropboxStatus,
    handleDisconnect,
    handleOpenAuthorization,
    handleOpenConfigurationHelp,
    isDisconnecting,
    refetchDropbox,
  ]);

  const integrations: IntegrationItem[] = useMemo(
    () => [
      {
        name: "Google Calendar",
        description: "Sync meetings, deadlines, and reminders across workspaces.",
        status: "Connected",
        lastSynced: "5 minutes ago",
        icon: CalendarDays,
        accent: "bg-gradient-primary",
        actionLabel: "Manage",
        actionVariant: "outline",
        actionDisabled: false,
        statusVariant: "secondary",
      },
      {
        name: "Microsoft 365",
        description: "Two-way sync with Outlook calendars for hybrid teams.",
        status: "Connected",
        lastSynced: "12 minutes ago",
        icon: RefreshCw,
        accent: "bg-gradient-accent",
        actionLabel: "Manage",
        actionVariant: "outline",
        actionDisabled: false,
        statusVariant: "secondary",
      },
      dropboxIntegration,
    ],
    [dropboxIntegration],
  );

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">Integrations</CardTitle>
        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isHealthy = integration.statusVariant === "secondary";

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
                    <Badge variant={integration.statusVariant}>{integration.status}</Badge>
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
                variant={integration.actionVariant ?? (isHealthy ? "outline" : "default")}
                className={!isHealthy && integration.actionVariant !== "outline" ? "bg-gradient-primary hover:opacity-90" : ""}
                disabled={integration.actionDisabled}
                onClick={integration.onAction}
              >
                {integration.showSpinner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {integration.actionLabel}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
