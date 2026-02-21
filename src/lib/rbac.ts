/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * Permission checking helpers for frontend components.
 * Backend enforcement is source of truth.
 */

import { Role, Permission, ROLE_PERMISSIONS } from '@/types/auth';

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role is at least as privileged as another role
 */
export function roleIsAtLeast(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = [
    Role.SuperAdmin,
    Role.OrgAdmin,
    Role.Manager,
    Role.Coach,
    Role.Rep,
    Role.Viewer,
  ];

  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);

  return userIndex <= requiredIndex;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: Role): string {
  const names: Record<Role, string> = {
    [Role.SuperAdmin]: 'Super Admin',
    [Role.OrgAdmin]: 'Organization Admin',
    [Role.Manager]: 'Manager',
    [Role.Coach]: 'Coach',
    [Role.Rep]: 'Sales Rep',
    [Role.Viewer]: 'Viewer',
  };

  return names[role] || role;
}

/**
 * Get human-readable permission name
 */
export function getPermissionName(permission: Permission): string {
  const names: Record<Permission, string> = {
    [Permission.VIEW_USERS]: 'View Users',
    [Permission.MANAGE_USERS]: 'Manage Users',
    [Permission.VIEW_ORG]: 'View Organization',
    [Permission.MANAGE_ORG]: 'Manage Organization',
    [Permission.VIEW_AUDIT_LOGS]: 'View Audit Logs',
    [Permission.ACCESS_DASHBOARD]: 'Access Dashboard',
    [Permission.ACCESS_ROLEPLAY]: 'Access Role Play Simulator',
    [Permission.ACCESS_AI_COACH]: 'Access AI Coach',
    [Permission.ACCESS_KNOWLEDGE]: 'Access Knowledge Base',
    [Permission.ACCESS_MODULES]: 'Access Training Modules',
    [Permission.ACCESS_FRAMEWORKS]: 'Access Frameworks',
    [Permission.ACCESS_EXERCISES]: 'Access Exercises',
    [Permission.ACCESS_REPORTS]: 'Access Reports',
  };

  return names[permission] || permission;
}
