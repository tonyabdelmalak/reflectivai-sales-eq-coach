/**
 * Logout Endpoint
 * 
 * Invalidates session and logs audit event.
 */

import type { Request, Response } from 'express';
import { sessions } from '../login/POST.js';
import { logAuditEvent } from '../../lib/audit.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token required' });
    }

    const sessionData = sessions.get(token);

    if (sessionData) {
      // Log audit event before deleting session
      await logAuditEvent({
        userId: sessionData.user.id,
        orgId: sessionData.user.orgId,
        eventType: 'logout',
        metadata: { username: sessionData.user.username },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Delete session
      sessions.delete(token);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
