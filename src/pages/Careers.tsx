import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, ClipboardList } from "lucide-react";

const openings = [
  {
    title: "Implementation Specialist",
    location: "Remote · North America",
    pipeline: "14 candidates",
    stage: "Interviews",
  },
  {
    title: "Customer Success Manager",
    location: "Austin, TX",
    pipeline: "22 candidates",
    stage: "Reviewing",
  },
  {
    title: "Revenue Operations Analyst",
    location: "Remote",
    pipeline: "9 candidates",
    stage: "Sourcing",
  },
];

const playbooks = [
  { name: "Interview scorecard", type: "Template", updated: "Updated yesterday" },
  { name: "Candidate outreach", type: "Workflow", updated: "Updated 2 days ago" },
  { name: "Offer approval", type: "Process", updated: "Updated last week" },
];

const Careers = () => {
  const { toast } = useToast();

  const handleNewOpening = () => {
    toast({
      title: "Post a job",
      description: "Sync role details to job boards and your career site.",
    });
  };

  const handleConfigure = () => {
    toast({
      title: "Configure pipeline",
      description: "Customize stages, approvers, and automation.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Careers"
          description="Manage open roles, candidate pipelines, and hiring playbooks across your teams."
          actions={(
            <>
              <Button variant="outline" size="sm" onClick={handleConfigure}>
                <Settings className="mr-2 h-4 w-4" />
                Configure pipeline
              </Button>
              <Button size="sm" onClick={handleNewOpening} className="bg-gradient-primary text-white shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Post job
              </Button>
            </>
          )}
        />

        <div className="grid gap-6 p-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Open roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {openings.map((opening) => (
                <div key={opening.title} className="rounded-xl border border-border/60 bg-white/70 p-4 shadow-card/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{opening.title}</p>
                      <p className="text-xs text-muted-foreground">{opening.location}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {opening.stage}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{opening.pipeline}</span>
                    <span>Hiring manager review</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Playbooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {playbooks.map((playbook) => (
                <div key={playbook.name} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{playbook.name}</p>
                    <p className="text-xs text-muted-foreground">{playbook.type}</p>
                  </div>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <ClipboardList className="h-3 w-3" />
                    {playbook.updated}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Playbooks automatically sync to hiring managers and interviewers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Careers;
