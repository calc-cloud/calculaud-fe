import React from 'react';

import { ServiceType, ServiceTypeCreateRequest, ServiceTypeUpdateRequest } from '@/types/serviceTypes';

import ServiceTypeModal from './ServiceTypeModal';

interface ServiceTypeModalAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: ServiceType | null;
  onSave: (data: ServiceTypeCreateRequest | ServiceTypeUpdateRequest, editId?: number) => Promise<void>;
}

const ServiceTypeModalAdapter: React.FC<ServiceTypeModalAdapterProps> = ({
  open,
  onOpenChange,
  editItem,
  onSave
}) => {
  const handleSave = async (name: string, editId?: number) => {
    const data = { name };
    await onSave(data, editId);
  };

  return (
    <ServiceTypeModal
      open={open}
      onOpenChange={onOpenChange}
      editItem={editItem}
      onSave={handleSave}
    />
  );
};

export default ServiceTypeModalAdapter;