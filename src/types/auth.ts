/**
 * Authentication and Authorization Types
 * 
 * CRITICAL: This is platform infrastructure only.
 * DO NOT modify product logic (Role Play, AI Coach, Scoring).
 */

// Role hierarchy (most to least privileged)
export enum Role {
  SuperAdmin = 'SuperAdmin',
  OrgAdmin = 'OrgAdmin',
  Manager = 'Manager',
  Coach = 'Coach',
  Rep = 'Rep',
  Viewer = 'Viewer',
}

// User authentication state
export interface User {
  id: string;
  username: string;
  email?: string;
  role: Role;
  orgId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  lastLoginAt?: string;
}

// Session data stored in cookies/localStorage
export interface Session {
  userId: string;
  role: Role;
  orgId: string;
  expiresAt: string;
  token: string;
}

// Auth context for React
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
}

// Permission system
export enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  
  // Org management
  VIEW_ORG = 'view_org',
  MANAGE_ORG = 'manage_org',
  
  // Audit logs
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  
  // Content access (existing features)
  ACCESS_DASHBOARD = 'access_dashboard',
  ACCESS_ROLEPLAY = 'access_roleplay',
  ACCESS_AI_COACH = 'access_ai_coach',
  ACCESS_KNOWLEDGE = 'access_knowledge',
  ACCESS_MODULES = 'access_modules',
  ACCESS_FRAMEWORKS = 'access_frameworks',
  ACCESS_EXERCISES = 'access_exercises',
  ACCESS_REPORTS = 'access_reports',
}

// Role-to-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SuperAdmin]: [
    // All permissions
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_ORG,
    Permission.MANAGE_ORG,
    Permission.VIEW_AUDIT_LOGS,
    Permission.ACCESS_DASHBOARD,
    Permission.ACCESS_ROLEPLAY,
    Permission.ACCESS_AI_COACH,
    Permission.ACCESS_KNOWLEDGE,
    Permission.ACCESS_MODULES,
    Permission.ACCESS_FRAMEWORKS,
    Permission.ACCESS_EXERCISES,
    Permission.ACCESS_REPORTS,
  ],
  [Role.OrgAdmin]: [
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_ORG,
    Permission.MANAGE_ORG,
    Permission.VIEW_AUDIT_LOGS,
    Permission.ACCESS_DASHBOARD,
    Permission.ACCESS_ROLEPLAY,
    Permission.ACCESS_AI_COACH,
    Permission.ACCESS_KNOWLEDGE,
    Permission.ACCESS_MODULES,
    Permission.ACCESS_FRAMEWORKS,
    Permission.ACCESS_EXERCISES,
    Permission.ACCESS_REPORTS,
  ],
  [Role.Manager]: [
    Permission.VIEW_USERS,
    Permission.VIEW_ORG,
    Permission.ACCESS_DASHBOARD,
    Permission.ACCESS_ROLEPLAY,
    Permission.ACCESS_AI_COACH,
    Permission.ACCESS_KNOWLEDGE,
    Permission.ACCESS_MODULES,
    Permission.ACCESS_FRAMEWORKS,
    Permission.ACCESS_EXERCISES,
    Permission.ACCESS_REPORTS,
  ],
  [Role.Coach]: [
    Permission.VIEW_ORG,
    Permission.ACCESS_DASHBOARD,
    Permission.ACCESS_ROLEPLAY,
    Permission.ACCESS_AI_COACH,
    Permission.ACCESS_KNOWLEDGE,
    Permission.ACCESS_MODULES,
    Permission.ACCESS_FRAMEWORKS,
    Permission.ACCESS_EXERCISES,
  ],
  [Role.Rep]: [
    Permission.ACCESS_DASHBOARD,
    Permission.ACCESS_ROLEPLAY,
    Permission.ACCESS_AI_COACH,
    Permission.ACCESS_KNOWLEDGE,
    Permission.ACCESS_MODULES,
    Permission.ACCESS_FRAMEWORKS,
    Permission.ACCESS_EXERCISES,
  ],
  [Role.Viewer]: [
    Permission.ACCESS_DASHBOARD,
    Permission.ACCESS_KNOWLEDGE,
  ],
};

// Audit log types
export enum AuditEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  ROLE_CHANGED = 'role_changed',
  PAGE_ACCESS = 'page_access',
  PERMISSION_DENIED = 'permission_denied',
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  orgId: string;
  eventType: AuditEventType;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Login request/response
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

// Session validation
export interface SessionValidationResult {
  valid: boolean;
  user?: User;
  session?: Session;
  error?: string;
}
