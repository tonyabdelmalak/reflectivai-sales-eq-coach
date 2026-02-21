/**
 * Session Validation Endpoint
 * 
 * Validates session token and returns user data.
 */

import type { Request, Response } from 'express';
import { sessions } from '../login/POST.js';
import type { SessionValidationResult } from '../../../../types/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      const response: SessionValidationResult = {
        valid: false,
        error: 'Token required',
      };
      return res.status(400).json(response);
    }

    const sessionData = sessions.get(token);

    if (!sessionData) {
      const response: SessionValidationResult = {
        valid: false,
        error: 'Invalid or expired session',
      };
      return res.status(401).json(response);
    }

    // Check if session expired
    if (new Date(sessionData.session.expiresAt) < new Date()) {
      sessions.delete(token);
      const response: SessionValidationResult = {
        valid: false,
        error: 'Session expired',
      };
      return res.status(401).json(response);
    }

    const response: SessionValidationResult = {
      valid: true,
      user: sessionData.user,
      session: sessionData.session,
    };

    return res.json(response);
  } catch (error) {
    console.error('Session validation error:', error);
    const response: SessionValidationResult = {
      valid: false,
      error: 'Internal server error',
    };
    return res.status(500).json(response);
  }
}
