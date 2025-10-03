import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Badge } from "@/components/ui/badge";

const upcomingEvents = [
  {
    id: "d058c1c9-1439-4f7d-8be6-1cf3d3a62b7b",
    title: "Team Standup",
    time: "9:00 AM",
    type: "meeting",
    location: "Conference Room A",
    attendees: 8
  },
  {
    id: "4a6ca34d-8e21-4d4e-b610-0a5bc6da1233",
    title: "Client Review Call",
    time: "2:00 PM",
    type: "call",
    location: "Zoom",
    attendees: 4
  },
  {
    id: "0d1b9849-2f1d-4fbe-8228-77b9e6a91e76",
    title: "Project Deadline",
    time: "EOD",
    type: "deadline",
    location: "CRM Dashboard",
    attendees: null
  }
];

export function CalendarOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard
        title="Today's Schedule"
        icon={Calendar}
        className="lg:col-span-2"
      >
        <div className="space-y-3 mt-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  {event.type === "meeting" && <Video className="h-5 w-5 text-white" />}
                  {event.type === "call" && <Clock className="h-5 w-5 text-white" />}
                  {event.type === "deadline" && <Calendar className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{event.time}</span>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              {event.attendees && (
                <Badge variant="secondary">
                  {event.attendees} attendees
                </Badge>
              )}
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}