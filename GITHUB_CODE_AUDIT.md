# 🔍 GITHUB REPOSITORY CODE AUDIT

**Date:** 2026-02-12  
**Branch:** origin/main (commit ff953653)  
**Purpose:** Understand current implementation before Phase 1  
**Status:** ✅ AUDIT COMPLETE

---

## **EXECUTIVE SUMMARY**

### **What's Working:**
- ✅ 8 behavioral metrics scoring system (Question Quality, Listening, etc.)
- ✅ Observable cue detection (10 HCP signals)
- ✅ Dynamic cue selection (prevents repetition)
- ✅ HCP behavioral descriptions (body language, vocal tone, physical cues)
- ✅ Real-time scoring during conversation
- ✅ Signal Intelligence Panel display
- ✅ Cue toggle functionality

### **What's Missing (Confirmed from Diagnostic):**
- ❌ Signal timing inversion (signals shown AFTER rep responds)
- ❌ Signal-response alignment evaluation
- ❌ Signal state persistence
- ❌ Cross-metric conditional logic
- ❌ Context-aware scoring (HCP state doesn't influence metrics)
- ❌ Pacing-aware adaptation

---

## **DETAILED FINDINGS**

### **1. CURRENT SIGNAL FLOW**

#### **File:** `src/pages/roleplay.tsx`

**State Variables (lines 224-242):**
```typescript
const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
const [input, setInput] = useState("");
const [sessionSignals, setSessionSignals] = useState<SignalIntelligenceCapability[]>([]);
const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
const [metricResults, setMetricResults] = useState<MetricResult[]>([]);
const [feedbackData, setFeedbackData] = useState<ComprehensiveFeedback | null>(null);
const [showCues, setShowCues] = useState(true);
const [conversationContext, setConversationContext] = useState<ConversationContext>(createInitialContext());
const [allDetectedCues, setAllDetectedCues] = useState<ObservableCue[]>([]);
const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
const [failOpenTriggered, setFailOpenTriggered] = useState(false);
```

**Key Observations:**
- ❌ NO `upcomingHCPSignals` state (Phase 1 not implemented)
- ✅ Has `sessionSignals` (accumulated signals from Worker)
- ✅ Has `allDetectedCues` (all cues detected in conversation)
- ✅ Has `conversationContext` (for dynamic cue selection)
- ✅ Has `showCues` toggle (eye icon)

---

### **2. MESSAGE SENDING FLOW**

**Location:** Lines 364-400

```typescript
const sendResponseMutation = useMutation({
  mutationFn: async (content: string) => {
    const res = await apiRequest("POST", "/api/roleplay/respond", { message: content });
    return res.json();
  },
  onSuccess: async (data) => {
    // 1. Extract signals from Worker response
    const newSignals = extractSignals(data);
    if (newSignals.length) {
      setSessionSignals((prev) =>
        dedupeByStableKey(cap50([...prev, ...newSignals]))
      );
    }
    
    // 2. Refetch messages
    await queryClient.invalidateQueries({ queryKey: ["/api/roleplay/session"] });
    await queryClient.refetchQueries({ queryKey: ["/api/roleplay/session"] });

    // 3. Score conversation
    const freshData = queryClient.getQueryData<SessionPayload>(["/api/roleplay/session"]);
    const currentMessages = freshData?.messages ?? [];
    
    if (currentMessages.length >= 2) {
      const transcript: Transcript = currentMessages.map((msg) => ({
        speaker: msg.role === 'user' ? 'rep' : 'customer',
        text: msg.content,
      }));
      const liveScores = scoreConversation(transcript);
      setMetricResults(liveScores);
    }
  },
});
```

**Flow:**
```
1. Rep sends message
2. Worker generates HCP response
3. Frontend extracts signals from response
4. Frontend refetches messages
5. Frontend scores conversation
6. Signals displayed in chat history (AFTER rep already responded)
```

**Problem:** Signals are revealed AFTER rep has already sent their response. Rep cannot adapt to signals they haven't seen.

---

### **3. SIGNAL DISPLAY IN CHAT**

**Location:** Lines 894-919

```tsx
{/* HCP Behavioral Cues - ENHANCED */}
{hcpBehavioralDesc && (
  <div className="space-y-2">
    <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
      <p className="text-xs font-semibold text-amber-900 mb-2">
        🎭 Observable HCP Behaviors:
      </p>
      <div className="space-y-1.5 text-xs text-amber-800">
        {hcpBehavioralDesc.bodyLanguage.length > 0 && (
          <p><span className="font-medium">Body Language:</span> {hcpBehavioralDesc.bodyLanguage.slice(0, 2).join('; ')}</p>
        )}
        {hcpBehavioralDesc.vocalTone.length > 0 && (
          <p><span className="font-medium">Vocal Tone:</span> {hcpBehavioralDesc.vocalTone.slice(0, 2).join('; ')}</p>
        )}
        {hcpBehavioralDesc.physicalCues.length > 0 && (
          <p><span className="font-medium">Physical Cues:</span> {hcpBehavioralDesc.physicalCues.slice(0, 2).join('; ')}</p>
        )}
      </div>
      <p className="mt-2 text-xs italic text-amber-700 border-t border-amber-200 pt-2">
        {hcpBehavioralDesc.overallDescription}
      </p>
    </div>
    {cues.length > 0 && (
      <CueBadgeGroup cues={cues} />
    )}
  </div>
)}
```

**Display Location:** AFTER HCP message in chat history (lines 868-919)

**Problem:** Signals are displayed as part of the chat history, not as "upcoming" signals the rep should adapt to.

---

### **4. SCORING SYSTEM ARCHITECTURE**

**File:** `src/lib/signal-intelligence/scoring.ts`

**Main Function (lines 727-809):**
```typescript
export function scoreConversation(transcript: Transcript, meta?: Record<string, any>): MetricResult[] {
  const results: MetricResult[] = [];

  METRICS_SPEC.forEach(spec => {
    let components: ComponentResult[] = [];

    switch (spec.id) {
      case 'question_quality':
        components = scoreQuestionQuality(transcript);
        break;
      case 'listening_responsiveness':
        components = scoreListeningResponsiveness(transcript);
        break;
      case 'making_it_matter':
        components = scoreMakingItMatter(transcript, goalTokens);
        break;
      case 'customer_engagement_signals':
        components = scoreCustomerEngagement(transcript);
        break;
      case 'objection_navigation':
        components = scoreObjectionNavigation(transcript);
        break;
      case 'conversation_control_structure':
        components = scoreConversationControl(transcript);
        break;
      case 'commitment_gaining':
        components = scoreCommitmentGaining(transcript);
        break;
      case 'adaptability':
        components = scoreAdaptability(transcript);
        break;
    }

    // ... averaging logic
    results.push({ id, metric, components, overall_score, ... });
  });

  return results;
}
```

**Key Observations:**
- ✅ All 8 metrics implemented
- ✅ Each metric has component-level scoring
- ✅ Averaging logic for overall scores
- ❌ NO HCPSignalState parameter (context-blind)
- ❌ NO alignment evaluation
- ❌ NO cross-metric conditional logic
- ❌ Metrics scored independently

**Individual Metric Functions:**
```typescript
function scoreQuestionQuality(transcript: Transcript): ComponentResult[]
function scoreListeningResponsiveness(transcript: Transcript): ComponentResult[]
function scoreMakingItMatter(transcript: Transcript, goalTokens: Set<string>): ComponentResult[]
function scoreCustomerEngagement(transcript: Transcript): ComponentResult[]
function scoreObjectionNavigation(transcript: Transcript): ComponentResult[]
function scoreConversationControl(transcript: Transcript): ComponentResult[]
function scoreCommitmentGaining(transcript: Transcript): ComponentResult[]
function scoreAdaptability(transcript: Transcript): ComponentResult[]
```

**All functions:**
- Take only `transcript` (and optional `goalTokens`)
- Do NOT take `HCPSignalState` or `ObservableCues[]`
- Evaluate rep behavior in isolation
- Cannot detect signal-response misalignment

---

### **5. OBSERVABLE CUES DETECTION**

**File:** `src/lib/observable-cues.ts`

**Main Function (lines 93-541):**
```typescript
export function detectObservableCues(message: string): BehavioralCue[] {
  const detected: BehavioralCue[] = [];
  const lowerMessage = message.toLowerCase();

  // Time Pressure patterns
  if (
    lowerMessage.includes('busy') ||
    lowerMessage.includes('time') ||
    // ... more patterns
  ) {
    detected.push(HCP_CUES.TIME_PRESSURE);
  }
  
  // ... more cue detection
  
  return detected;
}
```

**Key Observations:**
- ✅ Pattern matching for 10 cue types
- ✅ Returns array of detected cues
- ❌ Stateless (no persistence)
- ❌ No state transition rules
- ❌ Can detect contradictory cues ("curious" + "disengaged")

---

### **6. DYNAMIC CUE MANAGER**

**File:** `src/lib/dynamic-cue-manager.ts`

**Main Function (lines 1-205):**
```typescript
export interface ConversationContext {
  turnNumber: number;
  previousCues: string[]; // IDs of previously shown cues
  repPerformance: 'poor' | 'fair' | 'good' | 'excellent';
  hcpMood: 'improving' | 'stable' | 'declining';
}

export function selectDynamicCues(
  rawCues: BehavioralCue[],
  context: ConversationContext,
  repMetrics: RepMetricCue[]
): BehavioralCue[] {
  // Prevent immediate repetition
  // Adjust HCP mood based on rep performance
  // Select 2-3 cues per turn
  // ...
}
```

**Key Observations:**
- ✅ Prevents immediate cue repetition
- ✅ Tracks HCP mood (improving/stable/declining)
- ✅ Adjusts cue selection based on rep performance
- ❌ Does NOT enforce signal persistence ("stressed HCP stays stressed")
- ❌ Does NOT prevent contradictory signals
- ❌ Does NOT model realistic state transitions

---

### **7. HCP BEHAVIORAL STATE**

**File:** `src/lib/hcp-behavioral-state.ts`

**Main Function:**
```typescript
export function generateHCPBehavioralDescription(
  cues: ObservableCue[],
  messageContent: string
): {
  bodyLanguage: string[];
  vocalTone: string[];
  physicalCues: string[];
  overallDescription: string;
} {
  // Generate rich descriptions based on cues
  // ...
}
```

**Key Observations:**
- ✅ Generates rich behavioral descriptions
- ✅ Categorizes into body language, vocal tone, physical cues
- ✅ Creates overall description
- ❌ Does NOT track state over time
- ❌ Does NOT model state transitions
- ❌ Generates descriptions independently each turn

---

### **8. REP RESPONSE EVALUATOR**

**File:** `src/lib/rep-response-evaluator.ts`

**Main Function:**
```typescript
export function evaluateRepResponse(
  repMessage: string,
  prevHcpMessage: string | undefined,
  transcript: Transcript
): RepMetricCue[] {
  // Detect rep behaviors (acknowledgment, probing, etc.)
  // ...
}
```

**Key Observations:**
- ✅ Detects rep behaviors
- ✅ Used for dynamic cue selection
- ❌ Does NOT evaluate signal-response alignment
- ❌ Does NOT check if rep adapted to HCP signals

---

## **SIGNAL TIMING ISSUE (CONFIRMED)**

### **Current Flow:**
```
1. Rep types message: "Hi Dr Patel, could you share..."
2. Rep sends message
3. Worker generates HCP response: "Well, it all depends..."
4. Worker detects signals: [TIME_PRESSURE, LOW_ENGAGEMENT]
5. Frontend receives response + signals
6. Frontend displays HCP message in chat
7. Frontend displays signals BELOW HCP message
8. Rep sees signals for the FIRST TIME (too late!)
```

### **Problem:**
Rep cannot adapt to signals they haven't seen. By the time signals are visible, rep has already responded.

### **Desired Flow:**
```
1. Frontend displays HCP message: "Hi, what can I do for you?"
2. Frontend displays signals BEFORE input: [TIME_PRESSURE, LOW_ENGAGEMENT]
3. Rep sees signals and adapts: "I know you're busy, I'll be brief..."
4. Rep sends message
5. System evaluates: Did rep adapt to visible signals?
```

---

## **ALIGNMENT EVALUATION (MISSING)**

### **What's Missing:**
```typescript
// DOES NOT EXIST
function scoreSignalAlignment(
  transcript: Transcript,
  hcpSignals: ObservableCue[],
  turnIndex: number
): AlignmentResult {
  // Get signals BEFORE rep's response
  const priorSignals = getSignalsBeforeTurn(hcpSignals, turnIndex);
  
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

### **Impact:**
Rep can be pushy when HCP is stressed and still score well on:
- Question Quality (if questions are open-ended)
- Value Framing (if outcomes are mentioned)
- Conversation Control (if agenda is set)

No mechanism to detect misalignment.

---

## **CONTEXT-AWARE SCORING (MISSING)**

### **Current:**
```typescript
function scoreQuestionQuality(transcript: Transcript): ComponentResult[] {
  // Scores questions based on:
  // - Open-ended vs closed
  // - Probing depth
  // - Follow-up quality
  
  // ❌ DOES NOT CONSIDER:
  // - HCP's time pressure
  // - HCP's stress level
  // - HCP's engagement state
}
```

### **Needed:**
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

---

## **CROSS-METRIC LOGIC (MISSING)**

### **Current:**
Each metric is scored independently. No conditional checks across metrics.

### **Needed (from User's Rubric):**
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

**Example:**
If HCP shows concern:
- Expected: Acknowledgment (Objection Navigation) + Pacing adjustment (Conversation Control)
- If missing → Misalignment penalty

---

## **SIGNAL STATE PERSISTENCE (MISSING)**

### **Current:**
Signals are detected independently each turn. No state persistence.

### **Needed:**
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

---

## **SUMMARY: WHAT NEEDS TO BE BUILT**

### **Phase 1: Signal Timing Fix** (Quick Win)
1. Add `upcomingHCPSignals` state
2. Extract signals from HCP messages
3. Display signals BEFORE message input
4. Clear signals after rep responds

### **Phase 2: Signal State Persistence** (Critical)
1. Build `HCPSignalState` tracker
2. Implement state transition rules
3. Prevent signal drift
4. Model realistic progression

### **Phase 3: Alignment Engine** (Critical)
1. Create signal-to-behavior mapping
2. Build alignment computation
3. Integrate with scoring
4. Add alignment penalties/bonuses

### **Phase 4: Context-Aware Scoring** (High Priority)
1. Add `HCPSignalState` parameter to scoring functions
2. Implement context adjustments
3. Test with user scenarios

### **Phase 5: Cross-Metric Logic** (High Priority)
1. Build conditional evaluator
2. Implement multi-metric checks
3. Integrate alignment penalties/bonuses

---

## **CLOUDFLARE WORKER CONSTRAINTS**

### **What We CANNOT Change:**
- ❌ Worker API endpoints (`/api/roleplay/start`, `/api/roleplay/respond`, `/api/roleplay/end`)
- ❌ Worker response format
- ❌ Worker signal generation logic

### **What We CAN Change:**
- ✅ Frontend signal display timing
- ✅ Frontend scoring logic
- ✅ Frontend state management
- ✅ Frontend alignment evaluation

---

## **NEXT STEPS**

**Ready to proceed with Phase 1 implementation:**
1. Add `upcomingHCPSignals` state
2. Extract signals from HCP messages
3. Display signals BEFORE input
4. Clear signals after rep responds
5. Test functionality

**All changes will be frontend-only. No Worker modifications required.**

---

**AUDIT STATUS: ✅ COMPLETE**
**READY FOR PHASE 1 IMPLEMENTATION**
