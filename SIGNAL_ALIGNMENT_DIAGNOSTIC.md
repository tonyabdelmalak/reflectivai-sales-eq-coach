# 🔍 SIGNAL INTELLIGENCE ARCHITECTURE DIAGNOSTIC

**Date:** 2026-01-31  
**Status:** READ-ONLY AUDIT COMPLETE  
**Scope:** Signal generation, timing, alignment, and scoring

---

## **EXECUTIVE SUMMARY**

### **6 CRITICAL ARCHITECTURAL FLAWS CONFIRMED**

1. ❌ **No Signal-Response Alignment Engine** - System scores rep behavior in isolation
2. ❌ **Inverted Signal Timing** - Signals revealed AFTER rep responds (should be BEFORE)
3. ❌ **Signal State Instability** - Cues mutate between turns without persistence logic
4. ❌ **No Cross-Metric Conditional Logic** - Metrics evaluated independently, context-blind
5. ❌ **No Pacing-Aware Adaptation** - HCP state (busy/stressed) doesn't influence scoring
6. ❌ **Missing Alignment Equation** - No `Alignment(SignalState, RepResponse)` computation

---

## **ISSUE #1: NO SIGNAL-RESPONSE ALIGNMENT ENGINE**

### **Current Architecture**

```
Rep speaks → HCP responds → Metrics scored
```

**What's scored:**
- ✅ Question structure (open-ended, probing)
- ✅ Value framing (outcome-based language)
- ✅ Objection navigation (acknowledgment patterns)
- ✅ Conversation control (agenda setting)

**What's NOT scored:**
- ❌ Whether rep's response aligned with HCP's observable state
- ❌ Whether rep adapted to HCP's emotional signals
- ❌ Whether rep's pacing matched HCP's time pressure
- ❌ Whether rep's tone matched HCP's engagement level

### **Evidence from Code**

**File:** `src/lib/signal-intelligence/scoring.ts` (809 lines)

**Current scoring functions:**
```typescript
function scoreQuestionQuality(transcript: Transcript): ComponentResult[]
function scoreListeningResponsiveness(transcript: Transcript): ComponentResult[]
function scoreMakingItMatter(transcript: Transcript): ComponentResult[]
function scoreCustomerEngagement(transcript: Transcript): ComponentResult[]
function scoreObjectionNavigation(transcript: Transcript): ComponentResult[]
function scoreConversationControl(transcript: Transcript): ComponentResult[]
function scoreCommitmentGaining(transcript: Transcript): ComponentResult[]
function scoreAdaptability(transcript: Transcript): ComponentResult[]
```

**All functions take:** `Transcript` (array of speaker + text)  
**None take:** `HCPSignalState` or `ObservableCues[]`

**Missing function:**
```typescript
// DOES NOT EXIST
function scoreSignalAlignment(
  transcript: Transcript,
  hcpSignals: ObservableCue[],
  turnIndex: number
): AlignmentResult {
  // Compare rep's response against HCP's observable state
  // Detect misalignment (e.g., pushy when HCP is stressed)
  // Penalize inappropriate pacing/tone
}
```

### **User's Observed Behavior**

> "I was deliberately pushy and obnoxious in my role play and it answered me rationally as if it didn't pick up on my tone/language."

**Why this happens:**
- Rep's "pushy" behavior may still score well on:
  - Question Quality (if questions are open-ended)
  - Value Framing (if outcomes are mentioned)
  - Conversation Control (if agenda is set)
- System has NO mechanism to detect:
  - Misalignment with HCP's stress signals
  - Inappropriate pacing given time pressure
  - Tone mismatch with HCP's engagement level

---

## **ISSUE #2: INVERTED SIGNAL TIMING**

### **Current Sequence**

```
1. Rep speaks: "Hi Dr Patel, could you share how you typically make prescribing decisions?"
2. HCP responds: "Well, it all depends on the patient and their comorbidities"
3. System reveals: "HCP looks at her watch, assistant hands her a patient file"
```

**Problem:** Rep cannot adapt to signals they haven't seen yet.

### **Desired Sequence**

```
1. System reveals: "HCP looks at her watch, assistant hands her a patient file"
2. HCP speaks: "Hi, what can I do for you today?"
3. Rep responds: (should adapt to time pressure signal)
4. System evaluates: Did rep pick up on time pressure?
```

### **Evidence from Code**

**File:** `src/pages/roleplay.tsx` lines 364-400

```typescript
const sendResponseMutation = useMutation({
  mutationFn: async (content: string) => {
    const res = await apiRequest("POST", "/api/roleplay/respond", { message: content });
    return res.json();
  },
  onSuccess: async (data) => {
    const newSignals = extractSignals(data);  // ← Signals extracted AFTER rep speaks
    if (newSignals.length) {
      setSessionSignals((prev) =>
        dedupeByStableKey(cap50([...prev, ...newSignals]))
      );
    }
    // ... scoring happens here
  },
});
```

**Flow:**
1. Rep sends message
2. Worker generates HCP response + signals
3. Frontend receives response + signals
4. Signals displayed to user
5. Scoring happens

**Missing:** Signals should be generated and displayed BEFORE rep's next turn.

### **Architectural Dependency Violation**

Signal Intelligence requires:
```
Signal → Interpretation → Response
```

Current system does:
```
Response → Signal → (No interpretation possible)
```

---

## **ISSUE #3: SIGNAL STATE INSTABILITY**

### **User's Observed Behavior**

> "The HCP responses changed as we kept 'talking'. For example, above the cue is 'The HCP shows signs of curiosity through minimal eye contact...', and then below it changed to 'The HCP shows low engagement with minimal participation...' on the same exchange"

### **Root Cause: Stateless Signal Evaluation**

**File:** `src/lib/observable-cues.ts` lines 93-541

```typescript
export function detectObservableCues(message: string): BehavioralCue[] {
  const detected: BehavioralCue[] = [];
  const lowerMessage = message.toLowerCase();

  // Time Pressure patterns
  if (
    lowerMessage.includes('busy') ||
    lowerMessage.includes('time') ||
    // ... pattern matching
  ) {
    detected.push(HCP_CUES.TIME_PRESSURE);
  }
  
  // ... more pattern matching
  
  return detected;
}
```

**Problem:** Function is **stateless** - it re-evaluates from scratch every turn.

**Missing:**
- Signal persistence rules ("once stressed, stays stressed until relieved")
- Momentum continuity ("curiosity → engagement → interest" progression)
- State locking ("cannot be curious AND disengaged simultaneously")
- Transition triggers ("what causes HCP to shift from stressed to relaxed?")

### **Dynamic Cue Manager Attempt**

**File:** `src/lib/dynamic-cue-manager.ts` lines 1-205

```typescript
export interface ConversationContext {
  turnNumber: number;
  previousCues: string[]; // IDs of previously shown cues
  repPerformance: 'poor' | 'fair' | 'good' | 'excellent';
  hcpMood: 'improving' | 'stable' | 'declining';
}
```

**What it does:**
- ✅ Tracks previously shown cues
- ✅ Prevents immediate repetition
- ✅ Adjusts HCP mood based on rep performance

**What it DOESN'T do:**
- ❌ Enforce signal persistence ("stressed HCP stays stressed")
- ❌ Prevent contradictory signals ("curious" vs "disengaged")
- ❌ Model realistic state transitions
- ❌ Lock signals until transition conditions met

**Result:** Cues can flip arbitrarily between turns.

---

## **ISSUE #4: NO CROSS-METRIC CONDITIONAL LOGIC**

### **Current Scoring: Independent Metrics**

**File:** `src/lib/signal-intelligence/scoring.ts` line 727

```typescript
export function scoreConversation(transcript: Transcript, meta?: Record<string, any>): MetricResult[] {
  return [
    ...scoreQuestionQuality(transcript),
    ...scoreListeningResponsiveness(transcript),
    ...scoreMakingItMatter(transcript),
    ...scoreCustomerEngagement(transcript),
    ...scoreObjectionNavigation(transcript),
    ...scoreConversationControl(transcript),
    ...scoreCommitmentGaining(transcript),
    ...scoreAdaptability(transcript),
  ];
}
```

**Each metric is computed independently.**

### **User's Alignment Rubric Requires Cross-Metric Logic**

From the Explicit Signal-Response Alignment Rubric:

**Example:**
```
Signal: HCP shows concern (furrowed brow, hesitant tone)
Expected behaviors:
  - Acknowledgment (Objection Navigation metric)
  - Pacing adjustment (Conversation Control metric)
  - Empathetic language (Listening & Responsiveness metric)

If missing → Misalignment penalty
```

**This requires:**
```typescript
function evaluateAlignmentForConcernSignal(
  transcript: Transcript,
  turnIndex: number
): AlignmentScore {
  const repResponse = transcript[turnIndex];
  
  // Check multiple metrics conditionally
  const hasAcknowledgment = checkObjectionNavigation(repResponse);
  const hasPacingAdjustment = checkConversationControl(repResponse);
  const hasEmpathy = checkListeningResponsiveness(repResponse);
  
  if (!hasAcknowledgment || !hasPacingAdjustment) {
    return { aligned: false, penalty: -1.0 };
  }
  
  return { aligned: true, bonus: +0.5 };
}
```

**This function DOES NOT EXIST.**

---

## **ISSUE #5: NO PACING-AWARE ADAPTATION SCORING**

### **User's Example**

> "The HCP has a waiting room full of patients and is having a busy day. She stops on her way into a patient room."
>
> **Signals:** busy, overwhelmed, impatient
>
> **Expected:** Rep should:
> - Keep questions brief
> - Acknowledge time pressure
> - Offer to follow up later
> - Avoid lengthy explanations

### **Current Scoring: Context-Blind**

**File:** `src/lib/signal-intelligence/scoring.ts` lines 50-150 (Question Quality)

```typescript
function scoreQuestionQuality(transcript: Transcript): ComponentResult[] {
  // ... counts open-ended questions
  // ... measures question depth
  // ... evaluates probing techniques
  
  // ❌ DOES NOT CONSIDER:
  // - HCP's time pressure
  // - HCP's stress level
  // - HCP's engagement state
}
```

**Missing logic:**
```typescript
function scoreQuestionQuality(
  transcript: Transcript,
  hcpState: HCPBehavioralState  // ← MISSING PARAMETER
): ComponentResult[] {
  // If HCP is time-pressured:
  if (hcpState.timeAwareness === 'pressured') {
    // Penalize long questions
    // Reward brief, focused questions
    // Reward acknowledgment of time constraints
  }
  
  // If HCP is engaged:
  if (hcpState.emotionalState === 'engaged') {
    // Reward deeper probing
    // Reward follow-up questions
  }
}
```

---

## **ISSUE #6: MISSING ALIGNMENT EQUATION**

### **What's Missing**

```typescript
// DOES NOT EXIST
function computeSignalResponseAlignment(
  signalState: HCPBehavioralState,
  repResponse: string,
  transcript: Transcript,
  turnIndex: number
): AlignmentResult {
  // 1. Identify observable signals at this turn
  const signals = getSignalsAtTurn(turnIndex);
  
  // 2. Determine expected behaviors for these signals
  const expectedBehaviors = mapSignalsToExpectedBehaviors(signals);
  
  // 3. Analyze rep's actual response
  const actualBehaviors = detectBehaviorsInResponse(repResponse);
  
  // 4. Compare expected vs actual
  const alignment = compareExpectedVsActual(expectedBehaviors, actualBehaviors);
  
  // 5. Return alignment score
  return {
    aligned: alignment.score >= 0.7,
    score: alignment.score,
    missingBehaviors: alignment.missing,
    inappropriateBehaviors: alignment.inappropriate,
  };
}
```

**This is the core missing piece.**

---

## **CURRENT SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                    ROLEPLAY FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. Rep sends message
   ↓
2. Worker generates HCP response
   ↓
3. Worker detects HCP signals (pattern matching)
   ↓
4. Frontend receives: { hcpResponse, signals }
   ↓
5. Frontend displays HCP response + signals
   ↓
6. Frontend scores rep's message (8 metrics, independent)
   ↓
7. Frontend displays scores

┌─────────────────────────────────────────────────────────────┐
│                    SCORING LOGIC                            │
└─────────────────────────────────────────────────────────────┘

Input: Transcript (array of { speaker, text })
Output: MetricResult[] (8 metrics with scores 1-5)

Process:
  - scoreQuestionQuality(transcript)
  - scoreListeningResponsiveness(transcript)
  - scoreMakingItMatter(transcript)
  - scoreCustomerEngagement(transcript)
  - scoreObjectionNavigation(transcript)
  - scoreConversationControl(transcript)
  - scoreCommitmentGaining(transcript)
  - scoreAdaptability(transcript)

Each function:
  - Analyzes transcript in isolation
  - Pattern matches for specific behaviors
  - Returns component scores
  - Averages to overall metric score

❌ NO SIGNAL STATE INPUT
❌ NO ALIGNMENT COMPUTATION
❌ NO CROSS-METRIC CONDITIONAL LOGIC
```

---

## **WHAT NEEDS TO BE BUILT**

### **1. Signal State Persistence System**

```typescript
interface HCPSignalState {
  currentSignals: ObservableCue[];
  signalHistory: Array<{ turn: number; signals: ObservableCue[] }>;
  emotionalState: 'engaged' | 'neutral' | 'resistant' | 'stressed' | 'interested';
  energyLevel: 'high' | 'medium' | 'low';
  openness: 'open' | 'guarded' | 'closed';
  timeAwareness: 'relaxed' | 'aware' | 'pressured';
}

function updateHCPState(
  currentState: HCPSignalState,
  newSignals: ObservableCue[],
  repResponse: string
): HCPSignalState {
  // Apply state transition rules
  // Persist signals unless transition triggered
  // Prevent contradictory signals
  // Model realistic progression
}
```

### **2. Signal-Response Alignment Engine**

```typescript
function scoreSignalAlignment(
  transcript: Transcript,
  signalHistory: HCPSignalState['signalHistory'],
  turnIndex: number
): AlignmentResult {
  // Get signals BEFORE rep's response
  const priorSignals = getSignalsBeforeTurn(signalHistory, turnIndex);
  
  // Get rep's response
  const repResponse = transcript[turnIndex];
  
  // Determine expected behaviors
  const expected = mapSignalsToExpectedBehaviors(priorSignals);
  
  // Detect actual behaviors
  const actual = detectBehaviorsInResponse(repResponse);
  
  // Compute alignment
  return computeAlignment(expected, actual);
}
```

### **3. Context-Aware Metric Scoring**

```typescript
function scoreQuestionQuality(
  transcript: Transcript,
  hcpState: HCPSignalState,  // ← NEW PARAMETER
  turnIndex: number
): ComponentResult[] {
  const baseScore = computeBaseQuestionScore(transcript[turnIndex]);
  
  // Apply context adjustments
  if (hcpState.timeAwareness === 'pressured') {
    // Penalize long questions
    if (isLongQuestion(transcript[turnIndex])) {
      baseScore -= 1.0;
    }
    // Reward acknowledgment of time
    if (acknowledgesTime(transcript[turnIndex])) {
      baseScore += 0.5;
    }
  }
  
  return [{ score: baseScore, ... }];
}
```

### **4. Cross-Metric Conditional Evaluator**

```typescript
function evaluateCrossMetricAlignment(
  transcript: Transcript,
  signalState: HCPSignalState,
  metricResults: MetricResult[],
  turnIndex: number
): CrossMetricResult {
  const signals = signalState.signalHistory[turnIndex]?.signals || [];
  
  // For each signal, check if multiple expected behaviors occurred
  const alignmentChecks = signals.map(signal => {
    const expected = getExpectedBehaviorsForSignal(signal);
    const detected = checkExpectedBehaviorsInMetrics(expected, metricResults);
    return { signal, expected, detected, aligned: detected.length >= expected.length };
  });
  
  return { checks: alignmentChecks, overallAlignment: computeOverallAlignment(alignmentChecks) };
}
```

### **5. Signal Timing Inversion**

**New flow:**
```
1. Worker generates HCP response + signals for NEXT turn
2. Frontend displays: HCP response + observable signals
3. Rep sees signals BEFORE responding
4. Rep sends response
5. Frontend scores: Did rep adapt to visible signals?
6. Repeat
```

**Implementation:**
```typescript
// Worker response format
interface WorkerResponse {
  hcpMessage: string;
  currentTurnSignals: ObservableCue[];  // Signals for THIS turn (already happened)
  nextTurnSignals: ObservableCue[];     // Signals for NEXT turn (rep should adapt to these)
}

// Frontend displays nextTurnSignals BEFORE rep's input
// Scoring evaluates if rep adapted to nextTurnSignals
```

---

## **WHAT IS NOT WRONG**

### **✅ Correct Approach (User's Rubric)**

- ✅ NO empathy scoring
- ✅ NO personality inference
- ✅ NO emotional intelligence scoring
- ✅ Focus on observable signal-response alignment
- ✅ Behavioral congruence, not intent inference

### **✅ Working Components**

- ✅ 8 behavioral metrics (Question Quality, Listening, etc.)
- ✅ Pattern matching for rep behaviors
- ✅ Observable cue detection (10 HCP signals)
- ✅ Behavioral description generation
- ✅ Scoring calculation (1-5 scale)
- ✅ Frontend UI rendering

---

## **SUMMARY OF REQUIRED CHANGES**

| Component | Status | Priority | Complexity |
|-----------|--------|----------|------------|
| Signal State Persistence | ❌ Missing | 🔴 Critical | High |
| Signal Timing Inversion | ❌ Missing | 🔴 Critical | Medium |
| Alignment Engine | ❌ Missing | 🔴 Critical | High |
| Context-Aware Scoring | ❌ Missing | 🟠 High | Medium |
| Cross-Metric Logic | ❌ Missing | 🟠 High | High |
| Signal-Behavior Mapping | ❌ Missing | 🟠 High | Medium |

---

## **NEXT STEPS**

### **Phase 1: Signal Timing Fix (Quick Win)**
1. Modify Worker to generate signals for NEXT turn
2. Display signals BEFORE rep input
3. Score alignment with visible signals

### **Phase 2: State Persistence**
1. Build HCPSignalState tracker
2. Implement state transition rules
3. Prevent signal drift

### **Phase 3: Alignment Engine**
1. Create signal-to-behavior mapping
2. Build alignment computation
3. Integrate with scoring

### **Phase 4: Context-Aware Scoring**
1. Add HCPSignalState parameter to scoring functions
2. Implement context adjustments
3. Test with user scenarios

### **Phase 5: Cross-Metric Logic**
1. Build conditional evaluator
2. Implement multi-metric checks
3. Integrate alignment penalties/bonuses

---

## **CONSTRAINTS**

### **Must NOT Break**
- ❌ Cloudflare Worker API contract
- ❌ Existing 8 behavioral metrics
- ❌ Frontend UI components
- ❌ Scoring calculation logic (unless enhancing)

### **Must NOT Add**
- ❌ Empathy scoring
- ❌ Personality inference
- ❌ Emotional intelligence metrics
- ❌ Intent detection

### **Must ADD**
- ✅ Signal-response alignment layer
- ✅ State persistence
- ✅ Context-aware adjustments
- ✅ Cross-metric conditional logic

---

**END OF DIAGNOSTIC**
