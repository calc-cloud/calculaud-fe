
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { Purpose, ModalMode } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePurpose = () => {
    setIsModalOpen(true);
  };

  const handleSavePurpose = (purposeData: Partial<Purpose>) => {
    // For now, we'll just show a toast. In a real app, this would integrate with a global state management solution
    toast({
      title: "Purpose created",
      description: "New purpose has been successfully created."
    });
    console.log('New purpose created:', purposeData);
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
              <Button onClick={handleCreatePurpose} className="flex items-center gap-2 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors bg-cyan-950 hover:bg-cyan-800">
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
      <PurposeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="create" onSave={handleSavePurpose} />
    </div>
  );
};

export default Layout;
