import { BaseQueryParams } from '@/services/BaseService';
import { serviceTypeService } from '@/services/serviceTypeService';
import { ServiceType, ServiceTypesResponse, ServiceTypeCreateRequest, ServiceTypeUpdateRequest } from '@/types/serviceTypes';

import { EntityManagement, EntityManagementConfig } from './EntityManagement';
import ServiceTypeModalAdapter from './ServiceTypeModalAdapter';

const ServiceTypeManagementNew: React.FC = () => {
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

export default ServiceTypeManagementNew;