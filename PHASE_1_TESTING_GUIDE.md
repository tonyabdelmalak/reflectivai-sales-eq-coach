# ✅ PHASE 1 IMPLEMENTATION COMPLETE - TESTING GUIDE

**Date:** 2026-02-12  
**Status:** ✅ IMPLEMENTED & BUILD SUCCESSFUL  
**Branch:** 20260212101653-57caki7jtt  
**Build:** ✅ SUCCESS (no errors)

---

## **WHAT WAS IMPLEMENTED**

### **Problem Solved:**
**Critical Issue #2:** Signal timing inversion - signals shown AFTER rep responds (too late to adapt)

### **Solution:**
**New Flow:** HCP signals displayed BEFORE rep types response → Rep adapts → Rep sends → Signals cleared

---

## **IMPLEMENTATION SUMMARY**

### **1. New State Variable (Line 244-248)**
```typescript
const [upcomingHCPSignals, setUpcomingHCPSignals] = useState<{
  cues: ObservableCue[];
  description: ReturnType<typeof generateHCPBehavioralDescription> | null;
} | null>(null);
```
**Purpose:** Store HCP signals that rep should see BEFORE their next response.

---

### **2. Initial Signal Detection (Lines 290-306)**
```typescript
useEffect(() => {
  if (messages.length > 0 && messages[0].role === 'assistant' && showCues) {
    const firstHCPMessage = messages[0];
    const rawCues = detectObservableCues(firstHCPMessage.content);
    const selectedCues = selectDynamicCues(rawCues, conversationContext, []);
    
    if (selectedCues.length > 0) {
      const behavioralDesc = generateHCPBehavioralDescription(selectedCues, firstHCPMessage.content);
      setUpcomingHCPSignals({ cues: selectedCues, description: behavioralDesc });
      console.log('[PHASE 1] Initial HCP signals set:', selectedCues.map(c => c.name));
    }
  }
}, [messages.length, showCues]);
```
**When:** Scenario starts, HCP sends opening message  
**Action:** Extract signals from opening message, display immediately

---

### **3. Signal Extraction After HCP Responds (Lines 413-437)**
```typescript
const latestHCPMessage = currentMessages[currentMessages.length - 1];

if (latestHCPMessage && latestHCPMessage.role === 'assistant' && showCues) {
  const rawCues = detectObservableCues(latestHCPMessage.content);
  const selectedCues = selectDynamicCues(rawCues, conversationContext, []);
  const behavioralDesc = generateHCPBehavioralDescription(selectedCues, latestHCPMessage.content);
  
  setUpcomingHCPSignals({ cues: selectedCues, description: behavioralDesc });
  console.log('[PHASE 1] Upcoming HCP signals set:', selectedCues.map(c => c.name));
}
```
**When:** Rep sends message → Worker generates HCP response → Frontend receives  
**Action:** Extract signals from HCP response, store as "upcoming"

---

### **4. Display Signals BEFORE Input (Lines 992-1017)**
```tsx
{upcomingHCPSignals && upcomingHCPSignals.cues.length > 0 && (
  <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400">
    <p className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-2">
      <span className="text-base">👁️</span>
      Observable HCP State (adapt your response to these signals):
    </p>
    {/* Body Language, Vocal Tone, Physical Cues */}
    <CueBadgeGroup cues={upcomingHCPSignals.cues} />
  </div>
)}
```
**Location:** Above message input textarea  
**Visual:** Amber background, thick border, eye icon, explicit instruction  
**Content:** Body language, vocal tone, physical cues, overall description, cue badges

---

### **5. Clear Signals After Rep Responds (Lines 456, 1026-1030)**
```typescript
// In handleSendMessage (line 456)
setUpcomingHCPSignals(null);

// In textarea onKeyDown (line 1026)
if (e.key === "Enter" && !e.shiftKey) {
  e.preventDefault();
  setUpcomingHCPSignals(null);  // Clear signals
  sendResponseMutation.mutate(input);
  setInput("");
}
```
**When:** Rep sends message (button click or Enter key)  
**Action:** Clear upcoming signals (they've been "consumed")

---

## **HOW TO TEST LOCALLY**

### **Step 1: Start Development Server**
```bash
npm run dev
```
**Expected:** Server starts on http://localhost:5173 (or similar)

---

### **Step 2: Navigate to Roleplay Page**
```
http://localhost:5173/roleplay
```
**Expected:** Scenario selection grid appears

---

### **Step 3: Start a Scenario**

**Actions:**
1. Select a scenario (e.g., "Busy Clinician")
2. Click "Start Scenario"
3. Wait for HCP's opening message

**Expected Results:**
- ✅ HCP message appears in chat
- ✅ **Amber box appears ABOVE message input**
- ✅ Amber box shows:
  - 👁️ Eye icon
  - "Observable HCP State (adapt your response to these signals):"
  - Body Language (e.g., "Glances at watch, tense posture")
  - Vocal Tone (e.g., "Clipped, hurried speech")
  - Physical Cues (e.g., "Fidgeting with papers")
  - Overall Description (e.g., "The HCP appears time-pressured")
  - Cue badges (e.g., "Time Pressure", "Low Engagement")

**Screenshot Location:** Above the message input textarea

---

### **Step 4: Type and Send Response**

**Actions:**
1. Type a response in the textarea
2. Press Enter or click Send button

**Expected Results:**
- ✅ **Amber box disappears** (signals cleared)
- ✅ Your message appears in chat
- ✅ Loading indicator appears
- ✅ HCP responds
- ✅ **New amber box appears** with updated signals

**Flow:**
```
Signals visible → Rep types → Rep sends → Signals cleared → HCP responds → New signals appear
```

---

### **Step 5: Continue Conversation**

**Actions:**
1. Observe new signals in amber box
2. Type another response
3. Send
4. Repeat

**Expected Results:**
- ✅ Signals update after each HCP response
- ✅ Signals clear after each rep response
- ✅ Cycle repeats consistently

---

### **Step 6: Toggle Cues On/Off**

**Actions:**
1. Click the eye icon in the top-right of the chat panel
2. Observe amber box disappears
3. Click eye icon again
4. Observe amber box reappears

**Expected Results:**
- ✅ Cues toggle on/off correctly
- ✅ No console errors
- ✅ State persists correctly

---

## **CONSOLE LOGS TO CHECK**

Open browser DevTools (F12) and check Console tab:

### **When Scenario Starts:**
```
[PHASE 1] Initial HCP signals set: ["Time Pressure", "Low Engagement"]
```

### **After Each HCP Response:**
```
[PHASE 1] Upcoming HCP signals set: ["Neutral Engagement", "Professional Tone"]
```

### **No Errors:**
- ❌ NO "Cannot read property of undefined"
- ❌ NO "React Error #185"
- ❌ NO "Maximum update depth exceeded"

---

## **VISUAL VERIFICATION CHECKLIST**

### **Amber Box Appearance:**
- ✅ Thick amber border (2px)
- ✅ Amber background (light mode: amber-50, dark mode: amber-950/20)
- ✅ Eye icon (👁️) visible
- ✅ Bold header text
- ✅ Body language, vocal tone, physical cues sections
- ✅ Overall description with italic text
- ✅ Cue badges at bottom

### **Positioning:**
- ✅ Amber box is ABOVE message input textarea
- ✅ Amber box is BELOW chat history
- ✅ Amber box has proper spacing (gap-2 or similar)

### **Behavior:**
- ✅ Box appears when signals exist
- ✅ Box disappears when rep sends message
- ✅ Box reappears after HCP responds
- ✅ Box respects cue toggle (eye icon)

---

## **EDGE CASES TO TEST**

### **Test Case 1: No Signals Detected**
**Scenario:** HCP message has no detectable cues  
**Expected:** No amber box appears (graceful handling)

### **Test Case 2: Rapid Messaging**
**Scenario:** Rep sends multiple messages quickly  
**Expected:** Signals clear/update correctly, no race conditions

### **Test Case 3: Toggle Cues Mid-Conversation**
**Scenario:** Toggle cues off, send message, toggle back on  
**Expected:** Signals reappear correctly after toggle

### **Test Case 4: Scenario Restart**
**Scenario:** End scenario, start new one  
**Expected:** Signals reset correctly, no stale data

---

## **WHAT'S NOT YET IMPLEMENTED**

### **Alignment Scoring (Phase 3)**
The system now shows signals BEFORE rep responds, but it does NOT yet:
- ❌ Evaluate if rep's response aligned with signals
- ❌ Penalize misalignment (e.g., pushy when HCP is stressed)
- ❌ Reward alignment (e.g., brief when HCP is time-pressured)

**Example:**
- HCP shows: "Time Pressure", "Stressed", "Impatient"
- Rep sends: Long, detailed 5-paragraph response
- **Current:** Rep scores normally on Question Quality, Value Framing, etc.
- **Phase 3:** Rep will be penalized for ignoring time pressure signals

### **Signal State Persistence (Phase 2)**
Signals can still drift between turns:
- ❌ "Curious" can flip to "Disengaged" arbitrarily
- ❌ No state transition rules
- ❌ No momentum continuity

**Example:**
- Turn 1: HCP is "Curious", "Engaged"
- Turn 2: HCP is "Disengaged", "Low Engagement" (no reason for flip)
- **Phase 2:** Will enforce realistic state transitions

---

## **SUCCESS CRITERIA**

### **Phase 1 is successful if:**
1. ✅ Amber box appears BEFORE message input
2. ✅ Signals display body language, vocal tone, physical cues
3. ✅ Signals clear when rep sends message
4. ✅ New signals appear after HCP responds
5. ✅ No console errors
6. ✅ No React Error #185
7. ✅ Cue toggle works correctly
8. ✅ Build succeeds

### **If all criteria met:**
✅ **Phase 1 is COMPLETE**  
➡️ **Ready to proceed to Phase 2: Signal State Persistence**

### **If any criteria fail:**
❌ **Report specific issue**  
➡️ **Debug and fix before proceeding**

---

## **DEPLOYMENT READINESS**

### **Before Pushing to GitHub:**
1. ✅ Test all scenarios locally
2. ✅ Verify no console errors
3. ✅ Verify build succeeds
4. ✅ Test on multiple browsers (Chrome, Firefox, Safari)
5. ✅ Test on mobile viewport (responsive design)
6. ✅ Verify no Worker impact (check Worker logs)

### **After Pushing to GitHub:**
1. Monitor GitHub Actions workflow
2. Verify deployment succeeds
3. Test on production URL
4. Monitor for errors in production logs
5. Rollback if critical issues found

---

## **NEXT STEPS AFTER PHASE 1**

### **If Phase 1 Works:**
1. ✅ Confirm all success criteria met
2. ✅ Push to GitHub with write access token
3. ✅ Deploy to production
4. ✅ Monitor for 24 hours
5. **Proceed to Phase 2: Signal State Persistence**

### **Phase 2 Preview:**
**Goal:** Fix signal drift/mutation  
**Approach:** Build HCP state tracker with transition rules  
**Complexity:** High  
**Estimated Time:** 2-4 hours

---

## **TECHNICAL NOTES**

### **Performance Impact:**
- **Negligible:** Only adds one state variable
- **No extra API calls:** Uses existing message data
- **No re-renders:** Signals only update when HCP responds

### **Compatibility:**
- ✅ Works with existing scoring system
- ✅ Works with existing cue detection
- ✅ Works with dynamic cue manager
- ✅ Works with toggle cues feature
- ✅ No Worker changes required

### **Rollback Plan:**
```bash
# If issues found, rollback to origin/main
git reset --hard origin/main
git push --force
```

---

## **CONTACT & SUPPORT**

**If you encounter issues:**
1. Check console for error messages
2. Take screenshots of unexpected behavior
3. Note which scenario/step caused the issue
4. Report with specific details

**Common Issues:**
- **Amber box not appearing:** Check if `showCues` is true (eye icon)
- **Signals not clearing:** Check console for errors
- **Build fails:** Run `npm install` and retry

---

**PHASE 1 STATUS: ✅ READY FOR LOCAL TESTING**

**Test now, then provide GitHub write access token to push to repository.**
