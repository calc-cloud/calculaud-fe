import { X, Flag } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { BudgetSource } from "@/types/budgetSources";
import { RELATIVE_TIME_OPTIONS, UnifiedFilters as UnifiedFiltersType } from "@/types/filters";
import { Hierarchy } from "@/types/hierarchies";
import { Material } from "@/types/materials";
import { ResponsibleAuthority } from "@/types/responsibleAuthorities";
import { ServiceType } from "@/types/serviceTypes";
import { Supplier } from "@/types/suppliers";
import { createToggleFunction } from "@/utils/filterUtils";
import { getStatusDisplayFromLabel } from "@/utils/statusUtils";

// Generic interface for entities with id and name
interface EntityWithIdAndName {
  id: number;
  name: string;
}

interface ActiveFiltersBadgesProps {
  filters: UnifiedFiltersType;
  onFiltersChange: (filters: UnifiedFiltersType) => void;
  hierarchies: Hierarchy[];
  serviceTypes: ServiceType[];
  suppliers: Supplier[];
  materials: Material[];
  responsibleAuthorities?: ResponsibleAuthority[];
  budgetSources?: BudgetSource[];
}

export const ActiveFiltersBadges: React.FC<ActiveFiltersBadgesProps> = ({
  filters,
  onFiltersChange,
  hierarchies,
  serviceTypes,
  suppliers,
  materials,
  responsibleAuthorities = [],
  budgetSources = [],
}) => {
  const toggleServiceType = createToggleFunction<number>("service_type", filters, onFiltersChange);
  const toggleStatus = createToggleFunction<string>("status", filters, onFiltersChange);
  const toggleSupplier = createToggleFunction<number>("supplier", filters, onFiltersChange);
  const toggleMaterial = createToggleFunction<number>("material", filters, onFiltersChange);
  const toggleHierarchy = createToggleFunction<number>("hierarchy_id", filters, onFiltersChange);
  const togglePendingAuthority = createToggleFunction<number>("pending_authority", filters, onFiltersChange);
  const toggleBudgetSource = createToggleFunction<number>("budget_source", filters, onFiltersChange);

  const clearRelativeTime = () => {
    onFiltersChange({
      ...filters,
      relative_time: "all_time",
      start_date: undefined,
      end_date: undefined,
    });
  };

  const clearFlaggedFilter = () => {
    onFiltersChange({
      ...filters,
      flagged: undefined,
    });
  };

  // Generic function to render filter badges for array-based filters
  const renderFilterBadges = <T extends EntityWithIdAndName>(
    filterArray: number[] | undefined,
    dataArray: T[],
    toggleFunction: (id: number) => void
  ) => {
    if (!filterArray || filterArray.length === 0) return null;

    return filterArray.map((id) => {
      const item = dataArray.find((entity) => entity.id === id);
      return item ? (
        <Badge key={id} variant="secondary" className="flex items-center gap-1">
          {item.name}
          <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFunction(id)} />
        </Badge>
      ) : null;
    });
  };

  const activeFiltersCount = [
    ...(filters.relative_time && filters.relative_time !== "all_time" ? [1] : []),
    ...(filters.hierarchy_id || []),
    ...(filters.service_type || []),
    ...(filters.status || []),
    ...(filters.supplier || []),
    ...(filters.material || []),
    ...(filters.pending_authority || []),
    ...(filters.budget_source || []),
    ...(filters.flagged === true ? [1] : []),
  ].length;

  if (activeFiltersCount === 0) return null;

  return (
    <div className="space-y-2 pb-2">
      <div className="flex flex-wrap gap-2">
        {filters.relative_time && filters.relative_time !== "all_time" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {RELATIVE_TIME_OPTIONS.find((option) => option.value === filters.relative_time)?.label ||
              filters.relative_time}
            <X className="h-3 w-3 cursor-pointer" onClick={clearRelativeTime} />
          </Badge>
        )}
        {renderFilterBadges(filters.hierarchy_id, hierarchies, toggleHierarchy)}
        {renderFilterBadges(filters.service_type, serviceTypes, toggleServiceType)}
        {filters.status && filters.status.length > 0 && (
          <>
            {filters.status.map((status) => {
              const statusInfo = getStatusDisplayFromLabel(status);
              return (
                <Badge
                  key={status}
                  variant={statusInfo.variant}
                  className={`flex items-center gap-1 ${statusInfo.className}`}
                >
                  {status}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatus(status)} />
                </Badge>
              );
            })}
          </>
        )}
        {renderFilterBadges(filters.supplier, suppliers, toggleSupplier)}
        {renderFilterBadges(filters.material, materials, toggleMaterial)}
        {renderFilterBadges(filters.pending_authority, responsibleAuthorities, togglePendingAuthority)}
        {renderFilterBadges(filters.budget_source, budgetSources, toggleBudgetSource)}
        {filters.flagged === true && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flag className="h-3 w-3 text-red-500 fill-red-500" />
            Flagged
            <X className="h-3 w-3 cursor-pointer" onClick={clearFlaggedFilter} />
          </Badge>
        )}
      </div>
    </div>
  );
};
