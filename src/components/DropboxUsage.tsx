import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useDropboxStatus } from "@/hooks/use-dropbox-status";
import { disconnectDropbox } from "@/lib/api";
import { Cloud, ExternalLink, FolderKanban, Loader2 } from "lucide-react";

const sharedFolders = [
  {
    name: "Client handoffs",
    path: "/Native/Clients/Handoffs",
    updated: "Updated 6m ago"
  },
  {
    name: "Product design",
    path: "/Native/Product/Design",
    updated: "Updated 1h ago"
  },
  {
    name: "Contracts",
    path: "/Native/Legal/Contracts",
    updated: "Updated yesterday"
  }
];

export function DropboxUsage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const dropboxStatusQuery = useDropboxStatus(token);
  const {
    data: dropboxStatus,
    isLoading: dropboxLoading,
    isError: dropboxError,
    refetch: refetchDropbox,
  } = dropboxStatusQuery;

  const handleStartAuthorization = useCallback(() => {
    if (!dropboxStatus?.authorizationUrl) {
      toast({
        variant: "destructive",
        title: "Dropbox configuration required",
        description: dropboxStatus?.isConfigured
          ? "Unable to generate the authorization link. Refresh the page and try again."
          : "Set Dropbox credentials in the backend configuration before connecting.",
      });
      return;
    }

    if (typeof window !== "undefined") {
      window.open(dropboxStatus.authorizationUrl, "_blank", "noopener,noreferrer");
    }

    toast({
      title: "Complete the Dropbox authorization",
      description: "After approving access, exchange the code for tokens and call the connect endpoint.",
    });
  }, [dropboxStatus, toast]);

  const handleDisconnect = useCallback(async () => {
    if (!token) return;
    try {
      setIsDisconnecting(true);
      await disconnectDropbox(token);
      toast({
        title: "Dropbox disconnected",
        description: "File sync has been turned off for this user.",
      });
      await refetchDropbox();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to disconnect",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  }, [refetchDropbox, toast, token]);

  const connectionSummary = useMemo(() => {
    if (dropboxLoading) {
      return {
        label: "Checking Dropbox connection...",
        button: "Loading",
        onClick: undefined,
        disabled: true,
        showSpinner: false,
      };
    }

    if (dropboxError) {
      return {
        label: "We couldn't reach Dropbox. Retry to refresh the status.",
        button: "Retry",
        onClick: () => refetchDropbox(),
        disabled: false,
        showSpinner: false,
      };
    }

    if (!dropboxStatus?.isConfigured) {
      return {
        label: "Add Dropbox credentials (Client ID, Secret, Redirect URI) in the backend before connecting.",
        button: "Configuration help",
        onClick: () =>
          toast({
            title: "Configure Dropbox",
            description: "Update Dropbox__* environment variables and restart the backend.",
          }),
        disabled: false,
        showSpinner: false,
      };
    }

    if (!dropboxStatus.isConnected) {
      return {
        label: "Dropbox is ready. Authorize access to start syncing attachments.",
        button: "Connect",
        onClick: handleStartAuthorization,
        disabled: false,
        showSpinner: false,
      };
    }

    const connectedAt = dropboxStatus.connectedAt
      ? `Connected ${formatDistanceToNow(new Date(dropboxStatus.connectedAt), { addSuffix: true })}`
      : "Connected";

    return {
      label: dropboxStatus.accountId
        ? `${connectedAt} as ${dropboxStatus.accountId}.`
        : `${connectedAt}.`,
      button: "Disconnect",
      onClick: handleDisconnect,
      disabled: isDisconnecting,
      showSpinner: isDisconnecting,
    };
  }, [
    dropboxError,
    dropboxLoading,
    dropboxStatus,
    handleDisconnect,
    handleStartAuthorization,
    isDisconnecting,
    toast,
    refetchDropbox,
  ]);

  return (
    <Card className="shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Dropbox Workspace
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Track shared folders, upload activity, and available storage at a glance.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Connection status</p>
            <p className="text-xs text-muted-foreground">{connectionSummary.label}</p>
          </div>
          <Button
            size="sm"
            onClick={connectionSummary.onClick}
            disabled={connectionSummary.disabled}
            className={!dropboxStatus?.isConnected ? "bg-gradient-primary text-white shadow-glow" : undefined}
          >
            {connectionSummary.showSpinner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {connectionSummary.button}
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>Storage usage</span>
            <span>72% of 2 TB</span>
          </div>
          <Progress value={72} className="mt-3" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>1.44 TB used</span>
            <Badge variant="outline">Auto-archiving enabled</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Shared folders
          </p>
          {sharedFolders.map((folder) => (
            <div key={folder.name} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/90 px-3 py-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-gradient-accent text-white">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">{folder.path}</p>
                  <p className="text-xs text-muted-foreground/80">{folder.updated}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-xs"
                onClick={() => {
                  navigate("/files", { state: { folder: folder.name } });
                  toast({
                    title: "Opening folder",
                    description: `${folder.name} is highlighted in the Files view.`,
                  });
                }}
              >
                Open
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
