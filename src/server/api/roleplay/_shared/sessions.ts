// Shared session storage for roleplay endpoints
// This ensures all endpoints use the same Map instance

export const sessions = new Map<string, any>();

export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}

export function setSession(sessionId: string, data: any) {
  sessions.set(sessionId, data);
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId);
}

export function hasSession(sessionId: string) {
  return sessions.has(sessionId);
}
