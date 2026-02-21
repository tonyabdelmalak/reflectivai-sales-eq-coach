import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import CookieBanner from "@/components/CookieBanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/index";
import Dashboard from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import ChatPage from "@/pages/chat";
import RolePlayPage from "@/pages/roleplay";
import PreCallPlanningPage from "@/pages/pre-call-planning";
import ModulesPage from "@/pages/modules";
import FrameworksPage from "@/pages/frameworks";
import KnowledgePage from "@/pages/knowledge";
import EIMetricsPage from "@/pages/ei-metrics";
import ExercisesPage from "@/pages/exercises";
import DataReportsPage from "@/pages/data-reports";
import HelpPage from "@/pages/help";
import ProfilePage from "@/pages/profile";
import DashboardEnterprisePage from "@/pages/dashboard-enterprise";
import DeployPage from "@/pages/deploy";

// Get base path from Vite config (for GitHub Pages deployment)
const basePath = import.meta.env.BASE_URL || '/';

function Router() {
  return (
    <WouterRouter base={basePath}>
      <Switch>
        {/* Public routes */}
        <Route path="/login" component={LoginPage} />
        
        {/* Protected routes */}
        <Route path="/" component={Dashboard} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/roleplay" component={RolePlayPage} />
        <Route path="/pre-call-planning" component={PreCallPlanningPage} />
        <Route path="/exercises" component={ExercisesPage} />
        <Route path="/modules" component={ModulesPage} />
        <Route path="/frameworks" component={FrameworksPage} />
        <Route path="/ei-metrics" component={EIMetricsPage} />
        <Route path="/data-reports" component={DataReportsPage} />
        <Route path="/knowledge" component={KnowledgePage} />
        <Route path="/help" component={HelpPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/dashboard-enterprise" component={DashboardEnterprisePage} />
        <Route path="/deploy" component={DeployPage} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger data-testid="button-sidebar-toggle" className="h-9 w-9" />
                    <img src="/logo-reflectivai-new.jpeg" alt="ReflectivAI" className="h-9 w-auto object-contain" />
                  </div>
                  <div className="flex items-center gap-2">
                    <NotificationCenter />
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Trophy className="h-5 w-5" />
                    </Button>
                    <ThemeToggle />
                  </div>
                </header>

                <main className="flex-1 overflow-hidden">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
          <SonnerToaster />
          <CookieBanner />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;