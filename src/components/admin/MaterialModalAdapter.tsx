import React from 'react';

import { Material, MaterialCreateRequest, MaterialUpdateRequest } from '@/types/materials';

import MaterialModal from './MaterialModal';

interface MaterialModalAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: Material | null;
  onSave: (data: MaterialCreateRequest | MaterialUpdateRequest, editId?: number) => Promise<void>;
}

const MaterialModalAdapter: React.FC<MaterialModalAdapterProps> = ({
  open,
  onOpenChange,
  editItem,
  onSave
}) => {
  const handleSave = async (name: string, serviceTypeId: number, editId?: number) => {
    const data = {
      name,
      service_type_id: serviceTypeId
    };
    await onSave(data, editId);
  };

  return (
    <MaterialModal
      open={open}
      onOpenChange={onOpenChange}
      editItem={editItem}
      onSave={handleSave}
    />
  );
};

export default MaterialModalAdapter;