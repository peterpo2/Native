import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted && resolvedTheme === "dark";

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated for this workspace.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Settings"
          description="Update workspace branding and notification preferences for your team."
        />

        <div className="p-6 space-y-6">
          <Card className="mx-auto w-full max-w-3xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Workspace preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input id="workspace-name" defaultValue="Native CRM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-url">Workspace URL</Label>
                <Input id="workspace-url" defaultValue="nativecrm.app/native" />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Dark mode</p>
                  <p className="text-xs text-muted-foreground">Enable adaptive theming for all members.</p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} disabled={!isMounted} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly digest</p>
                  <p className="text-xs text-muted-foreground">Send a summary of activity every Monday.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} className="bg-gradient-primary text-white shadow-glow">
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </Button>
            </CardFooter>
          </Card>
          {user?.role?.toLowerCase() === "admin" && (
            <Card className="mx-auto w-full max-w-3xl border border-primary/20 bg-card/80 shadow-card">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Administrator tools</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Access the workspace activity monitor to review every movement across the organization.
                  </p>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Button asChild className="bg-gradient-primary text-white shadow-glow">
                  <Link to="/admin/activity">Open admin panel</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
