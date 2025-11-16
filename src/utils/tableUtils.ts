import { getCurrencySymbol, Purpose } from "@/types";
import { getStagesText } from "@/utils/stageUtils";

import { ColumnSizing } from "./columnStorage";

// Column configuration constants
export const COLUMN_SIZES = {
  status: { size: 140, minSize: 100 },
  statusMessage: { size: 180, minSize: 160 },
  description: { size: 300, minSize: 256 },
  content: { size: 200, minSize: 180 },
  supplier: { size: 120, minSize: 96 },
  pendingAuthority: { size: 160, minSize: 120 },
  hierarchy: { size: 80, minSize: 60 },
  serviceType: { size: 140, minSize: 112 },
  budgetSource: { size: 140, minSize: 112 },
  purchases: { size: 320, minSize: 240 },
  emfIds: { size: 120, minSize: 96 },
  demandIds: { size: 120, minSize: 96 },
  orderIds: { size: 120, minSize: 96 },
  totalCost: { size: 120, minSize: 112 },
  expectedDelivery: { size: 120, minSize: 96 },
  createdAt: { size: 120, minSize: 96 },
  lastModified: { size: 120, minSize: 96 },
};

/**
 * Extract default column sizes from COLUMN_SIZES configuration
 */
export const getDefaultColumnSizing = (): ColumnSizing => {
  return Object.fromEntries(Object.entries(COLUMN_SIZES).map(([key, config]) => [key, config.size]));
};

export const getLastHierarchyLevel = (hierarchyName: string | undefined | null): string => {
  if (!hierarchyName) return "N/A";
  const parts = hierarchyName
    .split(/[>/\\-]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts[parts.length - 1] : hierarchyName;
};

export const getTotalCostWithCurrencies = (purpose: Purpose) => {
  const costsByCurrency: { [key: string]: number } = {};

  purpose.purchases.forEach((purchase) => {
    purchase.costs.forEach((cost) => {
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
    if (currency === "SUPPORT_USD" || currency === "AVAILABLE_USD") {
      if (!combinedCostsByCurrency["USD"]) {
        combinedCostsByCurrency["USD"] = 0;
      }
      combinedCostsByCurrency["USD"] += amount;
    } else {
      combinedCostsByCurrency[currency] = amount;
    }
  });

  const displayStrings = Object.entries(combinedCostsByCurrency).map(([currency, amount]) => {
    const symbol = currency === "USD" ? "$" : getCurrencySymbol(currency as any);
    return `${symbol}${formatAmount(amount)}`;
  });

  const costDetails = Object.entries(costsByCurrency).map(([currency, amount]) => {
    return `${getCurrencySymbol(currency as any)}${formatAmount(amount)} ${currency}`;
  });

  return {
    display: displayStrings,
    details: costDetails,
    allCosts: costDetails.join(", ") || "0",
  };
};

export const getEMFIds = (purpose: Purpose) => {
  const emfIds: string[] = [];

  purpose.purchases.forEach((purchase) => {
    purchase.flow_stages.forEach((stage) => {
      if (stage.stage_type.name === "emf_id" && stage.value && stage.value.trim()) {
        emfIds.push(stage.value.trim());
      }
    });
  });

  return {
    ids: emfIds,
    allIds: emfIds.length > 0 ? emfIds.join(", ") : "-",
  };
};

export const getDemandIds = (purpose: Purpose) => {
  const demandIds: string[] = [];

  purpose.purchases.forEach((purchase) => {
    purchase.flow_stages.forEach((stage) => {
      if (stage.stage_type.name === "demand_id" && stage.value && stage.value.trim()) {
        demandIds.push(stage.value.trim());
      }
    });
  });

  return {
    ids: demandIds,
    allIds: demandIds.length > 0 ? demandIds.join(", ") : "-",
  };
};

export const getOrderIds = (purpose: Purpose) => {
  const orderIds: string[] = [];

  purpose.purchases.forEach((purchase) => {
    purchase.flow_stages.forEach((stage) => {
      if (stage.stage_type.name === "order_id" && stage.value && stage.value.trim()) {
        orderIds.push(stage.value.trim());
      }
    });
  });

  return {
    ids: orderIds,
    allIds: orderIds.length > 0 ? orderIds.join(", ") : "-",
  };
};

export const getContentsDisplay = (purpose: Purpose) => {
  if (!purpose.contents || !Array.isArray(purpose.contents) || purpose.contents.length === 0) {
    return {
      display: ["No contents"],
      details: ["No contents specified"],
      allContents: "No contents",
    };
  }

  const contentStrings = purpose.contents.map(
    (content) =>
      `${content.quantity} × ${content.service_name || content.material_name || `Material ${content.material_id || content.service_id}`}`
  );

  return {
    display: contentStrings,
    details: contentStrings,
    allContents: contentStrings.join(", "),
  };
};

export const getStagesDisplay = (purpose: Purpose) => {
  // Sort purchases by days_since_last_completion in descending order (highest pending days first)
  const sortedPurchases = [...purpose.purchases].sort((a, b) => {
    const daysA = a.days_since_last_completion ?? -1;
    const daysB = b.days_since_last_completion ?? -1;
    return daysB - daysA;
  });

  return sortedPurchases.map((purchase) => getStagesText(purchase, true)).filter((text) => text !== null);
};

export const getHierarchyInfo = (purpose: Purpose, hierarchies: any[]) => {
  const hierarchy = hierarchies.find((h) => h.id === parseInt(purpose.hierarchy_id?.toString() || "0"));

  if (hierarchy) {
    return {
      displayName: getLastHierarchyLevel(hierarchy.path),
      fullPath: hierarchy.path,
      accessorValue: hierarchy.path,
    };
  }

  if (purpose.hierarchy_name) {
    return {
      displayName: getLastHierarchyLevel(purpose.hierarchy_name),
      fullPath: purpose.hierarchy_name,
      accessorValue: purpose.hierarchy_name,
    };
  }

  return {
    displayName: "N/A",
    fullPath: "No hierarchy assigned",
    accessorValue: "N/A",
  };
};

export const getAuthorityInfo = (purpose: Purpose) => {
  if (purpose.pending_authority) {
    return {
      displayName: purpose.pending_authority.name,
      description: purpose.pending_authority.description,
      accessorValue: purpose.pending_authority.name,
    };
  }

  return {
    displayName: "N/A",
    description: "No authority assigned",
    accessorValue: "N/A",
  };
};

export const getBudgetSources = (purpose: Purpose) => {
  const budgetSources: string[] = [];

  purpose.purchases.forEach((purchase) => {
    if (purchase.budget_source && purchase.budget_source.name) {
      const name = purchase.budget_source.name.trim();
      if (name && !budgetSources.includes(name)) {
        budgetSources.push(name);
      }
    }
  });

  return {
    sources: budgetSources,
    allSources: budgetSources.length > 0 ? budgetSources.join(", ") : "-",
  };
};
