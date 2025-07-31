import { useServiceTypes } from '@/hooks/useServiceTypes';
import { materialService } from '@/services/materialService';
import { Material, MaterialsResponse, MaterialCreateRequest, MaterialUpdateRequest } from '@/types/materials';

import { EntityManagement, EntityManagementConfig } from './EntityManagement';
import MaterialModalAdapter from './MaterialModalAdapter';

interface MaterialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  service_type_id?: number;
}

const MaterialManagementNew: React.FC = () => {
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
    
    ModalComponent: MaterialModalAdapter,
    
    buildQueryParams: (page, limit, search) => ({
      page,
      limit,
      search
    })
  };

  return <EntityManagement config={config} />;
};

export default MaterialManagementNew;