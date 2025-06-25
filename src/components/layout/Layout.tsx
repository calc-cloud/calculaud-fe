
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { Purpose, ModalMode } from '@/types';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createPurpose } = usePurposeMutations();

  const handleCreatePurpose = () => {
    setIsModalOpen(true);
  };

  const handleSavePurpose = (purposeData: Partial<Purpose>) => {
    createPurpose.mutate(purposeData, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: (error) => {
        // Modal stays open on error so user can retry
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-semibold text-blue-700 hover:opacity-80 transition-opacity flex items-center space-x-3">
                <div className="relative flex items-center justify-center w-10 h-8">
                  <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="cloudGradient" x1="0" y1="0" x2="1" y2="1">
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
            <div className="flex items-center space-x-4">
              <Button onClick={handleCreatePurpose} className="flex items-center gap-2 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors bg-cyan-800 hover:bg-cyan-700">
                <Plus className="h-4 w-4" />
                Create Purpose
              </Button>
              <div className="flex items-center space-x-2 ml-4 border-l pl-4">
                <Link to="/dashboard">
                  <Button variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}>
                    Dashboard
                  </Button>
                </Link>
                <Link to="/search">
                  <Button variant={location.pathname === '/search' ? 'default' : 'ghost'}>
                    Search
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button variant={location.pathname === '/admin' ? 'default' : 'ghost'}>
                    Admin
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Global Purpose Modal */}
      <PurposeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode="create" 
        onSave={handleSavePurpose} 
      />
    </div>
  );
};

export default Layout;
