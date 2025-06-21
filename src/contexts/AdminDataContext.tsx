import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ServiceType } from '@/types/serviceTypes';

interface HierarchyItem {
  id: string;
  type: 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';
  name: string;
  parentId?: string;
  fullPath: string;
}

interface SupplierItem {
  id: string;
  name: string;
}

interface AdminDataContextType {
  hierarchies: HierarchyItem[];
  setHierarchies: React.Dispatch<React.SetStateAction<HierarchyItem[]>>;
  suppliers: SupplierItem[];
  setSuppliers: React.Dispatch<React.SetStateAction<SupplierItem[]>>;
  // Service types now managed via API, keeping for backward compatibility
  serviceTypes: { id: string; name: string }[];
  setServiceTypes: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};

export const AdminDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hierarchies, setHierarchies] = useState<HierarchyItem[]>([
    {
      id: '1',
      type: 'Unit',
      name: 'North Unit',
      fullPath: 'North Unit'
    },
    {
      id: '2',
      type: 'Center',
      name: 'Tech Center',
      parentId: '1',
      fullPath: 'North Unit > Tech Center'
    }
  ]);

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([
    { id: '1', name: 'TechCorp Solutions' },
    { id: '2', name: 'Hardware Plus Inc' },
    { id: '3', name: 'Strategic Advisors LLC' },
    { id: '4', name: 'Global Tech Services' },
    { id: '5', name: 'Innovation Partners' },
    { id: '6', name: 'Digital Solutions Co' },
    { id: '7', name: 'Enterprise Systems Ltd' },
    { id: '8', name: 'CloudTech Inc' }
  ]);

  // Keep legacy service types for backward compatibility
  const [serviceTypes, setServiceTypes] = useState<{ id: string; name: string }[]>([]);

  return (
    <AdminDataContext.Provider value={{
      hierarchies,
      setHierarchies,
      suppliers,
      setSuppliers,
      serviceTypes,
      setServiceTypes
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};
