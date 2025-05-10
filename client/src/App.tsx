import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { SuppressWarnings } from "@/components/error-boundary/suppress-warnings";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Tasks from "@/pages/tasks";
import Messages from "@/pages/messages";
import Documents from "@/pages/documents";
import Schedule from "@/pages/schedule";
import Assets from "@/pages/assets";
import Reports from "@/pages/reports";
import DesignReview from "@/pages/design-review";
import Analytics from "@/pages/analytics";
import AuthPage from "@/pages/auth-page";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Members from "@/pages/members";
import Forum from "@/pages/forum";
import KnowledgeBase from "@/pages/knowledgebase";
import Jobs from "@/pages/jobs";
import Shop from "@/pages/shop";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";

  // Render a different layout for auth page
  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Render the app layout with sidebar/header for authenticated routes
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <Switch>
            <ProtectedRoute path="/" component={Dashboard} />
            <ProtectedRoute path="/projects" component={Projects} />
            <ProtectedRoute path="/tasks" component={Tasks} />
            <ProtectedRoute path="/messages" component={Messages} />
            <ProtectedRoute path="/documents" component={Documents} />
            <ProtectedRoute path="/schedule" component={Schedule} />
            <ProtectedRoute path="/assets" component={Assets} />
            <ProtectedRoute path="/reports" component={Reports} />
            <ProtectedRoute path="/analytics" component={Analytics} />
            <ProtectedRoute path="/design-review/:id?" component={DesignReview} />
            <ProtectedRoute path="/courses" component={Courses} />
            <ProtectedRoute path="/courses/:slug" component={CourseDetail} />
            <ProtectedRoute path="/members" component={Members} />
            <ProtectedRoute path="/forum" component={Forum} />
            <ProtectedRoute path="/knowledgebase" component={KnowledgeBase} />
            <ProtectedRoute path="/jobs" component={Jobs} />
            <ProtectedRoute path="/shop" component={Shop} />
            <ProtectedRoute path="/integrations" component={Integrations} />
            <ProtectedRoute path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SuppressWarnings>
      <QueryClientProvider client={queryClient}>
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <TooltipProvider>
              <AuthProvider>
                <Toaster />
                <Router />
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </PostHogProvider>
      </QueryClientProvider>
    </SuppressWarnings>
  );
}

export default App;
