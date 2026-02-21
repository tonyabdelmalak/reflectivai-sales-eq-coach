import type { Request, Response } from 'express';
import { getSession, setSession } from '../_shared/sessions.js';

// Simple scoring function (replace with actual scoring logic)
function scoreConversation(messages: any[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const messageCount = userMessages.length;
  
  // Generate basic scores (3-5 range)
  const baseScore = Math.min(5, 3 + (messageCount * 0.2));
  
  return {
    metricResults: [
      {
        id: 'question_quality',
        name: 'Question Quality',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      },
      {
        id: 'listening_responsiveness',
        name: 'Listening & Responsiveness',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      },
      {
        id: 'making_it_matter',
        name: 'Making It Matter',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      },
      {
        id: 'customer_engagement_signals',
        name: 'Customer Engagement Monitoring',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      },
      {
        id: 'conversation_control_structure',
        name: 'Conversation Management',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      },
      {
        id: 'adaptability',
        name: 'Adaptive Response',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      },
      {
        id: 'commitment_gaining',
        name: 'Commitment Generation',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      },
      {
        id: 'objection_navigation',
        name: 'Objection Navigation',
        overall_score: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
        not_applicable: false
      }
    ],
    coach: {
      topStrengths: [
        'Maintained professional communication throughout',
        'Asked relevant questions',
        'Demonstrated active listening'
      ],
      priorityImprovements: [
        'Consider asking more probing questions',
        'Build stronger rapport before presenting solutions',
        'Address objections more directly'
      ],
      nextSteps: [
        'Practice handling objections with confidence',
        'Work on building trust earlier in conversations',
        'Focus on understanding customer needs before proposing solutions'
      ],
      overallSummary: `Good session with ${messageCount} exchanges. You demonstrated solid fundamentals. Focus on deepening customer engagement and addressing concerns more proactively.`
    }
  };
}

export default async function handler(req: Request, res: Response) {
  try {
    const sessionId = req.headers['x-session-id'] as string || 'default';
    console.log('[ROLEPLAY END] Looking for session:', sessionId);
    
    const session = getSession(sessionId);
    console.log('[ROLEPLAY END] Session found:', !!session);
    console.log('[ROLEPLAY END] Session data:', session ? { active: session.active, messageCount: session.messages?.length } : 'null');
    
    if (!session) {
      console.error('[ROLEPLAY END] ERROR: No session found for ID:', sessionId);
      return res.status(400).json({ error: 'No session found', sessionId });
    }
    
    // Mark session as inactive
    session.active = false;
    session.endedAt = new Date().toISOString();
    
    // Score the conversation
    const scores = scoreConversation(session.messages);
    
    const result = {
      ...session,
      ...scores
    };
    
    setSession(sessionId, result);
    
    console.log('[ROLEPLAY END] Session ended:', sessionId, 'Messages:', session.messages.length);
    
    return res.json(result);
  } catch (error) {
    console.error('[ROLEPLAY END] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to end session',
      message: String(error)
    });
  }
}
