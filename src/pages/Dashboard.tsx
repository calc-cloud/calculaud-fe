import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { PurposeTable } from '@/components/tables/PurposeTable';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { FilterBar } from '@/components/common/FilterBar';
import { Purpose, PurposeFilters, ModalMode } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

// Mock data for demonstration - in a real app this would come from an API
const mockPurposes: Purpose[] = [
  {
    id: '1',
    description: 'Software Development Services',
    content: 'Development of procurement management system with React and TypeScript',
    supplier: 'TechCorp Solutions',
    hierarchy_id: 'H001',
    hierarchy_name: 'IT Department',
    status: 'In Progress',
    expected_delivery: '2024-07-15',
    comments: 'Project is progressing well, on schedule',
    service_type: 'Software',
    creation_time: '2024-06-01T10:00:00Z',
    last_modified: '2024-06-15T14:30:00Z',
    emfs: [
      {
        id: 'emf-1',
        purpose_id: '1',
        creation_date: '2024-06-02',
        demand_id: 'D001',
        demand_date: '2024-06-03',
        order_id: 'O001',
        order_date: '2024-06-05',
        costs: [
          {
            id: 'cost-1',
            emf_id: 'emf-1',
            amount: 25000,
            currency: 'USD'
          }
        ]
      }
    ],
    files: []
  },
  {
    id: '2',
    description: 'Hardware Procurement',
    content: 'Purchase of new servers and networking equipment for data center upgrade',
    supplier: 'Hardware Plus Inc',
    hierarchy_id: 'H002',
    hierarchy_name: 'Infrastructure',
    status: 'Pending',
    expected_delivery: '2024-08-01',
    service_type: 'Hardware',
    creation_time: '2024-06-10T09:15:00Z',
    last_modified: '2024-06-10T09:15:00Z',
    emfs: [],
    files: []
  },
  {
    id: '3',
    description: 'Consulting Services',
    content: 'Business process optimization and digital transformation consulting',
    supplier: 'Strategic Advisors LLC',
    hierarchy_id: 'H003',
    hierarchy_name: 'Operations',
    status: 'Completed',
    expected_delivery: '2024-05-30',
    service_type: 'Consulting',
    creation_time: '2024-04-15T11:00:00Z',
    last_modified: '2024-05-30T16:45:00Z',
    emfs: [
      {
        id: 'emf-3',
        purpose_id: '3',
        creation_date: '2024-04-16',
        costs: [
          {
            id: 'cost-3',
            emf_id: 'emf-3',
            amount: 15000,
            currency: 'USD'
          }
        ]
      }
    ],
    files: []
  }
];

type SortField = 'creation_time' | 'expected_delivery' | 'last_modified';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const Dashboard: React.FC = () => {
  const [purposes, setPurposes] = useState<Purpose[]>(mockPurposes);
  const [filteredPurposes, setFilteredPurposes] = useState<Purpose[]>(mockPurposes);
  const [filters, setFilters] = useState<PurposeFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'creation_time', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const itemsPerPage = 10;

  // Sort purposes based on current sort configuration
  const sortPurposes = (purposesToSort: Purpose[], config: SortConfig): Purpose[] => {
    return [...purposesToSort].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (config.field) {
        case 'creation_time':
          aValue = new Date(a.creation_time);
          bValue = new Date(b.creation_time);
          break;
        case 'expected_delivery':
          aValue = new Date(a.expected_delivery);
          bValue = new Date(b.expected_delivery);
          break;
        case 'last_modified':
          aValue = new Date(a.last_modified);
          bValue = new Date(b.last_modified);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter and sort purposes based on current filters and sort config
  React.useEffect(() => {
    let filtered = purposes;

    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      filtered = filtered.filter(purpose => 
        purpose.description.toLowerCase().includes(query) ||
        purpose.content.toLowerCase().includes(query) ||
        purpose.supplier.toLowerCase().includes(query)
      );
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
  const stats = React.useMemo(() => {
    const total = purposes.length;
    const pending = purposes.filter(p => p.status === 'Pending').length;
    const inProgress = purposes.filter(p => p.status === 'In Progress').length;
    const completed = purposes.filter(p => p.status === 'Completed').length;
    const totalCost = purposes.reduce((sum, purpose) => {
      const purposeCost = purpose.emfs.reduce((emfSum, emf) => 
        emfSum + emf.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
      );
      return sum + purposeCost;
    }, 0);

    return { total, pending, inProgress, completed, totalCost };
  }, [purposes]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPurposes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPurposes = filteredPurposes.slice(startIndex, endIndex);

  // Reset to first page when filters or sorting change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortConfig]);

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
    // Convert filtered purposes to CSV
    const csvHeaders = [
      'ID',
      'Description',
      'Content',
      'Supplier',
      'Hierarchy ID',
      'Hierarchy Name',
      'Status',
      'Expected Delivery',
      'Service Type',
      'Creation Time',
      'Last Modified',
      'Comments',
      'Total Cost'
    ];

    const csvRows = filteredPurposes.map(purpose => {
      const totalCost = purpose.emfs.reduce((sum, emf) => 
        sum + emf.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
      );

      return [
        purpose.id,
        `"${purpose.description.replace(/"/g, '""')}"`,
        `"${purpose.content.replace(/"/g, '""')}"`,
        `"${purpose.supplier.replace(/"/g, '""')}"`,
        purpose.hierarchy_id,
        `"${purpose.hierarchy_name.replace(/"/g, '""')}"`,
        purpose.status,
        purpose.expected_delivery,
        purpose.service_type,
        purpose.creation_time,
        purpose.last_modified,
        purpose.comments ? `"${purpose.comments.replace(/"/g, '""')}"` : '',
        totalCost
      ];
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `purposes_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export completed",
      description: `Successfully exported ${filteredPurposes.length} purposes to CSV.`,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    setSortConfig({ field, direction });
  };

  const getSortDisplayName = (field: SortField): string => {
    switch (field) {
      case 'creation_time':
        return 'Creation Time';
      case 'expected_delivery':
        return 'Expected Delivery';
      case 'last_modified':
        return 'Last Modified';
      default:
        return field;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={`${sortConfig.field}-${sortConfig.direction}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select sort option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creation_time-desc">Creation Time (Newest First)</SelectItem>
              <SelectItem value="creation_time-asc">Creation Time (Oldest First)</SelectItem>
              <SelectItem value="expected_delivery-asc">Expected Delivery (Earliest First)</SelectItem>
              <SelectItem value="expected_delivery-desc">Expected Delivery (Latest First)</SelectItem>
              <SelectItem value="last_modified-desc">Last Modified (Recent First)</SelectItem>
              <SelectItem value="last_modified-asc">Last Modified (Oldest First)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPurposes.length)} of {filteredPurposes.length} purposes
          </p>
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary">
              {Object.keys(filters).filter(key => filters[key as keyof PurposeFilters]).length} filters applied
            </Badge>
          )}
          <Badge variant="outline">
            Sorted by {getSortDisplayName(sortConfig.field)} ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
          </Badge>
        </div>
      </div>

      {/* Purposes Table */}
      <PurposeTable
        purposes={paginatedPurposes}
        onView={handleViewPurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
        isLoading={false}
      />

      {/* Pagination - Always show */}
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {renderPaginationItems()}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Purpose Modal */}
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

export default Dashboard;
