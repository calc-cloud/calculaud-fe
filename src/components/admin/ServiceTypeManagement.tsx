import { BaseQueryParams } from '@/services/BaseService';
import { serviceTypeService } from '@/services/serviceTypeService';
import { ServiceType, ServiceTypesResponse, ServiceTypeCreateRequest, ServiceTypeUpdateRequest } from '@/types/serviceTypes';

import { EntityManagement, EntityManagementConfig } from './EntityManagement';
import ServiceTypeModal from './ServiceTypeModal';

// Adapter component to bridge ServiceTypeModal interface with EntityManagement
const ServiceTypeModalAdapter: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: ServiceType | null;
  onSave: (data: ServiceTypeCreateRequest | ServiceTypeUpdateRequest, editId?: number) => Promise<void>;
}> = ({ open, onOpenChange, editItem, onSave }) => {
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

const ServiceTypeManagement: React.FC = () => {
  const config: EntityManagementConfig<
    ServiceType,
    ServiceTypesResponse,
    ServiceTypeCreateRequest,
    ServiceTypeUpdateRequest,
    BaseQueryParams
  > = {
    entityName: 'Service Type',
    entityNamePlural: 'Service Types',
    queryKey: 'service-types',
    
    service: {
      get: serviceTypeService.getServiceTypes.bind(serviceTypeService),
      create: serviceTypeService.createServiceType.bind(serviceTypeService),
      update: serviceTypeService.updateServiceType.bind(serviceTypeService),
      delete: serviceTypeService.deleteServiceType.bind(serviceTypeService),
    },
    
    displayFields: [
      {
        key: 'name',
        label: 'Name',
        className: 'font-medium truncate'
      }
    ],
    
    searchPlaceholder: 'Search service types...',
    gridColumns: 3,
    
    ModalComponent: ServiceTypeModalAdapter,
    
    buildQueryParams: (page, limit, search) => ({
      page,
      limit,
      search
    })
  };

  return <EntityManagement config={config} />;
};

export default ServiceTypeManagement;