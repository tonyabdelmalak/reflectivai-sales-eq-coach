import type { Request, Response } from 'express';
import { getSession } from '../_shared/sessions.js';

export default async function handler(req: Request, res: Response) {
  try {
    const sessionId = req.headers['x-session-id'] as string || 'default';
    
    const session = getSession(sessionId);
    
    if (!session) {
      return res.json({
        active: false,
        messages: [],
        scenario: null
      });
    }
    
    return res.json(session);
  } catch (error) {
    console.error('[ROLEPLAY SESSION GET] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get session',
      message: String(error)
    });
  }
}
