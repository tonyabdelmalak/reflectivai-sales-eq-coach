import type { Request, Response } from 'express';
import { setSession } from '../_shared/sessions.js';

/**
 * Derive initial HCP state from hcpMood (PRIMARY SOURCE)
 * Falls back to description/tags if hcpMood not provided
 */
function deriveInitialStateFromMood(hcpMood?: string): string {
  if (!hcpMood) return 'neutral';
  
  const mood = hcpMood.toLowerCase();
  
  // Negative moods → irritated
  if (mood.includes('frustrated') || mood.includes('annoyed') || mood.includes('irritated')) {
    return 'irritated';
  }
  
  // Overwhelmed/stressed → busy
  if (mood.includes('overwhelmed') || mood.includes('stressed') || mood.includes('rushed') || 
      mood.includes('time-pressured') || mood.includes('short-staffed') || mood.includes('burdened')) {
    return 'busy';
  }
  
  // Skeptical/defensive → resistant
  if (mood.includes('skeptical') || mood.includes('defensive') || mood.includes('dismissive')) {
    return 'resistant';
  }
  
  // Positive moods → engaged
  if (mood.includes('curious') || mood.includes('interested') || mood.includes('eager') || 
      mood.includes('enthusiastic') || mood.includes('excited')) {
    return 'engaged';
  }
  
  // Analytical/data-driven → neutral
  if (mood.includes('data-driven') || mood.includes('analytical')) {
    return 'neutral';
  }
  
  return 'neutral';
}

/**
 * FALLBACK: Derive initial state from scenario description/tags
 * Only used if hcpMood is not provided
 */
function deriveInitialStateFromScene(scenarioDescription: string, scenarioTags?: string[]): string {
  const desc = scenarioDescription.toLowerCase();
  const tags = (scenarioTags || []).map(t => t.toLowerCase());
  
  if (tags.includes('overwhelmed') || tags.includes('short-staffed') || tags.includes('rushed') || tags.includes('burdened') ||
      desc.includes('overwhelmed') || desc.includes('short-staffed') || desc.includes('rushed') || desc.includes('burdened')) {
    return 'busy';
  }
  
  if (tags.includes('frustrated') || desc.includes('frustrated')) {
    return 'irritated';
  }
  
  if (tags.includes('analytical') && !tags.includes('frustrated') && !tags.includes('overwhelmed')) {
    return 'neutral';
  }
  
  return 'busy';
}

/**
 * Generate generic Turn 0 dialogue (FALLBACK)
 * Only used if openingScene is not provided
 */
function generateTurn0Dialogue(state: string, scenarioContext: any): string {
  switch (state) {
    case 'busy':
      return "I only have a few minutes. What is this about?";
    case 'irritated':
      return "I'm very busy right now.";
    case 'neutral':
      return "Yes, what can I help you with?";
    case 'engaged':
      return "I'm interested to hear what you have to share.";
    default:
      return "I only have a few minutes. What is this about?";
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    const { 
      scenarioId, 
      scenarioTitle, 
      scenarioDescription, 
      scenarioTags,
      hcpMood,           // ← NEW: Source of truth for HCP emotional state
      openingScene,      // ← NEW: Source of truth for Turn 0 dialogue
      scenarioContext 
    } = req.body;
    
    if (!scenarioId) {
      return res.status(400).json({ error: 'scenarioId is required' });
    }
    
    const sessionId = req.headers['x-session-id'] as string || 'default';
    
    // PRIORITY 1: Use hcpMood if provided (SOURCE OF TRUTH)
    // FALLBACK: Derive from description/tags
    const initialState = hcpMood 
      ? deriveInitialStateFromMood(hcpMood)
      : deriveInitialStateFromScene(scenarioDescription || '', scenarioTags);
    
    // PRIORITY 1: Use openingScene if provided (SOURCE OF TRUTH)
    // FALLBACK: Generate generic dialogue
    const turn0Dialogue = openingScene || generateTurn0Dialogue(initialState, scenarioContext);
    
    console.log('[ROLEPLAY START] Using hcpMood:', hcpMood || 'not provided (fallback)');
    console.log('[ROLEPLAY START] Initial state:', initialState);
    console.log('[ROLEPLAY START] Using openingScene:', openingScene ? 'YES (from scenario)' : 'NO (generated)');
    
    // Create new session
    const session = {
      active: true,
      scenarioId,
      scenario: {
        id: scenarioId,
        title: scenarioTitle || 'Role-Play Session',
        description: scenarioDescription || ''
      },
      messages: [
        {
          role: 'assistant',
          content: turn0Dialogue,
          timestamp: new Date().toISOString(),
          metadata: {
            hcpState: initialState,
            turnNumber: 0,
            lockedState: initialState
          }
        }
      ],
      metadata: {
        hcpState: initialState,
        hcpMood: hcpMood || null,        // ← Store for use in respond endpoint
        openingScene: openingScene || null,
        turnNumber: 0,
        lockedState: initialState,
        stateDominant: false
      },
      startedAt: new Date().toISOString()
    };
    
    setSession(sessionId, session);
    
    console.log('[ROLEPLAY START] Session created:', sessionId);
    console.log('[ROLEPLAY START] Session data:', { 
      active: session.active, 
      messageCount: session.messages.length,
      hcpMood: session.metadata.hcpMood,
      initialState: session.metadata.hcpState
    });
    
    // Verify session was stored
    const { getSession } = await import('../_shared/sessions.js');
    const storedSession = getSession(sessionId);
    console.log('[ROLEPLAY START] Verification - session stored:', !!storedSession);
    
    return res.json(session);
  } catch (error) {
    console.error('[ROLEPLAY START] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to start session',
      message: String(error)
    });
  }
}
