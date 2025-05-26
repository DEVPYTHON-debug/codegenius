import { Switch, Route } from "wouter";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Shops from "@/pages/Shops";
import Jobs from "@/pages/Jobs";
import Chat from "@/pages/Chat";
import Payments from "@/pages/Payments";
import AdminDashboard from "@/pages/AdminDashboard";
import SplashScreen from "@/components/SplashScreen";
import Register from "@/pages/Register";
import { useState, useEffect } from "react";

function Router() {
  const { user } = useAuth(); // Only use user
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onSkip={() => setShowSplash(false)} />;
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/shops" component={Shops} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/chat" component={Chat} />
      <Route path="/payments" component={Payments} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/register" component={Register} /> {/* Add this line */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-dark-purple text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
