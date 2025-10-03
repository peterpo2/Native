import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Download, Plus, Users } from "lucide-react";
import { addDays, eachDayOfInterval, format, isFuture, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  start: Date;
  end: Date;
  status: "Pending" | "Approved" | "Declined";
  note?: string;
}

interface ScheduleEntry {
  id: number;
  employee: string;
  date: Date;
  start: string;
  end: string;
  location: string;
  notes?: string;
}

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employee: "Maria Petrova",
    type: "Paid time off",
    start: parseISO("2024-07-02"),
    end: parseISO("2024-07-05"),
    status: "Approved",
    note: "Family trip, handover completed with the team.",
  },
  {
    id: 2,
    employee: "Ivan Dimitrov",
    type: "Unpaid leave",
    start: parseISO("2024-07-18"),
    end: parseISO("2024-07-19"),
    status: "Pending",
    note: "Waiting for final approver.",
  },
  {
    id: 3,
    employee: "Elena Georgieva",
    type: "Remote work",
    start: parseISO("2024-06-24"),
    end: parseISO("2024-06-26"),
    status: "Approved",
  },
  {
    id: 4,
    employee: "Nikolay Ivanov",
    type: "Sick leave",
    start: parseISO("2024-06-14"),
    end: parseISO("2024-06-16"),
    status: "Declined",
    note: "Medical certificate pending.",
  },
];

const initialSchedule: ScheduleEntry[] = [
  {
    id: 1,
    employee: "Sales team",
    date: parseISO("2024-06-17"),
    start: "09:30",
    end: "18:00",
    location: "Sofia HQ",
    notes: "All customer lines covered.",
  },
  {
    id: 2,
    employee: "Support",
    date: parseISO("2024-06-18"),
    start: "08:00",
    end: "16:30",
    location: "Hybrid",
    notes: "Two agents working remotely.",
  },
  {
    id: 3,
    employee: "Marketing",
    date: parseISO("2024-06-19"),
    start: "10:00",
    end: "17:30",
    location: "Plovdiv office",
  },
];

const statusVariants: Record<LeaveRequest["status"], "secondary" | "default" | "destructive"> = {
  Approved: "secondary",
  Pending: "default",
  Declined: "destructive",
};

const formatDateRange = (start: Date, end: Date) => {
  const sameMonth = format(start, "MMMM", { locale: enUS }) === format(end, "MMMM", { locale: enUS });
  const monthFormat = sameMonth ? "d" : "d MMM";

  return `${format(start, `${monthFormat}`, { locale: enUS })} – ${format(end, "d MMM", { locale: enUS })}`;
};

const TimeOff = () => {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [scheduleEntries, setScheduleEntries] = useState(initialSchedule);
  const [formState, setFormState] = useState({
    employee: "",
    date: format(new Date(), "yyyy-MM-dd"),
    start: "09:00",
    end: "17:30",
    location: "Sofia HQ",
    notes: "",
  });

  const calendarDays = useMemo(() => {
    return leaveRequests.flatMap((request) =>
      eachDayOfInterval({ start: request.start, end: request.end }).map((day) => ({
        day,
        status: request.status,
      })),
    );
  }, [leaveRequests]);

  const modifiers = useMemo(
    () => ({
      approved: calendarDays.filter((entry) => entry.status === "Approved").map((entry) => entry.day),
      pending: calendarDays.filter((entry) => entry.status === "Pending").map((entry) => entry.day),
      rejected: calendarDays.filter((entry) => entry.status === "Declined").map((entry) => entry.day),
    }),
    [calendarDays],
  );

  const handleAddShift = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedDate = parseISO(formState.date);

    if (Number.isNaN(parsedDate.getTime())) {
      toast({
        title: "Invalid date",
        description: "Enter a valid date for the schedule entry.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: ScheduleEntry = {
      id: Date.now(),
      employee: formState.employee || "Unassigned team",
      date: parsedDate,
      start: formState.start,
      end: formState.end,
      location: formState.location,
      notes: formState.notes || undefined,
    };

    setScheduleEntries((prev) => [newEntry, ...prev].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setFormState((prev) => ({ ...prev, employee: "", notes: "" }));

    toast({
      title: "Schedule updated",
      description: `${newEntry.employee} was scheduled for ${format(newEntry.date, "d MMMM", { locale: enUS })}.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export in progress",
      description: "Generating a PDF with time-off and schedule details.",
    });
  };

  const summary = useMemo(() => {
    const approved = leaveRequests.filter((request) => request.status === "Approved").length;
    const pending = leaveRequests.filter((request) => request.status === "Pending").length;
    const rejected = leaveRequests.filter((request) => request.status === "Declined").length;
    const nextRequest = leaveRequests
      .filter((request) => request.status === "Approved" && isFuture(addDays(request.start, -1)))
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

    return {
      approved,
      pending,
      rejected,
      nextRequest,
    };
  }, [leaveRequests]);

  const upcomingSchedule = useMemo(
    () => scheduleEntries.filter((entry) => entry.date >= addDays(new Date(), -1)).slice(0, 5),
    [scheduleEntries],
  );

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Time off & scheduling"
          description="Track leave requests, coordinate shift coverage, and plan team availability."
          actions={(
            <>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" className="bg-gradient-primary text-white shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                New request
              </Button>
            </>
          )}
        />

        <div className="grid gap-6 p-6 xl:grid-cols-[2fr,1.1fr]">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Time-off calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                <DayPicker
                  mode="multiple"
                  selected={calendarDays.map((entry) => entry.day)}
                  modifiers={modifiers}
                  modifiersClassNames={{
                    approved: "bg-emerald-500/80 text-white hover:bg-emerald-500", // highlight approved days
                    pending: "bg-amber-500/80 text-white hover:bg-amber-500",
                    rejected: "bg-rose-500/80 text-white hover:bg-rose-500",
                  }}
                  className="rounded-xl border border-border/60 bg-card/80 shadow-inner"
                />
                <div className="space-y-4">
                  <div className="rounded-xl border border-border/60 bg-card/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Leave status</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          Approved
                        </span>
                        <span className="font-semibold">{summary.approved}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
                          Pending approval
                        </span>
                        <span className="font-semibold">{summary.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                          Declined
                        </span>
                        <span className="font-semibold">{summary.rejected}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Next approved leave</h3>
                    {summary.nextRequest ? (
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="font-medium text-foreground">{summary.nextRequest.employee}</p>
                        <p className="text-muted-foreground">
                          {summary.nextRequest.type} · {formatDateRange(summary.nextRequest.start, summary.nextRequest.end)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">No upcoming approved time off.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Upcoming shifts</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {upcomingSchedule.map((entry) => (
                        <li key={entry.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                          <div>
                            <p className="font-medium text-foreground">{entry.employee}</p>
                            <p className="text-muted-foreground">
                              {format(entry.date, "d MMMM", { locale: enUS })} · {entry.start} – {entry.end}
                            </p>
                          </div>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {entry.location}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  Team schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="grid gap-4 rounded-xl border border-border/60 bg-card/80 p-4 md:grid-cols-2" onSubmit={handleAddShift}>
                  <div className="md:col-span-1">
                    <Label htmlFor="employee">Team / employee</Label>
                    <Input
                      id="employee"
                      placeholder="e.g. Sales team"
                      value={formState.employee}
                      onChange={(event) => setFormState((prev) => ({ ...prev, employee: event.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formState.date}
                      onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="start">Start</Label>
                      <Input
                        id="start"
                        type="time"
                        value={formState.start}
                        onChange={(event) => setFormState((prev) => ({ ...prev, start: event.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="end">End</Label>
                      <Input
                        id="end"
                        type="time"
                        value={formState.end}
                        onChange={(event) => setFormState((prev) => ({ ...prev, end: event.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Office, remote..."
                      value={formState.location}
                      onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional context for the team"
                      value={formState.notes}
                      onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-end">
                    <Button type="submit" size="sm" className="bg-gradient-primary text-white shadow-glow">
                      <Plus className="mr-2 h-4 w-4" />
                      Add to schedule
                    </Button>
                  </div>
                </form>

                <div className="rounded-xl border border-border/60 bg-card/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[22%]">Team / employee</TableHead>
                        <TableHead className="w-[18%]">Date</TableHead>
                        <TableHead className="w-[18%]">Hours</TableHead>
                        <TableHead className="w-[18%]">Location</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduleEntries.map((entry) => (
                        <TableRow key={entry.id} className="border-t border-border/40">
                          <TableCell className="font-medium text-foreground">{entry.employee}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(entry.date, "d MMMM yyyy", { locale: enUS })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.start} – {entry.end}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-full px-3 py-1">
                              {entry.location}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.notes ? entry.notes : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">Time-off requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-border/60 bg-card/80 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{request.employee}</p>
                        <p className="text-xs text-muted-foreground">{request.type}</p>
                        <p className="text-xs text-muted-foreground/80">
                          {formatDateRange(request.start, request.end)}
                        </p>
                      </div>
                      <Badge variant={statusVariants[request.status]}>{request.status}</Badge>
                    </div>
                    {request.note && (
                      <p className="mt-3 text-xs text-muted-foreground">{request.note}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeOff;
