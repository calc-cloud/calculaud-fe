import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Purpose } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { getStatusDisplay } from '@/utils/statusUtils';
import { 
  COLUMN_SIZES,
  getTotalCostWithCurrencies,
  getEMFIds,
  getContentsDisplay,
  getStagesDisplay,
  getHierarchyInfo
} from '@/utils/tableUtils';

import { CellWrapper } from './shared/CellWrapper';
import { HeaderWrapper, SimpleHeaderWrapper } from './shared/HeaderWrapper';
import { TooltipCell, MultiItemDisplay } from './shared/TooltipCell';

export const createColumns = (hierarchies: any[]): ColumnDef<Purpose>[] => [
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <HeaderWrapper>Status</HeaderWrapper>,
    cell: ({ row }) => {
      const purpose = row.original;
      const statusInfo = getStatusDisplay(purpose.status);
      
      return (
        <TooltipCell
          trigger={
            <Badge 
              variant={statusInfo.variant}
              className={`pointer-events-none ${statusInfo.className}`}
            >
              {statusInfo.label}
            </Badge>
          }
          content={<p>{purpose.comments || 'No status message'}</p>}
        />
      );
    },
    ...COLUMN_SIZES.status,
  },

  {
    id: 'statusMessage',
    accessorKey: 'comments',
    header: () => <SimpleHeaderWrapper>Status Message</SimpleHeaderWrapper>,
    cell: ({ row }) => (
      <CellWrapper>
        {row.original.comments || <span className="text-muted-foreground">No status message</span>}
      </CellWrapper>
    ),
    ...COLUMN_SIZES.statusMessage,
  },

  {
    id: 'description',
    accessorKey: 'description',
    header: () => <HeaderWrapper>Description</HeaderWrapper>,
    cell: ({ row }) => (
      <TooltipCell
        trigger={
          <div className="line-clamp-2 text-sm leading-tight font-medium">
            {row.original.description}
          </div>
        }
        content={<p>{row.original.description}</p>}
      />
    ),
    ...COLUMN_SIZES.description,
  },

  {
    id: 'content',
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
    id: 'supplier',
    accessorKey: 'supplier',
    header: () => <HeaderWrapper>Supplier</HeaderWrapper>,
    cell: ({ row }) => <CellWrapper>{row.original.supplier}</CellWrapper>,
    ...COLUMN_SIZES.supplier,
  },

  {
    id: 'hierarchy',
    accessorFn: (row) => getHierarchyInfo(row, hierarchies).accessorValue,
    header: () => <SimpleHeaderWrapper>Hierarchy</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const hierarchyInfo = getHierarchyInfo(row.original, hierarchies);
      
      return (
        <TooltipCell
          trigger={<div>{hierarchyInfo.displayName}</div>}
          content={<p>{hierarchyInfo.fullPath}</p>}
        />
      );
    },
    ...COLUMN_SIZES.hierarchy,
  },

  {
    id: 'serviceType',
    accessorKey: 'service_type',
    header: () => <SimpleHeaderWrapper>Service Type</SimpleHeaderWrapper>,
    cell: ({ row }) => (
      <CellWrapper>
        <Badge variant="outline">{row.original.service_type}</Badge>
      </CellWrapper>
    ),
    ...COLUMN_SIZES.serviceType,
  },

  {
    id: 'purchases',
    accessorFn: (row) => getStagesDisplay(row).join(', '),
    header: () => <SimpleHeaderWrapper>Purchases</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const purpose = row.original;
      const stagesTexts = getStagesDisplay(purpose);
      
      if (!stagesTexts || stagesTexts.length === 0) {
        return (
          <CellWrapper>
            <div className="text-sm text-muted-foreground">
              {purpose.purchases.length === 0 ? 'No purchases added' : 'No stage information'}
            </div>
          </CellWrapper>
        );
      }

      return (
        <TooltipCell
          trigger={<MultiItemDisplay items={stagesTexts} />}
          content={
            <div className="flex flex-col">
              {stagesTexts.map((text, index) => (
                <div key={index}>{text}</div>
              ))}
            </div>
          }
        />
      );
    },
    ...COLUMN_SIZES.purchases,
  },

  {
    id: 'emfIds',
    accessorFn: (row) => getEMFIds(row).allIds,
    header: () => <SimpleHeaderWrapper>EMF IDs</SimpleHeaderWrapper>,
    cell: ({ row }) => {
      const emfIds = getEMFIds(row.original);
      
      return emfIds.ids.length > 0 ? (
        <TooltipCell
          trigger={<MultiItemDisplay items={emfIds.ids} />}
          content={<p>{emfIds.allIds}</p>}
        />
      ) : (
        <CellWrapper>
          <div className="text-sm text-muted-foreground">-</div>
        </CellWrapper>
      );
    },
    ...COLUMN_SIZES.emfIds,
  },

  {
    id: 'totalCost',
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
    id: 'expectedDelivery',
    accessorKey: 'expected_delivery',
    header: () => <HeaderWrapper>Expected Delivery</HeaderWrapper>,
    cell: ({ row }) => <CellWrapper>{formatDate(row.original.expected_delivery)}</CellWrapper>,
    ...COLUMN_SIZES.expectedDelivery,
  },

  {
    id: 'lastModified',
    accessorKey: 'last_modified',
    header: () => (
      <HeaderWrapper className="text-center">
        <div className="flex flex-col items-center">
          <div className="font-medium">Last Modified</div>
          <div className="text-xs font-normal text-muted-foreground">Created</div>
        </div>
      </HeaderWrapper>
    ),
    cell: ({ row }) => {
      const purpose = row.original;
      return (
        <CellWrapper className="flex-col">
          <div className="text-sm">{formatDate(purpose.last_modified)}</div>
          <div className="text-xs text-muted-foreground">{formatDate(purpose.creation_time)}</div>
        </CellWrapper>
      );
    },
    ...COLUMN_SIZES.lastModified,
  },
];