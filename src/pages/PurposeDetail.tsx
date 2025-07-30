import React from 'react';

import { AttachedFilesCard } from '@/components/detail/AttachedFilesCard';
import { GeneralDataCard } from '@/components/detail/GeneralDataCard';
import { PurchasesTimelineCard } from '@/components/detail/PurchasesTimelineCard';
import { PurposeDetailHeader } from '@/components/detail/PurposeDetailHeader';
import { AddPurchaseModal } from '@/components/modals/AddPurchaseModal';
import { EditGeneralDataModal } from '@/components/modals/EditGeneralDataModal';
import { usePurposeDetail } from '@/hooks/usePurposeDetail';

const PurposeDetail: React.FC = () => {
  const {
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
    handleEditCancel,
    handleCloseStagePopup,
    handleSaveStage,
    
    // Utilities
    getStageDisplayDate,
    hasMultipleStagesWithSamePriority,
    getPriorityVariant,
    isCurrentPendingStage,
    calculateStagePosition,
    isPurchaseComplete,
  } = usePurposeDetail();




  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
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
          <button onClick={handleBackToSearch} className="text-blue-600 hover:text-blue-800">
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PurposeDetailHeader
        purpose={purpose}
        onBackToSearch={handleBackToSearch}
        onDeletePurpose={handleDeletePurpose}
      />

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: General Data + Attached Files */}
        <div className="lg:col-span-1 space-y-4">
          <GeneralDataCard
            purpose={purpose}
            onEdit={handleEditGeneralData}
          />
          
          <AttachedFilesCard
            purpose={purpose}
            onFilesChange={handleFilesChange}
          />
        </div>

        {/* Right Column: Purchases Timeline */}
        <div className="space-y-4 lg:col-span-3">
          <PurchasesTimelineCard
            purpose={purpose}
            onAddPurchase={() => setIsAddPurchaseModalOpen(true)}
            onDeletePurchase={handleDeletePurchase}
            editingStage={editingStage}
            selectedStage={selectedStage}
            editForm={editForm}
            isUpdatingStage={isUpdatingStage}
            onStageClick={handleStageClick}
            onEditCancel={handleEditCancel}
            onCloseStagePopup={handleCloseStagePopup}
            onSaveStage={handleSaveStage}
            setEditForm={setEditForm}
            getStageDisplayDate={getStageDisplayDate}
            hasMultipleStagesWithSamePriority={hasMultipleStagesWithSamePriority}
            getPriorityVariant={getPriorityVariant}
            isCurrentPendingStage={isCurrentPendingStage}
            calculateStagePosition={calculateStagePosition}
            isPurchaseComplete={isPurchaseComplete}
          />
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

      {/* Full-screen overlay when stage is expanded */}
      {selectedStage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={handleCloseStagePopup}
        />
      )}

    </div>
  );
};

export default PurposeDetail;