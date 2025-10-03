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
import { bg } from "date-fns/locale";

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  start: Date;
  end: Date;
  status: "Очаква потвърждение" | "Одобрена" | "Отказана";
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
    employee: "Мария Петрова",
    type: "Платен отпуск",
    start: parseISO("2024-07-02"),
    end: parseISO("2024-07-05"),
    status: "Одобрена",
    note: "Семейно пътуване, екипът е уведомен.",
  },
  {
    id: 2,
    employee: "Иван Димитров",
    type: "Неплатен отпуск",
    start: parseISO("2024-07-18"),
    end: parseISO("2024-07-19"),
    status: "Очаква потвърждение",
    note: "Очаква финален одобряващ.",
  },
  {
    id: 3,
    employee: "Елена Георгиева",
    type: "Работа от разстояние",
    start: parseISO("2024-06-24"),
    end: parseISO("2024-06-26"),
    status: "Одобрена",
  },
  {
    id: 4,
    employee: "Николай Иванов",
    type: "Болничен",
    start: parseISO("2024-06-14"),
    end: parseISO("2024-06-16"),
    status: "Отказана",
    note: "Не е предоставен болничен лист.",
  },
];

const initialSchedule: ScheduleEntry[] = [
  {
    id: 1,
    employee: "Екип Продажби",
    date: parseISO("2024-06-17"),
    start: "09:30",
    end: "18:00",
    location: "Офис София",
    notes: "Покрити всички клиентски линии.",
  },
  {
    id: 2,
    employee: "Поддръжка",
    date: parseISO("2024-06-18"),
    start: "08:00",
    end: "16:30",
    location: "Смесен режим",
    notes: "Двама души работят дистанционно.",
  },
  {
    id: 3,
    employee: "Маркетинг",
    date: parseISO("2024-06-19"),
    start: "10:00",
    end: "17:30",
    location: "Офис Пловдив",
  },
];

const statusVariants: Record<LeaveRequest["status"], "secondary" | "default" | "destructive"> = {
  "Одобрена": "secondary",
  "Очаква потвърждение": "default",
  "Отказана": "destructive",
};

const formatDateRange = (start: Date, end: Date) => {
  const sameMonth = format(start, "MMMM", { locale: bg }) === format(end, "MMMM", { locale: bg });
  const monthFormat = sameMonth ? "d" : "d MMM";

  return `${format(start, `${monthFormat}`, { locale: bg })} – ${format(end, "d MMM", { locale: bg })}`;
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
    location: "Офис София",
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
      approved: calendarDays.filter((entry) => entry.status === "Одобрена").map((entry) => entry.day),
      pending: calendarDays.filter((entry) => entry.status === "Очаква потвърждение").map((entry) => entry.day),
      rejected: calendarDays.filter((entry) => entry.status === "Отказана").map((entry) => entry.day),
    }),
    [calendarDays],
  );

  const handleAddShift = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedDate = parseISO(formState.date);

    if (Number.isNaN(parsedDate.getTime())) {
      toast({
        title: "Невалидна дата",
        description: "Моля, въведете коректна дата за графика.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: ScheduleEntry = {
      id: Date.now(),
      employee: formState.employee || "Неразпределен екип",
      date: parsedDate,
      start: formState.start,
      end: formState.end,
      location: formState.location,
      notes: formState.notes || undefined,
    };

    setScheduleEntries((prev) => [newEntry, ...prev].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setFormState((prev) => ({ ...prev, employee: "", notes: "" }));

    toast({
      title: "Графикът е обновен",
      description: `${newEntry.employee} е добавен за ${format(newEntry.date, "d MMMM", { locale: bg })}.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Експорт в процес",
      description: "Създава се PDF с отпуски и график.",
    });
  };

  const summary = useMemo(() => {
    const approved = leaveRequests.filter((request) => request.status === "Одобрена").length;
    const pending = leaveRequests.filter((request) => request.status === "Очаква потвърждение").length;
    const rejected = leaveRequests.filter((request) => request.status === "Отказана").length;
    const nextRequest = leaveRequests
      .filter((request) => request.status === "Одобрена" && isFuture(addDays(request.start, -1)))
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
          title="Отпуски и работно време"
          description="Следете заявките за отпуск, разпределяйте смени и планирайте заетостта на екипа."
          actions={(
            <>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Експортирай
              </Button>
              <Button size="sm" className="bg-gradient-primary text-white shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Нова заявка
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
                  Календар на отсъствията
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
                    <h3 className="text-sm font-semibold text-foreground">Статус на отпуските</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          Одобрени
                        </span>
                        <span className="font-semibold">{summary.approved}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
                          Чакат потвърждение
                        </span>
                        <span className="font-semibold">{summary.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                          Отказани
                        </span>
                        <span className="font-semibold">{summary.rejected}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Следващ одобрен отпуск</h3>
                    {summary.nextRequest ? (
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="font-medium text-foreground">{summary.nextRequest.employee}</p>
                        <p className="text-muted-foreground">
                          {summary.nextRequest.type} · {formatDateRange(summary.nextRequest.start, summary.nextRequest.end)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">Няма предстоящи одобрени отсъствия.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/80 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Предстоящи смени</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {upcomingSchedule.map((entry) => (
                        <li key={entry.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                          <div>
                            <p className="font-medium text-foreground">{entry.employee}</p>
                            <p className="text-muted-foreground">
                              {format(entry.date, "d MMMM", { locale: bg })} · {entry.start} – {entry.end}
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
                  График по екипи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="grid gap-4 rounded-xl border border-border/60 bg-card/80 p-4 md:grid-cols-2" onSubmit={handleAddShift}>
                  <div className="md:col-span-1">
                    <Label htmlFor="employee">Екип / служител</Label>
                    <Input
                      id="employee"
                      placeholder="Пр. Екип Продажби"
                      value={formState.employee}
                      onChange={(event) => setFormState((prev) => ({ ...prev, employee: event.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="date">Дата</Label>
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
                      <Label htmlFor="start">От</Label>
                      <Input
                        id="start"
                        type="time"
                        value={formState.start}
                        onChange={(event) => setFormState((prev) => ({ ...prev, start: event.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="end">До</Label>
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
                    <Label htmlFor="location">Локация</Label>
                    <Input
                      id="location"
                      placeholder="Офис, дистанционно..."
                      value={formState.location}
                      onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Бележки</Label>
                    <Textarea
                      id="notes"
                      placeholder="Допълнителни указания за екипа"
                      value={formState.notes}
                      onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-end">
                    <Button type="submit" size="sm" className="bg-gradient-primary text-white shadow-glow">
                      <Plus className="mr-2 h-4 w-4" />
                      Добави към графика
                    </Button>
                  </div>
                </form>

                <div className="rounded-xl border border-border/60 bg-card/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[22%]">Екип / служител</TableHead>
                        <TableHead className="w-[18%]">Дата</TableHead>
                        <TableHead className="w-[18%]">Часове</TableHead>
                        <TableHead className="w-[18%]">Локация</TableHead>
                        <TableHead>Бележки</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduleEntries.map((entry) => (
                        <TableRow key={entry.id} className="border-t border-border/40">
                          <TableCell className="font-medium text-foreground">{entry.employee}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(entry.date, "d MMMM yyyy", { locale: bg })}
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
                <CardTitle className="text-lg font-semibold text-foreground">Заявки за отпуск</CardTitle>
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
