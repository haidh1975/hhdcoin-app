import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoadingSpinner from "@/components/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/login");
        return;
      }

      if (requireAdmin && user?.role !== "admin") {
        setLocation("/dashboard"); // Redirect to dashboard if not admin
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-bitcoin" />
          <p className="mt-2 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requireAdmin && user?.role !== "admin") {
    return null; // Will redirect to dashboard
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}