/**
 * Pre-Call Plan Storage Service
 * 
 * localStorage-based storage for Pre-Call Plans.
 * Private to the user, no manager visibility.
 */

import type { PreCallPlan, PreCallPlanDraft, PreCallPlanListItem } from '@/types/pre-call-plan';

const STORAGE_KEY = 'reflectivai_pre_call_plans';
const AUTOSAVE_DEBOUNCE_MS = 1000;

let autosaveTimer: NodeJS.Timeout | null = null;

/**
 * Get all Pre-Call Plans for the current user
 */
export function getAllPreCallPlans(userId: string): PreCallPlan[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allPlans: PreCallPlan[] = JSON.parse(stored);
    return allPlans.filter(plan => plan.userId === userId);
  } catch (error) {
    console.error('Failed to load Pre-Call Plans:', error);
    return [];
  }
}

/**
 * Get a single Pre-Call Plan by ID
 */
export function getPreCallPlan(planId: string, userId: string): PreCallPlan | null {
  const plans = getAllPreCallPlans(userId);
  return plans.find(plan => plan.id === planId) || null;
}

/**
 * Get list of Pre-Call Plans (summary view)
 */
export function getPreCallPlanList(userId: string): PreCallPlanListItem[] {
  const plans = getAllPreCallPlans(userId);
  return plans.map(plan => ({
    id: plan.id,
    title: plan.title || `Plan - ${new Date(plan.createdAt).toLocaleDateString()}`,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    scenarioName: plan.scenarioName,
  }));
}

/**
 * Create a new Pre-Call Plan
 */
export function createPreCallPlan(
  userId: string,
  draft: PreCallPlanDraft,
  scenarioId?: string,
  scenarioName?: string
): PreCallPlan {
  const now = new Date().toISOString();
  const newPlan: PreCallPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    createdAt: now,
    updatedAt: now,
    scenarioId,
    scenarioName,
    callObjective: draft.callObjective || '',
    keyMessages: draft.keyMessages || '',
    hypotheses: draft.hypotheses || '',
    signalsToListenFor: draft.signalsToListenFor || '',
    questionsToAsk: draft.questionsToAsk || '',
    potentialObjections: draft.potentialObjections || '',
    desiredNextStep: draft.desiredNextStep || '',
    title: draft.title,
    notes: draft.notes,
  };
  
  savePreCallPlan(newPlan);
  return newPlan;
}

/**
 * Update an existing Pre-Call Plan
 */
export function updatePreCallPlan(
  planId: string,
  userId: string,
  updates: Partial<PreCallPlanDraft>
): PreCallPlan | null {
  const plan = getPreCallPlan(planId, userId);
  if (!plan) return null;
  
  const updatedPlan: PreCallPlan = {
    ...plan,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  savePreCallPlan(updatedPlan);
  return updatedPlan;
}

/**
 * Delete a Pre-Call Plan
 */
export function deletePreCallPlan(planId: string, userId: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const allPlans: PreCallPlan[] = JSON.parse(stored);
    const filtered = allPlans.filter(plan => !(plan.id === planId && plan.userId === userId));
    
    if (filtered.length === allPlans.length) return false; // Plan not found
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete Pre-Call Plan:', error);
    return false;
  }
}

/**
 * Save a Pre-Call Plan (internal helper)
 */
function savePreCallPlan(plan: PreCallPlan): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allPlans: PreCallPlan[] = stored ? JSON.parse(stored) : [];
    
    // Update or insert
    const index = allPlans.findIndex(p => p.id === plan.id);
    if (index >= 0) {
      allPlans[index] = plan;
    } else {
      allPlans.push(plan);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlans));
  } catch (error) {
    console.error('Failed to save Pre-Call Plan:', error);
    throw error;
  }
}

/**
 * Autosave a Pre-Call Plan (debounced)
 */
export function autosavePreCallPlan(
  planId: string,
  userId: string,
  updates: Partial<PreCallPlanDraft>,
  callback?: (success: boolean) => void
): void {
  // Clear existing timer
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
  }
  
  // Set new timer
  autosaveTimer = setTimeout(() => {
    try {
      const result = updatePreCallPlan(planId, userId, updates);
      callback?.(result !== null);
    } catch (error) {
      console.error('Autosave failed:', error);
      callback?.(false);
    }
  }, AUTOSAVE_DEBOUNCE_MS);
}

/**
 * Clear all Pre-Call Plans for a user (for testing/cleanup)
 */
export function clearAllPreCallPlans(userId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const allPlans: PreCallPlan[] = JSON.parse(stored);
    const filtered = allPlans.filter(plan => plan.userId !== userId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to clear Pre-Call Plans:', error);
  }
}
