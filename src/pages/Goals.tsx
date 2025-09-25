import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Goals = () => (
  <DashboardLayout>
    <div className="min-h-screen bg-gradient-subtle">
      <PageHeader
        title="Goals"
        description="Align teams around measurable outcomes and monitor progress in real time."
      />
      <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
        {["Launch mobile app", "Expand enterprise ARR", "Improve CSAT"].map((goal) => (
          <Card key={goal} className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">{goal}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Owner: Strategic Operations</p>
              <p>Timeline: Q1 2025</p>
              <p>Status: In progress</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Goals;
