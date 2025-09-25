import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Plus, Video, Users } from "lucide-react";

const meetings = [
  {
    title: "Customer success sync",
    time: "09:30 - 10:15",
    type: "Zoom",
    attendees: "5 attendees",
  },
  {
    title: "Product roadmap review",
    time: "11:00 - 12:00",
    type: "Hybrid",
    attendees: "12 attendees",
  },
  {
    title: "Candidate interview",
    time: "14:30 - 15:00",
    type: "Google Meet",
    attendees: "Panel with HR",
  },
];

const events = [
  { day: "Mon", focus: "Operations", count: 5 },
  { day: "Tue", focus: "Product", count: 4 },
  { day: "Wed", focus: "Sales", count: 6 },
  { day: "Thu", focus: "Hiring", count: 3 },
  { day: "Fri", focus: "Finance", count: 4 },
];

const Calendar = () => {
  const { toast } = useToast();

  const handleNewMeeting = () => {
    toast({
      title: "Schedule meeting",
      description: "Calendar integrations will open in a connected account.",
    });
  };

  const handleInviteTeam = () => {
    toast({
      title: "Invite teammates",
      description: "Share availability from the team directory.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Calendar"
          description="Review upcoming meetings, prepare agendas, and coordinate availability across teams."
          actions={(
            <>
              <Button variant="outline" size="sm" onClick={handleInviteTeam}>
                <Users className="mr-2 h-4 w-4" />
                Share availability
              </Button>
              <Button size="sm" onClick={handleNewMeeting} className="bg-gradient-primary text-white shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                New meeting
              </Button>
            </>
          )}
        />

        <div className="grid gap-6 p-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-card">
            <CardHeader className="flex items-center justify-between border-b border-border/60 pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Today's agenda</CardTitle>
              <Badge variant="secondary" className="gap-1 text-xs">
                <CalendarIcon className="h-4 w-4" />
                3 meetings
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {meetings.map((meeting) => (
                <div key={meeting.title} className="rounded-xl border border-border/60 bg-white/70 p-4 shadow-card/30">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground">{meeting.attendees}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Video className="h-4 w-4" />
                      {meeting.type}
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {meeting.time}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Focus for the week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.map((event) => (
                  <div key={event.day} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
                    <span className="font-semibold text-foreground">{event.day}</span>
                    <span className="text-muted-foreground">{event.focus}</span>
                    <Badge variant="outline">{event.count} events</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Meeting reminders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Send agenda for the product review.</p>
                <p>• Share candidate resume with panel.</p>
                <p>• Confirm follow-up notes after customer sync.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
