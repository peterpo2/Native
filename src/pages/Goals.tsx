import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type GoalStatus = "Not started" | "In progress" | "At risk" | "Completed";

type Goal = {
  id: number;
  title: string;
  owner: string;
  timeline: string;
  status: GoalStatus;
  progress: number;
  description: string;
};

type GoalFormValues = {
  title: string;
  owner: string;
  timeline: string;
  status: GoalStatus;
  progress: number;
  description: string;
};

const defaultGoalValues: GoalFormValues = {
  title: "",
  owner: "",
  timeline: "",
  status: "Not started",
  progress: 40,
  description: "",
};

const statusOptions: { label: string; value: GoalStatus }[] = [
  { label: "Not started", value: "Not started" },
  { label: "In progress", value: "In progress" },
  { label: "At risk", value: "At risk" },
  { label: "Completed", value: "Completed" },
];

const statusStyles: Record<GoalStatus, string> = {
  "Not started": "border border-border/60 bg-muted/50 text-muted-foreground",
  "In progress": "border border-primary/60 bg-primary/15 text-primary",
  "At risk": "border border-amber-500/60 bg-amber-500/15 text-amber-300",
  Completed: "border border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
};

const seededGoals: Goal[] = [
  {
    id: 1,
    title: "Launch mobile app",
    owner: "Product Management",
    timeline: "Q1 2025",
    status: "In progress",
    progress: 65,
    description: "Ship the first version of the companion mobile app with core collaboration features.",
  },
  {
    id: 2,
    title: "Expand enterprise ARR",
    owner: "Strategic Sales",
    timeline: "H1 2025",
    status: "At risk",
    progress: 40,
    description: "Accelerate mid-market expansion with bundled adoption programs and enablement.",
  },
  {
    id: 3,
    title: "Improve CSAT",
    owner: "Customer Experience",
    timeline: "Q2 2025",
    status: "Not started",
    progress: 20,
    description: "Launch a refreshed onboarding journey with proactive support touchpoints.",
  },
];

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>(seededGoals);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  const goalForm = useForm<GoalFormValues>({ defaultValues: defaultGoalValues });

  const metrics = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((goal) => goal.status === "Completed").length;
    const averageProgress =
      total === 0 ? 0 : Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / total);

    return {
      total,
      completed,
      averageProgress,
    };
  }, [goals]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGoalId(null);
    goalForm.reset(defaultGoalValues);
  };

  const handleCreateGoal = () => {
    setEditingGoalId(null);
    goalForm.reset(defaultGoalValues);
    setDialogOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    const { id: _goalId, ...formValues } = goal;
    goalForm.reset(formValues);
    setDialogOpen(true);
  };

  const onSubmit = (values: GoalFormValues) => {
    const clampedProgress = Math.min(100, Math.max(0, values.progress));

    if (editingGoalId) {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === editingGoalId
            ? {
                ...goal,
                ...values,
                progress: clampedProgress,
              }
            : goal,
        ),
      );
    } else {
      setGoals((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...values,
          progress: clampedProgress,
        },
      ]);
    }

    handleCloseDialog();
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Goals"
          description="Align teams around measurable outcomes and monitor progress in real time."
          actions={
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (open) {
                  setDialogOpen(true);
                } else {
                  handleCloseDialog();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  onClick={handleCreateGoal}
                  className="bg-gradient-primary text-white shadow-glow"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGoalId ? "Edit goal" : "Create goal"}</DialogTitle>
                  <DialogDescription>
                    Set outcomes, owners, and success milestones so your team can execute with clarity.
                  </DialogDescription>
                </DialogHeader>
                <Form {...goalForm}>
                  <form onSubmit={goalForm.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={goalForm.control}
                      name="title"
                      rules={{ required: "Goal name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal name</FormLabel>
                          <FormControl>
                            <Input placeholder="Launch APAC expansion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={goalForm.control}
                        name="owner"
                        rules={{ required: "Owner is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner</FormLabel>
                            <FormControl>
                              <Input placeholder="Revenue Operations" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={goalForm.control}
                        name="timeline"
                        rules={{ required: "Timeline is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeline</FormLabel>
                            <FormControl>
                              <Input placeholder="Q3 2025" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={goalForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={goalForm.control}
                        name="progress"
                        rules={{
                          min: { value: 0, message: "Progress must be at least 0%" },
                          max: { value: 100, message: "Progress cannot exceed 100%" },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Progress (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                {...field}
                                onChange={(event) => field.onChange(Number(event.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={goalForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Outline the key deliverables and outcomes" className="resize-none" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingGoalId ? "Save changes" : "Create goal"}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />
        <div className="grid gap-6 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Goals</CardTitle>
                <CardDescription className="text-2xl font-semibold text-foreground">
                  {metrics.total}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Completed</CardTitle>
                <CardDescription className="text-2xl font-semibold text-foreground">
                  {metrics.completed}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Avg. progress</CardTitle>
                <CardDescription className="text-2xl font-semibold text-foreground">
                  {metrics.averageProgress}%
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id} className="flex flex-col justify-between shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle className="text-base font-semibold text-foreground">{goal.title}</CardTitle>
                      <Badge className={`w-fit text-xs ${statusStyles[goal.status]}`}>{goal.status}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEditGoal(goal)}
                      aria-label={`Edit ${goal.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p className="leading-relaxed">{goal.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <div className="grid gap-1 text-xs text-muted-foreground/90">
                    <span>
                      <span className="font-semibold text-foreground">Owner:</span> {goal.owner}
                    </span>
                    <span>
                      <span className="font-semibold text-foreground">Timeline:</span> {goal.timeline}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {goals.length === 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">No goals yet</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Create your first goal to align the team around what matters most.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Goals;
