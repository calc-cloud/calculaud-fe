
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useHierarchies } from '@/hooks/useHierarchies';

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
  serviceTypes: { id: string; name: string }[];
  setServiceTypes: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
  isLoading: boolean;
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
  const [hierarchies, setHierarchies] = useState<HierarchyItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [serviceTypes, setServiceTypes] = useState<{ id: string; name: string }[]>([]);

  // Fetch data from backend
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes();
  const { data: hierarchiesData, isLoading: hierarchiesLoading } = useHierarchies();

  const isLoading = suppliersLoading || serviceTypesLoading || hierarchiesLoading;

  // Update suppliers when backend data changes
  useEffect(() => {
    if (suppliersData?.items) {
      const mappedSuppliers = suppliersData.items.map(supplier => ({
        id: supplier.id.toString(),
        name: supplier.name
      }));
      setSuppliers(mappedSuppliers);
    }
  }, [suppliersData]);

  // Update service types when backend data changes
  useEffect(() => {
    if (serviceTypesData?.items) {
      const mappedServiceTypes = serviceTypesData.items.map(serviceType => ({
        id: serviceType.id.toString(),
        name: serviceType.name
      }));
      setServiceTypes(mappedServiceTypes);
    }
  }, [serviceTypesData]);

  // Update hierarchies when backend data changes
  useEffect(() => {
    if (hierarchiesData?.items) {
      const mappedHierarchies = hierarchiesData.items.map(hierarchy => ({
        id: hierarchy.id.toString(),
        type: hierarchy.type as any,
        name: hierarchy.name,
        parentId: hierarchy.parent_id?.toString(),
        fullPath: hierarchy.path
      }));
      setHierarchies(mappedHierarchies);
    }
  }, [hierarchiesData]);

  return (
    <AdminDataContext.Provider value={{
      hierarchies,
      setHierarchies,
      suppliers,
      setSuppliers,
      serviceTypes,
      setServiceTypes,
      isLoading
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};
