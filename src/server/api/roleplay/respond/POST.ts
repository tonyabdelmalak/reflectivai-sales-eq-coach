import type { Request, Response } from 'express';
import { getSession, setSession } from '../_shared/sessions.js';
import { getSecret } from '#airo/secrets';
import { deriveInitialState, nextState, toneForState, type HCPState, type ToneDirective } from '../../../../lib/hcp-state-engine.js';
import { selectCuesForState, validateCueStateAlignment } from '../../../../lib/dynamic-cue-manager.js';
import { computeAlignment } from '../../../../lib/alignment-engine.js';

interface RepEvaluation {
  isHostile: boolean;
  increasedDemand: boolean;
  acknowledgedConstraint: boolean;
  metricScores: Record<string, number>;
}

interface AIResponse {
  hcpDialogue: string;
  repEvaluation: RepEvaluation;
}

/**
 * Evaluate rep's message for state transition triggers.
 * DETERMINISTIC RULES - NO ML.
 */
function evaluateRepMessage(message: string, conversationHistory: any[]): RepEvaluation {
  const lowerMsg = message.toLowerCase();
  
  // Hostile language detection (EXPANDED)
  const hostilePatterns = [
    'suck', 'terrible', 'useless', 'waste', 'stupid', 'idiot', 'incompetent',
    'ass', 'asshole', 'mean', 'jerk', 'rude', 'dumb', 'moron', 'fool',
    'pathetic', 'worthless', 'garbage', 'trash', 'crap', 'bullshit',
    'shut up', 'shut the hell', 'go to hell', 'screw you', 'fuck'
  ];
  const isHostile = hostilePatterns.some(p => lowerMsg.includes(p));
  
  // Additional hostility signals
  const hasExcessiveCaps = (message.match(/[A-Z]/g) || []).length / message.length > 0.5;
  const hasMultipleExclamations = (message.match(/!/g) || []).length >= 2;
  const hasAggressiveTone = hasExcessiveCaps || hasMultipleExclamations;
  
  const finalIsHostile = isHostile || hasAggressiveTone;
  
  // Demand increase detection
  const demandPatterns = ['need', 'must', 'have to', 'require', 'urgent', 'immediately', 'now'];
  const increasedDemand = demandPatterns.some(p => lowerMsg.includes(p));
  
  // Constraint acknowledgment detection
  const constraintPatterns = ['understand', 'i see', 'makes sense', 'appreciate', 'thank you', 'got it'];
  const acknowledgedConstraint = constraintPatterns.some(p => lowerMsg.includes(p));
  
  return {
    isHostile: finalIsHostile,
    increasedDemand,
    acknowledgedConstraint,
    metricScores: {} // Populated by scoring engine
  };
}

/**
 * Call GROQ AI to generate HCP dialogue constrained by tone directive.
 * AI generates ONLY dialogue. State and cues are deterministic.
 */
async function generateHCPDialogue(
  repMessage: string,
  conversationHistory: any[],
  scenarioContext: any,
  toneDirective: ToneDirective,
  currentState: HCPState
): Promise<string> {
  const apiKey = getSecret('GROQ_API_KEY') as string;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  // Extract hcpMood from scenarioContext (source of truth)
  const hcpMood = scenarioContext.hcpMood || 'neutral';
  
  const systemPrompt = `You are an HCP (Healthcare Professional) in a pharmaceutical sales roleplay.

SCENARIO CONTEXT:
- HCP: ${scenarioContext.stakeholder || 'Healthcare Professional'}
- Disease State: ${scenarioContext.diseaseState || 'general'}
- Opening Scene: ${scenarioContext.openingScene || 'N/A'}
- HCP Mood: ${hcpMood} (maintain this emotional baseline throughout)

CURRENT HCP STATE: ${currentState}

TONE DIRECTIVE (MUST FOLLOW):
- Max sentences: ${toneDirective.maxSentences}
- Warmth level: ${toneDirective.warmth}
- Boundary setting: ${toneDirective.boundary ? 'YES - assert time/boundary constraint' : 'NO'}
- Tone: ${toneDirective.tone}

RULES:
1. Generate ONLY the HCP's next dialogue (no analysis, no JSON)
2. Stay within ${toneDirective.maxSentences} sentence(s)
3. Match the tone directive exactly
4. Maintain the HCP's baseline mood (${hcpMood}) in your responses
5. If boundary=true, include time pressure or constraint language
6. Natural, realistic medical professional dialogue
7. NO markdown, NO formatting, ONLY dialogue text

Respond with ONLY the HCP's dialogue.`;

  const recentHistory = conversationHistory.slice(-6).map(msg => ({
    role: msg.role === 'user' ? 'Rep' : 'HCP',
    content: msg.content
  }));

  const userPrompt = `CONVERSATION HISTORY:
${recentHistory.map(m => `${m.role}: "${m.content}"`).join('\n')}

REP'S LATEST MESSAGE:
"${repMessage}"

Generate HCP's response following the tone directive.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GROQ API error:', response.status, errorText);
    throw new Error('AI dialogue generation failed');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No AI response received');
  }

  return content.trim();
}

export default async function handler(req: Request, res: Response) {
  try {
    const { message, scenarioContext } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }
    
    const sessionId = req.headers['x-session-id'] as string || 'default';
    const session = getSession(sessionId);
    
    if (!session || !session.active) {
      return res.status(400).json({ error: 'No active session' });
    }
    
    // PHASE 1: Evaluate rep's message (DETERMINISTIC)
    const repEvaluation = evaluateRepMessage(message, session.messages);
    
    // PHASE 2: Determine HCP state transition (DETERMINISTIC)
    const currentState: HCPState = (session.metadata?.hcpState as HCPState) || 'neutral';
    const newState = nextState(currentState, repEvaluation);
    
    console.log(`[ROLEPLAY] State transition: ${currentState} → ${newState}`);
    
    // PHASE 3: Get tone directive for new state (DETERMINISTIC)
    const toneDirective = toneForState(newState);
    
    // PHASE 4: Generate HCP dialogue (AI-DRIVEN, TONE-CONSTRAINED)
    const hcpDialogue = await generateHCPDialogue(
      message,
      session.messages,
      scenarioContext || {},
      toneDirective,
      newState
    );
    
    // PHASE 5: Select cues for state (DETERMINISTIC)
    const turnNumber = session.messages.filter(m => m.role === 'assistant').length + 1;
    const previousCueIds = session.messages
      .filter(m => m.role === 'assistant' && m.metadata?.behavioralCues)
      .flatMap(m => m.metadata.behavioralCues.map((c: any) => c.id));
    
    const cues = selectCuesForState(newState, previousCueIds);
    
    console.log(`[ROLEPLAY] Cue selection: state=${newState}, cues=${cues.map(c => c.id).join(', ')}`);
    
    // PHASE 6: Validate cue-state alignment (GOVERNANCE)
    const validation = validateCueStateAlignment(cues, newState);
    if (!validation.valid) {
      console.error('[ROLEPLAY] CUE VALIDATION FAILED:', validation.errors);
      throw new Error('Cue-state misalignment detected');
    }
    
    // PHASE 7: Compute alignment score (DERIVED METRIC)
    const alignmentScore = computeAlignment({ hcpState: newState, repEvaluation });
    
    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Add HCP response with deterministic metadata
    session.messages.push({
      role: 'assistant',
      content: hcpDialogue,
      timestamp: new Date().toISOString(),
      metadata: {
        hcpState: newState,
        toneDirective,
        behavioralCues: cues,
        repEvaluation,
        alignmentScore,
        turnNumber
      }
    });
    
    // Update session state
    session.metadata = {
      ...session.metadata,
      hcpState: newState,
      turnNumber
    };
    
    setSession(sessionId, session);
    
    console.log('[ROLEPLAY] Deterministic response sent:', {
      state: newState,
      cues: cues.map(c => `${c.id} (${c.category})`),
      alignment: alignmentScore,
      repEvaluation: {
        isHostile: repEvaluation.isHostile,
        increasedDemand: repEvaluation.increasedDemand,
        acknowledgedConstraint: repEvaluation.acknowledgedConstraint
      }
    });
    
    return res.json({
      message: hcpDialogue,
      hcpState: newState,
      behavioralCues: cues,
      repEvaluation,
      alignmentScore,
      toneDirective,
      turnNumber,
      session
    });
  } catch (error) {
    console.error('[ROLEPLAY RESPOND] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process response',
      message: String(error)
    });
  }
}
