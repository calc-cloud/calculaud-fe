import { AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "react-oidc-context";

import { Button } from "@/components/ui/button";
import { getUserRoles } from "@/utils/roleUtils";

const AccessDenied = () => {
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.signoutRedirect();
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

        <p className="text-sm text-gray-500 mb-6">
          Please contact your administrator to request access to either the "{adminRole}" or "{userRole}" role.
        </p>

        <Button onClick={handleLogout} className="flex items-center gap-2 mx-auto" variant="outline">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
