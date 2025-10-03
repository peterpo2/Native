import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  AdminUser,
  CreateUserPayload,
  UpdateUserPayload,
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Trash2, UserPlus, PencilLine } from "lucide-react";

interface CreateUserFormValues {
  fullName: string;
  email: string;
  password: string;
  role: string;
  organizationId: string;
}

interface UpdateUserFormValues {
  fullName: string;
  role: string;
  twoFactorEnabled: boolean;
}

const defaultCreateValues: CreateUserFormValues = {
  fullName: "",
  email: "",
  password: "",
  role: "User",
  organizationId: "",
};

const roleOptions = ["Admin", "Manager", "User"];

const AdminUsers = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const usersQuery = useQuery<AdminUser[], Error>({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(token!),
    enabled: Boolean(token),
  });

  const createForm = useForm<CreateUserFormValues>({
    defaultValues: defaultCreateValues,
  });

  const updateForm = useForm<UpdateUserFormValues>({
    defaultValues: { fullName: "", role: "User", twoFactorEnabled: false },
  });

  const createMutation = useMutation({
    mutationFn: async (values: CreateUserFormValues) => {
      const payload: CreateUserPayload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
        organizationId: values.organizationId.trim() ? values.organizationId.trim() : null,
      };
      return createUser(token!, payload);
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The new user can now access the workspace.",
      });
      setCreateOpen(false);
      createForm.reset(defaultCreateValues);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateUserFormValues) => {
      if (!editingUser) return Promise.reject(new Error("No user selected"));
      const payload: UpdateUserPayload = {
        fullName: values.fullName,
        role: values.role,
        twoFactorEnabled: values.twoFactorEnabled,
      };
      return updateUser(token!, editingUser.id, payload);
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "Changes were saved successfully.",
      });
      setEditOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => deleteUser(token!, userId),
    onSuccess: () => {
      toast({
        title: "User removed",
        description: "The user was soft deleted and can no longer sign in.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    updateForm.reset({
      fullName: user.fullName,
      role: user.role,
      twoFactorEnabled: user.isTwoFactorEnabled,
    });
    setEditOpen(true);
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="User management"
          description="Create, update, or deactivate workspace members. Only administrators can see this area."
          actions={(
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) {
                createForm.reset(defaultCreateValues);
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-gradient-primary text-white shadow-glow">
                  <UserPlus className="h-4 w-4" />
                  New user
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create user</DialogTitle>
                  <DialogDescription>Invite a new teammate with the appropriate role.</DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form
                    onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
                    className="space-y-4"
                  >
                    <FormField
                      control={createForm.control}
                      name="fullName"
                      rules={{ required: "Full name is required" }}
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
                      control={createForm.control}
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
                      control={createForm.control}
                      name="password"
                      rules={{ required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temporary password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
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
                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Create user
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        />

        <div className="p-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  Workspace members
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Monitor active accounts and enforce least-privilege access.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {users.length} users
              </Badge>
            </CardHeader>
            <CardContent>
              {usersQuery.isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2 text-sm">Loading users…</span>
                </div>
              ) : usersQuery.isError ? (
                <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 py-12 text-center text-sm text-destructive">
                  {usersQuery.error.message}
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 py-12 text-center text-sm text-muted-foreground">
                  No users found. Create a new member to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-foreground">{user.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isTwoFactorEnabled ? "secondary" : "outline"} className="text-xs">
                            {user.isTwoFactorEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleEdit(user)}
                            >
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={() => setUserToDelete(user)}
                              disabled={deleteMutation.isPending && userToDelete?.id === user.id}
                            >
                              {deleteMutation.isPending && userToDelete?.id === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete
                            </Button>
                          </div>
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

      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setEditOpen(open);
        if (!open) {
          setEditingUser(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update profile information or permissions for this user.</DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit((values) => updateMutation.mutate(values))}
              className="space-y-4"
            >
              <FormField
                control={updateForm.control}
                name="fullName"
                rules={{ required: "Full name is required" }}
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
                control={updateForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Two-factor authentication</FormLabel>
                      <FormDescription>Require a second factor when this user signs in.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
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
              This action will soft delete the user and prevent them from signing in. You can recreate the account later if
              needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminUsers;
