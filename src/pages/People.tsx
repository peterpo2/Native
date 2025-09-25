import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Filter, Mail, UserPlus } from "lucide-react";

const team = [
  {
    name: "Sarah Johnson",
    title: "Founder",
    email: "sarah@native.co",
    status: "Online",
    initials: "SJ",
    avatar: null,
  },
  {
    name: "Mike Chen",
    title: "Operations Lead",
    email: "mike@native.co",
    status: "Reviewing pipeline",
    initials: "MC",
    avatar: null,
  },
  {
    name: "Emma Davis",
    title: "Recruiter",
    email: "emma@native.co",
    status: "Interview scheduled",
    initials: "ED",
    avatar: null,
  },
  {
    name: "Alex Morgan",
    title: "Client Partner",
    email: "alex@native.co",
    status: "Out of office",
    initials: "AM",
    avatar: null,
  },
];

const invites = [
  { email: "lisa@native.co", role: "Client", sent: "Sent 1 hour ago" },
  { email: "drew@native.co", role: "Manager", sent: "Sent yesterday" },
];

const People = () => {
  const { toast } = useToast();

  const handleInvite = () => {
    toast({
      title: "Invite teammate",
      description: "Send an invite with role selection and SSO provisioning.",
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filter directory",
      description: "Use status, role, or segment to refine your view.",
    });
  };

  const handleMessage = (name: string) => {
    toast({
      title: `Message sent to ${name}`,
      description: "They will receive it in their inbox and in-app.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="People"
          description="Manage teammates, monitor invite status, and coordinate collaboration in one place."
          actions={(
            <>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" onClick={handleInvite} className="bg-gradient-primary text-white shadow-glow">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite teammate
              </Button>
            </>
          )}
        />

        <div className="grid gap-6 p-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Team directory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {team.map((member) => (
                <div key={member.email} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar ?? undefined} alt={member.name} />
                      <AvatarFallback className="bg-gradient-accent text-sm font-semibold text-white">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.title}</p>
                      <p className="text-xs text-muted-foreground/80">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {member.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => handleMessage(member.name)}>
                      <Mail className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Pending invitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {invites.map((invite) => (
                <div key={invite.email} className="rounded-lg bg-muted/40 px-3 py-2">
                  <p className="font-semibold text-foreground">{invite.email}</p>
                  <p className="text-muted-foreground">{invite.role} · {invite.sent}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">All invites include SSO and role-based access by default.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default People;
