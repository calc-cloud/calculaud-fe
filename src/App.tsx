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
import PurposeDetail from "@/pages/PurposeDetail";
import {AdminDataProvider} from "@/contexts/AdminDataContext";
import {apiService} from "@/services/apiService";
import {useEffect} from "react";
import {AlertTriangle, Loader2} from "lucide-react";

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
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4"/>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (auth.error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500"/>
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
                                <Route path="/purposes/:id" element={<PurposeDetail/>}/>
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
