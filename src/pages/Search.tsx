
import React from 'react';
import { PurposeTable } from '@/components/tables/PurposeTable';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { FilterBar } from '@/components/common/FilterBar';
import { SortControls } from '@/components/search/SortControls';
import { ResultsSummary } from '@/components/search/ResultsSummary';
import { TablePagination } from '@/components/tables/TablePagination';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Purpose } from '@/types';
import { usePurposeData } from '@/hooks/usePurposeData';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { exportPurposesToCSV } from '@/utils/csvExport';

const Search: React.FC = () => {
  const {
    purposes,
    filteredPurposes,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    setModalMode,
    selectedPurpose,
    setSelectedPurpose,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    isLoading,
    error
  } = usePurposeData();

  const { createPurpose, updatePurpose, deletePurpose } = usePurposeMutations();

  const itemsPerPage = 10;

  // Calculate display indices for server-side pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + filteredPurposes.length, totalCount);

  const handleCreatePurpose = () => {
    setSelectedPurpose(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewPurpose = (purpose: Purpose) => {
    setSelectedPurpose(purpose);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditPurpose = (purpose: Purpose) => {
    setSelectedPurpose(purpose);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeletePurpose = (purposeId: string) => {
    deletePurpose.mutate(purposeId);
  };

  const handleSavePurpose = (purposeData: Partial<Purpose>) => {
    if (modalMode === 'create') {
      createPurpose.mutate(purposeData);
    } else if (modalMode === 'edit' && selectedPurpose) {
      updatePurpose.mutate({ 
        id: selectedPurpose.id, 
        data: purposeData 
      });
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    exportPurposesToCSV(filteredPurposes);
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load purposes</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Search Purposes</h1>
        <Button onClick={handleCreatePurpose} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Purpose
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      <SortControls
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
      />

      <ResultsSummary
        startIndex={startIndex}
        endIndex={endIndex}
        filteredCount={totalCount}
        filters={filters}
        sortConfig={sortConfig}
      />

      <PurposeTable
        purposes={filteredPurposes}
        onView={handleViewPurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
        isLoading={isLoading}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <PurposeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        purpose={selectedPurpose}
        onSave={handleSavePurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
      />
    </div>
  );
};

export default Search;
