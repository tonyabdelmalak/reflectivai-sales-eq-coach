/**
 * Login Endpoint
 * 
 * DEV-ONLY admin credentials:
 * - Username: admin
 * - Password: ReflectivAI
 * - Role: SuperAdmin
 * - Only works when DEV_MODE=true or NODE_ENV=development
 * 
 * CRITICAL: Credentials enforced server-side only.
 */

import type { Request, Response } from 'express';
import { Role, type LoginResponse, type Session, type User } from '../../../../types/auth.js';
import { logAuditEvent } from '../../lib/audit.js';
import crypto from 'crypto';

const DEV_ADMIN_USERNAME = 'admin';
const DEV_ADMIN_PASSWORD = 'ReflectivAI';
const SESSION_EXPIRY_HOURS = 24;

// In-memory session store (replace with database in production)
const sessions = new Map<string, { user: User; session: Session }>();

export default async function handler(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        error: 'Username and password are required',
      };
      return res.status(400).json(response);
    }

    const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';

    // DEV-ONLY admin login
    if (isDev && username === DEV_ADMIN_USERNAME && password === DEV_ADMIN_PASSWORD) {
      const userId = 'dev-admin-001';
      const orgId = 'dev-org-001';
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

      const user: User = {
        id: userId,
        username: DEV_ADMIN_USERNAME,
        email: 'admin@reflectivai.dev',
        role: Role.SuperAdmin,
        orgId,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const session: Session = {
        userId,
        role: Role.SuperAdmin,
        orgId,
        expiresAt,
        token,
      };

      // Store session
      sessions.set(token, { user, session });

      // Log audit event
      await logAuditEvent({
        userId,
        orgId,
        eventType: 'login',
        metadata: { username, isDev: true },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const response: LoginResponse = {
        success: true,
        user,
        session,
      };

      return res.json(response);
    }

    // Production login would go here (database lookup, password hashing, etc.)
    // For now, reject all non-dev logins
    await logAuditEvent({
      userId: 'unknown',
      orgId: 'unknown',
      eventType: 'login_failed',
      metadata: { username, reason: 'Invalid credentials' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const response: LoginResponse = {
      success: false,
      error: 'Invalid credentials',
    };

    return res.status(401).json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: LoginResponse = {
      success: false,
      error: 'Internal server error',
    };
    return res.status(500).json(response);
  }
}

// Export sessions for other endpoints
export { sessions };
