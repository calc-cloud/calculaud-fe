
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Purpose } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface PurposeTableProps {
  purposes: Purpose[];
  onView: (purpose: Purpose) => void;
  onEdit: (purpose: Purpose) => void;
  onDelete: (purposeId: string) => void;
  isLoading?: boolean;
}

export const PurposeTable: React.FC<PurposeTableProps> = ({
  purposes,
  onView,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const getTotalCostWithCurrencies = (purpose: Purpose) => {
    const costsByCurrency: { [key: string]: number } = {};
    
    purpose.emfs.forEach(emf => {
      emf.costs.forEach(cost => {
        if (!costsByCurrency[cost.currency]) {
          costsByCurrency[cost.currency] = 0;
        }
        costsByCurrency[cost.currency] += cost.amount;
      });
    });

    const costStrings = Object.entries(costsByCurrency).map(
      ([currency, amount]) => `${amount.toFixed(2)} ${currency}`
    );

    return costStrings.length > 0 ? costStrings.join(', ') : '0.00';
  };

  const getEMFIds = (purpose: Purpose) => {
    return purpose.emfs.map(emf => emf.id).join(', ');
  };

  const getLastHierarchyLevel = (hierarchyName: string) => {
    // Split by common separators and return the last part
    const parts = hierarchyName.split(/[>/\\-]/).map(part => part.trim()).filter(part => part.length > 0);
    return parts.length > 0 ? parts[parts.length - 1] : hierarchyName;
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'PENDING':
        return 'Pending';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleRowClick = (purpose: Purpose) => {
    onView(purpose);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading purposes...</p>
      </div>
    );
  }

  if (purposes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No purposes found.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Description</TableHead>
              <TableHead className="w-32">Content</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Hierarchy</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>EMF IDs</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead>
                <div className="flex flex-col">
                  <div className="font-medium">Last Modified</div>
                  <div className="text-xs font-normal text-muted-foreground">Created</div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purposes.map((purpose) => (
              <TableRow 
                key={purpose.id} 
                onClick={() => handleRowClick(purpose)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium w-32">
                  <div className="line-clamp-2 text-sm leading-tight">
                    {purpose.description}
                  </div>
                </TableCell>
                <TableCell className="w-32">
                  <div className="line-clamp-2 text-sm leading-tight">
                    {purpose.content}
                  </div>
                </TableCell>
                <TableCell>{purpose.supplier}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        {getLastHierarchyLevel(purpose.hierarchy_name)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{purpose.hierarchy_name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{purpose.service_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={purpose.status === 'COMPLETED' ? 'default' : 
                             purpose.status === 'IN_PROGRESS' ? 'secondary' :
                             purpose.status === 'PENDING' ? 'outline' : 'outline'}
                  >
                    {getStatusDisplay(purpose.status)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {getEMFIds(purpose) || 'None'}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {getTotalCostWithCurrencies(purpose)}
                </TableCell>
                <TableCell>{formatDate(purpose.expected_delivery)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="text-sm">{formatDate(purpose.last_modified)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(purpose.creation_time)}</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
