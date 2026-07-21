import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/chat-widget";
import React, { lazy, Suspense } from 'react';
import LoadingSpinner from "@/components/loading-spinner";

// Lazy load all route components for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Investors = lazy(() => import("@/pages/investors"));
const Community = lazy(() => import("@/pages/community"));
const Admin = lazy(() => import("@/pages/admin"));
const InvestmentPackages = lazy(() => import("@/pages/investment-packages"));
const AuthManagement = lazy(() => import("@/pages/auth"));
const Analysis = lazy(() => import("@/pages/analysis"));
const News = lazy(() => import("@/pages/news"));
const InvestmentGuide = lazy(() => import("@/pages/investment-guide"));
const Contact = lazy(() => import("@/pages/contact"));
const AccountManagement = lazy(() => import("@/pages/account-management"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Checkout = lazy(() => import("@/pages/checkout"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const InvestmentPurchase = lazy(() => import("@/pages/investment-purchase"));
const Tokenomics = lazy(() => import("@/pages/tokenomics"));
const Roadmap = lazy(() => import("@/pages/roadmap"));
const Staking = lazy(() => import("@/pages/staking"));
const Team = lazy(() => import("@/pages/team"));
const Research = lazy(() => import("@/pages/research"));

// Redirect components for reorganized content

function RedirectToAccountManagement() {
  const [, setLocation] = useLocation();
  React.useEffect(() => {
    setLocation("/account-management");
  }, [setLocation]);
  return <LoadingSpinner />;
}

function RedirectToInvestmentGuide() {
  const [, setLocation] = useLocation();
  React.useEffect(() => {
    setLocation("/investment-guide");
  }, [setLocation]);
  return <LoadingSpinner />;
}

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
      <Route path="/contact" component={Contact} />
      <Route path="/account-management">
        <ProtectedRoute>
          <AccountManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      {/* Redirects for reorganized content */}
      <Route path="/my-investments" component={RedirectToAccountManagement} />
      <Route path="/investment-guide" component={InvestmentGuide} />
      <Route path="/investment-utilities" component={RedirectToInvestmentGuide} />
      
      <Route path="/tokenomics" component={Tokenomics} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/staking" component={Staking} />
      <Route path="/team" component={Team} />
      <Route path="/research" component={Research} />
      {/* Keep original pages for now - can be removed later */}
      <Route path="/investment-purchase" component={InvestmentPurchase} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Error boundary for lazy components
interface LazyErrorBoundaryProps {
  children: React.ReactNode;
}

interface LazyErrorBoundaryState {
  hasError: boolean;
}

class LazyErrorBoundary extends React.Component<LazyErrorBoundaryProps, LazyErrorBoundaryState> {
  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Lazy component error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Failed to load page component.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-bitcoin text-white rounded hover:bg-bitcoin-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <LazyErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <Router />
                </Suspense>
              </LazyErrorBoundary>
              <ChatWidget />
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
