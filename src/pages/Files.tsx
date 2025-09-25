import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Upload, Filter, FileText, Share2 } from "lucide-react";

const folders = [
  {
    name: "Client handoffs",
    path: "/Native/Clients/Handoffs",
    files: 24,
    updated: "Updated 6m ago",
  },
  {
    name: "Product design",
    path: "/Native/Product/Design",
    files: 18,
    updated: "Updated 1h ago",
  },
  {
    name: "Contracts",
    path: "/Native/Legal/Contracts",
    files: 12,
    updated: "Updated yesterday",
  },
];

const documents = [
  { name: "FY25 OKRs.pdf", owner: "Sarah Johnson", updated: "Edited today" },
  { name: "Client Rollout Checklist.docx", owner: "Mike Chen", updated: "Edited 2 hours ago" },
  { name: "Hiring Scorecard.xlsx", owner: "Emma Davis", updated: "Edited yesterday" },
  { name: "Security Review.md", owner: "Alex Morgan", updated: "Edited 2 days ago" },
];

const Files = () => {
  const location = useLocation();
  const { toast } = useToast();

  const highlightedFolder = useMemo(() => {
    const state = location.state as { folder?: string } | null;
    if (state?.folder) {
      return folders.find((folder) => folder.name === state.folder)?.name ?? null;
    }
    return null;
  }, [location.state]);

  const handleUpload = () => {
    toast({
      title: "Upload file",
      description: "Drag and drop files or connect to Dropbox to sync instantly.",
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filter files",
      description: "Filter by owner, status, or last activity.",
    });
  };

  const handleShare = (documentName: string) => {
    toast({
      title: "Share document",
      description: `${documentName} is ready to share with the selected workspace.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Files"
          description="Browse recent documents and shared folders from your connected storage providers."
          actions={(
            <>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" onClick={handleUpload} className="bg-gradient-primary text-white shadow-glow">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </>
          )}
        />

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr,1fr]">
          <Card className="shadow-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Shared folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {folders.map((folder) => (
                <div
                  key={folder.path}
                  className={`flex items-start justify-between rounded-xl border border-border/60 bg-card/80 p-4 shadow-card/30 transition-all ${highlightedFolder === folder.name ? "ring-2 ring-accent/60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent text-white">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">{folder.path}</p>
                      <p className="text-xs text-muted-foreground/80">{folder.updated}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.files} files
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Recent documents</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-80 pr-4">
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div key={document.name} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{document.name}</p>
                        <p className="text-xs text-muted-foreground">Owned by {document.owner}</p>
                        <p className="text-xs text-muted-foreground/80">{document.updated}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <FileText className="h-3 w-3" />
                          Preview
                        </Badge>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleShare(document.name)}>
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Files;
