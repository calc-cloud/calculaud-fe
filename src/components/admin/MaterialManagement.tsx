import { useServiceTypes } from '@/hooks/useServiceTypes';
import { materialService } from '@/services/materialService';
import { Material, MaterialsResponse, MaterialCreateRequest, MaterialUpdateRequest } from '@/types/materials';

import { EntityManagement, EntityManagementConfig } from './EntityManagement';
import MaterialModal from './MaterialModal';

// Adapter component to bridge MaterialModal interface with EntityManagement
const MaterialModalAdapter: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: Material | null;
  onSave: (data: MaterialCreateRequest | MaterialUpdateRequest, editId?: number) => Promise<void>;
}> = ({ open, onOpenChange, editItem, onSave }) => {
  const handleSave = async (name: string, serviceTypeId: number, editId?: number) => {
    const data = { name, service_type_id: serviceTypeId };
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

interface MaterialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  service_type_id?: number;
}

const MaterialManagement: React.FC = () => {
  const { data: serviceTypesData } = useServiceTypes();

  const getServiceTypeName = (serviceTypeId: number) => {
    const serviceType = serviceTypesData?.items?.find(st => st.id === serviceTypeId);
    return serviceType?.name || 'Unknown';
  };

  const config: EntityManagementConfig<
    Material,
    MaterialsResponse,
    MaterialCreateRequest,
    MaterialUpdateRequest,
    MaterialQueryParams
  > = {
    entityName: 'Material',
    entityNamePlural: 'Materials',
    queryKey: 'materials',
    
    service: {
      get: materialService.getMaterials.bind(materialService),
      create: materialService.createMaterial.bind(materialService),
      update: materialService.updateMaterial.bind(materialService),
      delete: materialService.deleteMaterial.bind(materialService),
    },
    
    displayFields: [
      {
        key: 'name',
        label: 'Name',
        className: 'font-medium truncate'
      },
      {
        key: 'service_type_id',
        label: 'Type',
        render: (serviceTypeId: number) => `Type: ${getServiceTypeName(serviceTypeId)}`,
        className: 'text-xs text-gray-500'
      }
    ],
    
    searchPlaceholder: 'Search materials...',
    gridColumns: 3,
    
    ModalComponent: MaterialModalAdapter
  };

  return <EntityManagement config={config} />;
};

export default MaterialManagement;