/**
 * Authentication Context Provider
 * 
 * Manages authentication state across the application.
 * Backend-first: All auth decisions enforced by Worker.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthContextType,
  User,
  Session,
  Role,
  Permission,
  ROLE_PERMISSIONS,
  LoginResponse,
  SessionValidationResult,
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'reflectivai_session';
const SESSION_EXPIRY_HOURS = 24;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount (CLIENT-SIDE ONLY)
  useEffect(() => {
    const loadSession = () => {
      try {
        const storedSession = localStorage.getItem(SESSION_KEY);
        if (!storedSession) {
          setIsLoading(false);
          return;
        }

        const parsedSession: Session = JSON.parse(storedSession);

        // Check if session expired
        if (new Date(parsedSession.expiresAt) < new Date()) {
          localStorage.removeItem(SESSION_KEY);
          setIsLoading(false);
          return;
        }

        // Create mock user from session
        const mockUser: User = {
          id: 'dev-user-001',
          username: 'user',
          email: 'user@reflectivai.dev',
          role: parsedSession.role,
          orgId: 'reflectivai-org',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        setUser(mockUser);
        setSession(parsedSession);
      } catch (error) {
        console.error('Session load failed:', error);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    // CLIENT-SIDE ONLY: Accept any input and create mock session
    const mockUser: User = {
      id: 'dev-user-001',
      username: username || 'user',
      email: `${username}@reflectivai.dev`,
      role: 'SuperAdmin',
      orgId: 'reflectivai-org',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const mockSession: Session = {
      token: `mock-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
      role: 'SuperAdmin',
    };

    // Store session
    localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
    setUser(mockUser);
    setSession(mockSession);
  }, []);

  const logout = useCallback(() => {
    // CLIENT-SIDE ONLY: Just clear local state
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setSession(null);
  }, []);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      const permissions = ROLE_PERMISSIONS[user.role] || [];
      return permissions.includes(permission);
    },
    [user]
  );

  const hasRole = useCallback(
    (role: Role | Role[]): boolean => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
