import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAdminData } from '@/contexts/AdminDataContext';
import { useToast } from '@/hooks/use-toast';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { purposeService } from '@/services/purposeService';
import { stageService, UpdateStageRequest } from '@/services/stageService';
import { Purpose, PurposeFile, CreatePurchaseRequest } from '@/types';
import { convertPurchaseToStages } from '@/utils/stageUtils';

export const usePurposeDetail = () => {
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
  const [editForm, setEditForm] = useState({ date: '', text: '' });
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  
  // Real API data loading
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data loading effect
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

  // Handler functions
  const handleEditGeneralData = () => {
    setSelectedPurpose(purpose);
    setIsEditModalOpen(true);
  };

  const handleBackToSearch = () => {
    const searchUrl = sessionStorage.getItem('searchUrl');
    if (searchUrl) {
      // Navigate to the stored search URL to preserve filters
      window.location.href = searchUrl;
    } else {
      // Fallback to clean search page if no stored URL
      navigate('/search');
    }
  };

  const handleDeletePurpose = async () => {
    if (!id) return;
    
    try {
      await deletePurpose.mutateAsync(id);
      // Go back to search with stored filters
      handleBackToSearch();
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleFilesChange = (newFiles: PurposeFile[]) => {
    if (purpose) {
      setPurpose({
        ...purpose,
        files: newFiles
      });
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
    } catch {
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

  const handleDeletePurchase = async (purchaseId: string) => {
    try {
      await purposeService.deletePurchase(purchaseId);
      
      toast({
        title: "Purchase deleted",
        description: "The purchase has been deleted successfully.",
      });
      
      // Refresh the purpose data to show updated purchases
      if (id) {
        const apiPurpose = await purposeService.getPurpose(id);
        const transformedPurpose = purposeService.transformApiPurpose(apiPurpose, hierarchies);
        
        setPurpose(transformedPurpose);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete purchase';
      toast({
        title: "Error deleting purchase",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleStageClick = (stage: any) => {
    setSelectedStage(stage);
    // Automatically start editing when clicking on a stage
    handleEditStart(stage.id, stage.date, stage.value);
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
  };

  const handleCloseStagePopup = () => {
    setSelectedStage(null);
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
      // editForm.date is already in "YYYY-MM-DD" format from HTML date input
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

  // Utility functions
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    // Convert date to YYYY-MM-DD format for HTML date input
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateForTimeline = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getStageDisplayDate = (stage: any) => {
    if (stage.completed && stage.date) {
      const formattedDate = formatDateForTimeline(stage.date);
      if (stage.days_since_previous_stage !== null && stage.days_since_previous_stage !== undefined) {
        return `${formattedDate} (${stage.days_since_previous_stage} days)`;
      }
      return formattedDate;
    }
    
    return ''; // No text for incomplete stages
  };

  const hasMultipleStagesWithSamePriority = (stages: any[], stage: any) => {
    return stages.filter(s => s.priority === stage.priority).length > 1;
  };

  const getPriorityVariant = (priority: number) => {
    const variants = [
      'secondary', // purple-ish
      'outline',   // teal-ish
      'default'    // blue-ish
    ];
    return variants[(priority - 1) % variants.length] as 'secondary' | 'outline' | 'default';
  };

  const isCurrentPendingStage = (stage: any, purchase: any) => {
    if (!purchase.current_pending_stages || purchase.current_pending_stages.length === 0) {
      return false;
    }
    return purchase.current_pending_stages.some((pendingStage: any) => pendingStage.id === stage.id);
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

  return {
    // Data
    purpose,
    isLoading,
    error,
    
    // Modal states
    isEditModalOpen,
    setIsEditModalOpen,
    selectedPurpose,
    setSelectedPurpose,
    isAddPurchaseModalOpen,
    setIsAddPurchaseModalOpen,
    isCreatingPurchase,
    
    // Stage editing states
    editingStage,
    selectedStage,
    editForm,
    setEditForm,
    isUpdatingStage,
    
    // Handlers
    handleEditGeneralData,
    handleBackToSearch,
    handleDeletePurpose,
    handleFilesChange,
    handleSaveGeneralData,
    handleCreatePurchase,
    handleDeletePurchase,
    handleStageClick,
    handleEditStart,
    handleEditCancel,
    handleCloseStagePopup,
    handleSaveStage,
    
    // Utilities
    formatDateForInput,
    formatDateForTimeline,
    getStageDisplayDate,
    hasMultipleStagesWithSamePriority,
    getPriorityVariant,
    isCurrentPendingStage,
    calculateStagePosition,
    isPurchaseComplete,
  };
};