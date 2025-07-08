import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Plus, Trash2, Calendar, Building, Target, MessageSquare, Activity, Layers, Edit2, Check, X } from 'lucide-react';
import { Purpose, PurposeFile, CreatePurchaseRequest, getCurrencySymbol } from '@/types';

import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { formatDate } from '@/utils/dateUtils';
import { useAdminData } from '@/contexts/AdminDataContext';
import { EditGeneralDataModal } from '@/components/modals/EditGeneralDataModal';
import { AddPurchaseModal } from '@/components/modals/AddPurchaseModal';
import { FileUpload } from '@/components/common/FileUpload';
import { useToast } from '@/hooks/use-toast';
import { purposeService } from '@/services/purposeService';
import { stageService, UpdateStageRequest } from '@/services/stageService';

const PurposeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hierarchies, suppliers, serviceTypes } = useAdminData();
  const { deletePurpose, updatePurpose } = usePurposeMutations();
  
  // State for modals and editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  
  // Timeline state
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<any | null>(null);
  const [selectedStagePosition, setSelectedStagePosition] = useState<{ x: number, isAbove: boolean } | null>(null);
  const [editForm, setEditForm] = useState({ date: '', text: '' });
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  
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
        return { label: 'In Progress', variant: 'secondary' as const };
      case 'COMPLETED':
        return { label: 'Completed', variant: 'default' as const };
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
    }
  };

  const handleCreatePurchase = async (purchaseData: CreatePurchaseRequest) => {
    if (!id) return;
    
    setIsCreatingPurchase(true);
    
    try {
      await purposeService.createPurchase(purchaseData);
      
      toast({
        title: "Purchase created",
        description: "The purchase has been created successfully.",
      });
      
      // Refresh the page to get the updated purpose with the new purchase
      window.location.reload();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create purchase';
      toast({
        title: "Error creating purchase",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreatingPurchase(false);
      setIsAddPurchaseModalOpen(false);
    }
  };

  // Timeline utility functions
  const convertPurchaseToStages = (purchase: any) => {
    // Keep stages in the order from API response (no sorting by priority or dates)
    // Flatten nested arrays of stages - treat array items as independent stages
    const stages = (purchase.flow_stages || [])
      .flatMap((item: any) => Array.isArray(item) ? item : [item]) // Flatten nested stage arrays
      .filter((stage: any) => stage && stage.stage_type && (stage.stage_type.display_name || stage.stage_type.name)) // Filter out invalid stages
      .map((stage: any) => ({
        id: stage.id,
        name: stage.stage_type.display_name || stage.stage_type.name, // Using display_name from API response
        completed: !!stage.completion_date,
        date: stage.completion_date, // Only show completion date, no fallback to creation date
        value: stage.value || '',
        priority: stage.priority,
        stage_type: stage.stage_type
      }));
    
    // Only create a basic creation stage if there are truly no flow stages
    if (stages.length === 0) {
      return [{
        id: `${purchase.id}-creation`,
        name: 'Created',
        completed: true,
        date: purchase.creation_date,
        value: `Purchase #${purchase.id}`,
        priority: 0, // Changed from 1 to 0 to ensure it comes before any actual stages
        stage_type: { name: 'creation', value_required: false }
      }];
    }
    
    return stages;
  };



  const handleStageClick = (stage: any, stageIndex: number, allStages: any[]) => {
    const position = calculateStagePosition(allStages, stageIndex);
    const isAbove = stageIndex % 2 === 0;
    setSelectedStage(stage);
    setSelectedStagePosition({ x: position, isAbove });
    // Automatically start editing when clicking on a stage
    handleEditStart(stage.id, stage.date, stage.value);
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    // Convert date to YYYY-MM-DD format for HTML date input
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleEditStart = (stageId: string, date: string, value: string) => {
    setEditingStage(stageId);
    // For incomplete stages (no date), use today's date as default
    const formDate = date ? formatDateForInput(date) : new Date().toISOString().split('T')[0];
    setEditForm({ date: formDate, text: value });
  };

  const handleEditCancel = () => {
    setEditingStage(null);
    setEditForm({ date: '', text: '' });
    // Close the popup completely instead of showing expanded read mode
    setSelectedStage(null);
    setSelectedStagePosition(null);
  };

  const handleCloseStagePopup = () => {
    setSelectedStage(null);
    setSelectedStagePosition(null);
    setEditingStage(null);
    setEditForm({ date: '', text: '' });
  };

  const handleSaveStage = async (stage: any) => {
    if (!stage.id || isUpdatingStage) return;
    
    setIsUpdatingStage(true);
    
    try {
      // Prepare the update data
      const updateData: UpdateStageRequest = {};
      
      // Add value if stage requires it
      if (stage.stage_type.value_required) {
        updateData.value = editForm.text || null;
      }
      
      // Handle completion date
      // Use the edited date from the form for both completed and incomplete stages
      updateData.completion_date = editForm.date || null;
      
      // Call the API
      await stageService.updateStage(stage.id.toString(), updateData);
      
      toast({
        title: "Stage updated",
        description: "The stage has been updated successfully.",
      });
      
      // Close the editing mode
      setEditingStage(null);
      setEditForm({ date: '', text: '' });
      setSelectedStage(null);
      setSelectedStagePosition(null);
      
      // Refresh the purpose data to show updated stage
      if (id) {
        const apiPurpose = await purposeService.getPurpose(id);
        const transformedPurpose = purposeService.transformApiPurpose(apiPurpose, hierarchies);
        setPurpose(transformedPurpose);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update stage';
      toast({
        title: "Error updating stage",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const formatDateForTimeline = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getDaysSinceLastCompletion = (stages: any[], currentIndex: number) => {
    // Find the last completed stage before this one
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (stages[i].completed && stages[i].date) {
        const lastCompletionDate = new Date(stages[i].date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastCompletionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
    }
    return null;
  };

  const getStageDisplayDate = (stage: any, stages: any[], index: number) => {
    if (stage.completed && stage.date) {
      return formatDateForTimeline(stage.date);
    }
    
    // Only show days counter for the immediate next stage after the last completed stage
    if (!stage.completed) {
      // Find the last completed stage index
      let lastCompletedIndex = -1;
      for (let i = stages.length - 1; i >= 0; i--) {
        if (stages[i].completed && stages[i].date) {
          lastCompletedIndex = i;
          break;
        }
      }
      
      // Only show counter if this is the immediate next stage after the last completed one
      if (lastCompletedIndex !== -1 && index === lastCompletedIndex + 1) {
        const daysSince = getDaysSinceLastCompletion(stages, index);
        if (daysSince !== null) {
          return `${daysSince} days since last completion`;
        }
      }
    }
    
    return ''; // No text for other incomplete stages
  };

  const calculateStagePosition = (stages: any[], stageIndex: number) => {
    if (stages.length <= 1) return 50; // Center if only one stage
    
    // Distribute stages evenly across the timeline
    // Use minimal padding (5% on each side) to maximize use of available space
    const padding = 5;
    const availableWidth = 100 - (padding * 2);
    const position = padding + (stageIndex / (stages.length - 1)) * availableWidth;
    
    return position;
  };

  const isPurchaseComplete = (purchase: any) => {
    // Convert purchase to stages to check completion status
    const stages = convertPurchaseToStages(purchase);
    
    // A purchase is complete if all stages have completion dates
    return stages.every(stage => stage.completed);
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
          <Badge variant={statusDisplay.variant} className="cursor-default pointer-events-none">{statusDisplay.label}</Badge>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Purchases</CardTitle>
                {purpose.purchases.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddPurchaseModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Purchase
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {purpose.purchases.length > 0 ? (
                <div className="space-y-8">
                  {purpose.purchases
                    .sort((a, b) => {
                      // Sort incomplete purchases first, then completed purchases
                      const aComplete = isPurchaseComplete(a);
                      const bComplete = isPurchaseComplete(b);
                      
                      if (aComplete === bComplete) {
                        // If both are complete or both are incomplete, maintain original order
                        return 0;
                      }
                      
                      // Incomplete (false) comes before complete (true)
                      return aComplete ? 1 : -1;
                    })
                    .map((purchase, purchaseIndex) => {
                    const stages = convertPurchaseToStages(purchase);
                    
                                          return (
                        <div key={purchase.id}>
                          <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-800">Purchase #{purchase.id}</h3>
                          <div className="text-xs text-gray-500">
                            Created: {formatDate(purchase.creation_date)}
                          </div>
                        </div>
                      
                                                                                                                                                           <div className="relative">
                           {/* Timeline Container with dedicated areas */}
                           <div className="relative px-4" id={`timeline-${purchase.id}`}>
                             
                                                                          {/* Above Timeline Area */}
                             <div className="relative h-28 mb-6">
                               {stages.map((stage, index) => {
                                 const position = calculateStagePosition(stages, index);
                                 const isAboveTimeline = index % 2 === 0;
                                 
                                 if (!isAboveTimeline) return null;
                                 
                                 const isExpanded = selectedStage?.id === stage.id;
                                 
                                 return (
                                   <div key={`${stage.id}-above`}>
                                                                           {/* Expandable Stage Card Above Timeline */}
                                      <div
                                        className="absolute bottom-0 flex flex-col items-center"
                                        style={{
                                          left: `${position}%`,
                                          transform: 'translateX(-50%)',
                                          zIndex: isExpanded ? 50 : 10
                                        }}
                                      >
                                                                <div 
                          className={`bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 ${
                            isExpanded 
                              ? 'w-64 p-4 shadow-xl hover:shadow-2xl z-50' 
                              : 'min-w-32 max-w-40 p-3 hover:shadow-md z-10'
                          }`}
                         onClick={() => handleStageClick(stage, index, stages)}
                       >
                         {/* Collapsed Content */}
                         {!isExpanded && (
                           <div className="text-center">
                             <h4 className="font-medium text-gray-800 text-xs mb-1 leading-tight break-words">{stage.name || 'Unknown Stage'}</h4>
                             {stage.completed && stage.stage_type.value_required && stage.value && stage.value.trim() !== '' && (
                               <div className="text-xs text-blue-600 font-medium mb-1 break-words">
                                 {stage.value}
                               </div>
                             )}
                             {getStageDisplayDate(stage, stages, index) && (
                               <div className="text-xs text-gray-500">
                                 {getStageDisplayDate(stage, stages, index)}
                               </div>
                             )}
                           </div>
                         )}
                                         
                                         {/* Expanded Content */}
                                         {isExpanded && (
                                           <div className="space-y-3">
                                             <div className="flex items-center justify-between mb-3">
                                               <h4 className="font-medium text-gray-800 text-sm">{stage.name}</h4>
                                               <div className="flex items-center space-x-1">
                                                 <div 
                                                   className={`w-3 h-3 rounded-full ${
                                                     stage.completed 
                                                       ? 'bg-green-500' 
                                                       : 'bg-gray-300'
                                                   }`}
                                                 />
                                                 <button
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     handleCloseStagePopup();
                                                   }}
                                                   className="text-gray-400 hover:text-gray-600 transition-colors"
                                                 >
                                                   <X className="w-4 h-4" />
                                                 </button>
                                               </div>
                                             </div>
                                             
                                             {editingStage === stage.id && (
                                               <div className="space-y-3">
                                                 {stage.completed && (
                                                   <div>
                                                     <label className="text-xs text-gray-500 mb-1 block">Completion Date</label>
                                                     <input
                                                       type="date"
                                                       value={editForm.date}
                                                       onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                                       className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                     />
                                                   </div>
                                                 )}
                                                 {!stage.completed && (
                                                   <div>
                                                     <label className="text-xs text-gray-500 mb-1 block">Completion Date</label>
                                                     <input
                                                       type="date"
                                                       value={editForm.date}
                                                       onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                                       className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                     />
                                                   </div>
                                                 )}
                                                 {stage.stage_type.value_required && (
                                                   <div>
                                                     <label className="text-xs text-gray-500 mb-1 block">Value</label>
                                                     <input
                                                       type="text"
                                                       value={editForm.text}
                                                       onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                                                       className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                     />
                                                   </div>
                                                 )}
                                                 <div className="flex space-x-2">
                                                   <button
                                                     onClick={(e) => {
                                                       e.stopPropagation();
                                                       handleSaveStage(stage);
                                                     }}
                                                     disabled={isUpdatingStage}
                                                     className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                   >
                                                     <Check className="w-3 h-3 mr-1" />
                                                     {isUpdatingStage ? 'Saving...' : 'Save'}
                                                   </button>
                                                   <button
                                                     onClick={(e) => {
                                                       e.stopPropagation();
                                                       handleEditCancel();
                                                     }}
                                                     disabled={isUpdatingStage}
                                                     className="flex items-center px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                   >
                                                     <X className="w-3 h-3 mr-1" />
                                                     Cancel
                                                   </button>
                                                 </div>
                                               </div>
                                             )}
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                             
                             {/* Timeline Line */}
                             <div className="relative h-1">
                               {(() => {
                                 const firstStagePosition = calculateStagePosition(stages, 0);
                                 const lastStagePosition = calculateStagePosition(stages, stages.length - 1);
                                 return (
                                   <div 
                                     className="absolute top-1/2 h-0.5 bg-gray-300 -translate-y-1/2"
                                     style={{
                                       left: `${firstStagePosition}%`,
                                       right: `${100 - lastStagePosition}%`
                                     }}
                                   ></div>
                                 );
                               })()}
                               
                               {/* Stage Dots and Connecting Lines */}
                               {stages.map((stage, index) => {
                                 const position = calculateStagePosition(stages, index);
                                 const isAboveTimeline = index % 2 === 0;
                                 return (
                                   <div 
                                     key={`${stage.id}-dot`}
                                     className="absolute top-1/2 transform -translate-y-1/2"
                                     style={{
                                       left: `${position}%`,
                                       transform: 'translateX(-50%) translateY(-50%)',
                                     }}
                                   >
                                     {/* Connecting Line */}
                                     <div 
                                       className="absolute w-0.5 bg-gray-200"
                                       style={{
                                         left: '50%',
                                         transform: 'translateX(-50%)',
                                         ...(isAboveTimeline 
                                           ? { bottom: '0.5rem', height: '1.5rem' }
                                           : { top: '0.5rem', height: '1.5rem' }
                                         )
                                       }}
                                     />
                                     
                                     {/* Stage Dot */}
                                     <div 
                                       className={`w-4 h-4 rounded-full border-2 flex items-center justify-center relative z-10 ${
                                         stage.completed 
                                           ? 'bg-green-500 border-green-500' 
                                           : 'bg-white border-gray-300'
                                       }`}
                                     >
                                       {stage.completed && (
                                         <Check className="w-2 h-2 text-white" />
                                       )}
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                             
                             {/* Below Timeline Area */}
                             <div className="relative h-28 mt-6">
                               {stages.map((stage, index) => {
                                 const position = calculateStagePosition(stages, index);
                                 const isAboveTimeline = index % 2 === 0;
                                 
                                 if (isAboveTimeline) return null;
                                 
                                 const isExpanded = selectedStage?.id === stage.id;
                                 
                                 return (
                                   <div key={`${stage.id}-below`}>
                                                                           {/* Expandable Stage Card Below Timeline */}
                                      <div
                                        className="absolute top-0 flex flex-col items-center"
                                        style={{
                                          left: `${position}%`,
                                          transform: 'translateX(-50%)',
                                          zIndex: isExpanded ? 50 : 10
                                        }}
                                      >
                                                                <div 
                          className={`bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 ${
                            isExpanded 
                              ? 'w-60 p-4 shadow-xl hover:shadow-2xl z-50' 
                              : 'min-w-32 max-w-40 p-3 hover:shadow-md z-10'
                          }`}
                         onClick={() => handleStageClick(stage, index, stages)}
                       >
                         {/* Collapsed Content */}
                         {!isExpanded && (
                           <div className="text-center">
                             <h4 className="font-medium text-gray-800 text-xs mb-1 leading-tight break-words">{stage.name || 'Unknown Stage'}</h4>
                             {stage.completed && stage.stage_type.value_required && stage.value && stage.value.trim() !== '' && (
                               <div className="text-xs text-blue-600 font-medium mb-1 break-words">
                                 {stage.value}
                               </div>
                             )}
                             {getStageDisplayDate(stage, stages, index) && (
                               <div className="text-xs text-gray-500">
                                 {getStageDisplayDate(stage, stages, index)}
                               </div>
                             )}
                           </div>
                         )}
                                         
                                         {/* Expanded Content */}
                                         {isExpanded && (
                                           <div className="space-y-3">
                                             <div className="flex items-center justify-between mb-3">
                                               <h4 className="font-medium text-gray-800 text-sm">{stage.name}</h4>
                                               <div className="flex items-center space-x-1">
                                                 <div 
                                                   className={`w-3 h-3 rounded-full ${
                                                     stage.completed 
                                                       ? 'bg-green-500' 
                                                       : 'bg-gray-300'
                                                   }`}
                                                 />
                                                 <button
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     handleCloseStagePopup();
                                                   }}
                                                   className="text-gray-400 hover:text-gray-600 transition-colors"
                                                 >
                                                   <X className="w-4 h-4" />
                                                 </button>
                                               </div>
                                             </div>
                                             
                                             {editingStage === stage.id && (
                                               <div className="space-y-3">
                                                 {stage.completed && (
                                                   <div>
                                                     <label className="text-xs text-gray-500 mb-1 block">Completion Date</label>
                                                     <input
                                                       type="date"
                                                       value={editForm.date}
                                                       onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                                       className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                     />
                                                   </div>
                                                 )}
                                                 {!stage.completed && (
                                                   <div>
                                                     <label className="text-xs text-gray-500 mb-1 block">Completion Date</label>
                                                     <input
                                                       type="date"
                                                       value={editForm.date}
                                                       onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                                       className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                     />
                                                   </div>
                                                 )}
                                                 {stage.stage_type.value_required && (
                                                   <div>
                                                     <label className="text-xs text-gray-500 mb-1 block">Value</label>
                                                     <input
                                                       type="text"
                                                       value={editForm.text}
                                                       onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                                                       className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                     />
                                                   </div>
                                                 )}
                                                 <div className="flex space-x-2">
                                                   <button
                                                     onClick={(e) => {
                                                       e.stopPropagation();
                                                       handleSaveStage(stage);
                                                     }}
                                                     disabled={isUpdatingStage}
                                                     className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                   >
                                                     <Check className="w-3 h-3 mr-1" />
                                                     {isUpdatingStage ? 'Saving...' : 'Save'}
                                                   </button>
                                                   <button
                                                     onClick={(e) => {
                                                       e.stopPropagation();
                                                       handleEditCancel();
                                                     }}
                                                     disabled={isUpdatingStage}
                                                     className="flex items-center px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                   >
                                                     <X className="w-3 h-3 mr-1" />
                                                     Cancel
                                                   </button>
                                                 </div>
                                               </div>
                                             )}
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>
                         </div>
                          
                          {/* Cost */}
                          <div className="mt-6">
                            <h5 className="text-base font-medium mb-2">Cost</h5>
                        <div className="flex flex-wrap gap-1">
                          {purchase.costs.map((cost) => {
                            return (
                              <Badge key={cost.id} variant="outline" className="text-sm">
                                {getCurrencySymbol(cost.currency)}{cost.amount.toLocaleString()} {cost.currency}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                        
                        {/* Add separator between purchases, but not after the last one */}
                        {purchaseIndex < purpose.purchases.length - 1 && (
                          <div className="mt-6">
                            <Separator />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3 text-sm">No purchases yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddPurchaseModalOpen(true)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add First Purchase
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

      {/* Add Purchase Modal */}
      {purpose && (
        <AddPurchaseModal
          isOpen={isAddPurchaseModalOpen}
          onClose={() => setIsAddPurchaseModalOpen(false)}
          onSubmit={handleCreatePurchase}
          purposeId={parseInt(purpose.id)}
          isLoading={isCreatingPurchase}
        />
      )}

    </div>
  );
};

export default PurposeDetail;