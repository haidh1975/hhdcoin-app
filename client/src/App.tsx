import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Investors from "@/pages/investors";
import Community from "@/pages/community";
import Admin from "@/pages/admin";
import InvestmentPackages from "@/pages/investment-packages";
import AuthManagement from "@/pages/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/investment-packages" component={InvestmentPackages} />
      <Route path="/investors" component={Investors} />
      <Route path="/community" component={Community} />
      <Route path="/admin" component={Admin} />
      <Route path="/auth" component={AuthManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
