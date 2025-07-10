/**
 * Utility functions for handling purchase stages, pending stages calculation,
 * and related text generation.
 */

/**
 * Convert purchase data to structured stages array
 */
export const convertPurchaseToStages = (purchase: any) => {
  // Flatten nested arrays of stages - treat array items as independent stages
  const stages = (purchase.flow_stages || [])
    .flatMap((item: any) => Array.isArray(item) ? item : [item]) // Flatten nested stage arrays
    .filter((stage: any) => stage && stage.stage_type && (stage.stage_type.display_name || stage.stage_type.name)) // Filter out invalid stages
    .map((stage: any) => ({
      id: stage.id,
      name: stage.stage_type.display_name || stage.stage_type.name, // Using display_name from API response
      completed: !!stage.completion_date,
      date: stage.completion_date, // Only show completion date, no fallback to creation date
      value: stage.value || '',
      priority: stage.priority,
      stage_type: stage.stage_type
    }))
    .sort((a: any, b: any) => {
      // First sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Within the same priority, sort by completion status (completed first)
      if (a.completed !== b.completed) {
        return a.completed ? -1 : 1; // completed stages first
      }
      return 0;
    });
  
  // Only create a basic creation stage if there are truly no flow stages
  if (stages.length === 0) {
    return [{
      id: `${purchase.id}-creation`,
      name: 'Created',
      completed: true,
      date: purchase.creation_date,
      value: `Purchase #${purchase.id}`,
      priority: 0, // Changed from 1 to 0 to ensure it comes before any actual stages
      stage_type: { name: 'creation', value_required: false }
    }];
  }
  
  return stages;
};

/**
 * Calculate time since last completion (or creation if no stages completed)
 */
export const calculateTimeSinceLastCompletion = (stages: any[], purchase: any): number => {
  const completedStages = stages.filter(stage => stage.completed && stage.date);
  
  let referenceDate;
  
  if (completedStages.length === 0) {
    // No completed stages yet - use purchase creation date
    referenceDate = purchase.creation_date;
  } else {
    // Find the most recent completion date
    const mostRecentCompletion = completedStages.reduce((latest, stage) => {
      return new Date(stage.date) > new Date(latest.date) ? stage : latest;
    });
    referenceDate = mostRecentCompletion.date;
  }

  // Calculate duration since reference date
  const now = new Date();
  const refDate = new Date(referenceDate);
  const diffMs = now.getTime() - refDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Get current pending stages (incomplete stages with lowest priority)
 */
export const getCurrentPendingStages = (stages: any[]) => {
  const incompleteStages = stages.filter(stage => !stage.completed);
  if (incompleteStages.length === 0) {
    return [];
  }

  // Find the lowest priority among incomplete stages
  const lowestPriority = Math.min(...incompleteStages.map(stage => stage.priority));
  
  // Return all incomplete stages with the lowest priority
  return incompleteStages.filter(stage => stage.priority === lowestPriority);
};

/**
 * Generate pending stages text for a purchase
 * Follows three-tier logic: API fields -> Hybrid -> Manual calculation
 * @param purchase - The purchase object
 * @param showPurchasePrefix - Whether to include "Purchase {id}" prefix in the text
 */
export const getPendingStagesText = (purchase: any, showPurchasePrefix: boolean = false): string | null => {
  // First try the API-provided data (tier 1: full API)
  if (purchase.days_since_last_completion !== undefined && purchase.current_pending_stages && purchase.current_pending_stages.length > 0) {
    const days = purchase.days_since_last_completion;
    const stageNames = purchase.current_pending_stages.map((stage: any) => stage.stage_type.display_name || stage.stage_type.name).join(', ');
    const baseText = `${days} days in ${stageNames}`;
    return showPurchasePrefix ? `Purchase ${purchase.id}: ${baseText}` : baseText;
  }

  // Fallback: calculate stages manually but prefer API time calculation (tier 2: hybrid & tier 3: full manual)
  const stages = convertPurchaseToStages(purchase);
  const pendingStages = getCurrentPendingStages(stages);
  
  if (pendingStages.length === 0) {
    return null;
  }

  // Prefer API time field, fallback to manual calculation only if API field missing
  let days;
  if (purchase.days_since_last_completion !== undefined) {
    days = purchase.days_since_last_completion;
  } else {
    days = calculateTimeSinceLastCompletion(stages, purchase);
  }

  const stageNames = pendingStages.map(stage => stage.name).join(', ');
  const baseText = `${days} days in ${stageNames}`;
  return showPurchasePrefix ? `Purchase ${purchase.id}: ${baseText}` : baseText;
}; 