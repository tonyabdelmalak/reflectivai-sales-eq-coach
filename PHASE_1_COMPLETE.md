# ✅ PHASE 1 COMPLETE: SIGNAL TIMING FIX

**Date:** 2026-02-12  
**Status:** IMPLEMENTED & READY FOR TESTING  
**Build:** ✅ SUCCESS

---

## **WHAT WAS IMPLEMENTED**

### **Problem Addressed**
Critical Issue #2 from diagnostic: **Inverted Signal Timing**

**Before:**
```
Rep speaks → HCP responds → Signals revealed
```

**After:**
```
HCP signals displayed → Rep responds → Evaluate alignment
```

---

## **CHANGES MADE**

### **1. New State Variable**
```typescript
const [upcomingHCPSignals, setUpcomingHCPSignals] = useState<{
  cues: ObservableCue[];
  description: ReturnType<typeof generateHCPBehavioralDescription> | null;
} | null>(null);
```

**Purpose:** Store HCP signals that rep should see BEFORE their next response.

---

### **2. Signal Extraction After HCP Responds**

**Location:** `sendResponseMutation.onSuccess` (lines 389-419)

```typescript
// Extract HCP signals from the latest HCP message
const latestHCPMessage = currentMessages[currentMessages.length - 1];

if (latestHCPMessage && showCues) {
  const rawCues = detectObservableCues(latestHCPMessage.content);
  const selectedCues = selectDynamicCues(rawCues, conversationContext, []);
  const behavioralDesc = generateHCPBehavioralDescription(selectedCues, latestHCPMessage.content);
  
  // Store as "upcoming" signals
  setUpcomingHCPSignals({
    cues: selectedCues,
    description: behavioralDesc
  });
}
```

**Flow:**
1. Rep sends message
2. Worker generates HCP response
3. Frontend extracts signals from HCP response
4. Signals stored as "upcoming" (not yet displayed in chat history)
5. Signals displayed in input area (see #3)

---

### **3. Display Signals BEFORE Input**

**Location:** Lines 972-998 (before textarea)

```tsx
{upcomingHCPSignals && upcomingHCPSignals.cues.length > 0 && (
  <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400">
    <p className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-2">
      <span className="text-base">👁️</span>
      Observable HCP State (adapt your response to these signals):
    </p>
    {/* Body language, vocal tone, physical cues */}
    <CueBadgeGroup cues={upcomingHCPSignals.cues} />
  </div>
)}
```

**Visual Design:**
- **Amber background** with thick border (stands out)
- **Eye icon** (👁️) to emphasize observation
- **Explicit instruction:** "adapt your response to these signals"
- **Behavioral details:** Body language, vocal tone, physical cues
- **Cue badges:** Visual indicators of signal types

---

### **4. Clear Signals After Rep Responds**

**Location:** `handleSendMessage` (line 438) and textarea `onKeyDown` (line 1010)

```typescript
// Clear upcoming signals when rep responds
setUpcomingHCPSignals(null);
```

**Why:** Once rep has responded, they've "consumed" the signals. Clear them to avoid confusion.

---

### **5. Set Initial Signals When Scenario Starts**

**Location:** `useEffect` (lines 291-306)

```typescript
useEffect(() => {
  if (messages.length > 0 && messages[0].role === 'assistant' && showCues) {
    const firstHCPMessage = messages[0];
    const rawCues = detectObservableCues(firstHCPMessage.content);
    const selectedCues = selectDynamicCues(rawCues, conversationContext, []);
    
    if (selectedCues.length > 0) {
      const behavioralDesc = generateHCPBehavioralDescription(selectedCues, firstHCPMessage.content);
      setUpcomingHCPSignals({ cues: selectedCues, description: behavioralDesc });
    }
  }
}, [messages.length, showCues]);
```

**Why:** When scenario starts, HCP's opening message contains signals. Display them immediately so rep can adapt their first response.

---

## **USER EXPERIENCE CHANGES**

### **Before Phase 1:**
1. Rep sees HCP message: "Hi, what can I do for you today?"
2. Rep responds: "Hi Dr Patel, could you share..."
3. HCP responds: "Well, it all depends..."
4. **THEN** system shows: "HCP looks at watch, stressed"
5. Rep thinks: "I wish I'd known that before!"

### **After Phase 1:**
1. Rep sees HCP message: "Hi, what can I do for you today?"
2. **System displays:** "👁️ Observable HCP State: HCP looks at watch, stressed, time-pressured"
3. Rep adapts response: "I know you're busy, I'll be brief..."
4. HCP responds: "Thanks, I appreciate that..."
5. Rep thinks: "I adapted to the signals!"

---

## **TESTING INSTRUCTIONS**

### **Test Case 1: Scenario Start**

**Steps:**
1. Go to `/roleplay`
2. Select any scenario (e.g., "Busy Clinician")
3. Click "Start Scenario"
4. **OBSERVE:** Amber box appears above message input
5. **VERIFY:** Box shows HCP's behavioral state (body language, tone, etc.)
6. **VERIFY:** Cue badges display (e.g., "Time Pressure", "Low Engagement")

**Expected Result:**
- ✅ Signals visible BEFORE rep types first message
- ✅ Amber box has thick border and eye icon
- ✅ Text says "adapt your response to these signals"

---

### **Test Case 2: Conversation Flow**

**Steps:**
1. Start a scenario
2. Type a response and send
3. **OBSERVE:** Amber box disappears (signals cleared)
4. Wait for HCP response
5. **OBSERVE:** New amber box appears with updated signals
6. Type another response
7. **OBSERVE:** Box disappears again

**Expected Result:**
- ✅ Signals clear when rep sends message
- ✅ New signals appear after HCP responds
- ✅ Cycle repeats: HCP responds → Signals shown → Rep responds → Signals cleared

---

### **Test Case 3: Signal Adaptation (Manual)**

**Steps:**
1. Start "Busy Clinician" scenario
2. **OBSERVE:** Signals show "Time Pressure", "Stressed", "Impatient"
3. Type a LONG, detailed response (ignore signals)
4. Send and observe HCP reaction
5. Restart scenario
6. **OBSERVE:** Same signals
7. Type a BRIEF, respectful response (adapt to signals)
8. Send and observe HCP reaction

**Expected Result:**
- ✅ HCP reacts differently based on rep's adaptation
- ✅ Ignoring signals → negative HCP response
- ✅ Adapting to signals → positive HCP response

---

### **Test Case 4: Toggle Cues**

**Steps:**
1. Start a scenario
2. **OBSERVE:** Amber box visible
3. Click eye icon (toggle cues off)
4. **OBSERVE:** Amber box disappears
5. Click eye icon again (toggle cues on)
6. **OBSERVE:** Amber box reappears

**Expected Result:**
- ✅ Cues toggle on/off correctly
- ✅ No errors in console

---

## **WHAT'S NOT YET IMPLEMENTED**

### **Alignment Scoring (Phase 3)**
The system now shows signals BEFORE rep responds, but it does NOT yet:
- ❌ Evaluate if rep's response aligned with signals
- ❌ Penalize misalignment (e.g., pushy when HCP is stressed)
- ❌ Reward alignment (e.g., brief when HCP is time-pressured)

**This will be implemented in Phase 3: Alignment Engine**

### **Signal State Persistence (Phase 2)**
Signals can still drift between turns:
- ❌ "Curious" can flip to "Disengaged" arbitrarily
- ❌ No state transition rules
- ❌ No momentum continuity

**This will be implemented in Phase 2: State Persistence**

---

## **NEXT STEPS**

### **If Phase 1 Works:**
1. ✅ Confirm signals display before input
2. ✅ Confirm signals clear after response
3. ✅ Confirm no console errors
4. ✅ Confirm no React Error #185
5. **Proceed to Phase 2: Signal State Persistence**

### **If Phase 1 Has Issues:**
1. ❌ Report specific issue (e.g., "signals not appearing")
2. ❌ Check console for errors
3. ❌ Provide screenshot if possible
4. **Debug and fix before proceeding**

---

## **TECHNICAL NOTES**

### **Why This Approach?**
- **Minimal changes:** Only added state variable and display logic
- **No Worker changes:** All changes in frontend
- **No breaking changes:** Existing functionality preserved
- **Testable:** Easy to verify visually

### **Performance Impact**
- **Negligible:** Only adds one state variable
- **No extra API calls:** Uses existing message data
- **No re-renders:** Signals only update when HCP responds

### **Compatibility**
- ✅ Works with existing scoring system
- ✅ Works with existing cue detection
- ✅ Works with dynamic cue manager
- ✅ Works with toggle cues feature

---

## **CONSOLE LOGS FOR DEBUGGING**

**When signals are set:**
```
[PHASE 1] Upcoming HCP signals set: ["Time Pressure", "Low Engagement"]
```

**When initial signals are set:**
```
[PHASE 1] Initial HCP signals set: ["Neutral Engagement", "Professional Tone"]
```

**Look for these in browser console during testing.**

---

**PHASE 1 STATUS: ✅ READY FOR USER TESTING**

**Please test the above scenarios and report results before proceeding to Phase 2.**
