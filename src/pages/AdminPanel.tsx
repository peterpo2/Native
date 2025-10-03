import { Link } from "react-router-dom";
import { ShieldCheck, Users, Activity } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const adminTools = [
  {
    title: "User management",
    description: "Invite teammates, assign roles, and deactivate accounts when access should be revoked.",
    highlights: [
      "Create new users with predefined roles and optional organization scopes.",
      "Edit profile information, update roles, and enforce two-factor authentication.",
      "Soft delete members to immediately suspend access while keeping audit history.",
    ],
    icon: Users,
    cta: "Manage users",
    to: "/admin/users",
  },
  {
    title: "Activity monitor",
    description: "Review sensitive changes, download audit trails, and verify compliance posture.",
    highlights: [
      "Filter notable workspace movements to focus on admin-only events.",
      "Surface sign-in attempts, permission updates, and data exports in one place.",
      "Share guidance with fellow administrators to maintain least-privilege policies.",
    ],
    icon: Activity,
    cta: "View activity",
    to: "/admin/activity",
  },
];

const AdminPanel = () => {
  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Administrator control center"
          description="Access security tooling reserved for administrators to manage members and monitor high-impact activity."
        />

        <div className="p-6 space-y-6">
          <Card className="border border-border/50 bg-card/80 shadow-card">
            <CardHeader className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Workspace security overview</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    These tools are only visible to workspace administrators. Keep credentials secure and audit access often.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Admin only
              </Badge>
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {adminTools.map((tool) => (
              <Card key={tool.title} className="h-full border border-border/40 bg-card/90 shadow-card/80">
                <CardHeader className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">{tool.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {tool.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/80" aria-hidden="true" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button asChild className="bg-gradient-primary text-white shadow-glow">
                    <Link to={tool.to}>{tool.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
