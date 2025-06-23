
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useHierarchies } from '@/hooks/useHierarchies';
import { useServices } from '@/hooks/useServices';

interface HierarchyItem {
  id: number;
  type: 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';
  name: string;
  parentId?: number;
  fullPath: string;
}

interface SupplierItem {
  id: number;
  name: string;
}

interface ServiceItem {
  id: number;
  name: string;
}

interface AdminDataContextType {
  hierarchies: HierarchyItem[];
  setHierarchies: React.Dispatch<React.SetStateAction<HierarchyItem[]>>;
  suppliers: SupplierItem[];
  setSuppliers: React.Dispatch<React.SetStateAction<SupplierItem[]>>;
  serviceTypes: { id: number; name: string }[];
  setServiceTypes: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
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
  const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string }[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Fetch data from backend
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes();
  const { data: hierarchiesData, isLoading: hierarchiesLoading } = useHierarchies();
  const { data: servicesData, isLoading: servicesLoading } = useServices();

  const isLoading = suppliersLoading || serviceTypesLoading || hierarchiesLoading || servicesLoading;

  // Update suppliers when backend data changes
  useEffect(() => {
    if (suppliersData?.items) {
      const mappedSuppliers = suppliersData.items.map(supplier => ({
        id: supplier.id,
        name: supplier.name
      }));
      setSuppliers(mappedSuppliers);
    }
  }, [suppliersData]);

  // Update service types when backend data changes
  useEffect(() => {
    if (serviceTypesData?.items) {
      const mappedServiceTypes = serviceTypesData.items.map(serviceType => ({
        id: serviceType.id,
        name: serviceType.name
      }));
      setServiceTypes(mappedServiceTypes);
    }
  }, [serviceTypesData]);

  // Update services when backend data changes
  useEffect(() => {
    if (servicesData?.items) {
      const mappedServices = servicesData.items.map(service => ({
        id: service.id,
        name: service.name
      }));
      setServices(mappedServices);
    }
  }, [servicesData]);

  // Update hierarchies when backend data changes
  useEffect(() => {
    if (hierarchiesData?.items) {
      const mappedHierarchies = hierarchiesData.items.map(hierarchy => ({
        id: hierarchy.id,
        type: hierarchy.type as any,
        name: hierarchy.name,
        parentId: hierarchy.parent_id,
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
      services,
      setServices,
      isLoading
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};
