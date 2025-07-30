import {getCurrencySymbol, Purpose} from '@/types';
import {getStagesText} from '@/utils/stageUtils';

// Column configuration constants
export const COLUMN_SIZES = {
  status: { size: 140, minSize: 100 },
  statusMessage: { size: 180, minSize: 160 },
  description: { size: 300, minSize: 256 },
  content: { size: 200, minSize: 180 },
  supplier: { size: 120, minSize: 96 },
  pendingAuthority: {size: 160, minSize: 120},
  hierarchy: { size: 80, minSize: 60 },
  serviceType: { size: 140, minSize: 112 },
  purchases: { size: 280, minSize: 240 },
  emfIds: { size: 120, minSize: 96 },
  demandIds: { size: 120, minSize: 96 },
  totalCost: { size: 140, minSize: 112 },
  expectedDelivery: { size: 120, minSize: 96 },
  createdAt: { size: 120, minSize: 96 },
  lastModified: { size: 120, minSize: 96 },
};

export const getLastHierarchyLevel = (hierarchyName: string | undefined | null): string => {
  if (!hierarchyName) return 'N/A';
  const parts = hierarchyName.split(/[>/\\-]/).map(part => part.trim()).filter(part => part.length > 0);
  return parts.length > 0 ? parts[parts.length - 1] : hierarchyName;
};

export const getTotalCostWithCurrencies = (purpose: Purpose) => {
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

export const getStageTypeIds = (purpose: Purpose, stageTypeName: string) => {
  const ids: string[] = [];
  
  purpose.purchases.forEach(purchase => {
    purchase.flow_stages.forEach(stage => {
      if (stage.stage_type.name === stageTypeName && stage.value && stage.value.trim()) {
        ids.push(stage.value.trim());
      }
    });
  });
  
  return {
    ids,
    allIds: ids.length > 0 ? ids.join(', ') : '-'
  };
};

// Convenience functions for specific stage types
export const getEMFIds = (purpose: Purpose) => getStageTypeIds(purpose, 'emf_id');
export const getDemandIds = (purpose: Purpose) => getStageTypeIds(purpose, 'demand_id');

export const getContentsDisplay = (purpose: Purpose) => {
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

export const getStagesDisplay = (purpose: Purpose) => {
  return purpose.purchases
    .map(purchase => getStagesText(purchase, true))
    .filter(text => text !== null);
};

export const getHierarchyInfo = (purpose: Purpose, hierarchies: any[]) => {
  const hierarchy = hierarchies.find(h => h.id === parseInt(purpose.hierarchy_id?.toString() || '0'));
  
  if (hierarchy) {
    return {
      displayName: getLastHierarchyLevel(hierarchy.path),
      fullPath: hierarchy.path,
      accessorValue: hierarchy.path
    };
  }
  
  if (purpose.hierarchy_name) {
    return {
      displayName: getLastHierarchyLevel(purpose.hierarchy_name),
      fullPath: purpose.hierarchy_name,
      accessorValue: purpose.hierarchy_name
    };
  }
  
  return {
    displayName: 'N/A',
    fullPath: 'No hierarchy assigned',
    accessorValue: 'N/A'
  };
};

export const getPendingAuthorityInfo = (purpose: Purpose) => {
  if (purpose.pending_authority) {
    return {
      displayName: purpose.pending_authority.name,
      description: purpose.pending_authority.description,
      accessorValue: purpose.pending_authority.name
    };
  }

  return {
    displayName: 'N/A',
    description: 'No pending authority assigned',
    accessorValue: 'N/A'
  };
};