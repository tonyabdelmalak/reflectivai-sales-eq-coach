# 🔍 DEPLOYMENT DIAGNOSTIC - Production vs Local Code Mismatch

## Issue Summary

User tested roleplay on production (https://reflectivai-app-prod.pages.dev) and found:
1. **Generic opening dialogue** instead of scenario-specific `openingScene`
2. **Misaligned cues** (Turn 2: HCP shows interest but cue says "low engagement")
3. **Fixes not working** despite successful GitHub Actions deployment

---

## Investigation Results

### ✅ GitHub Actions Deployment

**Workflow Run:** 22253174849  
**Status:** ✅ SUCCESS  
**Commit:** `d7e865f2` (HCP Mood Alignment fixes)  
**Completed:** 2026-02-21T07:58:37Z  
**Project:** `reflectivai-app-prod`  

### ❌ Production Site Status

**URL:** https://reflectivai-app-prod.pages.dev  
**version.json commit:** `a38339c5` (February 5, 2026)  
**JavaScript bundle:** `index-Hyur9xX1.js`  
**Contains `deriveInitialStateFromMood`:** ❌ NO  

### 🔍 Root Cause Analysis

**The production site is serving OLD code despite successful deployment!**

Possible causes:
1. **Cloudflare Pages cache** - Old deployment still cached
2. **Multiple Cloudflare projects** - Deploying to wrong project
3. **Deployment didn't actually update** - Workflow succeeded but didn't push to production
4. **Browser cache** - User's browser cached old version

---

## Code Comparison

### Local Repository (d7e865f2)

**src/server/api/roleplay/start/POST.ts:**
```typescript
function deriveInitialStateFromMood(hcpMood?: string): string {
  if (!hcpMood) return 'neutral';
  
  const mood = hcpMood.toLowerCase();
  
  if (mood.includes('frustrated') || mood.includes('annoyed')) {
    return 'irritated';
  }
  // ...
}

const initialState = hcpMood 
  ? deriveInitialStateFromMood(hcpMood)
  : deriveInitialStateFromScene(scenarioDescription || '', scenarioTags);

const turn0Dialogue = openingScene || generateTurn0Dialogue(initialState, scenarioContext);
```

**src/pages/roleplay.tsx:**
```typescript
const res = await apiRequest("POST", "/api/roleplay/start", {
  scenarioId: (scenario as any).id,
  scenarioTitle: (scenario as any).title,
  hcpMood: (scenario as any).hcpMood,           // ← NEW
  openingScene: (scenario as any).openingScene, // ← NEW
  scenarioContext: {
    hcpMood: (scenario as any).hcpMood,         // ← NEW
    // ...
  },
});
```

### Production Site (index-Hyur9xX1.js)

**Contains `deriveInitialStateFromMood`:** ❌ NO  
**Contains `openingScene` parameter:** ❓ UNKNOWN (minified)  

---

## User's Test Results

### Roleplay Session Observed:

**Turn 0 (Opening):**
```
HCP: "Good to see you. What would you like to discuss today?"
```
❌ **PROBLEM:** Generic opening, not using scenario's `openingScene`

**Turn 2:**
```
Rep: "i have solutions for you if you have 10 minutes."
HCP: "I have a few minutes, what kind of solutions are you referring to?"
Cue: "Low engagement. Minimal participation, disinterest or distraction evident."
```
❌ **PROBLEM:** HCP response shows interest, but cue says "low engagement" - MISALIGNED

**Turn 3:**
```
Rep: "patient outcomes based on data"
HCP: "I'm interested in learning more about how data can improve patient outcomes. Can you share some specific insights or findings?"
Cue: "Leaning forward, asking follow-up questions"
```
✅ **GOOD:** HCP shows interest, cue reflects engagement - ALIGNED

---

## Why Fixes Aren't Working

### Theory 1: Cloudflare Pages Serving Old Deployment

**Evidence:**
- GitHub Actions deployed successfully
- Commit hash in workflow matches local (d7e865f2)
- But production site shows old version.json (a38339c5)
- JavaScript bundle doesn't contain new functions

**Likely cause:** Cloudflare Pages has multiple deployments and is serving an older one as "production"

### Theory 2: GitHub Actions Deployed to Wrong Project

**Evidence:**
- Workflow specifies `--project-name=reflectivai-app-prod`
- URL is `reflectivai-app-prod.pages.dev`
- These match!

**Unlikely:** Project names match

### Theory 3: Build Didn't Include Backend Changes

**Evidence:**
- Backend changes are in `src/server/api/roleplay/start/POST.ts`
- Vite builds frontend to `dist/client`
- Backend is bundled separately by `bundle.js`

**Possible:** Backend bundle might not have been deployed correctly

---

## Next Steps

### Option 1: Check Cloudflare Pages Deployment History

Need to access Cloudflare dashboard to:
1. View all deployments for `reflectivai-app-prod`
2. Check which deployment is marked as "production"
3. Verify commit hash of production deployment
4. Manually promote latest deployment if needed

### Option 2: Force Rebuild and Redeploy

1. Update `version.json` with new commit hash
2. Trigger manual workflow dispatch
3. Verify new bundle hash in HTML
4. Test production site again

### Option 3: Test in Airo Preview Environment

The fixes ARE in the Airo development environment (this project). User can test here:
- URL: `6oijucvp8y.preview.c24.airoapp.ai`
- This environment has the latest code with all fixes

---

## Immediate Action Required

**CRITICAL:** The production site is NOT running the latest code despite successful deployment.

**User needs to:**
1. Access Cloudflare Pages dashboard
2. Check deployment history for `reflectivai-app-prod`
3. Verify which deployment is serving as production
4. Manually promote the latest deployment (d7e865f2) if needed

**OR**

**Test in Airo preview environment first** to verify fixes work before troubleshooting production deployment.
