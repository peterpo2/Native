import { Plus, UserPlus, FileText, Calendar, Upload, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  {
    icon: Plus,
    label: "New Task",
    description: "Create a task",
    onClick: () => console.log("New task"),
    variant: "default" as const
  },
  {
    icon: UserPlus,
    label: "Add Contact",
    description: "Add person",
    onClick: () => console.log("Add contact"),
    variant: "outline" as const
  },
  {
    icon: Calendar,
    label: "Schedule Meeting",
    description: "Book time",
    onClick: () => console.log("Schedule meeting"),
    variant: "outline" as const
  },
  {
    icon: FileText,
    label: "New Document",
    description: "Create doc",
    onClick: () => console.log("New document"),
    variant: "outline" as const
  },
  {
    icon: Upload,
    label: "Upload File",
    description: "Add to Dropbox",
    onClick: () => console.log("Upload file"),
    variant: "outline" as const
  },
  {
    icon: Briefcase,
    label: "Post Job",
    description: "Hire talent",
    onClick: () => console.log("Post job"),
    variant: "outline" as const
  }
];

export function QuickActions() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.onClick}
              className="h-auto p-4 flex-col space-y-2 hover:shadow-sm transition-all"
            >
              <action.icon className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}