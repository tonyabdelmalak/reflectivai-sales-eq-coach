/**
 * Behavioral Metrics Scoring Engine (SI-v2-locked-2026-02-11)
 * Frontend-only, deterministic scoring implementation
 * No ML, no external deps, no network calls
 */

import { METRICS_SPEC, METRICS_VERSION, type BehavioralMetricId } from './metrics-spec';

export type Turn = {
  speaker: 'rep' | 'customer';
  text: string;
  t0?: number;
  t1?: number;
};

export type Transcript = Turn[];

export type ComponentResult = {
  name: string;
  score: number | null;
  applicable: boolean;
  weight: number;
  rationale?: string;
};

export type MetricResult = {
  id: string;
  metric: string;
  optional: boolean;
  score_formula: 'average' | 'weighted_average';
  components: ComponentResult[];
  overall_score: number | null;
  not_applicable?: boolean;
  metricsVersion: string;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Round half up to 1 decimal place
 * SI-v2 canonical rounding: Math.round(n * 10) / 10
 */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Average of applicable components (equal weighting)
 * SI-v2 canonical aggregation: simple arithmetic mean
 */
export function averageApplicable(components: ComponentResult[]): number | null {
  const applicable = components.filter(c => c.applicable && c.score !== null);
  if (applicable.length === 0) return null;
  const sum = applicable.reduce((acc, c) => acc + (c.score || 0), 0);
  return round1(sum / applicable.length);
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
  'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

export function overlap(tokens1: string[], tokens2: string[]): number {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = [...set1].filter(t => set2.has(t));
  return intersection.length / Math.max(set1.size, set2.size);
}

export function containsAny(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some(p => lower.includes(p.toLowerCase()));
}

export function countOccurrences(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.filter(p => lower.includes(p.toLowerCase())).length;
}

export function isQuestion(text: string): boolean {
  return text.trim().endsWith('?');
}

// ============================================================================
// COMPONENT SCORING FUNCTIONS (SI-v2)
// ============================================================================

/**
 * 1. QUESTION QUALITY - Component: contextual_relevance
 * 
 * Degree to which rep questions reference customer goals/context
 */
function scoreContextualRelevance(transcript: Transcript): ComponentResult {
  const repQuestions = transcript.filter(t => t.speaker === 'rep' && isQuestion(t.text));
  const Q = repQuestions.length;

  if (Q === 0) {
    return {
      name: 'contextual_relevance',
      score: null,
      applicable: false,
      weight: 0.5,
      rationale: 'No rep questions detected'
    };
  }

  // Extract customer goal tokens
  const goalKeywords = ['need', 'goal', 'concern', 'challenge', 'priority', 'trying', 'want', 'issue', 'barrier', 'struggling'];
  const goalTokens = new Set<string>();

  transcript
    .filter(t => t.speaker === 'customer')
    .forEach(turn => {
      const tokens = tokenize(turn.text);
      tokens.forEach((token, idx) => {
        if (goalKeywords.includes(token) && idx + 1 < tokens.length) {
          goalTokens.add(tokens[idx + 1]);
        }
      });
    });

  // Bridging phrases
  const bridgingPhrases = [
    'you mentioned',
    'when you said',
    'earlier you noted',
    'based on what you said'
  ];

  // Count questions with goal token overlap or bridging phrases
  let G = 0;
  repQuestions.forEach(q => {
    const qTokens = tokenize(q.text);
    const hasGoalOverlap = qTokens.some(t => goalTokens.has(t));
    const hasBridge = containsAny(q.text, bridgingPhrases);
    if (hasGoalOverlap || hasBridge) G++;
  });

  const relevance_ratio = G / Q;

  let score: number;
  if (relevance_ratio >= 0.60) score = 5;
  else if (relevance_ratio >= 0.45) score = 4;
  else if (relevance_ratio >= 0.30) score = 3;
  else if (relevance_ratio >= 0.15) score = 2;
  else score = 1;

  return {
    name: 'contextual_relevance',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${G}/${Q} questions reference goals/context (${Math.round(relevance_ratio * 100)}%)`
  };
}

/**
 * 1. QUESTION QUALITY - Component: forward_value
 * 
 * Degree to which rep questions move conversation forward
 */
function scoreForwardValue(transcript: Transcript): ComponentResult {
  const repQuestions = transcript.filter(t => t.speaker === 'rep' && isQuestion(t.text));
  const Q = repQuestions.length;

  if (Q === 0) {
    return {
      name: 'forward_value',
      score: null,
      applicable: false,
      weight: 0.5,
      rationale: 'No rep questions detected'
    };
  }

  const forwardPhrases = [
    'how are you currently',
    'what would success look like',
    'what would need to change',
    'how would that impact',
    'what would make you comfortable',
    'what would it take',
    'if we could',
    'how do you see',
    'what happens next',
    'why',
    'how'
  ];

  let F = 0;
  repQuestions.forEach(q => {
    if (containsAny(q.text, forwardPhrases)) F++;
  });

  const forward_ratio = F / Q;

  let score: number;
  if (forward_ratio >= 0.70) score = 5;
  else if (forward_ratio >= 0.55) score = 4;
  else if (forward_ratio >= 0.40) score = 3;
  else if (forward_ratio >= 0.25) score = 2;
  else score = 1;

  return {
    name: 'forward_value',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${F}/${Q} questions are forward-driving (${Math.round(forward_ratio * 100)}%)`
  };
}

/**
 * 2. LISTENING & RESPONSIVENESS - Component: accuracy_of_interpretation
 */
function scoreAccuracyOfInterpretation(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const paraphrasePhrases = [
    "what i'm hearing",
    "so you're saying",
    'if i understand',
    'it sounds like'
  ];

  let count = 0;
  let hasTokenOverlap = false;

  repTurns.forEach((repTurn, idx) => {
    if (containsAny(repTurn.text, paraphrasePhrases)) {
      count++;
      // Check token overlap with prior customer turn
      const priorCustomer = transcript.slice(0, idx).reverse().find(t => t.speaker === 'customer');
      if (priorCustomer) {
        const repTokens = tokenize(repTurn.text);
        const custTokens = tokenize(priorCustomer.text);
        if (overlap(repTokens, custTokens) > 0.1) {
          hasTokenOverlap = true;
        }
      }
    }
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else if (count >= 2 && hasTokenOverlap) score = 5;
  else score = 3;

  return {
    name: 'accuracy_of_interpretation',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} paraphrasing occurrences detected`
  };
}

/**
 * 2. LISTENING & RESPONSIVENESS - Component: responsiveness_of_action
 */
function scoreResponsivenessOfAction(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const pivotPhrases = [
    'based on that',
    'let me adjust',
    'in light of',
    'given what you said'
  ];

  let count = 0;
  repTurns.forEach(turn => {
    if (containsAny(turn.text, pivotPhrases)) count++;
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'responsiveness_of_action',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} pivot phrases detected`
  };
}

/**
 * 3. MAKING IT MATTER - Component: customer_relevance_alignment
 */
function scoreCustomerRelevanceAlignment(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const linkingPhrases = [
    'for your patients',
    'in your practice',
    'given your population'
  ];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, linkingPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'customer_relevance_alignment',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} customer-specific references`
  };
}

/**
 * 3. MAKING IT MATTER - Component: outcome_translation
 */
function scoreOutcomeTranslation(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const translationPhrases = [
    'this means',
    'the impact would be',
    'the result is'
  ];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, translationPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'outcome_translation',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} outcome translations detected`
  };
}

/**
 * 4. CUSTOMER ENGAGEMENT CUES - Component: customer_verbal_participation_ratio
 */
function scoreCustomerVerbalParticipation(transcript: Transcript): ComponentResult {
  const customerWords = transcript
    .filter(t => t.speaker === 'customer')
    .reduce((sum, t) => sum + t.text.split(/\s+/).length, 0);

  const totalWords = transcript
    .reduce((sum, t) => sum + t.text.split(/\s+/).length, 0);

  if (totalWords === 0) {
    return {
      name: 'customer_verbal_participation_ratio',
      score: null,
      applicable: false,
      weight: 0.25,
      rationale: 'No conversation detected'
    };
  }

  const ratio = customerWords / totalWords;
  const percentage = Math.round(ratio * 100);

  let score: number;
  if (ratio >= 0.35 && ratio <= 0.55) score = 5;
  else if (ratio >= 0.20 && ratio < 0.35) score = 3;
  else score = 1;

  return {
    name: 'customer_verbal_participation_ratio',
    score: round1(score),
    applicable: true,
    weight: 0.25,
    rationale: `Customer spoke ${percentage}% of conversation`
  };
}

/**
 * 4. CUSTOMER ENGAGEMENT CUES - Component: responsiveness_to_customer_cues
 */
function scoreResponsivenessToCustomerCues(transcript: Transcript): ComponentResult {
  let count = 0;

  transcript.forEach((turn, idx) => {
    if (turn.speaker === 'rep' && idx > 0) {
      const priorTurn = transcript[idx - 1];
      if (priorTurn.speaker === 'customer') {
        const repTokens = tokenize(turn.text);
        const custTokens = tokenize(priorTurn.text);
        if (overlap(repTokens, custTokens) > 0.15) {
          count++;
        }
      }
    }
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count <= 2) score = 3;
  else score = 5;

  return {
    name: 'responsiveness_to_customer_cues',
    score: round1(score),
    applicable: true,
    weight: 0.25,
    rationale: `${count} instances of direct referencing`
  };
}

/**
 * 4. CUSTOMER ENGAGEMENT CUES - Component: momentum_continuity
 */
function scoreMomentumContinuity(transcript: Transcript): ComponentResult {
  let jumps = 0;
  let transitions = 0;

  for (let i = 1; i < transcript.length; i++) {
    const prevTokens = tokenize(transcript[i - 1].text);
    const currTokens = tokenize(transcript[i].text);
    const overlapRatio = overlap(prevTokens, currTokens);

    if (overlapRatio < 0.10) {
      jumps++;
    }
    transitions++;
  }

  if (transitions === 0) {
    return {
      name: 'momentum_continuity',
      score: null,
      applicable: false,
      weight: 0.25,
      rationale: 'Insufficient turns to evaluate'
    };
  }

  const jumpRate = jumps / transitions;

  let score: number;
  if (jumpRate <= 0.20) score = 5;
  else if (jumpRate <= 0.40) score = 3;
  else score = 1;

  return {
    name: 'momentum_continuity',
    score: round1(score),
    applicable: true,
    weight: 0.25,
    rationale: `${jumps}/${transitions} topic jumps (${Math.round(jumpRate * 100)}%)`
  };
}

/**
 * 4. CUSTOMER ENGAGEMENT CUES - Component: customer_signal_amplification
 */
function scoreCustomerSignalAmplification(transcript: Transcript): ComponentResult {
  let count = 0;

  transcript.forEach((turn, idx) => {
    if (turn.speaker === 'rep' && idx > 0) {
      const priorTurn = transcript[idx - 1];
      if (priorTurn.speaker === 'customer') {
        // Rep expands if response is longer and has high token overlap
        const repWords = turn.text.split(/\s+/).length;
        const custWords = priorTurn.text.split(/\s+/).length;
        const repTokens = tokenize(turn.text);
        const custTokens = tokenize(priorTurn.text);
        const overlapRatio = overlap(repTokens, custTokens);

        if (repWords > custWords && overlapRatio > 0.20) {
          count++;
        }
      }
    }
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'customer_signal_amplification',
    score: round1(score),
    applicable: true,
    weight: 0.25,
    rationale: `${count} instances of idea expansion`
  };
}

/**
 * 5. OBJECTION NAVIGATION - Component: non_defensive_response
 */
function scoreNonDefensiveResponse(transcript: Transcript): ComponentResult {
  const acknowledgmentPhrases = [
    'i understand your concern',
    "that's fair",
    'i hear you',
    'that makes sense'
  ];

  const repTurns = transcript.filter(t => t.speaker === 'rep');
  let count = 0;

  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, acknowledgmentPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'non_defensive_response',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} acknowledgment phrases detected`
  };
}

/**
 * 5. OBJECTION NAVIGATION - Component: constructive_engagement
 */
function scoreConstructiveEngagement(transcript: Transcript): ComponentResult {
  // Detect objections in customer turns
  const objectionKeywords = ['concern', 'worried', 'hesitant', 'problem', 'issue', 'not sure', "don't", "can't", "won't"];
  
  let followUpCount = 0;

  transcript.forEach((turn, idx) => {
    if (turn.speaker === 'customer' && containsAny(turn.text, objectionKeywords)) {
      // Check if next rep turn asks a question
      const nextRepTurn = transcript.slice(idx + 1).find(t => t.speaker === 'rep');
      if (nextRepTurn && isQuestion(nextRepTurn.text)) {
        followUpCount++;
      }
    }
  });

  let score: number;
  if (followUpCount === 0) score = 1;
  else if (followUpCount === 1) score = 3;
  else score = 5;

  return {
    name: 'constructive_engagement',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${followUpCount} follow-up questions after objections`
  };
}

/**
 * 6. CONVERSATION CONTROL & STRUCTURE - Component: directional_clarity
 */
function scoreDirectionalClarity(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const structureMarkers = ['first', 'next', 'to summarize', 'let me', 'so'];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, structureMarkers);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'directional_clarity',
    score: round1(score),
    applicable: true,
    weight: 0.33,
    rationale: `${count} structure markers detected`
  };
}

/**
 * 6. CONVERSATION CONTROL & STRUCTURE - Component: adaptive_steering
 */
function scoreAdaptiveSteering(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const steeringPhrases = ['let me', 'let\'s', 'how about', 'what if'];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, steeringPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'adaptive_steering',
    score: round1(score),
    applicable: true,
    weight: 0.33,
    rationale: `${count} steering phrases detected`
  };
}

/**
 * 6. CONVERSATION CONTROL & STRUCTURE - Component: purposeful_closure
 */
function scorePurposefulClosure(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const closurePhrases = ['to summarize', 'in summary', 'so what we\'ve covered', 'to recap'];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, closurePhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'purposeful_closure',
    score: round1(score),
    applicable: true,
    weight: 0.34,
    rationale: `${count} closure phrases detected`
  };
}

/**
 * 7. ADAPTABILITY - Component: situational_responsiveness
 */
function scoreSituationalResponsiveness(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const pivotPhrases = [
    'let\'s take a different approach',
    'given that',
    'in that case',
    'based on that'
  ];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, pivotPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'situational_responsiveness',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} situational pivots detected`
  };
}

/**
 * 7. ADAPTABILITY - Component: approach_adjustment_quality
 */
function scoreApproachAdjustmentQuality(transcript: Transcript): ComponentResult {
  // Proxy: count meaningful adjustments (similar to situational responsiveness)
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const adjustmentPhrases = [
    'let me try',
    'another way',
    'differently',
    'adjust'
  ];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, adjustmentPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'approach_adjustment_quality',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} approach adjustments detected`
  };
}

/**
 * 8. COMMITMENT GAINING - Component: next_step_clarity
 */
function scoreNextStepClarity(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const nextStepPhrases = [
    'would you be open',
    'can we schedule',
    'what would be the next step',
    'next step',
    'follow up'
  ];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, nextStepPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'next_step_clarity',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} next step references`
  };
}

/**
 * 8. COMMITMENT GAINING - Component: customer_ownership
 */
function scoreCustomerOwnership(transcript: Transcript): ComponentResult {
  const repTurns = transcript.filter(t => t.speaker === 'rep');

  const commitmentPhrases = [
    'would you',
    'can you',
    'will you',
    'are you willing'
  ];

  let count = 0;
  repTurns.forEach(turn => {
    count += countOccurrences(turn.text, commitmentPhrases);
  });

  let score: number;
  if (count === 0) score = 1;
  else if (count === 1) score = 3;
  else score = 5;

  return {
    name: 'customer_ownership',
    score: round1(score),
    applicable: true,
    weight: 0.5,
    rationale: `${count} commitment-seeking phrases`
  };
}

// ============================================================================
// METRIC SCORING ORCHESTRATION
// ============================================================================

const COMPONENT_SCORERS: Record<string, (t: Transcript) => ComponentResult> = {
  // Question Quality
  contextual_relevance: scoreContextualRelevance,
  forward_value: scoreForwardValue,

  // Listening & Responsiveness
  accuracy_of_interpretation: scoreAccuracyOfInterpretation,
  responsiveness_of_action: scoreResponsivenessOfAction,

  // Making It Matter
  customer_relevance_alignment: scoreCustomerRelevanceAlignment,
  outcome_translation: scoreOutcomeTranslation,

  // Customer Engagement Cues
  customer_verbal_participation_ratio: scoreCustomerVerbalParticipation,
  responsiveness_to_customer_cues: scoreResponsivenessToCustomerCues,
  momentum_continuity: scoreMomentumContinuity,
  customer_signal_amplification: scoreCustomerSignalAmplification,

  // Objection Navigation
  non_defensive_response: scoreNonDefensiveResponse,
  constructive_engagement: scoreConstructiveEngagement,

  // Conversation Control & Structure
  directional_clarity: scoreDirectionalClarity,
  adaptive_steering: scoreAdaptiveSteering,
  purposeful_closure: scorePurposefulClosure,

  // Adaptability
  situational_responsiveness: scoreSituationalResponsiveness,
  approach_adjustment_quality: scoreApproachAdjustmentQuality,

  // Commitment Gaining
  next_step_clarity: scoreNextStepClarity,
  customer_ownership: scoreCustomerOwnership
};

/**
 * Score a single metric
 */
function scoreMetric(metricId: BehavioralMetricId, transcript: Transcript): MetricResult {
  const spec = METRICS_SPEC.find(m => m.id === metricId);
  if (!spec) {
    throw new Error(`Unknown metric: ${metricId}`);
  }

  const componentResults: ComponentResult[] = spec.components.map(compSpec => {
    const scorer = COMPONENT_SCORERS[compSpec.name];
    if (!scorer) {
      console.warn(`No scorer found for component: ${compSpec.name}`);
      return {
        name: compSpec.name,
        score: null,
        applicable: false,
        weight: compSpec.weight,
        rationale: 'Scorer not implemented'
      };
    }
    return scorer(transcript);
  });

  const overall_score = averageApplicable(componentResults);
  const not_applicable = overall_score === null;

  return {
    id: spec.id,
    metric: spec.metric,
    optional: spec.optional,
    score_formula: spec.score_formula,
    components: componentResults,
    overall_score,
    not_applicable,
    metricsVersion: METRICS_VERSION
  };
}

/**
 * Score all 8 behavioral metrics
 */
export function scoreAllMetrics(transcript: Transcript): MetricResult[] {
  return METRICS_SPEC.map(spec => scoreMetric(spec.id, transcript));
}

/**
 * Score a specific metric by ID
 */
export function scoreMetricById(metricId: BehavioralMetricId, transcript: Transcript): MetricResult {
  return scoreMetric(metricId, transcript);
}
