// Shared color palette for all dashboard charts
export const CHART_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#ec4899", // pink
  "#6b7280", // gray
  "#f43f5e", // rose
  "#14b8a6", // teal
  "#a855f7", // purple
  "#eab308", // yellow
  "#0ea5e9", // sky blue
] as const;

// Global registry to maintain consistent service type ordering and colors
const serviceTypeRegistry = new Map<string, { index: number; color: string }>();
let nextColorIndex = 0;

/**
 * Get a consistent color for a service type
 * Uses a simple approach: first come, first served for color assignment
 * Same service type name = same color across ALL charts
 */
export function getServiceTypeColor(serviceTypeId: number | string, serviceTypeName?: string): string {
  // Use service type name as the key (most reliable across different data sources)
  const key = serviceTypeName?.trim().toLowerCase() || `id_${serviceTypeId}`;

  // If we've seen this service type before, return its assigned color
  if (serviceTypeRegistry.has(key)) {
    const assignment = serviceTypeRegistry.get(key)!;
    return assignment.color;
  }

  // New service type: assign the next available color
  const colorIndex = nextColorIndex % CHART_COLORS.length;
  const assignedColor = CHART_COLORS[colorIndex];

  // Register this service type
  serviceTypeRegistry.set(key, {
    index: nextColorIndex,
    color: assignedColor,
  });

  nextColorIndex++;

  return assignedColor;
}

/**
 * Get a consistent color for any entity based on its ID or name
 * Useful for other chart types (budget sources, authorities, etc.)
 * Uses the same registry approach as service types
 */
const entityColorRegistry = new Map<string, { index: number; color: string }>();
let nextEntityColorIndex = 0;

export function getEntityColor(entityId: number | string | null, entityName?: string): string {
  // Create a key for this entity
  const key = entityName?.trim().toLowerCase() || `id_${entityId}`;

  // If we've seen this entity before, return its assigned color
  if (entityColorRegistry.has(key)) {
    return entityColorRegistry.get(key)!.color;
  }

  // New entity: assign the next available color
  const colorIndex = nextEntityColorIndex % CHART_COLORS.length;
  const assignedColor = CHART_COLORS[colorIndex];

  // Register this entity
  entityColorRegistry.set(key, {
    index: nextEntityColorIndex,
    color: assignedColor,
  });

  nextEntityColorIndex++;

  return assignedColor;
}
