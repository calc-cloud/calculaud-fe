import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Purpose } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { useAdminData } from '@/contexts/AdminDataContext';
import { CURRENCY_DISPLAY_NAMES } from '@/utils/constants';

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
  const { hierarchies } = useAdminData();

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

    const formatAmount = (amount: number) => {
      const formattedNumber = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
      return parseFloat(formattedNumber).toLocaleString();
    };

    const getCurrencySymbol = (currency: string) => {
      switch (currency) {
        case 'SUPPORT_USD':
        case 'AVAILABLE_USD':
          return '$';
        case 'ILS':
          return '₪';
        default:
          return currency;
      }
    };

    const costStrings = Object.entries(costsByCurrency).map(
      ([currency, amount]) => `${getCurrencySymbol(currency)}${formatAmount(amount)}`
    );

    const costDetails = Object.entries(costsByCurrency).map(
      ([currency, amount]) => `${formatAmount(amount)} ${CURRENCY_DISPLAY_NAMES[currency as keyof typeof CURRENCY_DISPLAY_NAMES] || currency}`
    );

    const allCosts = costStrings.join(', ') || '0';

    return {
      display: costStrings,
      details: costDetails,
      allCosts
    };
  };

  const getEMFIds = (purpose: Purpose) => {
    const ids = purpose.emfs.map(emf => emf.id);
    return {
      ids: ids,
      allIds: ids.join(', ') || 'None'
    };
  };

  const getLastHierarchyLevel = (hierarchyName: string) => {
    // Split by common separators and return the last part
    const parts = hierarchyName.split(/[>/\\-]/).map(part => part.trim()).filter(part => part.length > 0);
    return parts.length > 0 ? parts[parts.length - 1] : hierarchyName;
  };

  const getHierarchyInfo = (purpose: Purpose) => {
    // Find the hierarchy from the admin data using the hierarchy_id
    const hierarchy = hierarchies.find(h => h.id === purpose.hierarchy_id?.toString());
    
    if (hierarchy) {
      return {
        displayName: getLastHierarchyLevel(hierarchy.fullPath),
        fullPath: hierarchy.fullPath
      };
    }
    
    // Fallback to the hierarchy_name if available
    if (purpose.hierarchy_name) {
      return {
        displayName: getLastHierarchyLevel(purpose.hierarchy_name),
        fullPath: purpose.hierarchy_name
      };
    }

    return {
      displayName: 'N/A',
      fullPath: 'No hierarchy assigned'
    };
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleRowClick = (purpose: Purpose) => {
    onView(purpose);
  };

  const getContentDisplay = (purpose: Purpose) => {
    if (!purpose.contents || purpose.contents.length === 0) {
      return 'No content';
    }
    
    return purpose.contents.map(content => 
      `${content.quantity} * ${content.service_name}`
    ).join('\n');
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
              <TableHead className="w-32 text-center">Description</TableHead>
              <TableHead className="w-32 text-center">Content</TableHead>
              <TableHead className="text-center">Supplier</TableHead>
              <TableHead className="text-center">Hierarchy</TableHead>
              <TableHead className="text-center">Service Type</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">EMF IDs</TableHead>
              <TableHead className="text-center">Total Cost</TableHead>
              <TableHead className="text-center">Expected Delivery</TableHead>
              <TableHead className="text-center">
                <div className="flex flex-col items-center">
                  <div className="font-medium">Last Modified</div>
                  <div className="text-xs font-normal text-muted-foreground">Created</div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purposes.map((purpose) => {
              const totalCost = getTotalCostWithCurrencies(purpose);
              const emfIds = getEMFIds(purpose);
              const hierarchyInfo = getHierarchyInfo(purpose);
              return (
                <TableRow 
                  key={purpose.id} 
                  onClick={() => handleRowClick(purpose)}
                  className="cursor-pointer hover:bg-muted/50 h-20"
                >
                  <TableCell className="font-medium w-32 text-center">
                    <div className="line-clamp-2 text-sm leading-tight">
                      {purpose.description}
                    </div>
                  </TableCell>
                  <TableCell className="w-32 text-center">
                    <div className="line-clamp-2 text-sm leading-tight whitespace-pre-line">
                      {getContentDisplay(purpose)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{purpose.supplier}</TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {hierarchyInfo.displayName}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{hierarchyInfo.fullPath}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{purpose.service_type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={purpose.status === 'COMPLETED' ? 'default' : 
                               purpose.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}
                    >
                      {getStatusDisplay(purpose.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px] text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col gap-0.5 items-center">
                          {emfIds.ids.length > 0 ? (
                            emfIds.ids.slice(0, 2).map((id, index) => (
                              <div key={index} className="text-sm truncate">
                                {id}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">None</div>
                          )}
                          {emfIds.ids.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{emfIds.ids.length - 2} more
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{emfIds.allIds}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="max-w-[150px] text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col gap-0.5 items-center">
                          {totalCost.display.length > 0 ? (
                            totalCost.display.slice(0, 2).map((cost, index) => (
                              <div key={index} className="text-sm truncate">
                                {cost}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm">0</div>
                          )}
                          {totalCost.display.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{totalCost.display.length - 2} more
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col">
                          {totalCost.details.map((detail, index) => (
                            <div key={index}>{detail}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center">{formatDate(purpose.expected_delivery)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-sm">{formatDate(purpose.last_modified)}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(purpose.creation_time)}</div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
