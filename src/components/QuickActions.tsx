import { useNavigate } from "react-router-dom";

import { Plus, UserPlus, FileText, Calendar, Upload, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const actions = [
    {
      icon: Plus,
      label: "New Task",
      description: "Create a task",
      onClick: () => navigate("/tasks"),
      variant: "default" as const,
    },
    {
      icon: UserPlus,
      label: "Add Contact",
      description: "Add person",
      onClick: () => navigate("/people"),
      variant: "outline" as const,
    },
    {
      icon: Calendar,
      label: "Schedule Meeting",
      description: "Book time",
      onClick: () => navigate("/calendar"),
      variant: "outline" as const,
    },
    {
      icon: FileText,
      label: "New Document",
      description: "Create doc",
      onClick: () => navigate("/files"),
      variant: "outline" as const,
    },
    {
      icon: Upload,
      label: "Upload File",
      description: "Add to Dropbox",
      onClick: () => {
        navigate("/files");
        toast({
          title: "Upload",
          description: "Connect Dropbox to upload directly from this view.",
        });
      },
      variant: "outline" as const,
    },
    {
      icon: Briefcase,
      label: "Post Job",
      description: "Hire talent",
      onClick: () => navigate("/careers"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
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