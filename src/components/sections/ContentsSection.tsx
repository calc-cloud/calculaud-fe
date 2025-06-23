import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2, Plus } from 'lucide-react';
import { PurposeContent } from '@/types';
import { useServices } from '@/hooks/useServices';

interface ContentsSectionProps {
  contents: PurposeContent[];
  onContentsChange: (contents: PurposeContent[]) => void;
  isReadOnly?: boolean;
  selectedServiceTypeId?: number;
  showServiceTypeWarning?: boolean;
}

export const ContentsSection: React.FC<ContentsSectionProps> = ({
  contents,
  onContentsChange,
  isReadOnly = false,
  selectedServiceTypeId,
  showServiceTypeWarning = false
}) => {
  const { data: servicesData, isLoading: servicesLoading } = useServices({
    service_type_id: selectedServiceTypeId
  });
  const services = servicesData?.items || [];

  // Get list of already selected service IDs
  const selectedServiceIds = contents
    .map(content => content.service_id)
    .filter(id => id && id > 0);

  // Check if all services are already selected
  const allServicesUsed = services.length > 0 && selectedServiceIds.length >= services.length;

  const handleAddContent = () => {
    const newContent: PurposeContent = {
      service_id: 0,
      quantity: 1
    };
    onContentsChange([...contents, newContent]);
  };

  const handleRemoveContent = (index: number) => {
    const updatedContents = contents.filter((_, i) => i !== index);
    onContentsChange(updatedContents);
  };

  const handleContentChange = (index: number, field: keyof PurposeContent, value: any) => {
    const updatedContents = contents.map((content, i) => {
      if (i === index) {
        return { ...content, [field]: value };
      }
      return content;
    });
    onContentsChange(updatedContents);
  };

  // Check if a service is available for selection (not already selected by other contents)
  const isServiceAvailable = (serviceId: number, currentIndex: number) => {
    return !selectedServiceIds.some((selectedId, index) => 
      selectedId === serviceId && index !== currentIndex
    );
  };

  // Get available services for a specific content index
  const getAvailableServices = (currentIndex: number) => {
    return services.filter(service => 
      isServiceAvailable(service.id, currentIndex)
    );
  };

  if (isReadOnly && (!contents || contents.length === 0)) {
    return (
      <div className="text-sm text-muted-foreground">
        No contents specified
      </div>
    );
  }

  const renderAddContentButton = () => {
    const isDisabled = !selectedServiceTypeId || showServiceTypeWarning || allServicesUsed;
    
    const button = (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddContent}
        disabled={isDisabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Content
      </Button>
    );

    if (allServicesUsed && selectedServiceTypeId && !showServiceTypeWarning) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {button}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground border shadow-md">
              <p>All available services have been added</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Contents</Label>
        {!isReadOnly && renderAddContentButton()}
      </div>

      {showServiceTypeWarning && !isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Please select a service type first to add contents
          </p>
        </div>
      )}

      {contents.map((content, index) => {
        const availableServices = getAvailableServices(index);
        const currentService = services.find(s => s.id === content.service_id);
        
        return (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Content {index + 1}</h4>
              {!isReadOnly && contents.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveContent(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service</Label>
                {isReadOnly ? (
                  <Input
                    value={content.service_name || `Service ${content.service_id}`}
                    disabled={true}
                  />
                ) : (
                  <>
                    <Select
                      value={content.service_id?.toString() || ''}
                      onValueChange={(value) => handleContentChange(index, 'service_id', parseInt(value))}
                      disabled={servicesLoading || !selectedServiceTypeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedServiceTypeId 
                            ? "Select service type first" 
                            : servicesLoading 
                              ? "Loading services..." 
                              : "Select service"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Show currently selected service even if it would normally be disabled */}
                        {currentService && !availableServices.find(s => s.id === currentService.id) && (
                          <SelectItem key={currentService.id} value={currentService.id.toString()}>
                            {currentService.name} (current)
                          </SelectItem>
                        )}
                        {availableServices.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedServiceTypeId && availableServices.length === 0 && !currentService && (
                      <p className="text-xs text-orange-600">
                        All available services have been selected
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={content.quantity || 1}
                  onChange={(e) => handleContentChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {isReadOnly && content.service_type && (
              <div className="text-sm text-muted-foreground">
                Service Type: {content.service_type}
              </div>
            )}
          </div>
        );
      })}

      {contents.length === 0 && !isReadOnly && !showServiceTypeWarning && (
        <div className="text-center py-4 text-muted-foreground">
          <p>No contents added yet</p>
          {renderAddContentButton()}
        </div>
      )}
    </div>
  );
};
