/**
 * Observable Cue to Behavioral Metric Mapping
 * Read-only explainability layer - NO SCORING LOGIC
 * Maps detected cues to metrics for transparency only
 */

import type { BehavioralMetricId } from './signal-intelligence/metrics-spec';

export type CueMetricMapping = {
  cueId: string;
  metricId: BehavioralMetricId;
  component?: string;
  explanation: string;
};

export const CUE_TO_METRIC_MAP: CueMetricMapping[] = [
  // Open-ended questions
  {
    cueId: 'open-ended',
    metricId: 'question_quality',
    component: 'open_closed_ratio',
    explanation: 'Open-ended questions encourage exploration and deeper dialogue.'
  },
  {
    cueId: 'open-ended',
    metricId: 'conversation_control_structure',
    component: 'topic_management',
    explanation: 'Open questions help guide conversation flow naturally.'
  },

  // Empathy
  {
    cueId: 'empathy',
    metricId: 'listening_responsiveness',
    component: 'acknowledgment_of_concerns',
    explanation: 'Empathetic language shows acknowledgment of customer concerns.'
  },
  {
    cueId: 'empathy',
    metricId: 'objection_navigation',
    component: 'acknowledge_before_response',
    explanation: 'Empathy validates concerns before responding to objections.'
  },

  // Active listening
  {
    cueId: 'active-listening',
    metricId: 'listening_responsiveness',
    component: 'paraphrasing',
    explanation: 'Active listening reflects back customer statements to confirm understanding.'
  },
  {
    cueId: 'active-listening',
    metricId: 'adaptability',
    component: 'adjustment_to_new_info',
    explanation: 'Active listening enables adaptation to new information shared.'
  },

  // Clarification
  {
    cueId: 'clarification',
    metricId: 'question_quality',
    component: 'follow_up_depth',
    explanation: 'Clarifying questions deepen understanding of customer needs.'
  },
  {
    cueId: 'clarification',
    metricId: 'objection_navigation',
    component: 'explore_underlying_concern',
    explanation: 'Clarification probes deeper to understand root concerns.'
  },

  // Benefit focus
  {
    cueId: 'benefit-focus',
    metricId: 'making_it_matter',
    component: 'outcome_based_language',
    explanation: 'Benefit-focused language emphasizes outcomes over features.'
  },
  {
    cueId: 'benefit-focus',
    metricId: 'making_it_matter',
    component: 'no_feature_dumping',
    explanation: 'Connecting features to benefits avoids overwhelming with details.'
  },

  // Data reference
  {
    cueId: 'data-reference',
    metricId: 'making_it_matter',
    component: 'outcome_based_language',
    explanation: 'Data and evidence support outcome-based value propositions.'
  },

  // Objection handling
  {
    cueId: 'objection-handling',
    metricId: 'objection_navigation',
    component: 'calm_demeanor',
    explanation: 'Calm, measured responses maintain professionalism during objections.'
  },
  {
    cueId: 'objection-handling',
    metricId: 'adaptability',
    component: 'approach_shift',
    explanation: 'Addressing objections often requires shifting strategy or approach.'
  },

  // Rapport building
  {
    cueId: 'rapport-building',
    metricId: 'customer_engagement_signals',
    component: 'energy_shifts',
    explanation: 'Rapport-building language helps maintain positive customer engagement.'
  },
  {
    cueId: 'rapport-building',
    metricId: 'listening_responsiveness',
    component: 'acknowledgment_of_concerns',
    explanation: 'Building rapport involves acknowledging and validating customer perspectives.'
  },

  // Question technique
  {
    cueId: 'question',
    metricId: 'question_quality',
    component: 'sequencing_logic',
    explanation: 'Effective questioning techniques create logical conversation flow.'
  },

  // Value articulation
  {
    cueId: 'value-statement',
    metricId: 'making_it_matter',
    component: 'link_to_customer_priorities',
    explanation: 'Value articulation connects solutions to customer-stated priorities.'
  },
  {
    cueId: 'value-statement',
    metricId: 'commitment_gaining',
    component: 'mutual_agreement',
    explanation: 'Clear value articulation helps gain customer agreement on next steps.'
  }
];

/**
 * Get all cue types that map to a specific metric
 * Read-only utility for UI display
 */
export function getCuesForMetric(metricId: BehavioralMetricId): CueMetricMapping[] {
  return CUE_TO_METRIC_MAP.filter(m => m.metricId === metricId);
}

/**
 * Get all metrics influenced by a specific cue ID
 * Read-only utility for UI display
 */
export function getMetricsForCue(cueId: string): CueMetricMapping[] {
  return CUE_TO_METRIC_MAP.filter(m => m.cueId === cueId);
}

/**
 * Check if a cue ID maps to a specific metric
 * Read-only utility for UI display
 */
export function cueInfluencesMetric(cueId: string, metricId: BehavioralMetricId): boolean {
  return CUE_TO_METRIC_MAP.some(m => m.cueId === cueId && m.metricId === metricId);
}
