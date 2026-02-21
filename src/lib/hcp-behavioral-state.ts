/**
 * HCP Behavioral State System
 * Generates rich behavioral descriptions for HCP responses including:
 * - Body language (posture, gestures, eye contact)
 * - Vocal tone and speech patterns
 * - Physical cues (facial expressions, movements)
 * - Emotional state indicators
 */

import { BehavioralCue } from './observable-cues';

export interface HCPBehavioralState {
  emotionalState: 'engaged' | 'neutral' | 'resistant' | 'stressed' | 'interested';
  energyLevel: 'high' | 'medium' | 'low';
  openness: 'open' | 'guarded' | 'closed';
  timeAwareness: 'relaxed' | 'aware' | 'pressured';
}

export interface HCPBehavioralDescription {
  bodyLanguage: string[];
  vocalTone: string[];
  physicalCues: string[];
  overallDescription: string;
}

/**
 * Generate behavioral descriptions based on detected cues
 */
export function generateHCPBehavioralDescription(
  cues: BehavioralCue[],
  messageContent: string
): HCPBehavioralDescription {
  const bodyLanguage: string[] = [];
  const vocalTone: string[] = [];
  const physicalCues: string[] = [];

  // Map cues to behavioral descriptions
  cues.forEach((cue) => {
    switch (cue.id) {
      case 'time-pressure':
        bodyLanguage.push('Glancing repeatedly at the clock on the wall');
        bodyLanguage.push('Shifting weight from foot to foot');
        physicalCues.push('Quick, darting eye movements toward the door');
        vocalTone.push('Speaking more rapidly than usual');
        break;

      case 'low-engagement':
        bodyLanguage.push('Minimal eye contact, gaze drifting to computer screen');
        bodyLanguage.push('Slouched posture with arms resting loosely');
        vocalTone.push('Monotone delivery with little inflection');
        physicalCues.push('Nodding mechanically without genuine acknowledgment');
        break;

      case 'frustration':
        physicalCues.push('Audible sigh before responding');
        bodyLanguage.push('Pinching bridge of nose briefly');
        physicalCues.push('Jaw tightening slightly');
        vocalTone.push('Clipped, terse responses');
        break;

      case 'defensive':
        bodyLanguage.push('Arms crossed tightly across chest');
        bodyLanguage.push('Shoulders hunched forward protectively');
        bodyLanguage.push('Leaning back in chair, creating distance');
        vocalTone.push('Slightly elevated pitch when responding');
        break;

      case 'distracted':
        physicalCues.push('Typing on keyboard while listening');
        bodyLanguage.push('Eyes scanning documents on desk');
        physicalCues.push('Reaching for phone intermittently');
        vocalTone.push('Delayed responses, as if processing other tasks');
        break;

      case 'hesitant':
        vocalTone.push('Long pauses before answering');
        vocalTone.push('Frequent "um" and "uh" fillers');
        physicalCues.push('Rubbing back of neck uncertainly');
        bodyLanguage.push('Avoiding direct eye contact');
        break;

      case 'uncomfortable':
        bodyLanguage.push('Shifting in seat frequently');
        physicalCues.push('Breaking eye contact and looking down');
        bodyLanguage.push('Fidgeting with pen or papers');
        vocalTone.push('Voice slightly quieter than normal');
        break;

      case 'impatient':
        physicalCues.push('Interrupting mid-sentence');
        bodyLanguage.push('Tapping fingers on desk rhythmically');
        vocalTone.push('Speaking over your words to redirect');
        physicalCues.push('Checking watch conspicuously');
        break;

      case 'disinterested':
        vocalTone.push('Flat, emotionless vocal delivery');
        bodyLanguage.push('Minimal facial expressions');
        physicalCues.push('Staring blankly without engagement');
        bodyLanguage.push('Body angled away from conversation');
        break;

      case 'withdrawn':
        bodyLanguage.push('Chair angled toward the door');
        bodyLanguage.push('Half-standing posture, ready to leave');
        bodyLanguage.push('Physically turning body away');
        physicalCues.push('Creating physical distance');
        break;
    }
  });

  // Generate overall description (pass messageContent for varied positive descriptions)
  const overallDescription = generateOverallDescription(cues, bodyLanguage, vocalTone, physicalCues, messageContent);

  return {
    bodyLanguage: deduplicateDescriptions(bodyLanguage),
    vocalTone: deduplicateDescriptions(vocalTone),
    physicalCues: deduplicateDescriptions(physicalCues),
    overallDescription,
  };
}

/**
 * Generate varied positive behavioral descriptions for empty cues
 * Uses message content to create contextually appropriate descriptions
 */
function generatePositiveDescription(messageContent: string): string {
  const lowerContent = messageContent.toLowerCase();
  
  // Question-based responses
  if (lowerContent.includes('?')) {
    const positiveQuestionDescriptions = [
      'The HCP leans forward slightly, showing genuine curiosity with raised eyebrows and an inquisitive expression.',
      'The HCP maintains steady eye contact, their tone warm and inviting as they seek to understand more.',
      'The HCP tilts their head thoughtfully, demonstrating active listening and interest in your response.',
      'The HCP nods encouragingly, their open posture and attentive gaze signaling genuine engagement.',
    ];
    return positiveQuestionDescriptions[Math.floor(Math.random() * positiveQuestionDescriptions.length)];
  }
  
  // Acknowledgment responses ("I see", "okay", "yes", "sure")
  if (/\b(i see|okay|yes|sure|understood|got it|makes sense)\b/i.test(lowerContent)) {
    const acknowledgmentDescriptions = [
      'The HCP nods affirmatively, their relaxed posture and calm demeanor showing they are following along comfortably.',
      'The HCP maintains a composed and attentive presence, their body language open and receptive.',
      'The HCP responds with a slight smile, their steady gaze and upright posture conveying confidence and engagement.',
      'The HCP appears at ease, their natural gestures and warm tone creating a comfortable atmosphere.',
    ];
    return acknowledgmentDescriptions[Math.floor(Math.random() * acknowledgmentDescriptions.length)];
  }
  
  // Positive sentiment keywords
  if (/\b(great|good|excellent|wonderful|perfect|love|excited|interested|appreciate)\b/i.test(lowerContent)) {
    const enthusiasticDescriptions = [
      'The HCP\'s face brightens noticeably, their animated gestures and energetic tone reflecting genuine enthusiasm.',
      'The HCP leans in with visible interest, their eyes lighting up as they engage more deeply in the conversation.',
      'The HCP smiles warmly, their open body language and positive vocal inflection showing authentic engagement.',
      'The HCP responds with increased energy, their expressive gestures and upbeat tone signaling strong interest.',
    ];
    return enthusiasticDescriptions[Math.floor(Math.random() * enthusiasticDescriptions.length)];
  }
  
  // Thoughtful/reflective responses
  if (/\b(think|consider|perhaps|maybe|interesting|hmm)\b/i.test(lowerContent)) {
    const thoughtfulDescriptions = [
      'The HCP pauses thoughtfully, their contemplative expression and measured tone showing careful consideration.',
      'The HCP appears reflective, maintaining eye contact while processing the information with visible interest.',
      'The HCP takes a moment to consider, their focused attention and calm demeanor indicating genuine engagement.',
      'The HCP responds with a thoughtful nod, their deliberate pace and attentive posture showing active processing.',
    ];
    return thoughtfulDescriptions[Math.floor(Math.random() * thoughtfulDescriptions.length)];
  }
  
  // Default positive descriptions (varied)
  const defaultPositiveDescriptions = [
    'The HCP appears engaged and receptive, maintaining positive eye contact and open body language.',
    'The HCP demonstrates active listening, their attentive posture and responsive facial expressions showing genuine interest.',
    'The HCP maintains a professional yet warm presence, their body language open and inviting continued dialogue.',
    'The HCP responds naturally, their comfortable demeanor and steady engagement creating a positive interaction.',
    'The HCP shows authentic engagement, their expressive gestures and warm tone fostering a collaborative atmosphere.',
  ];
  return defaultPositiveDescriptions[Math.floor(Math.random() * defaultPositiveDescriptions.length)];
}

/**
 * Generate a cohesive overall description from individual cues
 * 
 * 🚨 CRITICAL: Empty cues = positive/neutral message (sentiment detection filtered out negative cues)
 * Show varied, contextually appropriate positive behavioral descriptions
 */
function generateOverallDescription(
  cues: BehavioralCue[],
  bodyLanguage: string[],
  vocalTone: string[],
  physicalCues: string[],
  messageContent: string
): string {
  // 🚨 Empty cues means sentiment was positive/neutral - generate varied positive description
  if (cues.length === 0) {
    return generatePositiveDescription(messageContent);
  }

  const highSeverityCues = cues.filter((c) => c.severity === 'high');
  const categories = [...new Set(cues.map((c) => c.category))];

  // Build description based on dominant patterns
  if (highSeverityCues.length >= 2) {
    if (categories.includes('stress')) {
      return 'Visibly stressed and time-pressured. Urgency evident in body language and vocal tone. Attention divided, eager to conclude.';
    }
    if (categories.includes('resistance')) {
      return 'Strong resistance signals. Defensive body language, dismissive vocal patterns. Guarded and skeptical.';
    }
  }

  if (categories.includes('engagement') && cues.every((c) => c.category === 'engagement')) {
    return 'Low engagement. Minimal participation, disinterest or distraction evident.';
  }

  if (categories.length >= 3) {
    return 'Mixed signals: stress, resistance, and disengagement. Challenging conversation with multiple barriers.';
  }

  // Default to specific description with proper grammar
  const primaryCue = cues[0];
  const cueLabel = primaryCue.label.toLowerCase();
  
  // Convert adjectives to nouns for grammatical correctness
  const labelToNoun: Record<string, string> = {
    'impatient': 'impatience',
    'frustrated': 'frustration',
    'defensive': 'defensiveness',
    'distracted': 'distraction',
    'hesitant': 'hesitation',
    'uncomfortable': 'discomfort',
    'disinterested': 'disinterest',
    'withdrawn': 'withdrawal',
    'time pressure': 'time pressure',
    'low engagement': 'low engagement'
  };
  
  // Return the full cue description as plain text (no badges, no emojis, no bullets)
  return primaryCue.description;
}

/**
 * Remove duplicate descriptions
 */
function deduplicateDescriptions(descriptions: string[]): string[] {
  return [...new Set(descriptions)];
}

/**
 * Determine HCP behavioral state from detected cues
 */
export function determineHCPState(cues: BehavioralCue[]): HCPBehavioralState {
  const categories = cues.map((c) => c.category);
  const severities = cues.map((c) => c.severity);

  // Determine emotional state
  let emotionalState: HCPBehavioralState['emotionalState'] = 'neutral';
  if (categories.includes('stress')) {
    emotionalState = 'stressed';
  } else if (categories.includes('resistance')) {
    emotionalState = 'resistant';
  } else if (categories.includes('interest')) {
    emotionalState = 'interested';
  } else if (categories.includes('engagement') && cues.length > 0) {
    emotionalState = 'engaged';
  }

  // Determine energy level
  let energyLevel: HCPBehavioralState['energyLevel'] = 'medium';
  if (severities.filter((s) => s === 'high').length >= 2) {
    energyLevel = 'low'; // High severity cues indicate low energy/engagement
  } else if (cues.length === 0) {
    energyLevel = 'high';
  }

  // Determine openness
  let openness: HCPBehavioralState['openness'] = 'open';
  if (categories.includes('resistance')) {
    openness = cues.filter((c) => c.category === 'resistance').length >= 2 ? 'closed' : 'guarded';
  }

  // Determine time awareness
  let timeAwareness: HCPBehavioralState['timeAwareness'] = 'relaxed';
  if (cues.some((c) => c.id === 'time-pressure' || c.id === 'impatient')) {
    timeAwareness = 'pressured';
  } else if (cues.some((c) => c.id === 'distracted')) {
    timeAwareness = 'aware';
  }

  return {
    emotionalState,
    energyLevel,
    openness,
    timeAwareness,
  };
}

/**
 * Format behavioral description for UI display
 */
export function formatBehavioralDescriptionForUI(description: HCPBehavioralDescription): string {
  const parts: string[] = [];

  if (description.bodyLanguage.length > 0) {
    parts.push(`**Body Language:** ${description.bodyLanguage.slice(0, 2).join('; ')}`);
  }

  if (description.vocalTone.length > 0) {
    parts.push(`**Vocal Tone:** ${description.vocalTone.slice(0, 2).join('; ')}`);
  }

  if (description.physicalCues.length > 0) {
    parts.push(`**Physical Cues:** ${description.physicalCues.slice(0, 2).join('; ')}`);
  }

  return parts.join('\n\n');
}
