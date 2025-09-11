import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Investors from "@/pages/investors";
import Community from "@/pages/community";
import Admin from "@/pages/admin";
import InvestmentPackages from "@/pages/investment-packages";
import AuthManagement from "@/pages/auth";
import Analysis from "@/pages/analysis";
import News from "@/pages/news";
import InvestmentUtilities from "@/pages/investment-utilities";
import InvestmentGuide from "@/pages/investment-guide";
import Contact from "@/pages/contact";
import AccountManagement from "@/pages/account-management";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import AIInsights from "@/pages/ai-insights";
import InvestmentPurchase from "@/pages/investment-purchase";
import MyInvestments from "@/pages/my-investments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/investment-packages" component={InvestmentPackages} />
      <Route path="/investors" component={Investors} />
      <Route path="/community" component={Community} />
      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <Admin />
        </ProtectedRoute>
      </Route>
      <Route path="/auth">
        <ProtectedRoute requireAdmin>
          <AuthManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/analysis" component={Analysis} />
      <Route path="/news" component={News} />
      <Route path="/investment-utilities" component={InvestmentUtilities} />
      <Route path="/investment-guide" component={InvestmentGuide} />
      <Route path="/contact" component={Contact} />
      <Route path="/account-management">
        <ProtectedRoute>
          <AccountManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/investment-purchase" component={InvestmentPurchase} />
      <Route path="/my-investments">
        <ProtectedRoute>
          <MyInvestments />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
