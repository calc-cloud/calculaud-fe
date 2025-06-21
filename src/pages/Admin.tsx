
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import HierarchyManagement from '@/components/admin/HierarchyManagement';
import SupplierManagement from '@/components/admin/SupplierManagement';
import ServiceTypeManagement from '@/components/admin/ServiceTypeManagement';

const Admin = () => {
  return (
    <div className="space-y-4 h-full flex flex-col p-6 pt-2 overflow-y-scroll">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      <Tabs defaultValue="hierarchies" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
          <TabsTrigger value="hierarchies" className="text-sm">Hierarchies</TabsTrigger>
          <TabsTrigger value="suppliers" className="text-sm">Suppliers</TabsTrigger>
          <TabsTrigger value="service-types" className="text-sm">Service Types</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Admin;
