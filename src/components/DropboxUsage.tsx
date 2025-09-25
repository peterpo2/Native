import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Cloud, ExternalLink, FolderKanban } from "lucide-react";

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
