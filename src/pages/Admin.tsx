

import HierarchyManagement from '@/components/admin/HierarchyManagement';
import MaterialManagement from '@/components/admin/MaterialManagement';
import ServiceTypeManagement from '@/components/admin/ServiceTypeManagement';
import SupplierManagement from '@/components/admin/SupplierManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  return (
    <div className="space-y-4 h-full flex flex-col p-6 pt-2">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      <Tabs defaultValue="hierarchies" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
          <TabsTrigger value="hierarchies" className="text-sm">Hierarchies</TabsTrigger>
          <TabsTrigger value="suppliers" className="text-sm">Suppliers</TabsTrigger>
          <TabsTrigger value="service-types" className="text-sm">Service Types</TabsTrigger>
          <TabsTrigger value="materials" className="text-sm">Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hierarchies" className="flex-1 mt-4 min-h-0">
          <HierarchyManagement />
        </TabsContent>
        
        <TabsContent value="suppliers" className="flex-1 mt-4 min-h-0">
          <SupplierManagement />
        </TabsContent>
        
        <TabsContent value="service-types" className="flex-1 mt-4 min-h-0">
          <ServiceTypeManagement />
        </TabsContent>
        
        <TabsContent value="materials" className="flex-1 mt-4 min-h-0">
          <MaterialManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
