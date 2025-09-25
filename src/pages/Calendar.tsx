import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, isToday, parseISO, startOfWeek, subWeeks } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import {
  createCalendar,
  fetchCalendarEvents,
  fetchCalendars,
  fetchMyTasks,
  fetchUsersLookup,
  type CalendarEvent,
  type CalendarEventInput,
  type CalendarInput,
  type CalendarSummary,
  type TaskItem,
  upsertCalendarEvent,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CalendarFormValues {
  name: string;
  visibility: "Private" | "Shared" | "Public";
  sharedUserIds: string[];
}

interface EventFormValues {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay: boolean;
  taskId?: string;
}

const defaultCalendarValues: CalendarFormValues = {
  name: "",
  visibility: "Private",
  sharedUserIds: [],
};

const defaultEventValues: EventFormValues = {
  title: "",
  date: format(new Date(), "yyyy-MM-dd"),
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  isAllDay: false,
  taskId: "",
};

const Calendar = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [isCalendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [isEventDialogOpen, setEventDialogOpen] = useState(false);

  const weekRange = useMemo(() => {
    const start = currentWeekStart;
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }, [currentWeekStart]);

  const calendarsQuery = useQuery<CalendarSummary[]>({
    queryKey: ["calendars"],
    queryFn: () => fetchCalendars(token!),
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (calendarsQuery.data?.length && !selectedCalendarId) {
      setSelectedCalendarId(calendarsQuery.data[0].id);
    }
  }, [calendarsQuery.data, selectedCalendarId]);

  const weekEnd = useMemo(() => endOfWeek(currentWeekStart, { weekStartsOn: 1 }), [currentWeekStart]);

  const eventsQuery = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events", selectedCalendarId, currentWeekStart.toISOString()],
    queryFn: () =>
      fetchCalendarEvents(token!, selectedCalendarId!, {
        start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }).toISOString(),
        end: weekEnd.toISOString(),
      }),
    enabled: Boolean(token && selectedCalendarId),
  });

  const tasksQuery = useQuery<TaskItem[]>({
    queryKey: ["my-tasks"],
    queryFn: () => fetchMyTasks(token!),
    enabled: Boolean(token),
  });

  const usersQuery = useQuery({
    queryKey: ["users-lookup"],
    queryFn: () => fetchUsersLookup(token!),
    enabled: Boolean(token),
  });

  const calendarForm = useForm<CalendarFormValues>({ defaultValues: defaultCalendarValues });
  const eventForm = useForm<EventFormValues>({ defaultValues: defaultEventValues });

  const createCalendarMutation = useMutation({
    mutationFn: (payload: CalendarInput) => createCalendar(token!, payload),
    onSuccess: (calendar) => {
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      setSelectedCalendarId(calendar.id);
      toast({ title: "Calendar created", description: `${calendar.name} is ready to share.` });
      setCalendarDialogOpen(false);
      calendarForm.reset(defaultCalendarValues);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to create calendar";
      toast({ title: "Calendar error", description: message, variant: "destructive" });
    },
  });

  const upsertEventMutation = useMutation({
    mutationFn: (payload: CalendarEventInput) => upsertCalendarEvent(token!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events", selectedCalendarId] });
      toast({ title: "Event saved", description: "Your schedule has been updated." });
      setEventDialogOpen(false);
      eventForm.reset({
        ...defaultEventValues,
        date: format(currentWeekStart, "yyyy-MM-dd"),
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to save event";
      toast({ title: "Event error", description: message, variant: "destructive" });
    },
  });

  const handleCreateCalendar = (values: CalendarFormValues) => {
    createCalendarMutation.mutate({
      name: values.name,
      visibility: values.visibility,
      sharedUserIds: values.visibility === "Shared" ? values.sharedUserIds : [],
    });
  };

  const handleCreateEvent = (values: EventFormValues) => {
    if (!selectedCalendarId) return;

    const start = values.isAllDay ? new Date(`${values.date}T00:00:00`) : new Date(`${values.date}T${values.startTime}`);
    const end = values.isAllDay ? new Date(`${values.date}T23:59:59`) : new Date(`${values.date}T${values.endTime}`);

    upsertEventMutation.mutate({
      calendarId: selectedCalendarId,
      title: values.title,
      start: start.toISOString(),
      end: end.toISOString(),
      isAllDay: values.isAllDay,
      location: values.location ?? "",
      taskId: values.taskId ? values.taskId : null,
    });
  };

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }),
        end: weekEnd,
      }),
    [currentWeekStart, weekEnd],
  );

  const groupedEvents = useMemo(() => {
    const eventsByDay = new Map<string, CalendarEvent[]>();
    for (const day of weekDays) {
      eventsByDay.set(format(day, "yyyy-MM-dd"), []);
    }

    eventsQuery.data?.forEach((event) => {
      const key = format(parseISO(event.start), "yyyy-MM-dd");
      if (!eventsByDay.has(key)) {
        eventsByDay.set(key, []);
      }
      eventsByDay.get(key)!.push(event);
    });

    for (const [, events] of eventsByDay) {
      events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }

    return eventsByDay;
  }, [eventsQuery.data, weekDays]);

  const upcomingTasksWithoutEvents = useMemo(() => {
    if (!tasksQuery.data) return [] as TaskItem[];
    const linkedTaskIds = new Set(eventsQuery.data?.map((event) => event.taskId).filter(Boolean) as string[]);
    return tasksQuery.data.filter((task) => !linkedTaskIds.has(task.id)).slice(0, 4);
  }, [tasksQuery.data, eventsQuery.data]);

  const calendarName = calendarsQuery.data?.find((calendar) => calendar.id === selectedCalendarId)?.name ?? "";

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <div className="border-b border-border/40 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Release Project
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">Workload Overview</h1>
              <p className="text-sm text-muted-foreground">
                Coordinate teammates, tasks, and availability from a single shared calendar experience.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedCalendarId ?? ""} onValueChange={setSelectedCalendarId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  {calendarsQuery.data?.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isCalendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-dashed">
                    <Plus className="mr-2 h-4 w-4" />
                    New calendar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create calendar</DialogTitle>
                    <DialogDescription>Choose who can access this calendar and how it will be used.</DialogDescription>
                  </DialogHeader>
                  <Form {...calendarForm}>
                    <form onSubmit={calendarForm.handleSubmit(handleCreateCalendar)} className="space-y-6">
                      <FormField
                        control={calendarForm.control}
                        name="name"
                        rules={{ required: "Calendar name is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Team planning" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={calendarForm.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Visibility</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3">
                                <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                                  <RadioGroupItem value="Private" id="visibility-private" />
                                  <Label htmlFor="visibility-private" className="space-y-1">
                                    <span className="block text-sm font-medium text-foreground">Private</span>
                                    <span className="text-xs text-muted-foreground">Only you can see this calendar.</span>
                                  </Label>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                                  <RadioGroupItem value="Shared" id="visibility-shared" />
                                  <Label htmlFor="visibility-shared" className="space-y-1">
                                    <span className="block text-sm font-medium text-foreground">Shared</span>
                                    <span className="text-xs text-muted-foreground">Invite specific teammates to collaborate.</span>
                                  </Label>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                                  <RadioGroupItem value="Public" id="visibility-public" />
                                  <Label htmlFor="visibility-public" className="space-y-1">
                                    <span className="block text-sm font-medium text-foreground">Organization</span>
                                    <span className="text-xs text-muted-foreground">Visible to everyone in Native CRM.</span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {calendarForm.watch("visibility") === "Shared" && (
                        <FormField
                          control={calendarForm.control}
                          name="sharedUserIds"
                          render={() => (
                            <FormItem>
                              <FormLabel>Select teammates</FormLabel>
                              <FormMessage />
                              <ScrollArea className="h-48 rounded-lg border border-border/60">
                                <div className="space-y-2 p-3">
                                  {usersQuery.data?.map((user) => (
                                    <label key={user.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2 text-sm">
                                      <span className="font-medium text-foreground">{user.fullName}</span>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{user.email}</span>
                                        <Checkbox
                                          checked={calendarForm.watch("sharedUserIds").includes(user.id)}
                                          onCheckedChange={(checked) => {
                                            const current = calendarForm.getValues("sharedUserIds");
                                            if (checked === true) {
                                              calendarForm.setValue("sharedUserIds", [...current, user.id]);
                                            } else {
                                              calendarForm.setValue("sharedUserIds", current.filter((id) => id !== user.id));
                                            }
                                          }}
                                        />
                                      </div>
                                    </label>
                                  ))}
                                  {!usersQuery.data?.length && <p className="text-xs text-muted-foreground">Invite teammates to share this calendar.</p>}
                                </div>
                              </ScrollArea>
                            </FormItem>
                          )}
                        />
                      )}
                      <DialogFooter>
                        <Button type="submit" disabled={createCalendarMutation.isLoading}>
                          {createCalendarMutation.isLoading ? "Creating..." : "Create calendar"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog open={isEventDialogOpen} onOpenChange={setEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-primary text-white shadow-glow" disabled={!selectedCalendarId}>
                    <Plus className="mr-2 h-4 w-4" />
                    New event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule event</DialogTitle>
                    <DialogDescription>Attach tasks and set availability for your team.</DialogDescription>
                  </DialogHeader>
                  <Form {...eventForm}>
                    <form onSubmit={eventForm.handleSubmit(handleCreateEvent)} className="space-y-5">
                      <FormField
                        control={eventForm.control}
                        name="title"
                        rules={{ required: "Title is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Design review" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={eventForm.control}
                          name="date"
                          rules={{ required: true }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Zoom, HQ West, ..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={eventForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start</FormLabel>
                              <FormControl>
                                <Input type="time" disabled={eventForm.watch("isAllDay")} {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End</FormLabel>
                              <FormControl>
                                <Input type="time" disabled={eventForm.watch("isAllDay")} {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={eventForm.control}
                        name="isAllDay"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                            <div className="space-y-0.5">
                              <FormLabel>All-day event</FormLabel>
                              <p className="text-xs text-muted-foreground">Blocks the entire day for the selected calendar.</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="taskId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attach task (optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Link a task" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No linked task</SelectItem>
                                {tasksQuery.data?.map((task) => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={upsertEventMutation.isLoading}>
                          {upsertEventMutation.isLoading ? "Saving..." : "Save event"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 pb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart((week) => subWeeks(week, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-foreground">{weekRange}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart((week) => addWeeks(week, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                Today
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Week view</span>
              <span>•</span>
              <span className="text-xs uppercase tracking-wide">{calendarName}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
            <Card className="shadow-card">
              <CardHeader className="flex items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Weekly schedule</CardTitle>
                  <p className="text-xs text-muted-foreground">Plan sprints, interviews, and syncs for your team.</p>
                </div>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <CalendarIcon className="h-4 w-4" />
                  {eventsQuery.data?.length ?? 0} events
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4 lg:grid-cols-7">
                  {weekDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const events = groupedEvents.get(key) ?? [];
                    return (
                      <div key={key} className="rounded-xl border border-border/60 bg-white/70 p-3 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                          <span className="uppercase">{format(day, "EEE")}</span>
                          <Badge variant={isToday(day) ? "default" : "outline"} className="rounded-full px-2 py-0 text-[10px]">
                            {format(day, "d")}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-3">
                          {events.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No events</p>
                          ) : (
                            events.map((event) => {
                              const start = format(parseISO(event.start), "p");
                              const end = format(parseISO(event.end), "p");
                              const hasTask = Boolean(event.taskId);
                              return (
                                <div key={event.id} className="space-y-1 rounded-lg border border-border/50 bg-gradient-to-br from-primary/10 via-white to-white p-3 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-foreground line-clamp-2">{event.title}</p>
                                    {hasTask && <Badge variant="outline">Task</Badge>}
                                  </div>
                                  <p className="text-muted-foreground">{event.isAllDay ? "All day" : `${start} – ${end}`}</p>
                                  {event.location && <p className="text-muted-foreground/80">{event.location}</p>}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Upcoming tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {upcomingTasksWithoutEvents.length === 0 && <p>All tasks are already scheduled on your calendars.</p>}
                  {upcomingTasksWithoutEvents.map((task) => (
                    <div key={task.id} className="rounded-lg border border-border/40 bg-white/70 p-3 shadow-sm">
                      <p className="font-medium text-foreground">{task.title}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.status}</span>
                        {task.dueAt && <span>Due {format(parseISO(task.dueAt), "MMM d")}</span>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Shared calendars</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {calendarsQuery.data?.map((calendar) => (
                    <div key={calendar.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-white/80 px-3 py-2">
                      <div>
                        <p className="font-medium text-foreground">{calendar.name}</p>
                        <p className="text-xs text-muted-foreground">{calendar.visibility} • {calendar.sharedUserIds.length} collaborators</p>
                      </div>
                      <Badge variant={calendar.id === selectedCalendarId ? "default" : "outline"}>
                        {calendar.id === selectedCalendarId ? "Active" : "Available"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={() => setCalendarDialogOpen(true)}>
                    <Plus className="h-3 w-3" /> Invite teammates
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
