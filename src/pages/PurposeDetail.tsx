import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Plus, Trash2, Calendar, Building, Target, MessageSquare, Activity, Layers } from 'lucide-react';
import { Purpose, PurposeFile } from '@/types';
import { usePurposeData } from '@/hooks/usePurposeData';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { formatDate } from '@/utils/dateUtils';
import { useAdminData } from '@/contexts/AdminDataContext';
import { EditGeneralDataModal } from '@/components/modals/EditGeneralDataModal';
import { FileUpload } from '@/components/common/FileUpload';
import { useToast } from '@/hooks/use-toast';
import { purposeService } from '@/services/purposeService';

const PurposeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hierarchies, suppliers, serviceTypes } = useAdminData();
  const { deletePurpose, updatePurpose } = usePurposeMutations();
  
  // State for modals and editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  
  // Real API data loading
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPurpose = async () => {
      if (!id) {
        setPurpose(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch purpose from API
        const apiPurpose = await purposeService.getPurpose(id);
        
        // Transform API data to frontend format
        const transformedPurpose = purposeService.transformApiPurpose(apiPurpose, hierarchies);
        
        setPurpose(transformedPurpose);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load purpose';
        console.error('Failed to load purpose:', err);
        setError(errorMessage);
        setPurpose(null);
        toast({
          title: "Error loading purpose",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPurpose();
  }, [id, hierarchies, toast]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { label: 'In Progress', variant: 'default' as const };
      case 'COMPLETED':
        return { label: 'Completed', variant: 'secondary' as const };
      default:
        return { label: status, variant: 'outline' as const };
    }
  };

  const handleEditGeneralData = () => {
    setSelectedPurpose(purpose);
    setIsEditModalOpen(true);
  };

  const handleDeletePurpose = async () => {
    if (!id) return;
    
    try {
      await deletePurpose.mutateAsync(id);
      navigate('/search');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleFilesChange = (newFiles: PurposeFile[]) => {
    if (purpose) {
      setPurpose({
        ...purpose,
        files: newFiles
      });
      
      // Only show toast if files were added (not just reordered)
      if (newFiles.length > purpose.files.length) {
        toast({
          title: "Files uploaded",
          description: `${newFiles.length - purpose.files.length} file(s) uploaded successfully.`,
        });
      }
    }
  };

  const handleSaveGeneralData = async (editedPurpose: Purpose) => {
    if (!id) return;
    
    try {
      // Transform the edited purpose data to API format
      const updateData = {
        description: editedPurpose.description,
        supplier_id: suppliers.find(s => s.name === editedPurpose.supplier)?.id,
        service_type_id: serviceTypes.find(st => st.name === editedPurpose.service_type)?.id,
        expected_delivery: editedPurpose.expected_delivery && editedPurpose.expected_delivery.trim() 
          ? editedPurpose.expected_delivery 
          : null,
        status: editedPurpose.status,
        hierarchy_id: editedPurpose.hierarchy_id,
        comments: editedPurpose.comments && editedPurpose.comments.trim() 
          ? editedPurpose.comments 
          : null,
        contents: editedPurpose.contents?.map(content => ({
          service_id: content.material_id,
          quantity: content.quantity
        })) || []
      };

      // Call the update mutation
      await updatePurpose.mutateAsync({ id, data: updateData });
      
      // Reload the purpose from API to get the latest data
      const apiPurpose = await purposeService.getPurpose(id);
      const transformedPurpose = purposeService.transformApiPurpose(apiPurpose, hierarchies);
      setPurpose(transformedPurpose);
      
      setIsEditModalOpen(false);
      setSelectedPurpose(null);
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to update purpose:', error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !purpose) {
    return (
      <div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error Loading Purpose' : 'Purpose not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The purpose you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate('/search')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(purpose.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purpose Details</h1>
            <p className="text-sm text-gray-500">Created {formatDate(purpose.creation_time)}</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Purpose
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the purpose
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePurpose}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: General Data */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">General Data</CardTitle>
              <Button variant="outline" size="sm" onClick={handleEditGeneralData}>
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
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Expected Delivery</p>
                    <p className="text-sm text-gray-600">{formatDate(purpose.expected_delivery)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
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
                  <p className="text-sm text-gray-600">{purpose.comments || 'No status message'}</p>
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
        </div>

        {/* Right Column: Purchases Timeline + Attached Files */}
        <div className="space-y-4 lg:col-span-3">
          {/* Purchases Timeline */}
          <Card className="flex-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Purchases & EMF Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {purpose.emfs.length > 0 ? (
                <div className="space-y-4">
                  {purpose.emfs.map((emf) => (
                    <div key={emf.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">{emf.id}</h4>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(emf.creation_date)}
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="relative mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-gray-500">EMF</div>
                          <div className="text-xs text-gray-500">Demand</div>
                          <div className="text-xs text-gray-500">Order</div>
                          <div className="text-xs text-gray-500">Bikushit</div>
                        </div>
                        
                        <div className="flex items-center justify-between relative">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mb-1"></div>
                            <div className="text-xs text-center">
                              <div className="font-medium">{formatDate(emf.creation_date)}</div>
                            </div>
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mb-1 ${emf.demand_creation_date ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="text-xs text-center">
                              <div className="font-medium">{emf.demand_creation_date ? formatDate(emf.demand_creation_date) : '-'}</div>
                            </div>
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mb-1 ${emf.order_creation_date ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="text-xs text-center">
                              <div className="font-medium">{emf.order_creation_date ? formatDate(emf.order_creation_date) : '-'}</div>
                            </div>
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mb-1 ${emf.bikushit_creation_date ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="text-xs text-center">
                              <div className="font-medium">{emf.bikushit_creation_date ? formatDate(emf.bikushit_creation_date) : '-'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Costs */}
                      <div>
                        <h5 className="text-sm font-medium mb-2">Costs</h5>
                        <div className="flex flex-wrap gap-1">
                          {emf.costs.map((cost) => (
                            <Badge key={cost.id} variant="outline" className="text-xs">
                              ${cost.amount.toLocaleString()} {cost.currency.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3 text-sm">No purchases or EMFs yet</p>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-3 w-3" />
                    Add First EMF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attached Files */}
          <Card className="flex-none">
            <CardContent className="p-6">
              <FileUpload
                files={purpose.files}
                onFilesChange={handleFilesChange}
                isReadOnly={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit General Data Modal */}
      {selectedPurpose && (
        <EditGeneralDataModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPurpose(null);
          }}
          purpose={selectedPurpose}
          onSave={handleSaveGeneralData}
        />
      )}
    </div>
  );
};

export default PurposeDetail;