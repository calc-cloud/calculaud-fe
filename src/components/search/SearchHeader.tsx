import {Download, Loader2, Search as SearchIcon, X} from 'lucide-react';
import React, {useState} from 'react';

import {ColumnControl, ColumnVisibility} from '@/components/common/ColumnControl';
import {FiltersDrawer} from '@/components/common/UnifiedFilters';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Separator} from '@/components/ui/separator';
import {useToast} from '@/hooks/use-toast';
import {UnifiedFilters} from '@/types/filters';
import {exportPurposesToCSV} from '@/utils/csvExport';
import {clearFilters} from '@/utils/filterUtils';
import {SortConfig} from '@/utils/sorting';

interface SearchHeaderProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
  sortConfig: SortConfig;
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  activeFiltersCount: number;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  filters,
  onFiltersChange,
  sortConfig,
  columnVisibility,
  onColumnVisibilityChange,
  activeFiltersCount
}) => {
  const { toast } = useToast();
  const [isExportLoading, setIsExportLoading] = useState(false);

  const handleExport = () => {
    exportPurposesToCSV(filters, sortConfig, toast, setIsExportLoading);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex-shrink-0">Search Purposes</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, content, or EMF ID..."
            value={filters.search_query || ''}
            onChange={(e) => onFiltersChange({...filters, search_query: e.target.value})}
            className="pl-10 focus-visible:outline-none"
          />
        </div>
        <FiltersDrawer
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
        <ColumnControl
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={() => clearFilters(onFiltersChange, filters)} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
        <Separator orientation="vertical" className="h-8" />
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={isExportLoading}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-blue-600 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExportLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExportLoading ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </div>
  );
};