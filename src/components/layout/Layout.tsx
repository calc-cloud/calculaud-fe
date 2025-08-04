import { LogOut, Plus } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useLocation } from "react-router-dom";

import { CreatePurposeModal } from "@/components/modals/CreatePurposeModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const auth = useAuth();

  const handleCreatePurpose = () => {
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    await auth.signoutRedirect();
  };

  const getUserInitials = () => {
    const email =
      (auth.user?.profile?.upn as string) ||
      (auth.user?.profile?.email as string) ||
      (auth.user?.profile?.preferred_username as string) ||
      "User";

    // Find first character that is not a digit
    for (let i = 0; i < email.length; i++) {
      const char = email.charAt(i);
      if (!/\d/.test(char) && char.match(/[a-zA-Z]/)) {
        return char.toUpperCase();
      }
    }

    // If only digits or no letters found, return first character as fallback
    return email.charAt(0).toUpperCase();
  };

  const getDisplayName = (): string => {
    return (
      (auth.user?.profile?.unique_name as string) ||
      (auth.user?.profile?.email as string) ||
      (auth.user?.profile?.preferred_username as string) ||
      "User"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-semibold text-blue-700 hover:opacity-80 transition-opacity flex items-center space-x-3"
              >
                <div className="relative flex items-center justify-center w-10 h-8">
                  <svg
                    width="40"
                    height="32"
                    viewBox="0 0 40 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="cloudGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M33.6 15.6C33.1 8.6 27.5 3 20.5 3C15.9 3 11.9 5.5 9.5 9.2C9.1 9.1 8.6 9 8.1 9C3.6 9 0 12.6 0 17.1C0 21.6 3.6 25.2 8.1 25.2H32.5C36.6 25.2 40 21.8 40 17.7C40 16.7 39.9 15.7 39.6 14.8C37.8 15.4 35.7 15.7 33.6 15.6Z"
                      fill="url(#cloudGradient)"
                    />
                    <text
                      x="50%"
                      y="55%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontFamily="Arial, sans-serif"
                      fontSize="16"
                      fontWeight="bold"
                      fill="white"
                      className="drop-shadow-sm"
                    >
                      $
                    </text>
                  </svg>
                </div>
                <span className="font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Calculoud
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              <Button
                onClick={handleCreatePurpose}
                className="flex items-center gap-2 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors bg-cyan-800 hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4" />
                Create Purpose
              </Button>
              <div className="flex items-center space-x-2 border-l pl-4">
                <Link to="/dashboard">
                  <Button
                    variant={
                      location.pathname === "/dashboard" ? "default" : "ghost"
                    }
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/search">
                  <Button
                    variant={
                      location.pathname === "/search" ? "default" : "ghost"
                    }
                  >
                    Search
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button
                    variant={
                      location.pathname === "/admin" ? "default" : "ghost"
                    }
                  >
                    Admin
                  </Button>
                </Link>
              </div>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={getDisplayName()} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {(auth.user?.profile?.upn as string) ||
                          (auth.user?.profile?.email as string) ||
                          "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto py-6 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {children}
      </main>

      {/* Global Create Purpose Modal */}
      <CreatePurposeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Layout;
