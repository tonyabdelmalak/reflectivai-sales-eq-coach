/**
 * Behavioral Metrics Specification (SI-v2-locked-2026-02-11)
 * Single source of truth for 8 Signal Intelligence metrics
 * Frontend-only, deterministic scoring framework
 */

// VERSION LOCK
export const METRICS_VERSION = 'SI-v2-locked-2026-02-11';

// CANONICAL LIST: All 8 Behavioral Metrics (MUST be used everywhere)
export const BEHAVIORAL_METRIC_IDS = [
  'question_quality',
  'listening_responsiveness',
  'making_it_matter',
  'customer_engagement_signals',
  'objection_navigation',
  'conversation_control_structure',
  'adaptability',
  'commitment_gaining',
] as const;

export type BehavioralMetricId = typeof BEHAVIORAL_METRIC_IDS[number];

export interface ComponentSpec {
  name: string;
  description: string;
  weight: number;
  indicators: string[];
  heuristics: string;
}

export interface MetricSpec {
  id: BehavioralMetricId;
  metric: string;
  optional: boolean;
  score_formula: 'average' | 'weighted_average';
  components: ComponentSpec[];
}

export const METRICS_SPEC: MetricSpec[] = [
  {
    id: 'question_quality',
    metric: 'Question Quality',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'contextual_relevance',
        description: 'Degree to which rep questions directly reference, build on, or align with customer-stated goals, concerns, or context within prior turns',
        weight: 0.5,
        indicators: [
          'References customer-stated goals',
          'Uses bridging phrases ("you mentioned", "when you said")',
          'Builds on prior customer context'
        ],
        heuristics: 'Extract customer goal tokens from words following: need/goal/concern/challenge/priority/trying/want/issue/barrier/struggling. For each rep question, check token overlap with goal tokens OR bridging phrases. Score by relevance_ratio = G/Q where G=questions with overlap/bridges, Q=total questions: ≥0.60→5, ≥0.45→4, ≥0.30→3, ≥0.15→2, <0.15→1. If Q=0→null.'
      },
      {
        name: 'forward_value',
        description: 'Degree to which rep questions move conversation forward toward decision, clarification, or action',
        weight: 0.5,
        indicators: [
          'Explores impact ("how would that impact")',
          'Explores change ("what would need to change")',
          'Explores outcomes ("what would success look like")',
          'Explores next steps ("what happens next")'
        ],
        heuristics: 'Detect forward-driving phrases: how are you currently/what would success look like/what would need to change/how would that impact/what would make you comfortable/what would it take/if we could/how do you see/what happens next. Also detect why/how causal reasoning. Score by forward_ratio = F/Q where F=forward-driving questions, Q=total questions: ≥0.70→5, ≥0.55→4, ≥0.40→3, ≥0.25→2, <0.25→1. If Q=0→null.'
      }
    ]
  },
  {
    id: 'listening_responsiveness',
    metric: 'Listening & Responsiveness',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'accuracy_of_interpretation',
        description: 'Reflects back customer statements accurately',
        weight: 0.5,
        indicators: [
          'Uses paraphrasing ("what I\'m hearing", "so you\'re saying")',
          'Demonstrates understanding ("if I understand", "it sounds like")',
          'Token overlap with customer statements'
        ],
        heuristics: 'Detect paraphrasing patterns: what I\'m hearing/so you\'re saying/if I understand/it sounds like. Score: 0 occurrences→1, 1 occurrence→3, 2+ occurrences with token overlap→5.'
      },
      {
        name: 'responsiveness_of_action',
        description: 'Adjusts approach based on customer input',
        weight: 0.5,
        indicators: [
          'Uses pivot phrases ("based on that", "let me adjust")',
          'Adapts to customer feedback ("in light of", "given what you said")'
        ],
        heuristics: 'Detect pivot phrases: based on that/let me adjust/in light of/given what you said. Score: 0→1, 1→3, 2+→5.'
      }
    ]
  },
  {
    id: 'making_it_matter',
    metric: 'Making It Matter',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'customer_relevance_alignment',
        description: 'Links solution to customer-specific context',
        weight: 0.5,
        indicators: [
          'References customer context ("for your patients", "in your practice")',
          'Aligns with customer population ("given your population")'
        ],
        heuristics: 'Detect linking phrases: for your patients/in your practice/given your population. Score: 0→1, 1→3, 2+→5.'
      },
      {
        name: 'outcome_translation',
        description: 'Translates features into customer outcomes',
        weight: 0.5,
        indicators: [
          'Explains impact ("this means", "the impact would be")',
          'Clarifies results ("the result is")'
        ],
        heuristics: 'Detect translation phrases: this means/the impact would be/the result is. Score: 0→1, 1→3, 2+→5.'
      }
    ]
  },
  {
    id: 'customer_engagement_signals',
    metric: 'Customer Engagement Cues',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'customer_verbal_participation_ratio',
        description: 'Customer word count as percentage of total conversation',
        weight: 0.25,
        indicators: [
          'Customer speaks 35-55% of conversation (optimal)',
          'Customer speaks 20-35% (moderate)',
          'Customer speaks <20% or >55% (low engagement)'
        ],
        heuristics: 'Calculate customer_words / total_words. Score: 35-55%→5, 20-35%→3, 0-20%→1.'
      },
      {
        name: 'responsiveness_to_customer_cues',
        description: 'Rep directly references prior customer turn',
        weight: 0.25,
        indicators: [
          'References customer statements',
          'Builds on customer input',
          'Acknowledges customer cues'
        ],
        heuristics: 'Count instances where rep directly references prior customer turn within next turn. Score: 0→1, 1-2→3, 3+→5.'
      },
      {
        name: 'momentum_continuity',
        description: 'Conversation flows without abrupt topic jumps',
        weight: 0.25,
        indicators: [
          'Low topic jumps (smooth flow)',
          'Moderate topic jumps',
          'High topic jumps (disjointed)'
        ],
        heuristics: 'Count topic jumps (low overlap between adjacent turns). Score: Low jumps→5, Moderate→3, High→1.'
      },
      {
        name: 'customer_signal_amplification',
        description: 'Rep expands on customer ideas',
        weight: 0.25,
        indicators: [
          'Builds on customer statements',
          'Expands customer ideas',
          'Develops customer themes'
        ],
        heuristics: 'Count instances where rep expands on customer idea. Score: 0→1, 1→3, 2+→5.'
      }
    ]
  },
  {
    id: 'objection_navigation',
    metric: 'Objection Navigation',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'non_defensive_response',
        description: 'Avoids rebuttal language, uses acknowledgment',
        weight: 0.5,
        indicators: [
          'Uses acknowledgment ("I understand your concern", "that\'s fair")',
          'Avoids defensive language',
          'Validates customer perspective'
        ],
        heuristics: 'Detect acknowledgment phrases: I understand your concern/that\'s fair. Score: None→1, 1→3, 2+→5.'
      },
      {
        name: 'constructive_engagement',
        description: 'Asks follow-up questions on objections',
        weight: 0.5,
        indicators: [
          'Explores objection deeper',
          'Asks clarifying questions',
          'Engages constructively'
        ],
        heuristics: 'Count follow-up questions after objection. Score: None→1, 1→3, 2+→5.'
      }
    ]
  },
  {
    id: 'conversation_control_structure',
    metric: 'Conversation Control & Structure',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'directional_clarity',
        description: 'Uses structure markers to guide conversation',
        weight: 0.33,
        indicators: [
          'Uses sequencing ("first", "next")',
          'Provides transitions',
          'Signals direction'
        ],
        heuristics: 'Detect structure markers: first/next/to summarize. Score: 0→1, 1→3, 2+→5.'
      },
      {
        name: 'adaptive_steering',
        description: 'Adjusts conversation direction based on customer input',
        weight: 0.33,
        indicators: [
          'Pivots based on customer feedback',
          'Adjusts approach dynamically',
          'Steers toward goals'
        ],
        heuristics: 'Detect adaptive steering phrases. Score: 0→1, 1→3, 2+→5.'
      },
      {
        name: 'purposeful_closure',
        description: 'Brings topics to clear conclusion',
        weight: 0.34,
        indicators: [
          'Summarizes key points',
          'Confirms understanding',
          'Provides closure'
        ],
        heuristics: 'Detect closure phrases: to summarize/in summary/so what we\'ve covered. Score: 0→1, 1→3, 2+→5.'
      }
    ]
  },
  {
    id: 'adaptability',
    metric: 'Adaptability',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'situational_responsiveness',
        description: 'Responds to changing customer needs',
        weight: 0.5,
        indicators: [
          'Adjusts to customer signals',
          'Responds to situational changes',
          'Adapts approach'
        ],
        heuristics: 'Detect situational pivots: let\'s take a different approach/given that. Score: 0→1, 1→3, 2+→5.'
      },
      {
        name: 'approach_adjustment_quality',
        description: 'Quality of approach adjustments',
        weight: 0.5,
        indicators: [
          'Makes meaningful adjustments',
          'Adjustments align with customer needs',
          'Smooth transitions'
        ],
        heuristics: 'Evaluate quality of pivots. Score: 0→1, 1→3, 2+→5.'
      }
    ]
  },
  {
    id: 'commitment_gaining',
    metric: 'Commitment Gaining',
    optional: false,
    score_formula: 'average',
    components: [
      {
        name: 'next_step_clarity',
        description: 'Clearly defines next steps',
        weight: 0.5,
        indicators: [
          'Proposes specific next steps',
          'Clarifies action items',
          'Sets clear expectations'
        ],
        heuristics: 'Detect next step phrases: would you be open/can we schedule/what would be the next step. Score: 0→1, 1→3, 2+→5.'
      },
      {
        name: 'customer_ownership',
        description: 'Gains customer commitment to next steps',
        weight: 0.5,
        indicators: [
          'Seeks customer agreement',
          'Confirms customer commitment',
          'Establishes ownership'
        ],
        heuristics: 'Detect commitment-seeking phrases. Score: 0→1, 1→3, 2+→5.'
      }
    ]
  }
];
