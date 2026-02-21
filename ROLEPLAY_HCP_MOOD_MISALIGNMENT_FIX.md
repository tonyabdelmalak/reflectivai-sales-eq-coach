# 🚨 CRITICAL: Roleplay HCP Mood Misalignment - Root Cause Analysis

## Problem Statement

The roleplay system is **NOT aligned with the source of truth**. Scenarios define `hcpMood` (e.g., "frustrated, overwhelmed") but this field is **completely ignored** by the backend logic.

---

## Source of Truth: Scenarios in `data.ts`

Each scenario defines:
```typescript
{
  id: "hiv_np_highshare_access",
  stakeholder: "Sarah Thompson, NP - HIV Specialty Clinic",
  hcpMood: "frustrated, overwhelmed",  // ← SOURCE OF TRUTH
  openingScene: "Sarah looks up from a stack of prior-auth forms with a tired smile...",
  // ...
}
```

---

## Current Flow (BROKEN)

### 1. Start Endpoint (`src/server/api/roleplay/start/POST.ts`)

**What it does:**
```typescript
function deriveInitialStateFromScene(scenarioDescription, scenarioTags) {
  // Analyzes description and tags
  // Returns 'busy', 'irritated', or 'neutral'
}
```

**What it SHOULD do:**
- Accept `hcpMood` parameter from scenario
- Use `hcpMood` as primary source for initial state
- Fall back to description/tags only if `hcpMood` is missing

**Problem:** `hcpMood` is never passed or used!

---

### 2. Respond Endpoint (`src/server/api/roleplay/respond/POST.ts`)

**What it does:**
```typescript
// Uses deterministic state machine
const currentState = session.metadata?.hcpState || 'neutral';
const newState = nextState(currentState, repEvaluation);
```

**What it SHOULD do:**
- Reference scenario's `hcpMood` when generating HCP dialogue
- Pass `hcpMood` to cue detection system
- Ensure state transitions respect scenario's emotional baseline

**Problem:** Scenario context is passed but `hcpMood` is never extracted or used!

---

### 3. Observable Cues (`src/lib/observable-cues.ts`)

**What it supports:**
```typescript
export function detectObservableCues(message: string, hcpMood?: string): BehavioralCue[] {
  // Filters cues based on hcpMood
  const negativeMood = ['frustrated','overwhelmed','stressed',...];
  const positiveMood = ['enthusiastic','excited','interested',...];
  
  if (hasNegMood && !hasPosMood) {
    results = results.filter(c => !POSITIVE_CATEGORIES.includes(c.category));
  }
}
```

**What it receives:**
- `detectObservableCues(message)` ← NO hcpMood parameter!

**Problem:** Function supports `hcpMood` but it's never passed!

---

## Impact

### Example Scenario: Sarah Thompson (NP)

**Defined in data.ts:**
```typescript
hcpMood: "frustrated, overwhelmed"
openingScene: "Sarah looks up from a stack of prior-auth forms with a tired smile. 'I love getting my patients on PrEP, but honestly, the paperwork is killing us. We're drowning in PAs.'"
```

**What happens in roleplay:**
1. Start endpoint derives state from `scenarioDescription` → probably "busy"
2. Opening dialogue: Generic "I only have a few minutes. What is this about?"
3. Cues detected: Random, not aligned with "frustrated, overwhelmed"
4. HCP responses: Don't reflect the frustration and overwhelm

**What SHOULD happen:**
1. Start endpoint uses `hcpMood: "frustrated, overwhelmed"` → state "irritated"
2. Opening dialogue: Uses scenario's `openingScene` directly
3. Cues detected: Filtered to match "frustrated, overwhelmed" mood
4. HCP responses: Reflect frustration with PA burden

---

## Root Cause

**The scenario's `hcpMood` and `openingScene` fields are defined but never consumed by the backend.**

### Missing Data Flow:

```
Scenario (data.ts)
  ↓ hcpMood: "frustrated, overwhelmed"
  ↓ openingScene: "Sarah looks up..."
  ↓
Frontend (roleplay.tsx)
  ↓ Passes scenarioContext to API
  ↓
Backend Start (start/POST.ts)
  ✗ IGNORES hcpMood
  ✗ IGNORES openingScene
  ✗ Derives state from description/tags instead
  ↓
Backend Respond (respond/POST.ts)
  ✗ IGNORES hcpMood from scenarioContext
  ✗ Never passes hcpMood to detectObservableCues()
  ↓
Observable Cues (observable-cues.ts)
  ✗ Receives message only, no hcpMood
  ✗ Cannot filter cues appropriately
```

---

## Required Fixes

### Fix 1: Start Endpoint - Use `hcpMood` and `openingScene`

**File:** `src/server/api/roleplay/start/POST.ts`

**Changes:**
1. Accept `hcpMood` and `openingScene` from request body
2. Use `openingScene` as Turn 0 dialogue (if provided)
3. Derive initial state from `hcpMood` (if provided)
4. Store `hcpMood` in session metadata for later use

```typescript
function deriveInitialStateFromMood(hcpMood?: string): string {
  if (!hcpMood) return 'neutral';
  
  const mood = hcpMood.toLowerCase();
  
  // Negative moods
  if (mood.includes('frustrated') || mood.includes('annoyed') || mood.includes('irritated')) {
    return 'irritated';
  }
  if (mood.includes('overwhelmed') || mood.includes('stressed') || mood.includes('rushed') || mood.includes('time-pressured')) {
    return 'busy';
  }
  if (mood.includes('skeptical') || mood.includes('defensive') || mood.includes('dismissive')) {
    return 'resistant';
  }
  
  // Positive moods
  if (mood.includes('curious') || mood.includes('interested') || mood.includes('eager')) {
    return 'engaged';
  }
  if (mood.includes('data-driven') || mood.includes('analytical')) {
    return 'neutral';
  }
  
  return 'neutral';
}

export default async function handler(req: Request, res: Response) {
  const { 
    scenarioId, 
    scenarioTitle, 
    scenarioDescription, 
    scenarioTags,
    hcpMood,           // ← NEW
    openingScene,      // ← NEW
    scenarioContext 
  } = req.body;
  
  // Use hcpMood if provided, otherwise fall back to description/tags
  const initialState = hcpMood 
    ? deriveInitialStateFromMood(hcpMood)
    : deriveInitialStateFromScene(scenarioDescription || '', scenarioTags);
  
  // Use openingScene if provided, otherwise generate generic dialogue
  const turn0Dialogue = openingScene || generateTurn0Dialogue(initialState, scenarioContext);
  
  const session = {
    // ...
    metadata: {
      hcpState: initialState,
      hcpMood: hcpMood || null,  // ← Store for later use
      turnNumber: 0,
      // ...
    }
  };
}
```

---

### Fix 2: Respond Endpoint - Pass `hcpMood` to Cue Detection

**File:** `src/server/api/roleplay/respond/POST.ts`

**Changes:**
1. Extract `hcpMood` from session metadata
2. Pass `hcpMood` to `generateHCPDialogue()` system prompt
3. Pass `hcpMood` to cue detection (if implemented)

```typescript
export default async function handler(req: Request, res: Response) {
  const { message, scenarioContext } = req.body;
  const session = getSession(sessionId);
  
  // Extract hcpMood from session metadata
  const hcpMood = session.metadata?.hcpMood || scenarioContext?.hcpMood;
  
  // Pass hcpMood to AI dialogue generation
  const hcpDialogue = await generateHCPDialogue(
    message,
    session.messages,
    { ...scenarioContext, hcpMood },  // ← Include hcpMood
    toneDirective,
    newState
  );
  
  // If using cue detection, pass hcpMood
  // const cues = detectObservableCues(hcpDialogue, hcpMood);
}
```

---

### Fix 3: Frontend - Pass `hcpMood` and `openingScene` to API

**File:** `src/pages/roleplay.tsx`

**Changes:**
Ensure `hcpMood` and `openingScene` are passed when starting roleplay:

```typescript
const startRoleplay = async () => {
  const scenario = scenarios.find(s => s.id === selectedScenario);
  
  const response = await fetch('/api/roleplay/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
    body: JSON.stringify({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scenarioDescription: scenario.description,
      scenarioTags: scenario.tags,
      hcpMood: scenario.hcpMood,           // ← ADD
      openingScene: scenario.openingScene, // ← ADD
      scenarioContext: {
        stakeholder: scenario.stakeholder,
        objective: scenario.objective,
        context: scenario.context,
        hcpMood: scenario.hcpMood,         // ← ADD
        // ...
      }
    })
  });
};
```

---

## Verification Checklist

After implementing fixes:

- [ ] Start endpoint receives `hcpMood` and `openingScene`
- [ ] Turn 0 dialogue uses scenario's `openingScene` (not generic)
- [ ] Initial HCP state derived from `hcpMood` (not description)
- [ ] Session metadata stores `hcpMood` for later use
- [ ] Respond endpoint extracts `hcpMood` from session
- [ ] AI system prompt includes `hcpMood` context
- [ ] Cue detection receives `hcpMood` parameter
- [ ] HCP responses align with scenario's emotional baseline

---

## Expected Outcome

### Before Fix:
```
Scenario: Sarah Thompson (frustrated, overwhelmed)
Turn 0: "I only have a few minutes. What is this about?"
Cues: Random, generic
Responses: Generic, not reflecting frustration
```

### After Fix:
```
Scenario: Sarah Thompson (frustrated, overwhelmed)
Turn 0: "Sarah looks up from a stack of prior-auth forms with a tired smile. 'I love getting my patients on PrEP, but honestly, the paperwork is killing us. We're drowning in PAs.'"
Cues: Frustration, overwhelm, time pressure
Responses: Reflect PA burden, staffing concerns, workflow friction
```

---

## Priority: CRITICAL

This is a **fundamental misalignment** between the data model (scenarios) and the runtime behavior (roleplay system). The scenarios define rich emotional context that is completely ignored, resulting in generic, misaligned roleplay experiences.
