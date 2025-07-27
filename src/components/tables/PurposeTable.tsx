import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from '@/components/common/ColumnControl';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Purpose, getCurrencySymbol } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { getStagesText } from '@/utils/stageUtils';
import { getStatusDisplay } from '@/utils/statusUtils';


interface PurposeTableProps {
  purposes: Purpose[];
  isLoading?: boolean;
  columnVisibility?: ColumnVisibility;
}

export const PurposeTable: React.FC<PurposeTableProps> = ({
  purposes,
  isLoading = false,
  columnVisibility
}) => {
  const { hierarchies } = useAdminData();
  const navigate = useNavigate();
  
  // Use default visibility if none provided
  const columns = columnVisibility || DEFAULT_COLUMN_VISIBILITY;

  // Get stages display for all purchases in a purpose (pending and completed)
  const getStagesDisplay = (purpose: Purpose) => {
    return purpose.purchases
      .map(purchase => getStagesText(purchase, true))
      .filter(text => text !== null);
  };

  const getTotalCostWithCurrencies = (purpose: Purpose) => {
    const costsByCurrency: { [key: string]: number } = {};
    
    purpose.purchases.forEach(purchase => {
      purchase.costs.forEach(cost => {
        const currency = cost.currency;
        if (!costsByCurrency[currency]) {
          costsByCurrency[currency] = 0;
        }
        costsByCurrency[currency] += cost.amount;
      });
    });

    const formatAmount = (amount: number) => {
      const formattedNumber = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
      return parseFloat(formattedNumber).toLocaleString();
    };

    // Combine both USD types into a single total
    const combinedCostsByCurrency: { [key: string]: number } = {};
    const usdBreakdown: { [key: string]: number } = {};
    
    Object.entries(costsByCurrency).forEach(([currency, amount]) => {
      if (currency === 'SUPPORT_USD' || currency === 'AVAILABLE_USD') {
        // Store individual USD types for detailed tooltip
        usdBreakdown[currency] = amount;
        
        // Combine into single USD total
        if (!combinedCostsByCurrency['USD']) {
          combinedCostsByCurrency['USD'] = 0;
        }
        combinedCostsByCurrency['USD'] += amount;
      } else {
        // Keep other currencies as is
        combinedCostsByCurrency[currency] = amount;
      }
    });

    // For display: only amount + currency symbol
    const displayStrings = Object.entries(combinedCostsByCurrency).map(
      ([currency, amount]) => {
        // For combined USD, use the $ symbol
        const symbol = currency === 'USD' ? '$' : getCurrencySymbol(currency as any);
        return `${symbol}${formatAmount(amount)}`;
      }
    );

    // For tooltip: show original format with individual currency types
    const costDetails = Object.entries(costsByCurrency).map(
      ([currency, amount]) => {
        return `${getCurrencySymbol(currency as any)}${formatAmount(amount)} ${currency}`;
      }
    );

    return {
      display: displayStrings,
      details: costDetails,
      allCosts: costDetails.join(', ') || '0'
    };
  };

  const getEMFIds = (purpose: Purpose) => {
    const emfIds: string[] = [];
    
    purpose.purchases.forEach(purchase => {
      purchase.flow_stages.forEach(stage => {
        if (stage.stage_type.name === 'emf_id' && stage.value && stage.value.trim()) {
          emfIds.push(stage.value.trim());
        }
      });
    });
    
    return {
      ids: emfIds,
      allIds: emfIds.length > 0 ? emfIds.join(', ') : '-'
    };
  };

  const getContentsDisplay = (purpose: Purpose) => {
    if (!purpose.contents || !Array.isArray(purpose.contents) || purpose.contents.length === 0) {
      return {
        display: ['No contents'],
        details: ['No contents specified'],
        allContents: 'No contents'
      };
    }

    const contentStrings = purpose.contents.map(content => 
      `${content.quantity} × ${content.service_name || content.material_name || `Material ${content.material_id || content.service_id}`}`
    );

    const contentDetails = purpose.contents.map(content => 
      `${content.quantity} × ${content.service_name || content.material_name || `Material ${content.material_id || content.service_id}`}`
    );

    return {
      display: contentStrings,
      details: contentDetails,
      allContents: contentStrings.join(', ')
    };
  };

  const getLastHierarchyLevel = (hierarchyName: string | undefined | null) => {
    // Handle undefined/null values
    if (!hierarchyName) {
      return 'N/A';
    }
    
    // Split by common separators and return the last part
    const parts = hierarchyName.split(/[>/\\-]/).map(part => part.trim()).filter(part => part.length > 0);
    return parts.length > 0 ? parts[parts.length - 1] : hierarchyName;
  };

  const getHierarchyInfo = (purpose: Purpose) => {
    // Find the hierarchy from the admin data using the hierarchy_id
    const hierarchy = hierarchies.find(h => h.id === parseInt(purpose.hierarchy_id?.toString() || '0'));
    
    if (hierarchy) {
      return {
        displayName: getLastHierarchyLevel(hierarchy.path),
        fullPath: hierarchy.path
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

  const handleRowClick = (purpose: Purpose) => {
    navigate(`/purposes/${purpose.id}`);
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.status && <TableHead className="w-20 text-center">Status</TableHead>}
            {columns.statusMessage && <TableHead className="w-40 text-center">Status Message</TableHead>}
            {columns.description && <TableHead className="w-64 text-center">Description</TableHead>}
            {columns.content && <TableHead className="w-40 text-center">Content</TableHead>}
            {columns.supplier && <TableHead className="w-24 text-center">Supplier</TableHead>}
            {columns.hierarchy && <TableHead className="w-20 text-center">Hierarchy</TableHead>}
            {columns.serviceType && <TableHead className="w-28 text-center">Service Type</TableHead>}
            {columns.purchases && <TableHead className="w-60 text-center">Purchases</TableHead>}
            {columns.emfIds && <TableHead className="w-24 text-center">EMF IDs</TableHead>}
            {columns.totalCost && <TableHead className="w-28 text-center">Total Cost</TableHead>}
            {columns.expectedDelivery && <TableHead className="w-24 text-center">Expected Delivery</TableHead>}
            {columns.lastModified && (
              <TableHead className="w-24 text-center">
                <div className="flex flex-col items-center">
                  <div className="font-medium">Last Modified</div>
                  <div className="text-xs font-normal text-muted-foreground">Created</div>
                </div>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {purposes.map((purpose) => {
            const totalCost = getTotalCostWithCurrencies(purpose);
            const emfIds = getEMFIds(purpose);
            const hierarchyInfo = getHierarchyInfo(purpose);
            const contentsInfo = getContentsDisplay(purpose);
            const stagesTexts = getStagesDisplay(purpose);
            const statusInfo = getStatusDisplay(purpose.status);
            return (
              <TableRow 
                key={purpose.id} 
                onClick={() => handleRowClick(purpose)}
                className="cursor-pointer hover:bg-muted/50 h-20"
              >
                {columns.status && (
                <TableCell className="w-20 text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-pointer">
                        <Badge 
                          variant={statusInfo.variant}
                          className={`pointer-events-none ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{purpose.comments || 'No status message'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                )}
                {columns.statusMessage && (
                <TableCell className="w-40 text-center">{purpose.comments || <span className="text-muted-foreground">No status message</span>}</TableCell>
                )}
                {columns.description && (
                <TableCell className="font-medium w-64 text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="line-clamp-2 text-sm leading-tight">
                        {purpose.description}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{purpose.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                )}
                {columns.content && (
                <TableCell className="w-40 text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col gap-0.5 items-center">
                        {contentsInfo.display.length > 0 ? (
                          contentsInfo.display.slice(0, 2).map((content, index) => (
                            <div key={index} className="text-sm truncate">
                              {content}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">No contents</div>
                        )}
                        {contentsInfo.display.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{contentsInfo.display.length - 2} more
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col">
                        {contentsInfo.details.map((detail, index) => (
                          <div key={index}>{detail}</div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                )}
                {columns.supplier && (
                <TableCell className="w-24 text-center">{purpose.supplier}</TableCell>
                )}
                {columns.hierarchy && (
                <TableCell className="w-20 text-center">
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
                )}
                {columns.serviceType && (
                <TableCell className="w-28 text-center">
                  <Badge variant="outline">{purpose.service_type}</Badge>
                </TableCell>
                )}
                {columns.purchases && (
                <TableCell className="w-60 text-center">
                  {stagesTexts && stagesTexts.length > 0 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <div className="flex flex-col gap-0.5 items-center">
                            {stagesTexts.slice(0, 2).map((text, index) => (
                              <div key={index} className="text-sm">
                                {text}
                              </div>
                            ))}
                            {stagesTexts.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{stagesTexts.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col">
                          {stagesTexts.map((text, index) => (
                            <div key={index}>{text}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : purpose.purchases.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No purchases added
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No stage information
                    </div>
                  )}
                </TableCell>
                )}
                {columns.emfIds && (
                <TableCell className="w-24 text-center">
                  {emfIds.ids.length > 0 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col gap-0.5 items-center">
                          {emfIds.ids.slice(0, 2).map((id, index) => (
                            <div key={index} className="text-sm truncate">
                              {id}
                            </div>
                          ))}
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
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </TableCell>
                )}
                {columns.totalCost && (
                <TableCell className="w-28 text-center">
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
                )}
                {columns.expectedDelivery && (
                <TableCell className="w-24 text-center">{formatDate(purpose.expected_delivery)}</TableCell>
                )}
                {columns.lastModified && (
                <TableCell className="w-24 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-sm">{formatDate(purpose.last_modified)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(purpose.creation_time)}</div>
                  </div>
                </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
