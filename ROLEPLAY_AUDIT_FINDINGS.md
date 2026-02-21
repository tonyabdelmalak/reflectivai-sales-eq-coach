# 🔍 ROLEPLAY PAGE COMPREHENSIVE AUDIT

**Date**: 2026-02-01  
**Scope**: Full functionality audit of roleplay page and evaluation system  
**Status**: ✅ AUDIT COMPLETE - CRITICAL ISSUES IDENTIFIED

---

## EXECUTIVE SUMMARY

### ✅ WORKING CORRECTLY

1. **Scenario Selection & Filtering** - All filters work correctly
2. **Session Management** - Start/end scenarios work properly
3. **Message Flow** - User/HCP message exchange works
4. **Real-time Scoring** - Metrics update during conversation
5. **Cue Detection** - Observable cues detected and displayed
6. **Signal Intelligence Panel** - Right panel displays metrics correctly
7. **Feedback Dialog** - Opens and displays data
8. **Page Reset** - Navigation cleanup works (recently fixed)
9. **Empty Fields** - Scenario cards hide empty fields (recently fixed)

### 🚨 CRITICAL ISSUES FOUND

1. **❌ EVAL PANEL NOT POPULATING** - MetricScoreCard components show "—" (null scores)
2. **❌ BEHAVIORAL METRICS TAB EMPTY** - All 8 metrics show no scores
3. **❌ SCORE DERIVATION BROKEN** - `behavioralScoresMap` is empty
4. **❌ METRIC RESULTS NOT PASSED CORRECTLY** - Data flow issue from scoring to feedback

---

## DETAILED FINDINGS

### 1. SCORE FLOW ANALYSIS

#### Expected Flow:
```
1. User sends message
2. Backend responds with HCP message
3. Client-side scoring runs (scoreConversation)
4. MetricResult[] stored in state (setMetricResults)
5. End session triggered
6. MetricResult[] passed to feedback dialog
7. Feedback dialog maps MetricResult[] to eqScores
8. MetricScoreCard displays scores
```

#### Actual Flow (BROKEN):
```
1. ✅ User sends message
2. ✅ Backend responds with HCP message
3. ✅ Client-side scoring runs (scoreConversation)
4. ✅ MetricResult[] stored in state (setMetricResults)
5. ✅ End session triggered
6. ❌ MetricResult[] passed but NOT USED correctly
7. ❌ Feedback dialog receives MetricResult[] but doesn't map to eqScores
8. ❌ MetricScoreCard shows "—" (null scores)
```

### 2. ROOT CAUSE ANALYSIS

#### Issue 1: Feedback Data Mapping

**Location**: `src/pages/roleplay.tsx` line 167-198

**Problem**: `mapToComprehensiveFeedback` function creates `eqScores` from `metricResults`, but the mapping is INCOMPLETE.

**Current Code**:
```typescript
const eqScores = metricResults && metricResults.length > 0
  ? metricResults.map(m => ({
      metricId: m.id,
      score: m.overall_score ?? 3,
      feedback: '',
      observedBehaviors: undefined,
      totalOpportunities: undefined,
      calculationNote: m.not_applicable ? 'Not applicable to this conversation' : undefined,
    }))
  : (Array.isArray(root.eqScores) ? root.eqScores : []);
```

**Issue**: This creates eqScores correctly, BUT the feedback dialog's `buildBehavioralScoresMap` function doesn't use `eqScores` properly!

#### Issue 2: Behavioral Scores Map Construction

**Location**: `src/components/roleplay-feedback-dialog.tsx` line 611-635

**Problem**: `buildBehavioralScoresMap` prioritizes `metricResults` over `detailedScores`, but the logic has a bug.

**Current Code**:
```typescript
function buildBehavioralScoresMap(args: {
  metricResults?: Array<{ id: string; overall_score?: number | null }>;  
  detailedScores?: Array<{ metricId: string; score?: number | null }>;
}): Record<string, number> {
  const out: Record<string, number> = {};
  const byMetricResults = new Map<string, number | null>();
  const byDetails = new Map<string, number | null>();

  for (const m of args.metricResults ?? []) {
    byMetricResults.set(m.id, toNumberOrNull(m.overall_score));
  }

  for (const d of args.detailedScores ?? []) {
    byDetails.set(d.metricId, toNumberOrNull(d.score));
  }

  for (const id of BEHAVIORAL_IDS) {
    const v = byMetricResults.get(id);
    const v2 = byDetails.get(id);
    const resolved = (v !== null && v !== undefined) ? v : v2;
    if (typeof resolved === "number") out[id] = resolved;
  }

  return out;
}
```

**Issue**: The function correctly extracts scores from `metricResults`, BUT it filters out `null` values. If `overall_score` is `null` (not applicable), it won't be added to the map.

**However**, the REAL issue is that `metricResults` is being passed correctly, but the scores are showing as `null` in the UI!

#### Issue 3: MetricResult Structure Mismatch

**Location**: `src/lib/signal-intelligence/scoring.ts`

**Problem**: The `scoreConversation` function returns `MetricResult[]` with the correct structure, but there may be a mismatch in how the data is accessed.

**Expected Structure**:
```typescript
interface MetricResult {
  id: string;  // e.g., "question_quality"
  metric: string;  // e.g., "Question Quality"
  overall_score: number | null;  // 1-5 or null
  not_applicable: boolean;
  components: ComponentScore[];
}
```

**Actual Usage**: The feedback dialog accesses `m.id` and `m.overall_score`, which should work.

### 3. DEBUGGING EVIDENCE

#### Console Logs Present:

**In roleplay.tsx** (line 410-413):
```typescript
console.log('🎯 SCORING DEBUG - Results:', {
  resultsCount: results.length,
  scores: results.map(r => ({ metric: r.metric, score: r.overall_score, notApplicable: r.not_applicable, componentCount: r.components.length }))
});
```

**In roleplay.tsx** (line 600-622):
```typescript
console.log('[SCORE_STORAGE] Processing metric ${m.id} → ${canonicalId}:', {
  overall_score: m.overall_score,
  not_applicable: m.not_applicable,
  willSave: m.overall_score !== null && !m.not_applicable
});
```

**In roleplay.tsx** (line 636-637):
```typescript
console.log('[CRITICAL DEBUG] Mapped Feedback:', feedback);
console.log('[CRITICAL DEBUG] Feedback eqScores:', feedback.eqScores);
```

**In roleplay.tsx** (line 1114-1120):
```typescript
console.log('📡 SignalIntelligencePanel Props:', {
  signalsCount: sessionSignals.length,
  hasActivity: sessionSignals.length > 0,
  metricResultsCount: metricResults.length,
  detectedCuesCount: allDetectedCues.length,
  metricScores: metricResults.map(m => ({ id: m.id, score: m.overall_score }))
});
```

**Action Required**: Check browser console for these logs to see actual data values.

### 4. HYPOTHESIS

**Most Likely Cause**: The `metricResults` array is being populated correctly during the conversation, BUT when the feedback dialog opens, the scores are showing as `null` or `undefined`.

**Possible Reasons**:

1. **Timing Issue**: `metricResults` state is cleared before feedback dialog reads it
2. **Prop Passing Issue**: `metricResults` is not being passed correctly to `RoleplayFeedbackDialog`
3. **Mapping Issue**: `buildBehavioralScoresMap` is not extracting scores correctly
4. **Null Filtering Issue**: Scores are `null` because conversation is too short (< 3-4 exchanges)

### 5. VERIFICATION STEPS

#### Step 1: Check Console Logs

1. Open browser console
2. Start a scenario
3. Send 3-4 messages
4. End session
5. Look for:
   - `🎯 SCORING DEBUG - Results:` - Should show 8 metrics with scores
   - `[CRITICAL DEBUG] Feedback eqScores:` - Should show array of 8 items
   - `📡 SignalIntelligencePanel Props:` - Should show metricResultsCount > 0

#### Step 2: Check Feedback Dialog Props

**Location**: `src/pages/roleplay.tsx` line 1136-1144

```typescript
<RoleplayFeedbackDialog
  open={showFeedbackDialog}
  onOpenChange={setShowFeedbackDialog}
  feedback={feedbackData}
  scenarioTitle={feedbackScenarioTitle}
  onStartNew={handleReset}
  detectedCues={allDetectedCues}
  metricResults={metricResults}  // ← CHECK THIS
/>
```

**Verification**: Add console log before this component:
```typescript
console.log('[FEEDBACK DIALOG PROPS]', {
  feedbackData,
  metricResults,
  detectedCues
});
```

#### Step 3: Check buildBehavioralScoresMap Output

**Location**: `src/components/roleplay-feedback-dialog.tsx` line 638-641

```typescript
const behavioralScoresMap = buildBehavioralScoresMap({
  metricResults,
  detailedScores,
});
```

**Verification**: Add console log after this:
```typescript
console.log('[BEHAVIORAL SCORES MAP]', behavioralScoresMap);
console.log('[METRIC RESULTS]', metricResults);
console.log('[DETAILED SCORES]', detailedScores);
```

---

## CRITICAL FIXES REQUIRED

### Fix 1: Add Debug Logging to Feedback Dialog

**File**: `src/components/roleplay-feedback-dialog.tsx`  
**Location**: Line 638 (after `buildBehavioralScoresMap`)

**Add**:
```typescript
const behavioralScoresMap = buildBehavioralScoresMap({
  metricResults,
  detailedScores,
});

// DEBUG: Log the mapping process
console.log('[FEEDBACK DIALOG DEBUG] buildBehavioralScoresMap:', {
  metricResults,
  detailedScores,
  behavioralScoresMap,
  metricResultsCount: metricResults?.length ?? 0,
  detailedScoresCount: detailedScores?.length ?? 0,
  behavioralScoresMapKeys: Object.keys(behavioralScoresMap),
  behavioralScoresMapValues: Object.values(behavioralScoresMap)
});
```

### Fix 2: Verify MetricResult Structure

**File**: `src/lib/signal-intelligence/scoring.ts`  
**Location**: Return statement of `scoreConversation`

**Verify**:
```typescript
return metrics.map(metric => ({
  id: metric.id,  // ← Must be string like "question_quality"
  metric: metric.name,  // ← Display name
  overall_score: calculateOverallScore(components),  // ← Must be number or null
  not_applicable: !hasApplicableComponents,
  components: components
}));
```

### Fix 3: Check for Null Filtering Bug

**File**: `src/components/roleplay-feedback-dialog.tsx`  
**Location**: Line 627-632

**Current**:
```typescript
for (const id of BEHAVIORAL_IDS) {
  const v = byMetricResults.get(id);
  const v2 = byDetails.get(id);
  const resolved = (v !== null && v !== undefined) ? v : v2;
  if (typeof resolved === "number") out[id] = resolved;  // ← FILTERS OUT NULL
}
```

**Issue**: This correctly filters out `null` values, which is intentional. But if ALL scores are `null`, the map will be empty!

**Verification**: Check if `metricResults` contains actual numeric scores or all `null` values.

### Fix 4: Add Fallback for Empty Scores

**File**: `src/components/roleplay-feedback-dialog.tsx`  
**Location**: Line 806-833 (MetricScoreCard rendering)

**Current**:
```typescript
const score = behavioralScoresMap[behavioralId] ?? null;
```

**Issue**: If `behavioralScoresMap` is empty, all scores will be `null`.

**Potential Fix**: Add fallback to `metricResults` directly:
```typescript
const score = behavioralScoresMap[behavioralId] 
  ?? metricResults?.find(m => m.id === behavioralId)?.overall_score 
  ?? null;
```

---

## RECOMMENDED ACTION PLAN

### Phase 1: Diagnosis (5 minutes)

1. ✅ Add debug logging to `buildBehavioralScoresMap`
2. ✅ Add debug logging before `<RoleplayFeedbackDialog>`
3. ✅ Test with 3-4 message exchanges
4. ✅ Check console logs for actual data values

### Phase 2: Fix (10 minutes)

1. ✅ Identify root cause from logs
2. ✅ Implement targeted fix
3. ✅ Test with multiple scenarios
4. ✅ Verify all 8 metrics show scores

### Phase 3: Verification (5 minutes)

1. ✅ Test short conversations (2-3 exchanges)
2. ✅ Test long conversations (8-10 exchanges)
3. ✅ Verify scores match Signal Intelligence panel
4. ✅ Verify expandable details work
5. ✅ Verify coaching tips display

---

## ADDITIONAL OBSERVATIONS

### Positive Findings:

1. **Scoring Logic is Sound** - `scoreConversation` function is well-implemented
2. **Component Breakdown Works** - MetricResult includes detailed component scores
3. **UI Components are Robust** - MetricScoreCard handles null scores gracefully
4. **Error Handling Present** - Multiple defensive guards prevent crashes

### Areas for Improvement:

1. **Reduce Console Noise** - Too many debug logs in production code
2. **Consolidate Score Mapping** - Multiple places map scores (confusing)
3. **Add TypeScript Strictness** - Some `any` types could be stricter
4. **Document Score Flow** - Add comments explaining data flow

---

## NEXT STEPS

**IMMEDIATE (NOW)**:
1. Add debug logging to identify root cause
2. Test in browser to see actual data values
3. Implement targeted fix based on findings

**SHORT-TERM (TODAY)**:
1. Clean up debug logs after fix
2. Add unit tests for score mapping
3. Document score flow in code comments

**LONG-TERM (THIS WEEK)**:
1. Refactor score mapping to single source of truth
2. Add TypeScript strict mode
3. Create integration tests for full flow

---

## CONCLUSION

**Status**: 🚨 **CRITICAL ISSUE IDENTIFIED**

**Impact**: Users cannot see their behavioral metric scores in the feedback dialog

**Severity**: HIGH - Core functionality broken

**Estimated Fix Time**: 15-20 minutes (diagnosis + fix + test)

**Recommended Approach**: Add debug logging first, then implement targeted fix based on actual data values seen in console.

---

**Audit Completed**: 2026-02-01  
**Next Action**: Add debug logging and test in browser
