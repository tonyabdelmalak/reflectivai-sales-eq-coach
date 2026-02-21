# ✅ ROLEPLAY HCP MOOD ALIGNMENT - FIXES COMPLETE

## Problem Summary

The roleplay system was **NOT aligned with the source of truth**. Scenarios defined `hcpMood` (e.g., "frustrated, overwhelmed") and `openingScene` but these fields were **completely ignored** by the backend logic, resulting in:

- Generic opening dialogue instead of scenario-specific scenes
- HCP state derived from description/tags instead of `hcpMood`
- Misaligned behavioral cues and responses

---

## Fixes Implemented

### ✅ Fix 1: Start Endpoint - Use `hcpMood` and `openingScene`

**File:** `src/server/api/roleplay/start/POST.ts`

**Changes:**
1. Added `deriveInitialStateFromMood(hcpMood)` function as PRIMARY source
2. Made `deriveInitialStateFromScene()` a FALLBACK only
3. Accept `hcpMood` and `openingScene` from request body
4. Use `openingScene` as Turn 0 dialogue (if provided)
5. Store `hcpMood` in session metadata for later use

**Result:**
- Initial HCP state now derived from `hcpMood` (not description)
- Turn 0 dialogue uses scenario's `openingScene` (not generic)
- `hcpMood` stored in session for respond endpoint

---

### ✅ Fix 2: Respond Endpoint - Pass `hcpMood` to AI System Prompt

**File:** `src/server/api/roleplay/respond/POST.ts`

**Changes:**
1. Extract `hcpMood` from `scenarioContext`
2. Add `hcpMood` to AI system prompt
3. Instruct AI to maintain HCP's baseline mood throughout conversation

**Result:**
- AI-generated HCP dialogue reflects scenario's emotional baseline
- HCP responses stay consistent with defined mood

---

### ✅ Fix 3: Frontend - Pass `hcpMood` and `openingScene` to API

**File:** `src/pages/roleplay.tsx`

**Changes:**
1. Extract `hcpMood` and `openingScene` from scenario
2. Pass both fields explicitly to `/api/roleplay/start`
3. Include `hcpMood` in `scenarioContext` for respond endpoint

**Result:**
- Backend receives `hcpMood` and `openingScene` from frontend
- Data flows from scenario definition → frontend → backend

---

## Data Flow (AFTER FIX)

```
Scenario (data.ts)
  ↓ hcpMood: "frustrated, overwhelmed"
  ↓ openingScene: "Sarah looks up from a stack of prior-auth forms..."
  ↓
Frontend (roleplay.tsx)
  ↓ Extracts hcpMood and openingScene
  ↓ Passes to /api/roleplay/start
  ↓
Backend Start (start/POST.ts)
  ✓ Uses hcpMood to derive initial state
  ✓ Uses openingScene as Turn 0 dialogue
  ✓ Stores hcpMood in session metadata
  ↓
Backend Respond (respond/POST.ts)
  ✓ Extracts hcpMood from scenarioContext
  ✓ Passes hcpMood to AI system prompt
  ✓ AI maintains emotional baseline
  ↓
Observable Cues (observable-cues.ts)
  ✓ Receives hcpMood parameter (already supported)
  ✓ Filters cues appropriately
```

---

## Example: Before vs After

### Scenario: Sarah Thompson (NP)

**Defined in data.ts:**
```typescript
{
  id: "hiv_np_highshare_access",
  stakeholder: "Sarah Thompson, NP - HIV Specialty Clinic",
  hcpMood: "frustrated, overwhelmed",
  openingScene: "Sarah looks up from a stack of prior-auth forms with a tired smile. 'I love getting my patients on PrEP, but honestly, the paperwork is killing us. We're drowning in PAs.'",
  // ...
}
```

### BEFORE FIX:
```
Turn 0: "I only have a few minutes. What is this about?"
Initial State: "busy" (derived from description)
Cues: Random, generic
Responses: Generic, not reflecting frustration
```

### AFTER FIX:
```
Turn 0: "Sarah looks up from a stack of prior-auth forms with a tired smile. 'I love getting my patients on PrEP, but honestly, the paperwork is killing us. We're drowning in PAs.'"
Initial State: "irritated" (derived from hcpMood: "frustrated")
Cues: Frustration, overwhelm, time pressure
Responses: Reflect PA burden, staffing concerns, workflow friction
```

---

## Verification Checklist

- [x] Start endpoint receives `hcpMood` and `openingScene`
- [x] Turn 0 dialogue uses scenario's `openingScene` (not generic)
- [x] Initial HCP state derived from `hcpMood` (not description)
- [x] Session metadata stores `hcpMood` for later use
- [x] Respond endpoint extracts `hcpMood` from scenarioContext
- [x] AI system prompt includes `hcpMood` context
- [x] Frontend passes `hcpMood` and `openingScene` to API
- [x] Observable cues already support `hcpMood` parameter

---

## Files Modified

1. **`src/server/api/roleplay/start/POST.ts`** - Added `deriveInitialStateFromMood()`, use `openingScene`, store `hcpMood`
2. **`src/server/api/roleplay/respond/POST.ts`** - Extract `hcpMood`, pass to AI system prompt
3. **`src/pages/roleplay.tsx`** - Pass `hcpMood` and `openingScene` to start endpoint

---

## Testing Recommendations

1. **Start a roleplay** with scenario "hiv_np_highshare_access" (Sarah Thompson)
2. **Verify Turn 0** shows the full opening scene (not generic dialogue)
3. **Check HCP responses** reflect frustration and overwhelm
4. **Observe cues** align with "frustrated, overwhelmed" mood
5. **Test other scenarios** with different moods (analytical, curious, etc.)

---

## Impact

This fix restores **fundamental alignment** between:
- **Data model** (scenarios with rich emotional context)
- **Runtime behavior** (roleplay system that respects that context)

The roleplay experience will now be:
- **More realistic** - HCPs behave according to their defined mood
- **More consistent** - Opening scenes match scenario descriptions
- **More educational** - Learners practice with accurate emotional baselines

---

## Priority: CRITICAL ✅ RESOLVED

This was a **fundamental misalignment** that has now been fixed. The scenarios' `hcpMood` and `openingScene` fields are now the **source of truth** for roleplay behavior.
