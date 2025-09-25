import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BriefcaseBusiness } from "lucide-react";

const pipelineStages = [
  {
    name: "Applied",
    count: 24,
    change: "+5 this week",
    progress: 65
  },
  {
    name: "Interview",
    count: 8,
    change: "2 scheduled today",
    progress: 45
  },
  {
    name: "Offer",
    count: 3,
    change: "Awaiting signature",
    progress: 20
  }
];

const openRoles = [
  {
    title: "Product Manager",
    location: "Remote",
    applicants: 14
  },
  {
    title: "Full-stack Engineer",
    location: "Hybrid · Austin",
    applicants: 9
  }
];

export function CareersPipeline() {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5" />
          Careers Pipeline
        </CardTitle>
        <Badge variant="outline" className="text-xs">Hiring</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {pipelineStages.map((stage) => (
            <div key={stage.name} className="rounded-xl border border-border/60 bg-background/90 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">{stage.change}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stage.count} candidates
                </Badge>
              </div>
              <Progress value={stage.progress} className="mt-3" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Open roles
          </p>
          <div className="mt-3 space-y-3">
            {openRoles.map((role) => (
              <div key={role.title} className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{role.title}</p>
                  <p className="text-xs text-muted-foreground">{role.location}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {role.applicants} applicants
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
