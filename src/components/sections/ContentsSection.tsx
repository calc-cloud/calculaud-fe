import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2, Plus } from 'lucide-react';
import { PurposeContent } from '@/types';
import { useMaterials } from '@/hooks/useMaterials';

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
  const { data: materialsData, isLoading: materialsLoading } = useMaterials({
    service_type_id: selectedServiceTypeId
  });
  const materials = materialsData?.items || [];

  // Get list of already selected material IDs
  const selectedMaterialIds = contents
    .map(content => content.material_id)
    .filter(id => id && id > 0);

  // Check if all materials are already selected
  const allMaterialsUsed = materials.length > 0 && selectedMaterialIds.length >= materials.length;

  const handleAddContent = () => {
    const newContent: PurposeContent = {
      material_id: 0,
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

  // Check if a material is available for selection (not already selected by other contents)
  const isMaterialAvailable = (materialId: number, currentIndex: number) => {
    return !selectedMaterialIds.some((selectedId, index) => 
      selectedId === materialId && index !== currentIndex
    );
  };

  // Get available materials for a specific content index
  const getAvailableMaterials = (currentIndex: number) => {
    return materials.filter(material => 
      isMaterialAvailable(material.id, currentIndex)
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
    const isDisabled = !selectedServiceTypeId || showServiceTypeWarning || allMaterialsUsed;
    
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

    if (allMaterialsUsed && selectedServiceTypeId && !showServiceTypeWarning) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {button}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="left" 
              align="center"
              className="bg-popover text-popover-foreground border shadow-md max-w-xs z-50"
              sideOffset={5}
            >
              <p>All available materials have already been added</p>
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
        <Label className="text-base font-medium">Content</Label>
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
        const availableMaterials = getAvailableMaterials(index);
        const currentMaterial = materials.find(m => m.id === content.material_id);
        
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
                <Label>Material</Label>
                {isReadOnly ? (
                  <Input
                    value={content.service_name || content.material_name || `Material ${content.material_id || content.service_id}`}
                    disabled={true}
                  />
                ) : (
                  <>
                    <Select
                      value={content.material_id?.toString() || ''}
                      onValueChange={(value) => handleContentChange(index, 'material_id', parseInt(value))}
                      disabled={materialsLoading || !selectedServiceTypeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedServiceTypeId 
                            ? "Select service type first" 
                            : materialsLoading 
                              ? "Loading materials..." 
                              : "Select material"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Show currently selected material even if it would normally be disabled */}
                        {currentMaterial && !availableMaterials.find(m => m.id === currentMaterial.id) && (
                          <SelectItem key={currentMaterial.id} value={currentMaterial.id.toString()}>
                            {currentMaterial.name} (current)
                          </SelectItem>
                        )}
                        {availableMaterials.map(material => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedServiceTypeId && availableMaterials.length === 0 && !currentMaterial && (
                      <p className="text-xs text-orange-600">
                        No materials available for this service type
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

            {isReadOnly && content.material_type && (
              <div className="text-sm text-muted-foreground">
                Material Type: {content.material_type}
              </div>
            )}
          </div>
        );
      })}

      {contents.length === 0 && !isReadOnly && !showServiceTypeWarning && (
        <div className="text-center py-4 text-muted-foreground">
          <p>No contents added yet</p>
        </div>
      )}
    </div>
  );
};
