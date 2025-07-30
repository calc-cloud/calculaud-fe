import React, {createContext, ReactNode, useContext} from 'react';

import {useHierarchies} from '@/hooks/useHierarchies';
import {useMaterials} from '@/hooks/useMaterials';
import {useResponsibleAuthorities} from '@/hooks/useResponsibleAuthorities';
import {useServiceTypes} from '@/hooks/useServiceTypes';
import {useSuppliers} from '@/hooks/useSuppliers';
import {Hierarchy} from '@/types/hierarchies';
import {Material} from '@/types/materials';
import {ResponsibleAuthority} from '@/types/responsibleAuthorities';
import {ServiceType} from '@/types/serviceTypes';
import {Supplier} from '@/types/suppliers';

interface AdminDataContextType {
  hierarchies: Hierarchy[];
  suppliers: Supplier[];
  serviceTypes: ServiceType[];
  materials: Material[];
  responsibleAuthorities: ResponsibleAuthority[];
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
  const {responsibleAuthorities, isLoading: responsibleAuthoritiesLoading} = useResponsibleAuthorities();

  const hierarchies = hierarchiesData?.items || [];
  const suppliers = suppliersData?.items || [];
  const serviceTypes = serviceTypesData?.items || [];
  const materials = materialsData?.items || [];

  const isLoading = hierarchiesLoading || suppliersLoading || serviceTypesLoading || materialsLoading || responsibleAuthoritiesLoading;

  const value: AdminDataContextType = {
    hierarchies,
    suppliers,
    serviceTypes,
    materials,
    responsibleAuthorities,
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
