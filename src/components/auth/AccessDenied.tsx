import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "react-oidc-context";

import { Button } from "@/components/ui/button";
import { getUserRoles } from "@/utils/roleUtils";

const AccessDenied = () => {
  const auth = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Remove the bad token completely
      await auth.removeUser();

      // Trigger new sign-in (will use existing ADFS session with groups)
      await auth.signinRedirect();
    } catch (error) {
      console.error("Retry failed:", error); // eslint-disable-line no-console
      setIsRetrying(false);
    }
  };

  const getDisplayName = (): string => {
    return (
      (auth.user?.profile?.unique_name as string) ||
      (auth.user?.profile?.email as string) ||
      (auth.user?.profile?.preferred_username as string) ||
      "User"
    );
  };

  const userRoles = getUserRoles(auth.user);
  const adminRole = import.meta.env.VITE_ADMIN_ROLE || "calAdmins";
  const userRole = import.meta.env.VITE_USER_ROLE || "calUsers";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-red-500" />

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>

        <p className="text-gray-600 mb-6">You don't have the required permissions to access this application.</p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="text-sm text-left space-y-2">
            <div>
              <span className="font-medium text-gray-700">User:</span>{" "}
              <span className="text-gray-600">{getDisplayName()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Required Roles:</span>{" "}
              <span className="text-gray-600">
                {adminRole} or {userRole}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Your Roles:</span>{" "}
              <span className="text-gray-600">{userRoles.length > 0 ? userRoles.join(", ") : "None"}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Please contact your administrator to request access to either the "{adminRole}" or "{userRole}" role.
        </p>

        <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded border border-blue-200">
          If you just logged in and believe this is an error, try clicking "Retry Authentication" below. This may help
          if your group memberships were not loaded during the initial login.
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={handleRetry} disabled={isRetrying} className="flex items-center gap-2" variant="default">
            <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Retrying..." : "Retry Authentication"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
