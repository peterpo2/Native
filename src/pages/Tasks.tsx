import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, parseISO } from "date-fns";
import { CheckCircle2, Filter, Plus, RefreshCw, Timer } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createTask, fetchMyTasks, type TaskInput, type TaskItem } from "@/lib/api";

const statusColors: Record<string, string> = {
  Todo: "border border-border/70 bg-muted/40 text-muted-foreground",
  "In Progress": "border border-primary/40 bg-primary/15 text-primary",
  Review: "border border-amber-500/40 bg-amber-500/15 text-amber-300",
  Done: "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
};

const priorities: { label: string; value: TaskInput["priority"] }[] = [
  { label: "Low", value: "Low" },
  { label: "Normal", value: "Normal" },
  { label: "High", value: "High" },
  { label: "Urgent", value: "Urgent" },
];

const statusOrder = ["Todo", "In Progress", "Review", "Done"];

const defaultTaskValues: TaskInput & { title: string } = {
  title: "",
  description: "",
  status: "Todo",
  priority: "Normal",
  dueAt: "",
  assigneeId: "",
  projectId: null,
};

const Tasks = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery<TaskItem[]>({
    queryKey: ["my-tasks"],
    queryFn: () => fetchMyTasks(token!),
    enabled: Boolean(token),
  });

  const taskForm = useForm({ defaultValues: defaultTaskValues });

  const createTaskMutation = useMutation({
    mutationFn: (payload: TaskInput & { title: string }) =>
      createTask(token!, {
        ...payload,
        assigneeId: payload.assigneeId || null,
        dueAt: payload.dueAt || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      toast({ title: "Task created", description: "Your task has been added to the board." });
      setDialogOpen(false);
      taskForm.reset(defaultTaskValues);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to create task";
      toast({ title: "Task error", description: message, variant: "destructive" });
    },
  });

  const handleCreateTask = (values: TaskInput & { title: string }) => {
    createTaskMutation.mutate(values);
  };

  const handleFilter = () => {
    toast({
      title: "Filters",
      description: "Segment tasks by status, priority, or due dates to focus your day.",
    });
  };

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "Done").length;
    const overdue = tasks.filter((task) => task.dueAt && isPast(parseISO(task.dueAt)) && task.status !== "Done").length;
    return {
      total,
      completed,
      overdue,
      onTime: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const orderedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        if (statusDiff !== 0) return statusDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }),
    [tasks],
  );

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <div className="border-b border-border/60 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
          <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                My tasks
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">Execution Hub</h1>
              <p className="text-sm text-muted-foreground">
                Keep personal priorities, sprint work, and blockers aligned with your team objectives.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-primary text-white shadow-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    New task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create task</DialogTitle>
                    <DialogDescription>Break work into actionable steps and assign deadlines.</DialogDescription>
                  </DialogHeader>
                  <Form {...taskForm}>
                    <form onSubmit={taskForm.handleSubmit(handleCreateTask)} className="space-y-5">
                      <FormField
                        control={taskForm.control}
                        name="title"
                        rules={{ required: "Title is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Draft release notes" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taskForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Add supporting details" className="resize-none" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={taskForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? "Todo"}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOrder.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taskForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? "Normal"}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  {priorities.map((priority) => (
                                    <SelectItem key={priority.value} value={priority.value ?? "Normal"}>
                                      {priority.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={taskForm.control}
                          name="dueAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taskForm.control}
                          name="assigneeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assignee (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Add teammate ID" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createTaskMutation.isLoading}>
                          {createTaskMutation.isLoading ? "Creating..." : "Create task"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader className="flex items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Open tasks</CardTitle>
                <CardDescription className="text-xs">Work assigned to you</CardDescription>
              </div>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">{metrics.completed} completed so far</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">On-time delivery</CardTitle>
              <CardDescription className="text-xs">Percent of tasks finished by due date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={metrics.onTime} />
              <p className="text-xs text-muted-foreground">{metrics.onTime}% success rate</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <CardDescription className="text-xs">Tasks needing immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">{metrics.overdue}</div>
              <p className="text-xs text-muted-foreground">Follow up with owners today</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 px-6 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Active work</h2>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Timer className="h-3.5 w-3.5" /> {tasks.length} total
            </Badge>
          </div>

          <div className="space-y-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading your tasks…</p>}
            {!isLoading && orderedTasks.length === 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">You&apos;re all caught up</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">Create a task to start planning your next milestone.</CardDescription>
                </CardHeader>
              </Card>
            )}
            {orderedTasks.map((task) => {
              const dueDate = task.dueAt ? format(parseISO(task.dueAt), "MMM d") : "No due date";
              const statusBadge = statusColors[task.status] ?? "border border-border/70 bg-muted/40 text-muted-foreground";
              const completion = task.status === "Done" ? 100 : task.status === "Review" ? 75 : task.status === "In Progress" ? 50 : 15;
              return (
                <Card key={task.id} className="shadow-card">
                  <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">{task.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Created {format(parseISO(task.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge className={`flex items-center gap-1 px-3 py-1 text-xs font-medium ${statusBadge}`}>
                      {task.status === "Done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Timer className="h-3.5 w-3.5" />}
                      {task.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <Progress value={completion} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Priority: {task.priority}</span>
                      <span>{dueDate}</span>
                    </div>
                    {task.description && <p className="text-sm text-muted-foreground/90">{task.description}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
