import { useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Search as SearchIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ActiveFiltersBadges } from "@/components/common/ActiveFiltersBadges";
import { ColumnControl, ColumnVisibility } from "@/components/common/ColumnControl";
import { FiltersDrawer } from "@/components/common/UnifiedFilters";
import { TablePagination } from "@/components/tables/TablePagination";
import { TanStackPurposeTable } from "@/components/tables/TanStackPurposeTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAdminData } from "@/contexts/AdminDataContext";
import { useToast } from "@/hooks/use-toast";
import { usePurposeData } from "@/hooks/usePurposeData";
import { usePurposeMutations } from "@/hooks/usePurposeMutations";
import { Purpose } from "@/types";
import { UnifiedFilters as UnifiedFiltersType } from "@/types/filters";
import {
  ColumnSizing,
  loadColumnSizing,
  loadColumnVisibility,
  saveColumnSizing,
  saveColumnVisibility,
} from "@/utils/columnStorage";
import { exportPurposesToCSV } from "@/utils/csvExport";
import { clearFilters } from "@/utils/filterUtils";
import { togglePurposeFlag } from "@/utils/purposeActions";
import { SortConfig } from "@/utils/sorting";

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { deletePurpose } = usePurposeMutations();

  // Parse URL params to initial state
  const getInitialFilters = (): UnifiedFiltersType => {
    const filters: UnifiedFiltersType = {};

    if (searchParams.get("search_query")) {
      filters.search_query = searchParams.get("search_query") || undefined;
    }

    // Parse service type IDs
    if (searchParams.get("service_type_id")) {
      const serviceTypeIds = searchParams
        .get("service_type_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (serviceTypeIds && serviceTypeIds.length > 0) {
        filters.service_type = serviceTypeIds;
      }
    }

    if (searchParams.get("status")) {
      filters.status = searchParams.get("status")?.split(",");
    }

    // Parse supplier IDs
    if (searchParams.get("supplier_id")) {
      const supplierIds = searchParams
        .get("supplier_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (supplierIds && supplierIds.length > 0) {
        filters.supplier = supplierIds;
      }
    }

    if (searchParams.get("hierarchy_id")) {
      const hierarchyIds = searchParams
        .get("hierarchy_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (hierarchyIds && hierarchyIds.length > 0) {
        filters.hierarchy_id = hierarchyIds;
      }
    }

    // Parse material IDs (service IDs)
    if (searchParams.get("material_id")) {
      const materialIds = searchParams
        .get("material_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (materialIds && materialIds.length > 0) {
        filters.material = materialIds;
      }
    }

    // Parse pending authority IDs
    if (searchParams.get("pending_authority_id")) {
      const pendingAuthorityIds = searchParams
        .get("pending_authority_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (pendingAuthorityIds && pendingAuthorityIds.length > 0) {
        filters.pending_authority = pendingAuthorityIds;
      }
    }

    // Parse budget source IDs
    if (searchParams.get("budget_source_id")) {
      const budgetSourceIds = searchParams
        .get("budget_source_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (budgetSourceIds && budgetSourceIds.length > 0) {
        filters.budget_source = budgetSourceIds;
      }
    }

    if (searchParams.get("start_date")) {
      filters.start_date = searchParams.get("start_date") || undefined;
    }
    if (searchParams.get("end_date")) {
      filters.end_date = searchParams.get("end_date") || undefined;
    }
    if (searchParams.get("relative_time")) {
      filters.relative_time = searchParams.get("relative_time") || undefined;
    }

    // Parse flagged filter
    if (searchParams.get("flagged")) {
      filters.flagged = searchParams.get("flagged") === "true";
    }

    // If no date/time filters are provided in URL, set default "All Time" values
    const hasDateTimeParams =
      searchParams.get("start_date") || searchParams.get("end_date") || searchParams.get("relative_time");
    if (!hasDateTimeParams) {
      filters.relative_time = "all_time";
    }

    return filters;
  };

  const getInitialSortConfig = (): SortConfig => {
    const sortField = searchParams.get("sort_field") as any;
    const sortDirection = searchParams.get("sort_direction") as any;

    return {
      field: sortField || "creation_time",
      direction: sortDirection || "desc",
    };
  };

  const getInitialPage = (): number => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 1;
  };

  const {
    filteredPurposes,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    isLoading,
    error,
  } = usePurposeData(getInitialFilters(), getInitialSortConfig(), getInitialPage());

  // Create sort change handler that resets to page 1
  const handleSortChange = (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setCurrentPage(1);
  };

  // Get admin data for filter badges
  const { hierarchies, suppliers, serviceTypes, materials, responsibleAuthorities, budgetSources } = useAdminData();

  // Column visibility state - load from localStorage
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => loadColumnVisibility());

  // Column sizing state - load from localStorage
  const [columnSizing, setColumnSizing] = useState<ColumnSizing>(() => loadColumnSizing());

  // Get toast function
  const { toast } = useToast();

  // Export loading state
  const [isExportLoading, setIsExportLoading] = useState(false);

  // Persist column visibility changes to localStorage
  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  // Persist column sizing changes to localStorage
  useEffect(() => {
    saveColumnSizing(columnSizing);
  }, [columnSizing]);

  // Update URL when filters, sorting, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add search query
    if (filters.search_query) {
      params.set("search_query", filters.search_query);
    }

    // Add service type IDs
    if (filters.service_type && filters.service_type.length > 0) {
      params.set("service_type_id", filters.service_type.join(","));
    }

    // Add statuses
    if (filters.status && filters.status.length > 0) {
      params.set("status", filters.status.join(","));
    }

    // Add supplier IDs
    if (filters.supplier && filters.supplier.length > 0) {
      params.set("supplier_id", filters.supplier.join(","));
    }

    // Add hierarchy IDs
    if (filters.hierarchy_id && filters.hierarchy_id.length > 0) {
      params.set("hierarchy_id", filters.hierarchy_id.join(","));
    }

    // Add material IDs
    if (filters.material && filters.material.length > 0) {
      params.set("material_id", filters.material.join(","));
    }

    // Add pending authority IDs
    if (filters.pending_authority && filters.pending_authority.length > 0) {
      params.set("pending_authority_id", filters.pending_authority.join(","));
    }

    // Add budget source IDs
    if (filters.budget_source && filters.budget_source.length > 0) {
      params.set("budget_source_id", filters.budget_source.join(","));
    }

    // Add date/time filters (always include these if they have values, including defaults)
    if (filters.start_date) {
      params.set("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.set("end_date", filters.end_date);
    }
    if (filters.relative_time) {
      params.set("relative_time", filters.relative_time);
    }

    // Add flagged filter
    if (filters.flagged === true) {
      params.set("flagged", "true");
    }

    // Add sorting
    if (sortConfig.field !== "creation_time" || sortConfig.direction !== "desc") {
      params.set("sort_field", sortConfig.field);
      params.set("sort_direction", sortConfig.direction);
    }

    // Add pagination
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    setSearchParams(params, { replace: true });

    // Update stored search URL to match current filters
    const currentUrl = `${window.location.origin}${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    sessionStorage.setItem("searchUrl", currentUrl);
  }, [filters, sortConfig, currentPage, setSearchParams]);

  const itemsPerPage = 10;

  // Handle flag toggle - called by context menu after user confirms
  const handleToggleFlag = async (purpose: Purpose) => {
    await togglePurposeFlag(purpose, toast, () => {
      queryClient.invalidateQueries({ queryKey: ["purposes"] });
    });
  };

  // Handle delete purpose - called by context menu after confirmation
  const handleDeletePurpose = async (purpose: Purpose) => {
    deletePurpose.mutate({ id: purpose.id, refetchImmediately: true });
  };

  // Calculate display indices for server-side pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + filteredPurposes.length, totalCount);

  const handleExport = () => {
    exportPurposesToCSV(filters, sortConfig, toast, setIsExportLoading);
  };

  // Count active filters
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex-shrink-0">Search Purposes</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, content, or EMF ID..."
            value={filters.search_query || ""}
            onChange={(e) => setFilters({ ...filters, search_query: e.target.value })}
            className="pl-10 focus-visible:outline-none"
          />
        </div>
        <FiltersDrawer filters={filters} onFiltersChange={setFilters} />
        <ColumnControl columnVisibility={columnVisibility} onColumnVisibilityChange={setColumnVisibility} />
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={() => clearFilters(setFilters, filters)} className="gap-2">
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
          {isExportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExportLoading ? "Exporting..." : "Export"}
        </Button>
      </div>

      <ActiveFiltersBadges
        filters={filters}
        onFiltersChange={setFilters}
        hierarchies={hierarchies}
        serviceTypes={serviceTypes}
        suppliers={suppliers}
        materials={materials}
        responsibleAuthorities={responsibleAuthorities}
        budgetSources={budgetSources}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of {totalCount} purposes
          </p>
        </div>

        <div className="flex-shrink-0">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        </div>
      </div>

      <TanStackPurposeTable
        purposes={filteredPurposes}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        columnSizing={columnSizing}
        onColumnSizingChange={setColumnSizing}
        onToggleFlag={handleToggleFlag}
        onDeletePurpose={handleDeletePurpose}
      />
    </div>
  );
};

export default Search;
