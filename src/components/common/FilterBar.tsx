
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { PurposeFilters, ServiceType, PurposeStatus } from '@/types';
import { SERVICE_TYPES, PURPOSE_STATUSES } from '@/utils/constants';

interface FilterBarProps {
  filters: PurposeFilters;
  onFiltersChange: (filters: PurposeFilters) => void;
  onExport: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onExport
}) => {
  const updateFilter = (key: keyof PurposeFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== ''
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by description, content, or EMF ID..."
          value={filters.search_query || ''}
          onChange={(e) => updateFilter('search_query', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.service_type || 'all'}
          onValueChange={(value) => updateFilter('service_type', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            {SERVICE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {PURPOSE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                <Badge variant={status === 'Completed' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Hierarchy ID"
          value={filters.hierarchy_id || ''}
          onChange={(e) => updateFilter('hierarchy_id', e.target.value)}
          className="w-[130px]"
        />

        <Input
          placeholder="EMF ID"
          value={filters.emf_id || ''}
          onChange={(e) => updateFilter('emf_id', e.target.value)}
          className="w-[100px]"
        />

        <Input
          placeholder="Supplier"
          value={filters.supplier || ''}
          onChange={(e) => updateFilter('supplier', e.target.value)}
          className="w-[120px]"
        />

        <div className="flex items-center gap-2 ml-auto">
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
          
          <Button variant="outline" onClick={onExport}>
            Export
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.service_type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Service: {filters.service_type}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('service_type', undefined)}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('status', undefined)}
              />
            </Badge>
          )}
          {filters.hierarchy_id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Hierarchy: {filters.hierarchy_id}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('hierarchy_id', undefined)}
              />
            </Badge>
          )}
          {filters.emf_id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              EMF: {filters.emf_id}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('emf_id', undefined)}
              />
            </Badge>
          )}
          {filters.supplier && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Supplier: {filters.supplier}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('supplier', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
