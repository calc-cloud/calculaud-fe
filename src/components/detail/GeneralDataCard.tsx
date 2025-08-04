import { Building, Calendar, Edit, Layers, MessageSquare, Target } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Purpose } from "@/types";
import { formatDate } from "@/utils/dateUtils";

interface GeneralDataCardProps {
  purpose: Purpose;
  onEdit: () => void;
}

export const GeneralDataCard: React.FC<GeneralDataCardProps> = ({ purpose, onEdit }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">General Data</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6 pt-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700">{purpose.description}</p>
        </div>

        <Separator />

        {/* 2-column grid for other fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Supplier</p>
              <p className="text-sm text-gray-600">{purpose.supplier}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Service Type</p>
              <p className="text-sm text-gray-600">{purpose.service_type}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 col-span-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Expected Delivery</p>
              <p className="text-sm text-gray-600">{formatDate(purpose.expected_delivery)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 col-span-2">
            <Layers className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Hierarchy</p>
              <p className="text-sm text-gray-600 text-xs">{purpose.hierarchy_name}</p>
            </div>
          </div>
        </div>

        <Separator />
        <div className="flex items-start space-x-2">
          <MessageSquare className="h-4 w-4 text-gray-500 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-900">Status Message</p>
            <p className="text-sm text-gray-600">{purpose.comments || "No status message"}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Content</h4>
          <div className="space-y-2">
            {purpose.contents.map((content, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{content.material_name}</p>
                </div>
                <Badge variant="outline">Qty: {content.quantity}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
