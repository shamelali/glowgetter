import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/nav-bar";

import Home from "@/pages/home";
import ArtistsPage from "@/pages/artists/index";
import ArtistDetailPage from "@/pages/artists/detail";
import DashboardPage from "@/pages/dashboard/index";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/artists" component={ArtistsPage} />
          <Route path="/artists/:slug" component={ArtistDetailPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="py-8 border-t text-center text-sm text-muted-foreground bg-secondary/20">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} GlowGetter.my - Malaysia's Premium Makeup Artist Directory
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
