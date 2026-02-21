# 🔒 PRODUCTION STABLE VERSION - LOCKED

**DO NOT MODIFY THIS FILE OR THE BRANCHES IT REFERENCES!**

## Working Deployment Details

**Commit:** `c4a20b0b9b70329ccd28a6af64fc89c5af908041`
**Message:** "THE LAST WORKING ONE!!!"
**Date:** Thu Jan 29 07:01:52 2026
**Branch:** `production-stable` (protected)

## What Makes This Version Work

### Key Files:
- ✅ `src/lib/observable-cues.ts` (17,026 bytes) - MUST EXIST
- ❌ `src/lib/behavioral-cues.ts` - MUST NOT EXIST
- ✅ `src/pages/roleplay.tsx` - Imports from `@/lib/observable-cues`
- ✅ All components import from `observable-cues` NOT `behavioral-cues`

### Critical Imports:
```typescript
import { 
  detectObservableCues, 
  detectRepMetrics,
  generateCueDescription,
  generateRepFeedback,
  type ObservableCue,
  type RepMetricCue 
} from "@/lib/observable-cues";
```

## Deployment Information

**Live URL:** https://reflectivai-app-prod.pages.dev/
**Bundle Hash:** `index-MEHd9JwK.js`
**Deployed:** 2026-01-30 09:13:00 UTC
**Status:** ✅ WORKING - Roleplay page does NOT crash

## How to Restore This Version

If the main branch gets corrupted again:

```bash
# Reset main to the working commit
git checkout main
git reset --hard c4a20b0b
git push origin main --force

# Or use the protected branch
git checkout main
git reset --hard production-stable
git push origin main --force
```

## Protection Rules

1. **NEVER delete the `production-stable` branch**
2. **NEVER merge commits that:**
   - Delete `observable-cues.ts`
   - Create `behavioral-cues.ts`
   - Change imports from `observable-cues` to `behavioral-cues`
3. **ALWAYS test roleplay page before deploying**
4. **Keep this commit hash documented:** `c4a20b0b`

## What Was Wrong With Other Versions

**Commit `abe59517` ("Restore: Changes from commit C9B717F"):**
- ❌ Deleted `behavioral-cues.ts` (540 lines)
- ❌ Broke all imports
- ❌ Caused roleplay page to crash

**Commit `388aaa13` ("Revert 'Restore: Changes from commit C9B717F'"):**
- ❌ Re-created `behavioral-cues.ts`
- ❌ But components still imported from `observable-cues`
- ❌ Mismatch caused crashes

## Verification Checklist

Before deploying ANY changes:

- [ ] `src/lib/observable-cues.ts` exists
- [ ] `src/lib/behavioral-cues.ts` does NOT exist
- [ ] `src/pages/roleplay.tsx` imports from `@/lib/observable-cues`
- [ ] All components import from `observable-cues`
- [ ] Build succeeds: `npm run build`
- [ ] Roleplay page loads without crashing

---

**Last Updated:** 2026-01-30 09:13:00 UTC
**Locked By:** Airo Agent
**Reason:** This is the ONLY version where roleplay doesn't crash
