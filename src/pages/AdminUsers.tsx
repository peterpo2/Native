import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import {
  AdminUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type UpdateUserInput,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

interface UpdateUserFormValues {
  fullName: string;
  email: string;
  role: string;
  password: string;
  organizationId: string;
  twoFactorEnabled: boolean;
}

const defaultFormValues: UpdateUserFormValues = {
  fullName: "",
  email: "",
  role: "",
  password: "",
  organizationId: "",
  twoFactorEnabled: false,
};

const AdminUsers = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(token!),
    enabled: Boolean(token),
  });

  const form = useForm<UpdateUserFormValues>({
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        role: selectedUser.role,
        password: "",
        organizationId: selectedUser.organizationId ?? "",
        twoFactorEnabled: selectedUser.isTwoFactorEnabled,
      });
    }
  }, [selectedUser, form]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: UpdateUserInput }) => {
      if (!token) {
        throw new Error("Missing authentication token");
      }
      return updateUser(token, id, values);
    },
    onSuccess: (updated) => {
      toast({
        title: "User updated",
        description: `${updated.fullName} has been updated successfully.`,
      });
      setDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to update user";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) {
        throw new Error("Missing authentication token");
      }
      await deleteUser(token, id);
    },
    onSuccess: () => {
      toast({ title: "User deleted", description: "The account has been removed." });
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to delete user";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    },
  });

  const onSubmit = (values: UpdateUserFormValues) => {
    if (!selectedUser) return;

    const payload: UpdateUserInput = {
      fullName: values.fullName.trim() || undefined,
      email: values.email.trim() || undefined,
      role: values.role.trim() || undefined,
      password: values.password.trim() ? values.password : undefined,
      organizationId: values.organizationId.trim() ? values.organizationId.trim() : undefined,
      twoFactorEnabled: values.twoFactorEnabled,
    };

    updateMutation.mutate({ id: selectedUser.id, values: payload });
  };

  const sortedUsers = useMemo(() => {
    if (!usersQuery.data) return [] as AdminUser[];
    return [...usersQuery.data].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [usersQuery.data]);

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="User administration"
          description="Review every account in the workspace, adjust credentials, and remove access when required."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => usersQuery.refetch()}
              disabled={usersQuery.isFetching}
            >
              Refresh
            </Button>
          }
        />

        <div className="p-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Directory access
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {usersQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : usersQuery.isError ? (
                <p className="text-sm text-destructive">
                  {(usersQuery.error as Error)?.message ?? "Unable to load users."}
                </p>
              ) : sortedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {entry.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.isTwoFactorEnabled ? "default" : "outline"}>
                            {entry.isTwoFactorEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(entry.createdAt), "PP")}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(entry);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setUserToDelete(entry)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
            form.reset(defaultFormValues);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update account credentials, role assignment, and security preferences.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank to keep current" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                    <div>
                      <FormLabel className="mb-1 block">Two-factor authentication</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Require a second factor when signing in to this account.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-gradient-primary text-white"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {userToDelete?.fullName}. Their tasks and content will no longer be accessible.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (userToDelete) {
                  deleteMutation.mutate(userToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminUsers;
