# 🧪 ROLEPLAY EVAL PANEL TESTING GUIDE

**Purpose**: Diagnose why behavioral metrics show "—" (null scores) in feedback dialog  
**Date**: 2026-02-01  
**Status**: 🔍 DIAGNOSIS MODE - Debug logging added

---

## QUICK START

### Step 1: Open Browser Console

1. Navigate to: https://reflectivai-app-prod.pages.dev/roleplay
2. Open browser console: `F12` or `Ctrl + Shift + I`
3. Clear console: Click "Clear console" button

### Step 2: Run Test Scenario

1. **Select any scenario** (e.g., "Oncology - Resistant Oncologist")
2. **Click "Start Scenario"**
3. **Send 3-4 messages** (any content is fine)
   - Example: "Hello doctor"
   - Example: "I'd like to discuss treatment options"
   - Example: "What are your concerns?"
   - Example: "Let me share some data"
4. **Click "End Session"**
5. **Feedback dialog opens**
6. **Check console logs**

### Step 3: Analyze Console Output

**Look for these specific log entries**:

#### Log 1: Scoring Results (During Conversation)
```
🎯 SCORING DEBUG - Results:
{
  resultsCount: 8,
  scores: [
    { metric: "Question Quality", score: 3.2, notApplicable: false, componentCount: 4 },
    { metric: "Listening Responsiveness", score: 2.8, notApplicable: false, componentCount: 3 },
    ...
  ]
}
```

**✅ EXPECTED**: `resultsCount: 8`, all scores are numbers (not null)  
**❌ PROBLEM**: `resultsCount: 0` OR all scores are `null`

#### Log 2: Feedback Dialog Props (When Dialog Opens)
```
[FEEDBACK DIALOG PROPS] About to render RoleplayFeedbackDialog:
{
  showFeedbackDialog: true,
  feedbackData: { overallScore: 3, eqScores: [...], ... },
  metricResults: [
    { id: "question_quality", overall_score: 3.2, not_applicable: false, ... },
    { id: "listening_responsiveness", overall_score: 2.8, not_applicable: false, ... },
    ...
  ],
  metricResultsCount: 8,
  metricScores: [
    { id: "question_quality", score: 3.2, notApplicable: false },
    { id: "listening_responsiveness", score: 2.8, notApplicable: false },
    ...
  ]
}
```

**✅ EXPECTED**: `metricResultsCount: 8`, all scores are numbers  
**❌ PROBLEM**: `metricResultsCount: 0` OR all scores are `null`

#### Log 3: Behavioral Scores Map (Inside Dialog)
```
[FEEDBACK DIALOG DEBUG] buildBehavioralScoresMap:
{
  metricResults: [ ... ],  // Should have 8 items
  detailedScores: [ ... ],  // Should have 8 items
  behavioralScoresMap: {
    question_quality: 3.2,
    listening_responsiveness: 2.8,
    making_it_matter: 3.5,
    customer_engagement_signals: 3.0,
    objection_navigation: 2.5,
    conversation_control_structure: 3.8,
    commitment_gaining: 2.9,
    adaptability: 3.1
  },
  metricResultsCount: 8,
  detailedScoresCount: 8,
  behavioralScoresMapKeys: ["question_quality", "listening_responsiveness", ...],
  behavioralScoresMapValues: [3.2, 2.8, 3.5, ...],
  BEHAVIORAL_IDS: ["question_quality", "listening_responsiveness", ...]
}
```

**✅ EXPECTED**: `behavioralScoresMap` has 8 keys with numeric values  
**❌ PROBLEM**: `behavioralScoresMap` is empty `{}`

---

## DIAGNOSIS SCENARIOS

### Scenario A: Empty metricResults

**Symptoms**:
- Log 1 shows `resultsCount: 0`
- Log 2 shows `metricResultsCount: 0`
- Log 3 shows `behavioralScoresMap: {}`

**Root Cause**: Scoring function not running or returning empty array

**Fix**: Check `scoreConversation` function in `src/lib/signal-intelligence/scoring.ts`

### Scenario B: Null Scores

**Symptoms**:
- Log 1 shows `resultsCount: 8` but all scores are `null`
- Log 2 shows `metricResultsCount: 8` but all scores are `null`
- Log 3 shows `behavioralScoresMap: {}`

**Root Cause**: Conversation too short (< 3-4 exchanges) OR scoring logic returning null

**Fix**: Ensure at least 3-4 message exchanges OR adjust scoring thresholds

### Scenario C: Scores Present but Not Mapped

**Symptoms**:
- Log 1 shows `resultsCount: 8` with numeric scores
- Log 2 shows `metricResultsCount: 8` with numeric scores
- Log 3 shows `behavioralScoresMap: {}` (EMPTY!)

**Root Cause**: `buildBehavioralScoresMap` function has a bug

**Fix**: Check mapping logic in `src/components/roleplay-feedback-dialog.tsx` line 611-635

### Scenario D: ID Mismatch

**Symptoms**:
- Log 1 shows scores with IDs like `"questionQuality"` (camelCase)
- Log 3 shows `BEHAVIORAL_IDS` with `"question_quality"` (snake_case)
- Log 3 shows `behavioralScoresMap: {}` (EMPTY!)

**Root Cause**: Metric ID format mismatch (camelCase vs snake_case)

**Fix**: Normalize IDs to snake_case in scoring function

---

## EXPECTED BEHAVIOR

### Correct Console Output

**After sending 3-4 messages and ending session**:

```
🎯 SCORING DEBUG - Results:
{
  resultsCount: 8,
  scores: [
    { metric: "Question Quality", score: 3.2, notApplicable: false, componentCount: 4 },
    { metric: "Listening Responsiveness", score: 2.8, notApplicable: false, componentCount: 3 },
    { metric: "Making It Matter", score: 3.5, notApplicable: false, componentCount: 5 },
    { metric: "Customer Engagement Signals", score: 3.0, notApplicable: false, componentCount: 4 },
    { metric: "Objection Navigation", score: 2.5, notApplicable: false, componentCount: 3 },
    { metric: "Conversation Control Structure", score: 3.8, notApplicable: false, componentCount: 4 },
    { metric: "Commitment Gaining", score: 2.9, notApplicable: false, componentCount: 3 },
    { metric: "Adaptability", score: 3.1, notApplicable: false, componentCount: 4 }
  ]
}

[FEEDBACK DIALOG PROPS] About to render RoleplayFeedbackDialog:
{
  showFeedbackDialog: true,
  metricResultsCount: 8,
  metricScores: [
    { id: "question_quality", score: 3.2, notApplicable: false },
    { id: "listening_responsiveness", score: 2.8, notApplicable: false },
    { id: "making_it_matter", score: 3.5, notApplicable: false },
    { id: "customer_engagement_signals", score: 3.0, notApplicable: false },
    { id: "objection_navigation", score: 2.5, notApplicable: false },
    { id: "conversation_control_structure", score: 3.8, notApplicable: false },
    { id: "commitment_gaining", score: 2.9, notApplicable: false },
    { id: "adaptability", score: 3.1, notApplicable: false }
  ]
}

[FEEDBACK DIALOG DEBUG] buildBehavioralScoresMap:
{
  metricResultsCount: 8,
  detailedScoresCount: 8,
  behavioralScoresMap: {
    question_quality: 3.2,
    listening_responsiveness: 2.8,
    making_it_matter: 3.5,
    customer_engagement_signals: 3.0,
    objection_navigation: 2.5,
    conversation_control_structure: 3.8,
    commitment_gaining: 2.9,
    adaptability: 3.1
  },
  behavioralScoresMapKeys: [
    "question_quality",
    "listening_responsiveness",
    "making_it_matter",
    "customer_engagement_signals",
    "objection_navigation",
    "conversation_control_structure",
    "commitment_gaining",
    "adaptability"
  ],
  behavioralScoresMapValues: [3.2, 2.8, 3.5, 3.0, 2.5, 3.8, 2.9, 3.1]
}
```

### Correct UI Behavior

**In Feedback Dialog**:

1. **Behavioral Metrics Tab** shows 8 metrics
2. **Each metric card** shows:
   - Metric name (e.g., "Question Quality")
   - Score (e.g., "3.2/5") - NOT "—"
   - Progress bar (filled proportionally)
3. **Click any metric** to expand:
   - Definition
   - Scoring formula
   - Component breakdown table
   - Observable indicators
   - Coaching tips

---

## TROUBLESHOOTING

### Issue: No Console Logs Appear

**Cause**: Console filter may be hiding logs

**Fix**:
1. Check console filter (top of console)
2. Ensure "All levels" is selected
3. Ensure no text filter is active
4. Try refreshing page

### Issue: Logs Show "undefined"

**Cause**: Variables not in scope or timing issue

**Fix**:
1. Check if logs appear AFTER clicking "End Session"
2. Verify feedback dialog is actually open
3. Check for JavaScript errors above the logs

### Issue: Scores Are All Null

**Cause**: Conversation too short

**Fix**:
1. Send at least 4 messages (2 exchanges)
2. Ensure messages have substance (not just "hi")
3. Check if scoring requires minimum conversation length

### Issue: behavioralScoresMap is Empty

**Cause**: ID mismatch or mapping bug

**Fix**:
1. Compare `metricResults[0].id` with `BEHAVIORAL_IDS[0]`
2. Check if IDs match exactly (case-sensitive)
3. Verify `buildBehavioralScoresMap` logic

---

## NEXT STEPS AFTER TESTING

### If Scenario A (Empty metricResults)

1. Check `scoreConversation` function
2. Verify it's being called
3. Check if it returns empty array
4. Add logging inside `scoreConversation`

### If Scenario B (Null Scores)

1. Increase message count to 5-6
2. Check scoring thresholds
3. Verify component scoring logic
4. Check if `not_applicable` is set incorrectly

### If Scenario C (Scores Not Mapped)

1. Fix `buildBehavioralScoresMap` function
2. Verify ID matching logic
3. Check null filtering logic
4. Add fallback to `metricResults` directly

### If Scenario D (ID Mismatch)

1. Normalize IDs in `scoreConversation`
2. Use snake_case consistently
3. Add ID mapping if needed
4. Update `BEHAVIORAL_IDS` constant

---

## REPORTING RESULTS

**Please provide**:

1. **Screenshot of console logs** (all 3 log entries)
2. **Screenshot of feedback dialog** (Behavioral Metrics tab)
3. **Scenario used** (which scenario did you test?)
4. **Message count** (how many messages did you send?)
5. **Which diagnosis scenario** matches your output (A, B, C, or D)

**Send to**: Development team or paste in issue tracker

---

## SUMMARY

**Goal**: Identify why behavioral metrics show "—" instead of scores

**Method**: Add debug logging to trace data flow

**Expected**: 8 metrics with numeric scores in feedback dialog

**Current**: All metrics show "—" (null scores)

**Action**: Run test scenario and analyze console logs

**Timeline**: 5-10 minutes for testing + diagnosis

---

**Testing Guide Version**: 1.0  
**Last Updated**: 2026-02-01  
**Status**: 🔍 Ready for Testing
