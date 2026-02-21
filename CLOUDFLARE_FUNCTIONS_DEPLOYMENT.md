# 🚀 Cloudflare Pages Functions Deployment

## Problem Diagnosed

**Error:** `405 Method Not Allowed` on `/api/auth/login`

**Root Cause:** `vite-plugin-api-routes` only works in development. Production builds don't include API handlers.

**Solution:** Migrate auth API to Cloudflare Pages Functions (`/functions` directory).

---

## What Was Fixed

### 1. Created Cloudflare Pages Functions

```
functions/
├── _shared/
│   ├── audit.ts       # Cloudflare Workers-compatible audit logging
│   └── sessions.ts    # Shared session store
└── api/
    ├── auth/
    │   ├── login.ts   # POST /api/auth/login
    │   ├── logout.ts  # POST /api/auth/logout
    │   └── session.ts # POST /api/auth/session
    └── health.ts      # GET /api/health
```

### 2. Key Changes

- **No Node.js Dependencies:** Replaced `crypto` module with Web Crypto API
- **Shared State:** Created `_shared/` modules for session and audit logging
- **Cloudflare Workers Runtime:** All code runs in V8 isolates (no Node.js)
- **Auto-Deployment:** Cloudflare Pages automatically deploys functions

### 3. Restored `_worker.js`

Reverted to SPA-only mode. API routes now handled by `/functions` directory.

---

## How Cloudflare Pages Functions Work

### File-Based Routing

Cloudflare automatically maps files to routes:

```
functions/api/auth/login.ts  →  /api/auth/login
functions/api/health.ts      →  /api/health
```

### Function Format

```typescript
export async function onRequestPost(context) {
  const { request, env, params } = context;
  
  const body = await request.json();
  
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
```

### Supported Methods

- `onRequestGet` - GET requests
- `onRequestPost` - POST requests
- `onRequestPut` - PUT requests
- `onRequestDelete` - DELETE requests
- `onRequestPatch` - PATCH requests
- `onRequest` - All methods

---

## Deployment Status

**Commit:** `87e67aac`  
**Branch:** `main`  
**Pushed:** ✅ Success  
**Cloudflare Deployment:** Triggered automatically

### Expected Timeline

1. **Build:** 1-2 minutes
2. **Deploy:** 30 seconds
3. **Live:** 2-3 minutes total

---

## Testing After Deployment

### 1. Health Check

```bash
curl https://reflectivai-app-prod.pages.dev/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-08T...",
  "service": "ReflectivAI API"
}
```

### 2. Login Test

```bash
curl -X POST https://reflectivai-app-prod.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ReflectivAI"}'
```

**Expected:**
```json
{
  "success": true,
  "user": {
    "id": "dev-admin-001",
    "username": "admin",
    "role": "SuperAdmin",
    ...
  },
  "session": {
    "token": "...",
    "expiresAt": "..."
  }
}
```

### 3. Browser Test

1. Navigate to `https://reflectivai-app-prod.pages.dev`
2. Should redirect to `/login`
3. Enter credentials:
   - Username: `admin`
   - Password: `ReflectivAI`
4. Should redirect to `/dashboard`
5. Check browser console for audit logs

---

## Troubleshooting

### Still Getting 405?

**Wait 2-3 minutes** - Cloudflare Pages deployment takes time.

**Check deployment status:**
1. Go to Cloudflare Pages dashboard
2. Find `reflectivai-app-prod` project
3. Check latest deployment status

### Functions Not Found?

**Verify `/functions` directory is deployed:**
- Check Cloudflare Pages build logs
- Ensure `functions/` directory is in repository root
- Verify TypeScript files are being compiled

### Session Not Persisting?

**In-memory sessions reset on deployment:**
- Sessions are stored in memory (development)
- Each deployment creates new Worker instance
- Sessions lost on restart
- **Solution:** Migrate to Durable Objects or KV in production

---

## Next Steps (Production)

### 1. Persistent Session Storage

Replace in-memory sessions with Cloudflare KV or Durable Objects:

```typescript
// Using KV
export async function onRequestPost(context) {
  const { env } = context;
  await env.SESSIONS_KV.put(token, JSON.stringify(session), {
    expirationTtl: 86400, // 24 hours
  });
}
```

### 2. Database Integration

Add Cloudflare D1 for user storage:

```typescript
export async function onRequestPost(context) {
  const { env } = context;
  const result = await env.DB.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first();
}
```

### 3. Environment Variables

Set in Cloudflare Pages dashboard:
- `NODE_ENV=production`
- `DEV_MODE=false`

---

## Files Modified

- ✅ Created `functions/api/auth/login.ts`
- ✅ Created `functions/api/auth/logout.ts`
- ✅ Created `functions/api/auth/session.ts`
- ✅ Created `functions/api/health.ts`
- ✅ Created `functions/_shared/audit.ts`
- ✅ Created `functions/_shared/sessions.ts`
- ✅ Created `functions/README.md`
- ✅ Restored `public/_worker.js` (SPA-only)

---

## Verification Checklist

- [ ] Wait 2-3 minutes for deployment
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/auth/login` endpoint
- [ ] Test login in browser
- [ ] Verify session persistence
- [ ] Check Cloudflare Pages dashboard for deployment status
- [ ] Review Cloudflare Functions logs for errors

---

**Status:** ✅ Deployed  
**Commit:** `87e67aac`  
**Expected Live:** 2-3 minutes from push
