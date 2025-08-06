import { ColumnDef } from "@tanstack/react-table";

import { StatusColorTooltip } from "@/components/common/StatusColorTooltip";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Purpose } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { SortConfig } from "@/utils/sorting";
import { getStatusDisplay } from "@/utils/statusUtils";
import {
  COLUMN_SIZES,
  getContentsDisplay,
  getEMFIds,
  getDemandIds,
  getHierarchyInfo,
  getAuthorityInfo,
  getStagesDisplay,
  getTotalCostWithCurrencies,
} from "@/utils/tableUtils";

import { PurchaseGridCell } from "./purchases/PurchaseGridCell";
import { CellWrapper } from "./shared/CellWrapper";
import { HeaderWrapper, SimpleHeaderWrapper } from "./shared/HeaderWrapper";
import { MultiItemDisplay, TooltipCell } from "./shared/TooltipCell";

export const createColumns = (
  hierarchies: any[],
  sortConfig?: SortConfig,
  onSortChange?: (config: SortConfig) => void
): ColumnDef<Purpose>[] => [
  {
    id: "status",
    accessorKey: "status",
    header: () => <HeaderWrapper>Status</HeaderWrapper>,
    cell: ({ row }) => {
      const purpose = row.original;
      const statusInfo = getStatusDisplay(purpose.status);

      return (
        <TooltipCell
          trigger={
            <Badge variant={statusInfo.variant} className={`pointer-events-none ${statusInfo.className}`}>
              {statusInfo.label}
            </Badge>
          }
          content={<p>{purpose.comments || "No status message"}</p>}
        />
      );
    },
    ...COLUMN_SIZES.status,
  },

  {
    id: "statusMessage",
    accessorKey: "comments",
    header: () => <SimpleHeaderWrapper>Status Message</SimpleHeaderWrapper>,
    cell: ({ row }) => (
      <CellWrapper>
        {row.original.comments || <span className="text-muted-foreground">No status message</span>}
      </CellWrapper>
    ),
    ...COLUMN_SIZES.statusMessage,
  },

  {
    id: "description",
    accessorKey: "description",
    header: () => <HeaderWrapper>Description</HeaderWrapper>,
    cell: ({ row }) => (
      <TooltipCell
        trigger={<div className="line-clamp-2 text-sm leading-tight font-medium">{row.original.description}</div>}
        content={<p>{row.original.description}</p>}
      />
    ),
    ...COLUMN_SIZES.description,
  },

  {
    id: "content",
    accessorFn: (row) => getContentsDisplay(row).allContents,
    header: () => <SimpleHeaderWrapper>Content</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const contentsInfo = getContentsDisplay(row.original);

      return (
        <TooltipCell
          trigger={
            contentsInfo.display.length > 0 ? (
              <MultiItemDisplay items={contentsInfo.display} />
            ) : (
              <div className="text-sm text-muted-foreground">No contents</div>
            )
          }
          content={
            <div className="flex flex-col">
              {contentsInfo.details.map((detail, index) => (
                <div key={index}>{detail}</div>
              ))}
            </div>
          }
        />
      );
    },
    ...COLUMN_SIZES.content,
  },

  {
    id: "supplier",
    accessorKey: "supplier",
    header: () => <HeaderWrapper>Supplier</HeaderWrapper>,
    cell: ({ row }) => <CellWrapper>{row.original.supplier}</CellWrapper>,
    ...COLUMN_SIZES.supplier,
  },

  {
    id: "pendingAuthority",
    accessorFn: (row) => getAuthorityInfo(row).accessorValue,
    header: () => <SimpleHeaderWrapper>Pending Authority</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const authorityInfo = getAuthorityInfo(row.original);

      return (
        <TooltipCell trigger={<div>{authorityInfo.displayName}</div>} content={<p>{authorityInfo.description}</p>} />
      );
    },
    ...COLUMN_SIZES.pendingAuthority,
  },

  {
    id: "hierarchy",
    accessorFn: (row) => getHierarchyInfo(row, hierarchies).accessorValue,
    header: () => <SimpleHeaderWrapper>Hierarchy</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const hierarchyInfo = getHierarchyInfo(row.original, hierarchies);

      return <TooltipCell trigger={<div>{hierarchyInfo.displayName}</div>} content={<p>{hierarchyInfo.fullPath}</p>} />;
    },
    ...COLUMN_SIZES.hierarchy,
  },

  {
    id: "serviceType",
    accessorKey: "service_type",
    header: () => <SimpleHeaderWrapper>Service Type</SimpleHeaderWrapper>,
    cell: ({ row }) => (
      <CellWrapper>
        <Badge variant="outline">{row.original.service_type}</Badge>
      </CellWrapper>
    ),
    ...COLUMN_SIZES.serviceType,
  },

  {
    id: "purchases",
    accessorFn: (row) => getStagesDisplay(row).join(", "),
    header: () => (
      <HeaderWrapper
        sortable
        sortField="days_since_last_completion"
        currentSort={sortConfig}
        onSortChange={onSortChange}
        sortLabel="Purchases"
      >
        <TooltipProvider>
          <StatusColorTooltip>
            <span>Purchases</span>
          </StatusColorTooltip>
        </TooltipProvider>
      </HeaderWrapper>
    ),
    cell: ({ row }) => {
      const purpose = row.original;
      return <PurchaseGridCell purpose={purpose} />;
    },
    ...COLUMN_SIZES.purchases,
  },

  {
    id: "emfIds",
    accessorFn: (row) => getEMFIds(row).allIds,
    header: () => <SimpleHeaderWrapper>EMF IDs</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const emfIds = getEMFIds(row.original);

      return emfIds.ids.length > 0 ? (
        <TooltipCell trigger={<MultiItemDisplay items={emfIds.ids} />} content={<p>{emfIds.allIds}</p>} />
      ) : (
        <CellWrapper>
          <div className="text-sm text-muted-foreground">-</div>
        </CellWrapper>
      );
    },
    ...COLUMN_SIZES.emfIds,
  },

  {
    id: "demandIds",
    accessorFn: (row) => getDemandIds(row).allIds,
    header: () => <SimpleHeaderWrapper>Demand IDs</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const demandIds = getDemandIds(row.original);

      return demandIds.ids.length > 0 ? (
        <TooltipCell trigger={<MultiItemDisplay items={demandIds.ids} />} content={<p>{demandIds.allIds}</p>} />
      ) : (
        <CellWrapper>
          <div className="text-sm text-muted-foreground">-</div>
        </CellWrapper>
      );
    },
    ...COLUMN_SIZES.demandIds,
  },

  {
    id: "totalCost",
    accessorFn: (row) => getTotalCostWithCurrencies(row).allCosts,
    header: () => <SimpleHeaderWrapper>Total Cost</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const totalCost = getTotalCostWithCurrencies(row.original);

      return (
        <TooltipCell
          trigger={
            totalCost.display.length > 0 ? (
              <MultiItemDisplay items={totalCost.display} />
            ) : (
              <div className="text-sm">0</div>
            )
          }
          content={
            <div className="flex flex-col">
              {totalCost.details.map((detail, index) => (
                <div key={index}>{detail}</div>
              ))}
            </div>
          }
        />
      );
    },
    ...COLUMN_SIZES.totalCost,
  },

  {
    id: "expectedDelivery",
    accessorKey: "expected_delivery",
    header: () => (
      <HeaderWrapper sortable sortField="expected_delivery" currentSort={sortConfig} onSortChange={onSortChange}>
        Expected Delivery
      </HeaderWrapper>
    ),
    cell: ({ row }) => <CellWrapper>{formatDate(row.original.expected_delivery)}</CellWrapper>,
    ...COLUMN_SIZES.expectedDelivery,
  },

  {
    id: "createdAt",
    accessorKey: "creation_time",
    header: () => (
      <HeaderWrapper sortable sortField="creation_time" currentSort={sortConfig} onSortChange={onSortChange}>
        Created At
      </HeaderWrapper>
    ),
    cell: ({ row }) => <CellWrapper>{formatDate(row.original.creation_time)}</CellWrapper>,
    ...COLUMN_SIZES.createdAt,
  },

  {
    id: "lastModified",
    accessorKey: "last_modified",
    header: () => (
      <HeaderWrapper sortable sortField="last_modified" currentSort={sortConfig} onSortChange={onSortChange}>
        Last Modified
      </HeaderWrapper>
    ),
    cell: ({ row }) => <CellWrapper>{formatDate(row.original.last_modified)}</CellWrapper>,
    ...COLUMN_SIZES.lastModified,
  },
];
