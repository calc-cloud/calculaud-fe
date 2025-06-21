
import { useState, useEffect, useMemo } from 'react';
import { Purpose, PurposeFilters, ModalMode } from '@/types';
import { SortConfig, sortPurposes } from '@/utils/sorting';
import { mockPurposes } from '@/data/mockPurposes';

export const usePurposeData = () => {
  const [purposes, setPurposes] = useState<Purpose[]>(mockPurposes);
  const [filteredPurposes, setFilteredPurposes] = useState<Purpose[]>(mockPurposes);
  const [filters, setFilters] = useState<PurposeFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'creation_time', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort purposes based on current filters and sort config
  useEffect(() => {
    let filtered = purposes;

    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      filtered = filtered.filter(purpose => {
        // Search in description and content
        const matchesDescriptionOrContent = 
          purpose.description.toLowerCase().includes(query) ||
          purpose.content.toLowerCase().includes(query);
        
        // Search in EMF IDs
        const matchesEMF = purpose.emfs.some(emf => 
          emf.id.toLowerCase().includes(query)
        );
        
        return matchesDescriptionOrContent || matchesEMF;
      });
    }

    if (filters.service_type && filters.service_type.length > 0) {
      filtered = filtered.filter(purpose => filters.service_type!.includes(purpose.service_type));
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(purpose => filters.status!.includes(purpose.status));
    }

    if (filters.hierarchy_id) {
      if (Array.isArray(filters.hierarchy_id)) {
        filtered = filtered.filter(purpose => 
          filters.hierarchy_id!.includes(purpose.hierarchy_id)
        );
      } else {
        filtered = filtered.filter(purpose => 
          purpose.hierarchy_id === filters.hierarchy_id
        );
      }
    }

    if (filters.supplier && filters.supplier.length > 0) {
      filtered = filtered.filter(purpose => 
        filters.supplier!.some(supplierFilter => 
          typeof supplierFilter === 'string' && purpose.supplier.toLowerCase().includes(supplierFilter.toLowerCase())
        )
      );
    }

    // Apply sorting
    const sortedFiltered = sortPurposes(filtered, sortConfig);
    setFilteredPurposes(sortedFiltered);
  }, [filters, purposes, sortConfig]);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const total = purposes.length;
    const pending = purposes.filter(p => p.status === 'PENDING').length;
    const inProgress = purposes.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = purposes.filter(p => p.status === 'COMPLETED').length;
    const totalCost = purposes.reduce((sum, purpose) => {
      const purposeCost = purpose.emfs.reduce((emfSum, emf) => 
        emfSum + emf.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
      );
      return sum + purposeCost;
    }, 0);

    return { total, pending, inProgress, completed, totalCost };
  }, [purposes]);

  // Reset to first page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortConfig]);

  return {
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
    setCurrentPage,
    stats
  };
};
