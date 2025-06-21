
import React from 'react';
import { PurposeTable } from '@/components/tables/PurposeTable';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { FilterBar } from '@/components/common/FilterBar';
import { SortControls } from '@/components/dashboard/SortControls';
import { ResultsSummary } from '@/components/dashboard/ResultsSummary';
import { DashboardPagination } from '@/components/dashboard/DashboardPagination';
import { Purpose } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { usePurposeData } from '@/hooks/usePurposeData';
import { exportPurposesToCSV } from '@/utils/csvExport';

const Search: React.FC = () => {
  const {
    purposes,
    setPurposes,
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
    setCurrentPage
  } = usePurposeData();

  const { toast } = useToast();
  const itemsPerPage = 10;

  // Pagination calculations
  const totalPages = Math.ceil(filteredPurposes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPurposes = filteredPurposes.slice(startIndex, endIndex);

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
    setPurposes(prev => prev.filter(p => p.id !== purposeId));
    toast({
      title: "Purpose deleted",
      description: "The purpose has been successfully deleted.",
    });
  };

  const handleSavePurpose = (purposeData: Partial<Purpose>) => {
    if (modalMode === 'edit' && selectedPurpose) {
      setPurposes(prev => prev.map(p => 
        p.id === selectedPurpose.id 
          ? { ...p, ...purposeData, last_modified: new Date().toISOString() }
          : p
      ));
      toast({
        title: "Purpose updated",
        description: "Purpose has been successfully updated.",
      });
    }
  };

  const handleExport = () => {
    exportPurposesToCSV(filteredPurposes, toast);
  };

  return (
    <div className="space-y-6">
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
        filteredCount={filteredPurposes.length}
        filters={filters}
        sortConfig={sortConfig}
      />

      <PurposeTable
        purposes={paginatedPurposes}
        onView={handleViewPurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
        isLoading={false}
      />

      <DashboardPagination
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
