
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
    console.log('=== Layout.handleSavePurpose START ===');
    console.log('Purpose data received:', purposeData);
    
    createPurpose.mutate(purposeData, {
      onSuccess: () => {
        console.log('Purpose created successfully, closing modal');
        setIsModalOpen(false);
      },
      onError: (error) => {
        console.error('Failed to create purpose:', error);
        // Modal stays open on error so user can retry
      }
    });
    
    console.log('=== Layout.handleSavePurpose END ===');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Calculaud
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleCreatePurpose} className="flex items-center gap-2 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors bg-cyan-800 hover:bg-cyan-700">
                <Plus className="h-4 w-4" />
                Create Purpose
              </Button>
              <div className="flex items-center space-x-2 ml-4 border-l pl-4">
                <Link to="/">
                  <Button variant={location.pathname === '/' ? 'default' : 'ghost'}>
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
