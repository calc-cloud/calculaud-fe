import React, { createContext, useContext, ReactNode } from 'react';
import { useHierarchies } from '@/hooks/useHierarchies';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useMaterials } from '@/hooks/useMaterials';
import { Hierarchy } from '@/types/hierarchies';
import { Supplier } from '@/types/suppliers';
import { ServiceType } from '@/types/serviceTypes';
import { Material } from '@/types/materials';

interface AdminDataContextType {
  hierarchies: Hierarchy[];
  suppliers: Supplier[];
  serviceTypes: ServiceType[];
  materials: Material[];
  isLoading: boolean;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

interface AdminDataProviderProps {
  children: ReactNode;
}

export const AdminDataProvider: React.FC<AdminDataProviderProps> = ({ children }) => {
  const { data: hierarchiesData, isLoading: hierarchiesLoading } = useHierarchies();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes();
  const { data: materialsData, isLoading: materialsLoading } = useMaterials();

  const hierarchies = hierarchiesData?.items || [];
  const suppliers = suppliersData?.items || [];
  const serviceTypes = serviceTypesData?.items || [];
  const materials = materialsData?.items || [];

  const isLoading = hierarchiesLoading || suppliersLoading || serviceTypesLoading || materialsLoading;

  const value: AdminDataContextType = {
    hierarchies,
    suppliers,
    serviceTypes,
    materials,
    isLoading,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
