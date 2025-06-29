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

const queryClient = new QueryClient();

const App = () => {
  const auth = useAuth();


  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect();
    return <div>Redirecting to login...</div>;
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
