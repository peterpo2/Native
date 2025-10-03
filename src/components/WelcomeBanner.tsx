import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import dashboardHero from "@/assets/dashboard-hero.jpg";

export function WelcomeBanner() {
  return (
    <Card className="relative overflow-hidden border-0 shadow-elevated">
      <div className="absolute inset-0">
        <img 
          src={dashboardHero} 
          alt="Dashboard overview" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      </div>
      <div className="relative p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">Welcome to Native CRM</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your productivity hub is ready
              </h2>
              <p className="text-muted-foreground max-w-md">
                Manage tasks, schedule meetings, track progress, and collaborate with your team 
                all in one powerful platform.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button asChild className="bg-gradient-primary hover:opacity-90 shadow-glow">
                <Link to="/tasks">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboards">View dashboards</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-elevated">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}