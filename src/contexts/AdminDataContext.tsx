
import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface ServiceTypeItem {
  id: string;
  name: string;
}

interface AdminDataContextType {
  hierarchies: HierarchyItem[];
  setHierarchies: (hierarchies: HierarchyItem[]) => void;
  suppliers: SupplierItem[];
  setSuppliers: (suppliers: SupplierItem[]) => void;
  serviceTypes: ServiceTypeItem[];
  setServiceTypes: (serviceTypes: ServiceTypeItem[]) => void;
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

  const [serviceTypes, setServiceTypes] = useState<ServiceTypeItem[]>([
    { id: '1', name: 'Consulting' },
    { id: '2', name: 'Software' },
    { id: '3', name: 'Hardware' },
    { id: '4', name: 'Maintenance' },
    { id: '5', name: 'Training' },
    { id: '6', name: 'Other' }
  ]);

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
