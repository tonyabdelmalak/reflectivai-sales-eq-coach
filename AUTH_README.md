# ReflectivAI Authentication & Authorization

## Overview

This document describes the authentication, role-based access control (RBAC), and audit logging system implemented in ReflectivAI.

**CRITICAL:** This is platform infrastructure only. No product logic (Role Play, AI Coach, Scoring) has been modified.

---

## Authentication

### DEV Mode Login

**DEV-ONLY admin credentials** (enforced server-side):

```
Username: admin
Password: ReflectivAI
Role: SuperAdmin
```

**Important:**
- These credentials ONLY work when `NODE_ENV=development` or `DEV_MODE=true`
- Disabled automatically in production (`NODE_ENV=production`)
- Credentials are validated server-side (not hardcoded in frontend)

### Production Login

Production authentication is not yet implemented. The system currently:
- Rejects all non-dev login attempts
- Logs failed login attempts to audit log
- Returns 401 Unauthorized

To implement production auth:
1. Add user database schema
2. Implement password hashing (bcrypt/argon2)
3. Update `src/server/api/auth/login/POST.ts`
4. Add user registration endpoint

### Session Management

- **Session Duration:** 24 hours
- **Storage:** In-memory (development), migrate to database for production
- **Token:** 32-byte random hex string
- **Validation:** Server-side on every request
- **Expiry:** Automatic cleanup on validation

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

1. **SuperAdmin** - Full system access
2. **OrgAdmin** - Organization management
3. **Manager** - Team oversight
4. **Coach** - Training delivery
5. **Rep** - Standard user (default)
6. **Viewer** - Read-only access

### Permissions

#### User Management
- `VIEW_USERS` - View user list
- `MANAGE_USERS` - Create/edit/delete users

#### Organization Management
- `VIEW_ORG` - View organization details
- `MANAGE_ORG` - Edit organization settings

#### Audit
- `VIEW_AUDIT_LOGS` - Access audit logs

#### Content Access
- `ACCESS_DASHBOARD` - Dashboard page
- `ACCESS_ROLEPLAY` - Role Play Simulator
- `ACCESS_AI_COACH` - AI Coach
- `ACCESS_KNOWLEDGE` - Knowledge Base
- `ACCESS_MODULES` - Training Modules
- `ACCESS_FRAMEWORKS` - Frameworks
- `ACCESS_EXERCISES` - Exercises
- `ACCESS_REPORTS` - Data Reports

### Role-Permission Matrix

| Permission | SuperAdmin | OrgAdmin | Manager | Coach | Rep | Viewer |
|------------|------------|----------|---------|-------|-----|--------|
| MANAGE_USERS | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| VIEW_USERS | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| MANAGE_ORG | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| VIEW_ORG | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| VIEW_AUDIT_LOGS | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ACCESS_DASHBOARD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ACCESS_ROLEPLAY | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ACCESS_AI_COACH | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ACCESS_KNOWLEDGE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ACCESS_MODULES | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ACCESS_FRAMEWORKS | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ACCESS_EXERCISES | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ACCESS_REPORTS | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Enforcement

**Backend-First:** All permission checks are enforced server-side.

**Frontend:** Permission checks are for UX only (hiding UI elements). Backend is source of truth.

**Default Role:** Missing role metadata defaults to `Rep`.

---

## Audit Logging

### Logged Events

- `LOGIN` - Successful login
- `LOGOUT` - User logout
- `LOGIN_FAILED` - Failed login attempt
- `ROLE_CHANGED` - User role modified
- `PAGE_ACCESS` - Protected page accessed
- `PERMISSION_DENIED` - Permission check failed

### Audit Log Structure

```typescript
interface AuditLog {
  id: string;              // Unique log ID
  timestamp: string;       // ISO 8601 timestamp
  userId: string;          // User who performed action
  orgId: string;           // Organization context
  eventType: AuditEventType;
  metadata?: object;       // Event-specific data
  ipAddress?: string;      // Request IP
  userAgent?: string;      // Browser/client info
}
```

### Storage

- **Development:** In-memory array (max 10,000 logs)
- **Production:** Migrate to database (append-only table)

### Query API

```typescript
import { queryAuditLogs } from '@/server/api/lib/audit';

const logs = queryAuditLogs({
  userId: 'user-123',
  eventType: 'login',
  startDate: '2026-01-01T00:00:00Z',
  limit: 100,
});
```

### Critical Rules

1. **Never blocks app flow** - All errors caught and logged
2. **Append-only** - Logs are never modified or deleted
3. **Queryable by admin** - SuperAdmin and OrgAdmin can view logs

---

## API Endpoints

### POST /api/auth/login

Authenticate user and create session.

**Request:**
```json
{
  "username": "admin",
  "password": "ReflectivAI"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "dev-admin-001",
    "username": "admin",
    "email": "admin@reflectivai.dev",
    "role": "SuperAdmin",
    "orgId": "dev-org-001",
    "createdAt": "2026-02-08T05:00:00Z",
    "lastLoginAt": "2026-02-08T05:00:00Z"
  },
  "session": {
    "userId": "dev-admin-001",
    "role": "SuperAdmin",
    "orgId": "dev-org-001",
    "expiresAt": "2026-02-09T05:00:00Z",
    "token": "abc123..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /api/auth/logout

Invalidate session.

**Request:**
```json
{
  "token": "abc123..."
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /api/auth/session

Validate session token.

**Request:**
```json
{
  "token": "abc123..."
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "user": { /* User object */ },
  "session": { /* Session object */ }
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "Invalid or expired session"
}
```

---

## Frontend Usage

### Using Auth Context

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasPermission, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <p>Role: {user?.role}</p>
      
      {hasPermission(Permission.VIEW_USERS) && (
        <button>View Users</button>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Permission } from '@/types/auth';

<Route path="/admin">
  <ProtectedRoute requiredPermission={Permission.MANAGE_USERS}>
    <AdminPage />
  </ProtectedRoute>
</Route>
```

### Role Checking

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types/auth';

function AdminPanel() {
  const { hasRole } = useAuth();

  if (!hasRole([Role.SuperAdmin, Role.OrgAdmin])) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel</div>;
}
```

---

## Environment Variables

### Development

```bash
NODE_ENV=development
DEV_MODE=true
```

### Production

```bash
NODE_ENV=production
DEV_MODE=false  # or omit
```

---

## Migration to Production

### Required Changes

1. **Database Schema**
   - Create `users` table
   - Create `sessions` table
   - Create `audit_logs` table

2. **Password Security**
   - Install bcrypt or argon2
   - Hash passwords before storage
   - Never store plaintext passwords

3. **Session Storage**
   - Move from in-memory to database
   - Add session cleanup cron job
   - Consider Redis for session cache

4. **Audit Logging**
   - Move from in-memory to database
   - Add log rotation/archival
   - Set up log monitoring/alerts

5. **User Registration**
   - Add registration endpoint
   - Email verification
   - Password reset flow

6. **Organization Management**
   - Multi-org user support
   - Org switching UI
   - Org-scoped data queries

---

## Testing

### Manual Testing

1. **Login Flow**
   ```bash
   # Start dev server
   npm run dev
   
   # Navigate to http://localhost:20000
   # Should redirect to /login
   
   # Login with: admin / ReflectivAI
   # Should redirect to /dashboard
   ```

2. **Session Persistence**
   ```bash
   # Login
   # Refresh page
   # Should remain logged in
   ```

3. **Logout**
   ```bash
   # Click logout button
   # Should redirect to /login
   # Should clear session
   ```

4. **Permission Checks**
   ```bash
   # Login as different roles
   # Verify UI elements show/hide correctly
   ```

### Audit Log Verification

```bash
# Check dev console for audit logs
# Should see:
# [AUDIT] login | dev-admin-001 | { username: 'admin', isDev: true }
# [AUDIT] logout | dev-admin-001 | { username: 'admin' }
```

---

## Security Considerations

### Current Limitations (Development)

- ⚠️ In-memory session storage (lost on server restart)
- ⚠️ No password hashing (DEV credentials only)
- ⚠️ No rate limiting on login attempts
- ⚠️ No CSRF protection
- ⚠️ No session rotation

### Production Requirements

- ✅ Database-backed sessions
- ✅ Password hashing (bcrypt/argon2)
- ✅ Rate limiting (express-rate-limit)
- ✅ CSRF tokens (csurf)
- ✅ Session rotation on privilege escalation
- ✅ HTTPS only (secure cookies)
- ✅ Content Security Policy headers
- ✅ Input validation and sanitization

---

## Troubleshooting

### "Invalid credentials" in DEV mode

**Check:**
1. `NODE_ENV=development` is set
2. Username is exactly `admin`
3. Password is exactly `ReflectivAI` (case-sensitive)
4. Server logs show `[AUDIT] login_failed`

### Session not persisting

**Check:**
1. Browser localStorage is enabled
2. Session token is being stored
3. Session hasn't expired (24 hours)
4. Server hasn't restarted (in-memory sessions)

### Permission denied errors

**Check:**
1. User role is correct
2. Permission is defined in `ROLE_PERMISSIONS`
3. Backend endpoint validates permissions
4. Frontend and backend permission enums match

---

## File Structure

```
src/
├── types/
│   └── auth.ts                    # Auth types and interfaces
├── contexts/
│   └── AuthContext.tsx            # React auth context
├── components/
│   └── ProtectedRoute.tsx         # Route protection wrapper
├── pages/
│   └── login.tsx                  # Login page
├── lib/
│   └── rbac.ts                    # RBAC utilities
└── server/
    └── api/
        ├── auth/
        │   ├── login/POST.ts      # Login endpoint
        │   ├── logout/POST.ts     # Logout endpoint
        │   └── session/POST.ts    # Session validation
        └── lib/
            └── audit.ts           # Audit logging service
```

---

## Support

For questions or issues:
1. Check this README
2. Review audit logs in dev console
3. Check server logs for errors
4. Verify environment variables

---

**Last Updated:** 2026-02-08  
**Version:** 1.0.0  
**Status:** Development (DEV mode only)
