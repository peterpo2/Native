import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus2 } from "lucide-react";

const members = [
  {
    name: "Sarah Johnson",
    role: "Founder",
    initials: "SJ",
    avatar: null,
    status: "Online"
  },
  {
    name: "Mike Chen",
    role: "Operations",
    initials: "MC",
    avatar: null,
    status: "Reviewing tasks"
  },
  {
    name: "Emma Davis",
    role: "Recruiter",
    initials: "ED",
    avatar: null,
    status: "Interview today"
  }
];

const pendingInvites = [
  {
    email: "alex@native.co",
    role: "Manager",
    sent: "Sent 1 day ago"
  },
  {
    email: "lisa@native.co",
    role: "Client",
    sent: "Sent 3 hours ago"
  }
];

export function TeamOverview() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">Team Management</CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/people")}
        >
          <UserPlus2 className="h-4 w-4" />
          Invite
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.name} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar || undefined} alt={member.name} />
                  <AvatarFallback className="bg-gradient-accent text-white text-sm">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {member.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-white">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Security snapshot</p>
              <p className="text-xs text-muted-foreground">
                2FA enforced for admins • SSO ready • 3 active API tokens
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pending invites
          </p>
          <div className="mt-3 space-y-2">
            {pendingInvites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">{invite.role} · {invite.sent}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() =>
                    toast({
                      title: "Invite resent",
                      description: `${invite.email} has been notified again.`,
                    })
                  }
                >
                  Resend
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
        <span>8 active members</span>
        <span>Roles: Admin · Manager · Creator · Client</span>
      </CardFooter>
    </Card>
  );
}
