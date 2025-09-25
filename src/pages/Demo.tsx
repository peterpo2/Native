import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Download } from "lucide-react";

const Demo = () => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Demo deck downloaded",
      description: "Check your downloads folder for the latest presentation.",
    });
  };

  const handleWatch = () => {
    toast({
      title: "Demo starting",
      description: "Streaming the interactive product tour.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Product demo"
          description="Explore how Native CRM connects tasks, files, and operations in one collaborative workspace."
        />

        <div className="p-6">
          <Card className="overflow-hidden shadow-card">
            <CardHeader className="space-y-3">
              <CardTitle className="text-lg font-semibold text-foreground">Interactive tour</CardTitle>
              <p className="text-sm text-muted-foreground">
                Watch a guided walkthrough or download the executive summary deck to share with your team.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-muted-foreground">
                  <Play className="h-12 w-12" />
                  <p className="text-sm">Video preview coming soon.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleWatch} className="bg-gradient-primary text-white shadow-glow">
                  <Play className="mr-2 h-4 w-4" />
                  Watch demo
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download deck
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Demo;
