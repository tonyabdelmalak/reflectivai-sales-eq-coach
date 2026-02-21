/**
 * Pre-Call Plan Types
 * 
 * Rep-owned preparation tool for HCP conversations.
 * NO EVALUATION - Coaching assistance only.
 */

export interface PreCallPlan {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Optional link to scenario (for context, not evaluation)
  scenarioId?: string;
  scenarioName?: string;
  
  // Editable sections
  callObjective: string;
  keyMessages: string;
  hypotheses: string;
  signalsToListenFor: string;
  questionsToAsk: string;
  potentialObjections: string;
  desiredNextStep: string;
  
  // Metadata
  title?: string; // Optional custom title
  notes?: string; // Additional free-form notes
}

export interface PreCallPlanDraft {
  callObjective?: string;
  keyMessages?: string;
  hypotheses?: string;
  signalsToListenFor?: string;
  questionsToAsk?: string;
  potentialObjections?: string;
  desiredNextStep?: string;
  title?: string;
  notes?: string;
}

export interface PreCallPlanListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  scenarioName?: string;
}

export const PRE_CALL_PLAN_SECTIONS = [
  {
    key: 'callObjective' as const,
    label: 'Call Objective',
    placeholder: 'What do you want to accomplish in this conversation?',
    description: 'Define your primary goal for this HCP interaction.',
  },
  {
    key: 'keyMessages' as const,
    label: 'Key Messages',
    placeholder: 'What are the most important points to communicate?',
    description: 'List the core messages you want to deliver.',
  },
  {
    key: 'hypotheses' as const,
    label: 'Hypotheses',
    placeholder: 'What might matter to this HCP? What are you curious about?',
    description: 'Your educated guesses about what might be relevant or important.',
  },
  {
    key: 'signalsToListenFor' as const,
    label: 'Signals to Listen For',
    placeholder: 'What verbal or non-verbal cues will you pay attention to?',
    description: 'Observable signals that will inform your approach.',
  },
  {
    key: 'questionsToAsk' as const,
    label: 'Questions to Ask',
    placeholder: 'What questions will help you understand their needs?',
    description: 'Prepare thoughtful questions to guide the conversation.',
  },
  {
    key: 'potentialObjections' as const,
    label: 'Potential Objections',
    placeholder: 'What concerns or pushback might you encounter?',
    description: 'Anticipate possible objections and how you might address them.',
  },
  {
    key: 'desiredNextStep' as const,
    label: 'Desired Next Step',
    placeholder: 'What action or commitment are you hoping for?',
    description: 'Define what success looks like and the next step forward.',
  },
] as const;

export type PreCallPlanSectionKey = typeof PRE_CALL_PLAN_SECTIONS[number]['key'];
