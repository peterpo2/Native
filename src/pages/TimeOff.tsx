import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  BadgeCheck,
  BellRing,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Download,
  Plus,
  Users,
} from "lucide-react";
import {
  addDays,
  eachDayOfInterval,
  format,
  isFuture,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
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

const statusAccent: Record<LeaveRequest["status"], string> = {
  Approved: "bg-emerald-500",
  Pending: "bg-amber-500",
  Declined: "bg-rose-500",
};

const formatDateRange = (start: Date, end: Date) => {
  const sameMonth = format(start, "MMMM", { locale: enUS }) === format(end, "MMMM", { locale: enUS });
  const monthFormat = sameMonth ? "d" : "d MMM";

  return `${format(start, `${monthFormat}`, { locale: enUS })} – ${format(end, "d MMM", { locale: enUS })}`;
};

const TimeOff = () => {
  const { toast } = useToast();
  const [leaveRequests] = useState(initialLeaveRequests);
  const [scheduleEntries, setScheduleEntries] = useState(initialSchedule);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("schedule");
  const [formState, setFormState] = useState({
    employee: "",
    date: format(new Date(), "yyyy-MM-dd"),
    start: "09:00",
    end: "17:30",
    location: "Sofia HQ",
    notes: "",
  });

  useEffect(() => {
    if (selectedDate) {
      setFormState((previous) => ({ ...previous, date: format(selectedDate, "yyyy-MM-dd") }));
    }
  }, [selectedDate]);

  const calendarHighlights = useMemo(() => {
    const allDays = leaveRequests.flatMap((request) =>
      eachDayOfInterval({ start: request.start, end: request.end }).map((day) => ({
        day,
        status: request.status,
      })),
    );

    const modifiers = {
      approved: allDays.filter((entry) => entry.status === "Approved").map((entry) => entry.day),
      pending: allDays.filter((entry) => entry.status === "Pending").map((entry) => entry.day),
      declined: allDays.filter((entry) => entry.status === "Declined").map((entry) => entry.day),
    } as const;

    return modifiers;
  }, [leaveRequests]);

  const summary = useMemo(() => {
    const approved = leaveRequests.filter((request) => request.status === "Approved").length;
    const pending = leaveRequests.filter((request) => request.status === "Pending").length;
    const rejected = leaveRequests.filter((request) => request.status === "Declined").length;
    const nextRequest = leaveRequests
      .filter((request) => request.status === "Approved" && isFuture(addDays(request.start, -1)))
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

    const peopleAwayToday = selectedDate
      ? leaveRequests.filter((request) =>
          isWithinInterval(selectedDate, { start: request.start, end: request.end }),
        ).length
      : 0;

    return {
      approved,
      pending,
      rejected,
      nextRequest,
      peopleAwayToday,
    };
  }, [leaveRequests, selectedDate]);

  const selectedDateRequests = useMemo(() => {
    if (!selectedDate) return [];

    return leaveRequests.filter((request) =>
      isWithinInterval(selectedDate, { start: request.start, end: request.end }),
    );
  }, [leaveRequests, selectedDate]);

  const selectedDateShifts = useMemo(() => {
    if (!selectedDate) return [];

    return scheduleEntries.filter((entry) => isSameDay(entry.date, selectedDate));
  }, [scheduleEntries, selectedDate]);

  const upcomingSchedule = useMemo(
    () => scheduleEntries.filter((entry) => entry.date >= addDays(new Date(), -1)).slice(0, 6),
    [scheduleEntries],
  );

  const sortedRequests = useMemo(
    () =>
      [...leaveRequests].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "Pending" ? -1 : b.status === "Pending" ? 1 : 0;
        }

        return a.start.getTime() - b.start.getTime();
      }),
    [leaveRequests],
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

    setScheduleEntries((previous) =>
      [newEntry, ...previous].sort((a, b) => a.date.getTime() - b.date.getTime()),
    );
    setFormState((previous) => ({ ...previous, employee: "", notes: "" }));
    setSelectedDate(parsedDate);

    toast({
      title: "Schedule updated",
      description: `${newEntry.employee} was scheduled for ${format(newEntry.date, "d MMMM", {
        locale: enUS,
      })}.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export in progress",
      description: "Generating a PDF with time-off and schedule details.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-muted/20">
        <PageHeader
          title="Time off & scheduling"
          description="See who is away, assign coverage, and make quick updates with a single view."
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

        <main className="space-y-6 p-6 pb-10">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Approved time off</p>
                  <p className="text-2xl font-semibold text-foreground">{summary.approved}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Pending approvals</p>
                  <p className="text-2xl font-semibold text-foreground">{summary.pending}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-rose-100 p-2 text-rose-700">
                  <CalendarRange className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Declined requests</p>
                  <p className="text-2xl font-semibold text-foreground">{summary.rejected}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Away on selected day</p>
                  <p className="text-2xl font-semibold text-foreground">{summary.peopleAwayToday}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.55fr,1fr]">
            <Card className="shadow-card">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Team calendar
                  </span>
                  {selectedDate && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {format(selectedDate, "EEEE, d MMMM", { locale: enUS })}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
                <div className="rounded-2xl border border-border/60 bg-card/80 p-3 shadow-inner">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={calendarHighlights}
                    modifiersClassNames={{
                      approved:
                        "bg-emerald-500/80 text-white hover:bg-emerald-500 focus:bg-emerald-500",
                      pending:
                        "bg-amber-500/80 text-white hover:bg-amber-500 focus:bg-amber-500",
                      declined:
                        "bg-rose-500/80 text-white hover:bg-rose-500 focus:bg-rose-500",
                    }}
                    className="mx-auto"
                  />
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Declined
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Selected day overview</h3>
                    {selectedDateRequests.length === 0 && selectedDateShifts.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">No activity scheduled for this date.</p>
                    ) : (
                      <div className="mt-3 space-y-4 text-sm">
                        {selectedDateRequests.length > 0 && (
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">Time off</p>
                            <ul className="mt-2 space-y-2">
                              {selectedDateRequests.map((request) => (
                                <li
                                  key={request.id}
                                  className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/40 px-3 py-2"
                                >
                                  <div>
                                    <p className="font-medium text-foreground">{request.employee}</p>
                                    <p className="text-xs text-muted-foreground">{request.type}</p>
                                  </div>
                                  <Badge variant={statusVariants[request.status]}>{request.status}</Badge>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedDateShifts.length > 0 && (
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">Shifts</p>
                            <ul className="mt-2 space-y-2">
                              {selectedDateShifts.map((entry) => (
                                <li
                                  key={entry.id}
                                  className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/40 px-3 py-2"
                                >
                                  <div>
                                    <p className="font-medium text-foreground">{entry.employee}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {entry.start} – {entry.end}
                                    </p>
                                  </div>
                                  <Badge variant="secondary" className="whitespace-nowrap">
                                    {entry.location}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
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
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="border-b border-border/60 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    Planner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-muted/40">
                      <TabsTrigger value="schedule">Schedule</TabsTrigger>
                      <TabsTrigger value="requests">Requests</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedule" className="mt-4 space-y-4">
                      <div className="rounded-xl border border-border/60 bg-card/80">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-[22%]">Team / employee</TableHead>
                              <TableHead className="w-[20%]">Date</TableHead>
                              <TableHead className="w-[20%]">Hours</TableHead>
                              <TableHead className="w-[18%]">Location</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scheduleEntries.map((entry) => (
                              <TableRow key={entry.id} className="border-t border-border/40">
                                <TableCell className="font-medium text-foreground">{entry.employee}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {format(entry.date, "d MMM yyyy", { locale: enUS })}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {entry.start} – {entry.end}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                                    {entry.location}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{entry.notes ? entry.notes : "—"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Upcoming highlights</h3>
                        <ul className="mt-3 space-y-2 text-sm">
                          {upcomingSchedule.map((entry) => (
                            <li
                              key={entry.id}
                              className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/40 px-3 py-2"
                            >
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
                    </TabsContent>

                    <TabsContent value="requests" className="mt-4 space-y-3">
                      {sortedRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/80 p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{request.employee}</p>
                            <p className="text-xs text-muted-foreground">{request.type}</p>
                            <p className="text-xs text-muted-foreground/80">
                              {formatDateRange(request.start, request.end)}
                            </p>
                            {request.note && (
                              <p className="mt-2 text-xs text-muted-foreground">{request.note}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-2 text-xs font-semibold ${statusAccent[request.status]} rounded-full px-3 py-1 text-white`}>
                            {request.status}
                          </span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="border-b border-border/60 pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">Add to schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="grid gap-4" onSubmit={handleAddShift}>
                    <div>
                      <Label htmlFor="employee">Team / employee</Label>
                      <Input
                        id="employee"
                        placeholder="e.g. Sales team"
                        value={formState.employee}
                        onChange={(event) =>
                          setFormState((previous) => ({ ...previous, employee: event.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formState.date}
                          onChange={(event) =>
                            setFormState((previous) => ({ ...previous, date: event.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="Office, remote..."
                          value={formState.location}
                          onChange={(event) =>
                            setFormState((previous) => ({ ...previous, location: event.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="start">Start</Label>
                        <Input
                          id="start"
                          type="time"
                          value={formState.start}
                          onChange={(event) =>
                            setFormState((previous) => ({ ...previous, start: event.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end">End</Label>
                        <Input
                          id="end"
                          type="time"
                          value={formState.end}
                          onChange={(event) =>
                            setFormState((previous) => ({ ...previous, end: event.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional context for the team"
                        value={formState.notes}
                        onChange={(event) =>
                          setFormState((previous) => ({ ...previous, notes: event.target.value }))
                        }
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" className="bg-gradient-primary text-white shadow-glow">
                        <Plus className="mr-2 h-4 w-4" />
                        Add to schedule
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default TimeOff;
