import {useAuth} from "react-oidc-context";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Search from "@/pages/Search";
import NotFound from "./pages/NotFound";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import {AdminDataProvider} from "@/contexts/AdminDataContext";
import {apiService} from "@/services/apiService";
import {useEffect} from "react";

const queryClient = new QueryClient();

const App = () => {
    const auth = useAuth();

    // Set up API service with auth token
    useEffect(() => {
        apiService.setTokenProvider(() => auth.user?.access_token);
    }, [auth.user?.access_token]);

    if (auth.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (auth.error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                    </div>
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

    if (!auth.isAuthenticated) {
        auth.signinRedirect();
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-pulse mb-4">
                        <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-2"></div>
                        <div className="w-24 h-2 bg-blue-200 rounded mx-auto"></div>
                    </div>
                    <p className="text-gray-600 text-lg">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AdminDataProvider>
                    <Toaster/>
                    <Sonner/>
                    <BrowserRouter>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Navigate to="/search" replace/>}/>
                                <Route path="/search" element={<Search/>}/>
                                <Route path="/dashboard" element={<Dashboard/>}/>
                                <Route path="/admin" element={<Admin/>}/>
                                <Route path="*" element={<NotFound/>}/>
                            </Routes>
                        </Layout>
                    </BrowserRouter>
                </AdminDataProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
