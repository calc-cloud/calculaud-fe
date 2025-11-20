import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AccessDenied from "@/components/auth/AccessDenied";
import Layout from "@/components/layout/Layout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import PurposeDetail from "@/pages/PurposeDetail";
import Search from "@/pages/Search";
import { apiService } from "@/services/apiService";
import { hasRequiredRole } from "@/utils/roleUtils";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RETRY_ATTEMPTED_KEY = "auth_retry_attempted";

const App = () => {
  const auth = useAuth();
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);

  // Auto-retry when authenticated but no roles
  useEffect(() => {
    const attemptRetry = async () => {
      const hasAttempted = sessionStorage.getItem(RETRY_ATTEMPTED_KEY) === "true";

      // Early return if conditions not met
      if (!auth.isAuthenticated || hasRequiredRole(auth.user) || hasAttempted) {
        return;
      }

      sessionStorage.setItem(RETRY_ATTEMPTED_KEY, "true");
      setIsAutoRetrying(true);

      // Remove bad token and re-authenticate
      await auth.removeUser();
      await auth.signinRedirect();
    };

    attemptRetry().catch((error) => {
      console.error("Auto-retry failed:", error); // eslint-disable-line no-console
      setIsAutoRetrying(false);
    });
  }, [auth]);

  // Set up API token provider
  useEffect(() => {
    apiService.setTokenProvider(auth.user?.access_token ? () => auth.user?.access_token : null);
    return () => apiService.setTokenProvider(null);
  }, [auth.user?.access_token]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading && !isAutoRetrying) {
      auth.signinRedirect().catch(console.error); // eslint-disable-line no-console
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.activeNavigator, auth.isLoading, isAutoRetrying]);

  // Reset retry flag on logout
  useEffect(() => {
    if (!auth.isAuthenticated && !isAutoRetrying && !auth.isLoading) {
      sessionStorage.removeItem(RETRY_ATTEMPTED_KEY);
      setIsAutoRetrying(false);
    }
  }, [auth.isAuthenticated, isAutoRetrying, auth.isLoading]);

  // Helper: Get loading message based on current state
  const getLoadingMessage = (): string => {
    if (auth.activeNavigator === "signoutRedirect") return "Logging out...";
    if (auth.activeNavigator === "signinRedirect") return "Redirecting to login...";
    if (auth.activeNavigator === "signinSilent") return "Refreshing session...";
    if (isAutoRetrying) return "Retrying authentication...";
    return "Loading...";
  };

  // Consolidated loading state
  if (auth.isLoading || isAutoRetrying || auth.activeNavigator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{getLoadingMessage()}</p>
        </div>
      </div>
    );
  }

  // Authentication error
  if (auth.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{auth.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated - show redirecting message
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-2" />
            <div className="w-24 h-2 bg-blue-200 rounded mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!hasRequiredRole(auth.user)) {
    return <AccessDenied />;
  }

  // User is authenticated and has required role - render app
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/search" replace />} />
                <Route path="/search" element={<Search />} />
                <Route path="/purposes/:id" element={<PurposeDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AdminDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
