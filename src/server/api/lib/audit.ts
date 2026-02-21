/**
 * Audit Logging Service
 * 
 * Lightweight append-only audit logging.
 * Never blocks application flow.
 */

import { AuditEventType, type AuditLog } from '../../../types/auth.js';
import crypto from 'crypto';

// In-memory audit log store (replace with database in production)
const auditLogs: AuditLog[] = [];
const MAX_LOGS = 10000; // Prevent memory overflow

interface LogAuditEventParams {
  userId: string;
  orgId: string;
  eventType: AuditEventType | string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 * 
 * CRITICAL: This function never throws - it catches all errors
 * to prevent blocking the application flow.
 */
export async function logAuditEvent(params: LogAuditEventParams): Promise<void> {
  try {
    const log: AuditLog = {
      id: crypto.randomBytes(16).toString('hex'),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      orgId: params.orgId,
      eventType: params.eventType as AuditEventType,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    };

    // Append to log
    auditLogs.push(log);

    // Trim old logs if exceeding max
    if (auditLogs.length > MAX_LOGS) {
      auditLogs.splice(0, auditLogs.length - MAX_LOGS);
    }

    // In production, this would write to database asynchronously
    // For now, just log to console in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', log.eventType, '|', log.userId, '|', log.metadata);
    }
  } catch (error) {
    // Never throw - just log the error
    console.error('[AUDIT ERROR]', error);
  }
}

/**
 * Query audit logs (for admin use)
 */
export function queryAuditLogs(filters?: {
  userId?: string;
  orgId?: string;
  eventType?: AuditEventType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): AuditLog[] {
  let filtered = [...auditLogs];

  if (filters?.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId);
  }

  if (filters?.orgId) {
    filtered = filtered.filter((log) => log.orgId === filters.orgId);
  }

  if (filters?.eventType) {
    filtered = filtered.filter((log) => log.eventType === filters.eventType);
  }

  if (filters?.startDate) {
    filtered = filtered.filter((log) => log.timestamp >= filters.startDate!);
  }

  if (filters?.endDate) {
    filtered = filtered.filter((log) => log.timestamp <= filters.endDate!);
  }

  // Sort by timestamp descending (newest first)
  filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Apply limit
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Get audit log count
 */
export function getAuditLogCount(): number {
  return auditLogs.length;
}
