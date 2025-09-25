import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value?: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function DashboardCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  action,
  className,
  children
}: DashboardCardProps) {
  return (
    <Card className={cn("shadow-card hover:shadow-elevated transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value && (
          <div className="text-2xl font-bold text-foreground mb-1">
            {value}
          </div>
        )}
        {change && (
          <p className={cn(
            "text-xs",
            changeType === "positive" && "text-green-600",
            changeType === "negative" && "text-red-600",
            changeType === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-2">
            {description}
          </p>
        )}
        {children}
        {action && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={action.onClick}
            className="mt-3 w-full"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}