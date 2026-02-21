/**
 * Observable Behavioral Cues Detection System
 * Refactored for maintainability, deduplicated triggers, category-safe filtering
 */

export interface BehavioralCue {
  id: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'engagement' | 'resistance' | 'interest' | 'stress';
}

export type ObservableCue = BehavioralCue;

type CueCategory = BehavioralCue['category'];

const NEGATIVE_CATEGORIES: CueCategory[] = ['stress', 'resistance', 'engagement'];
const POSITIVE_CATEGORIES: CueCategory[] = ['interest'];

export const HCP_CUES: Record<string, BehavioralCue> = {
  TIME_PRESSURE: {
    id: 'time-pressure',
    label: 'Time Pressure',
    description: 'Repeated glances at clock or doorway',
    severity: 'high',
    category: 'stress',
  },
  LOW_ENGAGEMENT: {
    id: 'low-engagement',
    label: 'Low Engagement',
    description: 'Short, clipped responses with minimal elaboration',
    severity: 'medium',
    category: 'engagement',
  },
  FRUSTRATION: {
    id: 'frustration',
    label: 'Frustration',
    description: 'Sighing or exhaling audibly before answering',
    severity: 'high',
    category: 'resistance',
  },
  DEFENSIVE: {
    id: 'defensive',
    label: 'Defensive',
    description: 'Arms crossed tightly or shoulders hunched forward',
    severity: 'medium',
    category: 'resistance',
  },
  DISTRACTED: {
    id: 'distracted',
    label: 'Distracted',
    description: 'Multitasking behavior (typing, signing forms, checking phone)',
    severity: 'medium',
    category: 'engagement',
  },
  HESITANT: {
    id: 'hesitant',
    label: 'Hesitant',
    description: 'Delayed responses or long pauses before replying',
    severity: 'low',
    category: 'resistance',
  },
  UNCOMFORTABLE: {
    id: 'uncomfortable',
    label: 'Uncomfortable',
    description: 'Avoidance of eye contact while listening',
    severity: 'medium',
    category: 'resistance',
  },
  IMPATIENT: {
    id: 'impatient',
    label: 'Impatient',
    description: 'Interrupting mid-sentence to redirect or move on',
    severity: 'high',
    category: 'stress',
  },
  DISINTERESTED: {
    id: 'disinterested',
    label: 'Disinterested',
    description: 'Flat or monotone vocal delivery despite neutral words',
    severity: 'medium',
    category: 'engagement',
  },
  WITHDRAWN: {
    id: 'withdrawn',
    label: 'Withdrawn',
    description: 'Physically turning body away (chair angled, half-standing posture)',
    severity: 'high',
    category: 'engagement',
  },
  INTEREST: {
    id: 'interest',
    label: 'Interest',
    description: 'Leaning forward, asking follow-up questions',
    severity: 'medium',
    category: 'interest',
  },
  AGREEMENT: {
    id: 'agreement',
    label: 'Agreement',
    description: 'Nodding, verbal affirmations, acknowledging points',
    severity: 'medium',
    category: 'interest',
  },
  CURIOSITY: {
    id: 'curiosity',
    label: 'Curiosity',
    description: 'Asking clarifying questions, seeking more information',
    severity: 'low',
    category: 'interest',
  },
  ENTHUSIASM: {
    id: 'enthusiasm',
    label: 'Enthusiasm',
    description: 'Animated gestures, excited tone, positive energy',
    severity: 'high',
    category: 'interest',
  },
  OPENNESS: {
    id: 'openness',
    label: 'Openness',
    description: 'Receptive body language, willing to explore ideas',
    severity: 'medium',
    category: 'interest',
  },
  VALIDATION: {
    id: 'validation',
    label: 'Validation',
    description: 'Acknowledging relevance to their situation',
    severity: 'medium',
    category: 'interest',
  },
  FORWARD_MOMENTUM: {
    id: 'forward-momentum',
    label: 'Forward Momentum',
    description: 'Discussing next steps, future actions, follow-up',
    severity: 'high',
    category: 'interest',
  },
  TRUST_BUILDING: {
    id: 'trust-building',
    label: 'Trust Building',
    description: 'Sharing concerns openly, expressing appreciation',
    severity: 'medium',
    category: 'interest',
  },
  THINKING: {
    id: 'thinking',
    label: 'Thinking',
    description: 'Pausing to process information, considering options',
    severity: 'low',
    category: 'engagement',
  },
  CLARIFYING: {
    id: 'clarifying',
    label: 'Clarifying',
    description: 'Asking for clarification or more details',
    severity: 'low',
    category: 'engagement',
  },
  PROCESSING: {
    id: 'processing',
    label: 'Processing',
    description: 'Brief acknowledgments while absorbing information',
    severity: 'low',
    category: 'engagement',
  },
  COMPARING: {
    id: 'comparing',
    label: 'Comparing',
    description: 'Evaluating against alternatives or current solutions',
    severity: 'low',
    category: 'engagement',
  },
};

const TRIGGERS: Record<string, string[]> = {
  TIME_PRESSURE: [
    'busy','hurry','clock','late','rushed',"don't have time",'no time',
    'running late','in a rush','need to go','have to go','short on time',
    'pressed for time','time is limited','only have a minute',"can't stay long",
    'another appointment','patients waiting'
  ],
  LOW_ENGAGEMENT: ['okay','fine','sure','whatever'],
  FRUSTRATION: ['sigh','exhale','frustrated','annoyed'],
  DEFENSIVE: [
    'already','know that','aware','defensive','tried that','tried before',
    "didn't work",'not convinced','skeptical','doubt','not sure about',
    'heard that before','similar products','past experience',"doesn't apply",
    'not applicable','different situation','not the same'
  ],
  DISTRACTED: ['typing','phone','multitask','distract'],
  HESITANT: ['um','uh','well','pause','hesitat'],
  UNCOMFORTABLE: ['uncomfortable','awkward','eye contact'],
  IMPATIENT: ['interrupt','wait','impatient','move on'],
  DISINTERESTED: [
    'monotone','flat','disinterest','bored','not interested',
    'not really interested',"don't think",'not sure','maybe later',
    'not right now','not at this time','happy with current',
    'satisfied with','send information','leave materials',
    'not a priority','other concerns','stick with what','look it over'
  ],
  WITHDRAWN: ['turn','away','withdraw','distance'],
  INTEREST: [
    'tell me more',"that's interesting",'interesting','curious about',
    'want to hear more','intrigued','fascinating',"i'd like to know",
    'more about','sounds interesting','caught my attention',
    'piqued my interest','want to learn','keen to','eager to','looking forward'
  ],
  AGREEMENT: [
    'that makes sense','i see your point','good point','i agree',"you're right",
    'exactly','absolutely','i can see that',"that's true",'fair point',
    'makes sense','i understand','that resonates',"i'm with you",
    'i follow','that tracks','i buy that','sounds right'
  ],
  CURIOSITY: [
    'can you explain','help me understand','how does that work',
    'what about','why is that','how come','what if',
    'could you elaborate','more details','walk me through'
  ],
  ENTHUSIASM: [
    'exciting','impressive','excellent','fantastic','wonderful',
    'amazing','great','i love','i like that',"that's great",
    'really like','sounds great','perfect','brilliant',
    'outstanding','terrific','superb'
  ],
  OPENNESS: [
    "i'm open to",'willing to consider','worth exploring',
    "let's explore",'open to trying','receptive to',
    'interested in','would consider','open minded',
    'flexible','willing to try','give it a shot','see how it goes'
  ],
  VALIDATION: [
    'that aligns','that addresses','that could help','that fits',
    'relevant to','applies to','that matches','that speaks to',
    'that relates','that connects',"that's relevant",
    'pertinent','applicable','that works for','suits our needs'
  ],
  FORWARD_MOMENTUM: [
    'next step',"what's next",'moving forward',"let's schedule",
    'when can we','follow up','next time','going forward',
    'in the future','down the road','next meeting',
    'send me',"i'll review","let's continue",
    'keep talking','stay in touch','circle back'
  ],
  TRUST_BUILDING: [
    'i appreciate','thank you','thanks','helpful','useful',
    'i trust','candidly','honestly','to be frank',
    'appreciate your','grateful','value your',
    'respect your','confidence in'
  ],
  THINKING: [
    'let me think','hmm','interesting point','give me a moment',
    'let me consider','thinking about','pondering',
    'mulling over','weighing','reflecting on'
  ],
  CLARIFYING: [
    'can you clarify','what do you mean by','could you explain',
    'be more specific','what exactly','to clarify',
    'just to be clear',"so you're saying",
    'in other words','help me understand','what does that mean'
  ],
  PROCESSING: [
    'i see','okay','alright','got it','understood',
    'noted','right','sure','yes','mm-hmm','uh-huh'
  ],
  COMPARING: [
    'how does this compare','versus','compared to',
    "what's the difference",'pros and cons',
    'advantages','disadvantages','better than',
    'worse than','similar to','different from',
    'in contrast','on the other hand'
  ],
};

function containsAny(text: string, phrases: string[]): boolean {
  return phrases.some(p => text.includes(p));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function detectObservableCues(message: string, hcpMood?: string): BehavioralCue[] {
  const lower = message.toLowerCase();
  const mood = hcpMood?.toLowerCase() ?? '';
  const count = wordCount(message);
  const detected = new Map<string, BehavioralCue>();

  Object.entries(TRIGGERS).forEach(([key, phrases]) => {
    if (containsAny(lower, phrases)) {
      const cue = HCP_CUES[key];
      if (cue) {
        if (key === 'LOW_ENGAGEMENT') {
          if (count < 5) detected.set(cue.id, cue);
        } else if (key === 'PROCESSING') {
          if (count < 10) detected.set(cue.id, cue);
        } else {
          detected.set(cue.id, cue);
        }
      }
    }
  });

  if (lower.includes('?') && count > 5) {
    detected.set(HCP_CUES.CURIOSITY.id, HCP_CUES.CURIOSITY);
  }

  const negativeMood = ['frustrated','overwhelmed','stressed','rushed','impatient','annoyed','defensive','skeptical','dismissive','disinterested','withdrawn','uncomfortable','hesitant','distracted'];
  const positiveMood = ['enthusiastic','excited','interested','curious','engaged','open','receptive','agreeable','collaborative','supportive'];

  const hasNegMood = negativeMood.some(k => mood.includes(k));
  const hasPosMood = positiveMood.some(k => mood.includes(k));

  let results = Array.from(detected.values());

  if (hasNegMood && !hasPosMood) {
    results = results.filter(c => !POSITIVE_CATEGORIES.includes(c.category));
  }

  if (hasPosMood && !hasNegMood) {
    results = results.filter(c => !NEGATIVE_CATEGORIES.includes(c.category));
  }

  return results;
}

export interface RepMetricCue {
  id: string;
  label: string;
  description: string;
  category: 'question' | 'listening' | 'value' | 'engagement' | 'objection' | 'control' | 'commitment' | 'adaptability';
}

export const REP_METRIC_CUES: Record<string, RepMetricCue> = {
  QUESTION_QUALITY: {
    id: 'question-quality',
    label: 'Question Quality',
    description: 'Open-ended, relevant questions that uncover needs',
    category: 'question',
  },
  LISTENING_RESPONSIVENESS: {
    id: 'listening-responsiveness',
    label: 'Listening & Responsiveness',
    description: 'Paraphrasing, acknowledging, and adjusting based on HCP input',
    category: 'listening',
  },
  MAKING_IT_MATTER: {
    id: 'making-it-matter',
    label: 'Making It Matter',
    description: 'Connecting to patient outcomes and HCP priorities',
    category: 'value',
  },
  CUSTOMER_ENGAGEMENT: {
    id: 'customer-engagement',
    label: 'Customer Engagement',
    description: 'Encouraging dialogue and forward-looking conversation',
    category: 'engagement',
  },
  OBJECTION_NAVIGATION: {
    id: 'objection-navigation',
    label: 'Objection Navigation',
    description: 'Recognizing, reframing, and resolving concerns',
    category: 'objection',
  },
  CONVERSATION_CONTROL: {
    id: 'conversation-control',
    label: 'Conversation Control',
    description: 'Setting purpose, managing topics, respecting time',
    category: 'control',
  },
  COMMITMENT_GAINING: {
    id: 'commitment-gaining',
    label: 'Commitment Gaining',
    description: 'Proposing clear next steps with mutual agreement',
    category: 'commitment',
  },
  ADAPTABILITY: {
    id: 'adaptability',
    label: 'Adaptability',
    description: 'Adjusting approach based on HCP cues and context',
    category: 'adaptability',
  },
};

export function detectRepMetrics(message: string, previousHcpMessage?: string): RepMetricCue[] {
  const lower = message.toLowerCase();
  const count = wordCount(message);
  const detected: RepMetricCue[] = [];

  const openQ = containsAny(lower, ['how','what','why','tell me','describe','explain','walk me through','help me understand','could you share','what are your thoughts']);
  if (openQ && message.includes('?') && count > 5) {
    detected.push(REP_METRIC_CUES.QUESTION_QUALITY);
  }

  if (
    containsAny(lower, ['i hear','i understand','you mentioned','you said','sounds like','it seems','so what you','let me make sure',"if i'm hearing you correctly",'to summarize what you','i appreciate you sharing','that makes sense','i can see why'])
    && count > 8
  ) {
    detected.push(REP_METRIC_CUES.LISTENING_RESPONSIVENESS);
  }

  if (
    containsAny(lower, ['patient','outcome','result','benefit','improve','help','impact','practice','clinical','efficacy','quality of life','treatment goals','care','therapy'])
    && count > 10
  ) {
    detected.push(REP_METRIC_CUES.MAKING_IT_MATTER);
  }

  if (previousHcpMessage) {
    const prev = previousHcpMessage.toLowerCase();

    if (
      containsAny(prev, ['but','concern','worry','not sure']) &&
      containsAny(lower, ['concern','understand your','valid point','appreciate','however','on the other hand','perspective'])
    ) {
      detected.push(REP_METRIC_CUES.OBJECTION_NAVIGATION);
    }

    if (
      containsAny(prev, ['busy','time','quick']) &&
      containsAny(lower, ['briefly','quick','short','respect your time'])
    ) {
      detected.push(REP_METRIC_CUES.ADAPTABILITY);
    }
  }

  if (containsAny(lower, ['let me',"i'd like to",'to keep','briefly','moving to','next','before we']) && count > 6) {
    detected.push(REP_METRIC_CUES.CONVERSATION_CONTROL);
  }

  if (containsAny(lower, ['next step','follow up','schedule','send you','would you','can we','shall we']) && count > 5) {
    detected.push(REP_METRIC_CUES.COMMITMENT_GAINING);
  }

  return detected.slice(0, 3);
}

export function generateCueDescription(cues: BehavioralCue[]): string {
  if (!cues.length) return '';

  const grouped: Record<CueCategory, BehavioralCue[]> = {
    stress: [],
    resistance: [],
    engagement: [],
    interest: [],
  };

  cues.forEach(c => grouped[c.category].push(c));
  const parts: string[] = [];

  if (grouped.stress.some(c => c.id === 'time-pressure')) {
    parts.push('The HCP glances at the clock repeatedly and shifts in their chair');
  }
  if (grouped.stress.some(c => c.id === 'impatient')) {
    parts.push('they interrupt mid-sentence, clearly wanting to move forward');
  }
  if (grouped.resistance.some(c => c.id === 'frustration')) {
    parts.push('A visible sigh escapes before they respond');
  }
  if (grouped.resistance.some(c => c.id === 'defensive')) {
    parts.push('their arms cross tightly across their chest');
  }
  if (grouped.resistance.some(c => c.id === 'uncomfortable')) {
    parts.push('they avoid direct eye contact');
  }
  if (grouped.resistance.some(c => c.id === 'hesitant')) {
    parts.push("there's a long pause before they answer");
  }
  if (grouped.engagement.some(c => c.id === 'low-engagement')) {
    parts.push('Their responses are clipped and minimal');
  }
  if (grouped.engagement.some(c => c.id === 'distracted')) {
    parts.push('they continue typing on their computer while talking');
  }
  if (grouped.engagement.some(c => c.id === 'disinterested')) {
    parts.push('their tone is flat and monotone despite neutral words');
  }
  if (grouped.engagement.some(c => c.id === 'withdrawn')) {
    parts.push('they angle their body slightly away from you');
  }

  if (!parts.length) return '';
  if (parts.length === 1) return parts[0] + '.';

  const last = parts.pop();
  return parts.join(', ') + ', and ' + last + '.';
}

export function generateRepFeedback(metrics: RepMetricCue[], hcpCues: BehavioralCue[]): string {
  if (!metrics.length) return '';
  const feedback: string[] = [];

  metrics.forEach(m => {
    switch (m.id) {
      case 'question-quality':
        feedback.push('✓ Asked an open-ended question to uncover needs');
        break;
      case 'listening-responsiveness':
        feedback.push('✓ Demonstrated active listening and acknowledgment');
        break;
      case 'making-it-matter':
        feedback.push('✓ Connected to patient outcomes and clinical value');
        break;
      case 'customer-engagement':
        feedback.push('✓ Encouraged dialogue and forward momentum');
        break;
      case 'objection-navigation':
        feedback.push('✓ Addressed concerns with empathy and reframing');
        break;
      case 'conversation-control':
        feedback.push('✓ Managed conversation flow and respected time');
        break;
      case 'commitment-gaining':
        feedback.push('✓ Proposed clear next steps');
        break;
      case 'adaptability':
        feedback.push('✓ Adapted approach based on HCP cues');
        break;
    }
  });

  const hasTimePressure = hcpCues.some(c => c.id === 'time-pressure');
  const hasResistance = hcpCues.some(c => c.category === 'resistance');
  const hasLowEngagement = hcpCues.some(c => c.category === 'engagement' && c.severity !== 'low');

  if (hasTimePressure && !metrics.some(m => m.id === 'adaptability')) {
    feedback.push('→ Consider acknowledging time constraints explicitly');
  }

  if (hasResistance && !metrics.some(m => m.id === 'objection-navigation')) {
    feedback.push("→ Address the HCP's concerns or hesitation directly");
  }

  if (hasLowEngagement && !metrics.some(m => m.id === 'customer-engagement')) {
    feedback.push('→ Try an engaging question to re-energize the conversation');
  }

  return feedback.join('\n');
}
