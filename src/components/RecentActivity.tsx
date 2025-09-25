import { Activity, CheckSquare, FileText, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    user: { name: "Sarah Johnson", initials: "SJ", avatar: null },
    action: "completed task",
    target: "Update user dashboard",
    time: "2 minutes ago",
    type: "task"
  },
  {
    id: 2,
    user: { name: "Mike Chen", initials: "MC", avatar: null },
    action: "added contact",
    target: "Acme Corp - John Smith",
    time: "15 minutes ago",
    type: "contact"
  },
  {
    id: 3,
    user: { name: "Emma Davis", initials: "ED", avatar: null },
    action: "scheduled meeting",
    target: "Q4 Review Call",
    time: "1 hour ago",
    type: "meeting"
  },
  {
    id: 4,
    user: { name: "Alex Wilson", initials: "AW", avatar: null },
    action: "uploaded file",
    target: "Project_Specs.pdf",
    time: "2 hours ago",
    type: "file"
  },
  {
    id: 5,
    user: { name: "Lisa Brown", initials: "LB", avatar: null },
    action: "created document",
    target: "Marketing Strategy 2024",
    time: "3 hours ago",
    type: "document"
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "task":
      return CheckSquare;
    case "contact":
      return Users;
    case "meeting":
      return Calendar;
    case "file":
    case "document":
      return FileText;
    default:
      return Activity;
  }
};

export function RecentActivity() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-accent text-white">
                    {activity.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}