import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, UsersRound, ShieldCheck } from "lucide-react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  fetchCalendarEvents,
  fetchCalendars,
  fetchUsersLookup,
  type CalendarEvent,
  type CalendarSummary,
  type UserLookupItem,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const visibilityCopy: Record<CalendarSummary["visibility"], string> = {
  Private: "Visible only to the owner.",
  Shared: "Shared with selected teammates.",
  Public: "Discoverable by everyone in the workspace.",
};

const Dashboards = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAdmin && user?.id) {
      setOwnerFilter(user.id);
    }
    if (isAdmin) {
      setOwnerFilter("all");
    }
  }, [isAdmin, user?.id]);

  const calendarsQuery = useQuery({
    queryKey: ["dashboards", "calendars", token],
    queryFn: () => fetchCalendars(token!),
    enabled: Boolean(token),
  });

  const usersLookupQuery = useQuery({
    queryKey: ["dashboards", "users-lookup", token],
    queryFn: () => fetchUsersLookup(token!),
    enabled: Boolean(token),
  });

  const usersMap = useMemo(() => {
    const lookup = new Map<string, UserLookupItem>();
    usersLookupQuery.data?.forEach((item) => lookup.set(item.id, item));
    if (user) {
      lookup.set(user.id, { id: user.id, email: user.email, fullName: user.fullName });
    }
    return lookup;
  }, [usersLookupQuery.data, user]);

  const ownerOptions = useMemo(() => {
    if (!calendarsQuery.data) return [] as { value: string; label: string }[];
    const counts = new Map<string, number>();
    calendarsQuery.data.forEach((calendar) => {
      counts.set(calendar.ownerId, (counts.get(calendar.ownerId) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([ownerId, count]) => {
        const ownerName = usersMap.get(ownerId)?.fullName ?? (ownerId === user?.id ? user.fullName : "Unknown owner");
        return {
          value: ownerId,
          label: `${ownerName} (${count})`,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [calendarsQuery.data, usersMap, user]);

  const visibleCalendars = useMemo(() => {
    if (!calendarsQuery.data) return [] as CalendarSummary[];
    if (!isAdmin) return calendarsQuery.data;
    if (ownerFilter === "all") return calendarsQuery.data;
    return calendarsQuery.data.filter((calendar) => calendar.ownerId === ownerFilter);
  }, [calendarsQuery.data, isAdmin, ownerFilter]);

  const groupedCalendars = useMemo(() => {
    const groups = new Map<string, CalendarSummary[]>();
    visibleCalendars.forEach((calendar) => {
      const calendarsForOwner = groups.get(calendar.ownerId) ?? [];
      calendarsForOwner.push(calendar);
      groups.set(calendar.ownerId, calendarsForOwner);
    });

    return Array.from(groups.entries())
      .map(([ownerId, calendars]) => ({
        ownerId,
        ownerName: usersMap.get(ownerId)?.fullName ?? (ownerId === user?.id ? user.fullName : "Unknown owner"),
        calendars: calendars.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.ownerName.localeCompare(b.ownerName));
  }, [usersMap, user, visibleCalendars]);

  const todayStart = useMemo(() => startOfDay(new Date()), []);
  const rangeEnd = useMemo(() => addDays(todayStart, 30), [todayStart]);
  const rangeKey = `${todayStart.toISOString()}_${rangeEnd.toISOString()}`;

  const eventsQueries = useQueries({
    queries:
      token && calendarsQuery.data
        ? calendarsQuery.data.map((calendar) => ({
            queryKey: ["dashboards", "calendar-events", calendar.id, rangeKey, token],
            queryFn: () => fetchCalendarEvents(token!, calendar.id, {
              start: todayStart.toISOString(),
              end: rangeEnd.toISOString(),
            }),
            enabled: Boolean(token),
            select: (events: CalendarEvent[]) =>
              events
                .filter((event) => new Date(event.end) >= todayStart)
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                .slice(0, 4),
          }))
        : [],
  });

  const eventsByCalendar = useMemo(() => {
    const map = new Map<string, { events: CalendarEvent[]; isLoading: boolean; isError: boolean }>();
    if (!calendarsQuery.data) return map;

    calendarsQuery.data.forEach((calendar, index) => {
      const query = eventsQueries[index];
      map.set(calendar.id, {
        events: query?.data ?? [],
        isLoading: query?.isLoading ?? false,
        isError: query?.isError ?? false,
      });
    });

    return map;
  }, [calendarsQuery.data, eventsQueries]);

  const getSharedUsers = (calendar: CalendarSummary) =>
    calendar.sharedUserIds
      .map((id) => usersMap.get(id))
      .filter(Boolean) as UserLookupItem[];

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Team calendars"
          description="Monitor every team's availability and stay aligned across private, shared, and organization-wide schedules."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && ownerOptions.length > 0 && (
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Filter by owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All calendars</SelectItem>
                    {ownerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button asChild variant="outline">
                <Link to="/calendar">
                  Manage calendars
                </Link>
              </Button>
            </div>
          }
        />

        <div className="flex-1 space-y-6 p-6">
          {calendarsQuery.isLoading && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border border-border/40 bg-card/60 shadow-card">
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-4/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {calendarsQuery.isError && (
            <Card className="border border-destructive/50 bg-destructive/10">
              <CardHeader>
                <CardTitle className="text-destructive">Unable to load calendars</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-destructive/80">
                Please try refreshing the page or contact your workspace administrator.
              </CardContent>
            </Card>
          )}

          {!calendarsQuery.isLoading && !calendarsQuery.isError && groupedCalendars.length === 0 && (
            <Card className="border border-border/60 bg-card/70 text-center shadow-card">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg font-semibold text-foreground">No calendars available</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {isAdmin
                    ? "Create a calendar for each team to keep schedules connected."
                    : "Once your administrator shares calendars with you, they will appear here."}
                </p>
                <Button asChild className="bg-gradient-primary text-white shadow-glow">
                  <Link to="/calendar">Create your first calendar</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {groupedCalendars.map((group) => (
            <section key={group.ownerId} className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <UsersRound className="h-4 w-4" />
                  <span>{group.ownerName}</span>
                </div>
                <Badge variant="outline" className="text-xs font-medium">
                  {group.calendars.length} {group.calendars.length === 1 ? "calendar" : "calendars"}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.calendars.map((calendar) => {
                  const eventState = eventsByCalendar.get(calendar.id);
                  const sharedUsers = getSharedUsers(calendar);

                  return (
                    <Card key={calendar.id} className="border border-border/60 bg-card/80 shadow-card">
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg font-semibold text-foreground">{calendar.name}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {calendar.visibility.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          {visibilityCopy[calendar.visibility]}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-xs font-medium uppercase text-muted-foreground">Shared with</div>
                          {sharedUsers.length > 0 ? (
                            <div className="flex items-center gap-2">
                              {sharedUsers.slice(0, 4).map((sharedUser, index) => (
                                <Avatar
                                  key={sharedUser.id}
                                  className={cn(
                                    "h-8 w-8 border border-background text-xs font-semibold text-foreground",
                                    index > 0 && "-ml-2",
                                  )}
                                >
                                  <AvatarFallback className="bg-gradient-accent text-white">
                                    {sharedUser.fullName
                                      .split(" ")
                                      .map((part) => part[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {sharedUsers.length > 4 && (
                                <div className="text-xs text-muted-foreground">+{sharedUsers.length - 4} more</div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {calendar.visibility === "Private"
                                ? "Only the owner can view this calendar."
                                : "Not shared with specific teammates yet."}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                            <span>Upcoming events</span>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <CalendarIcon className="h-4 w-4" />
                              Next 30 days
                            </div>
                          </div>
                          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                            {eventState?.isLoading && (
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                              </div>
                            )}
                            {eventState?.isError && (
                              <p className="text-xs text-destructive">Unable to load events.</p>
                            )}
                            {!eventState?.isLoading && !eventState?.isError && (
                              <>
                                {eventState?.events.length ? (
                                  eventState.events.map((event) => (
                                    <div
                                      key={event.id}
                                      className="flex items-start gap-3 rounded-lg bg-background/80 p-3 shadow-sm"
                                    >
                                      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-[11px] font-semibold uppercase text-primary">
                                        <span>{format(parseISO(event.start), "MMM")}</span>
                                        <span className="text-base leading-none">{format(parseISO(event.start), "d")}</span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {event.isAllDay
                                            ? "All day"
                                            : `${format(parseISO(event.start), "p")} - ${format(parseISO(event.end), "p")}`}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    No scheduled events in the next 30 days.
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboards;
