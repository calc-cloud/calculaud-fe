
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HierarchyManagement from '@/components/admin/HierarchyManagement';
import SupplierManagement from '@/components/admin/SupplierManagement';
import ServiceTypeManagement from '@/components/admin/ServiceTypeManagement';

const Admin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage system data and configurations</p>
      </div>

      <Tabs defaultValue="hierarchies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarchies">Hierarchies</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="service-types">Service Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hierarchies" className="mt-6">
          <HierarchyManagement />
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <SupplierManagement />
        </TabsContent>
        
        <TabsContent value="service-types" className="mt-6">
          <ServiceTypeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
