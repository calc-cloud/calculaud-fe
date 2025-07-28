import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Purpose, getCurrencySymbol } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { getStagesText } from '@/utils/stageUtils';
import { getStatusDisplay } from '@/utils/statusUtils';

// Helper functions (moved from original PurposeTable)
const getLastHierarchyLevel = (hierarchyName: string | undefined | null): string => {
  if (!hierarchyName) return 'N/A';
  const parts = hierarchyName.split(/[>/\\-]/).map(part => part.trim()).filter(part => part.length > 0);
  return parts.length > 0 ? parts[parts.length - 1] : hierarchyName;
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
  
  Object.entries(costsByCurrency).forEach(([currency, amount]) => {
    if (currency === 'SUPPORT_USD' || currency === 'AVAILABLE_USD') {
      if (!combinedCostsByCurrency['USD']) {
        combinedCostsByCurrency['USD'] = 0;
      }
      combinedCostsByCurrency['USD'] += amount;
    } else {
      combinedCostsByCurrency[currency] = amount;
    }
  });

  const displayStrings = Object.entries(combinedCostsByCurrency).map(
    ([currency, amount]) => {
      const symbol = currency === 'USD' ? '$' : getCurrencySymbol(currency as any);
      return `${symbol}${formatAmount(amount)}`;
    }
  );

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

  return {
    display: contentStrings,
    details: contentStrings,
    allContents: contentStrings.join(', ')
  };
};

const getStagesDisplay = (purpose: Purpose) => {
  return purpose.purchases
    .map(purchase => getStagesText(purchase, true))
    .filter(text => text !== null);
};

export const createColumns = (hierarchies: any[]): ColumnDef<Purpose>[] => [
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <div className="text-center">
        <div className="h-auto p-2 font-medium">
          Status
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const purpose = row.original;
      const statusInfo = getStatusDisplay(purpose.status);
      
      return (
        <div className="text-center">
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
        </div>
      );
    },
    size: 140,
    minSize: 100,
  },
  {
    id: 'statusMessage',
    accessorKey: 'comments',
    header: () => <div className="text-center">Status Message</div>,
    cell: ({ row }) => {
      const purpose = row.original;
      return (
        <div className="text-center">
          <div className="flex items-center justify-center">
            {purpose.comments || <span className="text-muted-foreground">No status message</span>}
          </div>
        </div>
      );
    },
    size: 180,
    minSize: 160,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <div className="text-center">
        <div className="h-auto p-2 font-medium">
          Description
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const purpose = row.original;
      return (
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="line-clamp-2 text-sm leading-tight font-medium">
                  {purpose.description}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{purpose.description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    },
    size: 300,
    minSize: 256,
  },
  {
    id: 'content',
    accessorFn: (row) => getContentsDisplay(row).allContents,
    header: () => <div className="text-center">Content</div>,
    cell: ({ row }) => {
      const purpose = row.original;
      const contentsInfo = getContentsDisplay(purpose);
      
      return (
        <div className="text-center">
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
        </div>
      );
    },
    size: 200,
    minSize: 180,
  },
  {
    id: 'supplier',
    accessorKey: 'supplier',
    header: () => (
      <div className="text-center">
        <div className="h-auto p-2 font-medium">
          Supplier
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const purpose = row.original;
      return (
        <div className="text-center">
          <div className="flex items-center justify-center">
            {purpose.supplier}
          </div>
        </div>
      );
    },
    size: 120,
    minSize: 96,
  },
  {
    id: 'hierarchy',
    accessorFn: (row) => {
      const hierarchy = hierarchies.find(h => h.id === parseInt(row.hierarchy_id?.toString() || '0'));
      return hierarchy ? hierarchy.path : (row.hierarchy_name || 'N/A');
    },
    header: () => <div className="text-center">Hierarchy</div>,
    cell: ({ row }) => {
      const purpose = row.original;
      const hierarchy = hierarchies.find(h => h.id === parseInt(purpose.hierarchy_id?.toString() || '0'));
      
      const hierarchyInfo = hierarchy 
        ? {
            displayName: getLastHierarchyLevel(hierarchy.path),
            fullPath: hierarchy.path
          }
        : purpose.hierarchy_name 
          ? {
              displayName: getLastHierarchyLevel(purpose.hierarchy_name),
              fullPath: purpose.hierarchy_name
            }
          : {
              displayName: 'N/A',
              fullPath: 'No hierarchy assigned'
            };
      
      return (
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{hierarchyInfo.displayName}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hierarchyInfo.fullPath}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    },
    size: 80,
    minSize: 60,
  },
  {
    id: 'serviceType',
    accessorKey: 'service_type',
    header: () => <div className="text-center">Service Type</div>,
    cell: ({ row }) => {
      const purpose = row.original;
      return (
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Badge variant="outline">{purpose.service_type}</Badge>
          </div>
        </div>
      );
    },
    size: 140,
    minSize: 112,
  },
  {
    id: 'purchases',
    accessorFn: (row) => getStagesDisplay(row).join(', '),
    header: () => <div className="text-center">Purchases</div>,
    cell: ({ row }) => {
      const purpose = row.original;
      const stagesTexts = getStagesDisplay(purpose);
      
      return (
        <div className="text-center">
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
        </div>
      );
    },
    size: 280,
    minSize: 240,
  },
  {
    id: 'emfIds',
    accessorFn: (row) => getEMFIds(row).allIds,
    header: () => <div className="text-center">EMF IDs</div>,
    cell: ({ row }) => {
      const purpose = row.original;
      const emfIds = getEMFIds(purpose);
      
      return (
        <div className="text-center">
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
        </div>
      );
    },
    size: 120,
    minSize: 96,
  },
  {
    id: 'totalCost',
    accessorFn: (row) => getTotalCostWithCurrencies(row).allCosts,
    header: () => <div className="text-center">Total Cost</div>,
    cell: ({ row }) => {
      const purpose = row.original;
      const totalCost = getTotalCostWithCurrencies(purpose);
      
      return (
        <div className="text-center">
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
        </div>
      );
    },
    size: 140,
    minSize: 112,
  },
  {
    id: 'expectedDelivery',
    accessorKey: 'expected_delivery',
    header: () => (
      <div className="text-center">
        <div className="h-auto p-2 font-medium">
          Expected Delivery
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const purpose = row.original;
      return (
        <div className="text-center">
          <div className="flex items-center justify-center">
            {formatDate(purpose.expected_delivery)}
          </div>
        </div>
      );
    },
    size: 120,
    minSize: 96,
  },
  {
    id: 'lastModified',
    accessorKey: 'last_modified',
    header: () => (
      <div className="text-center">
        <div className="h-auto p-2 font-medium text-center">
          <div className="flex flex-col items-center">
            <div className="font-medium">Last Modified</div>
            <div className="text-xs font-normal text-muted-foreground">Created</div>
          </div>
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const purpose = row.original;
      return (
        <div className="text-center">
          <div className="flex flex-col items-center">
            <div className="text-sm">{formatDate(purpose.last_modified)}</div>
            <div className="text-xs text-muted-foreground">{formatDate(purpose.creation_time)}</div>
          </div>
        </div>
      );
    },
    size: 120,
    minSize: 96,
  },
];