# UI COPY REVIEW — 4-ZONE PLATFORM LAYOUT

**Date**: February 4, 2026  
**Scope**: Text clarity improvements only (no layout, behavior, or feature changes)

---

## ZONE 1: LEFT NAVIGATION / CONTEXT

### App Sidebar (src/components/app-sidebar.tsx)

#### Change 1.1: Sidebar Section Label
**Location**: Line 185  
**Original**: `Core Capabilities`  
**Revised**: `Practice & Learning`  
**Rationale**: "Core Capabilities" is abstract. Users see practice tools (AI Coach, Role Play, Exercises, Modules). "Practice & Learning" describes what they're actually doing.

#### Change 1.2: Navigation Item Label
**Location**: Line 69  
**Original**: `Role Play Simulator`  
**Revised**: `Role Play`  
**Rationale**: "Simulator" is technical. Users understand "Role Play" immediately. Matches the page title and reduces cognitive load.

#### Change 1.3: Sidebar Footer Card Title
**Location**: Line 275  
**Original**: `Today's Focus`  
**Revised**: `Daily Focus`  
**Rationale**: Matches the API endpoint name (`/api/daily-focus`) and is more concise. "Daily" implies freshness without "Today's" possessive.

---

## ZONE 2: PRIMARY WORK AREA (CENTER CONTENT)

### Roleplay Page — Scenario Selection (src/pages/roleplay.tsx)

#### Change 2.1: Practice Section Title
**Location**: Line 787  
**Original**: `Practice Signal Intelligence™ in a Range of Realistic Scenarios`  
**Revised**: `Practice Signal Intelligence in Realistic Scenarios`  
**Rationale**: Remove "Range of" (redundant when scenarios are visible). Remove ™ symbol (distracting in UI, belongs in legal/marketing copy).

#### Change 2.2: Practice Section Description (First Paragraph)
**Location**: Lines 788-790  
**Original**: `Each role-play emphasizes different judgment challenges, helping participants strengthen Signal Intelligence™ across diverse conversation types. Participants practice noticing signals, interpreting meaning, and responding thoughtfully as conversations evolve.`  
**Revised**: `Each scenario emphasizes different judgment challenges. Practice noticing signals, interpreting meaning, and responding thoughtfully as conversations evolve.`  
**Rationale**: 
- "role-play" → "scenario" (matches UI terminology)
- Remove "helping participants strengthen Signal Intelligence™" (redundant with title)
- Remove "Participants practice" → "Practice" (direct, action-oriented)
- Combine into one concise sentence

#### Change 2.3: Practice Section Description (Second Paragraph)
**Location**: Lines 791-793  
**Original**: `Scenarios are intentionally designed to bring specific behaviors into focus—reflecting the realities of high-stakes professional dialogue.`  
**Revised**: `Scenarios bring specific behaviors into focus, reflecting real professional conversations.`  
**Rationale**: 
- Remove "intentionally designed" (implied)
- "high-stakes professional dialogue" → "real professional conversations" (clearer, less formal)

#### Change 2.4: Scenario Card Label
**Location**: Line 837  
**Original**: `Stakeholder`  
**Revised**: `HCP Role`  
**Rationale**: "Stakeholder" is business jargon. Users see specific roles (Oncologist, Cardiologist). "HCP Role" matches domain language.

#### Change 2.5: Scenario Card Label
**Location**: Line 859  
**Original**: `HCP Mood`  
**Revised**: `Starting Mood`  
**Rationale**: "HCP Mood" is redundant (context is clear). "Starting Mood" indicates this is the initial state, not the entire conversation.

#### Change 2.6: Active Session Button
**Location**: Line 707  
**Original**: `End Session & Get Feedback`  
**Revised**: `End Session`  
**Rationale**: Users know feedback comes after ending. Shorter button text is clearer and less cluttered.

### Roleplay Page — Active Session (src/pages/roleplay.tsx)

#### Change 2.7: Scenario Context Card Title
**Location**: Line 896-898  
**Original**: (Uses scenario title directly with Briefcase icon)  
**Revised**: No change required.  
**Rationale**: Clear and contextual.

#### Change 2.8: Message Input Placeholder
**Location**: Line 1029  
**Original**: `Type your response...`  
**Revised**: `Your response...`  
**Rationale**: "Type" is implied. Shorter placeholder reduces visual noise.

#### Change 2.9: Cue Toggle Button Title
**Location**: Line 1050  
**Original**: `Hide observable cues` / `Show observable cues`  
**Revised**: `Hide cues` / `Show cues`  
**Rationale**: "Observable" is redundant (all cues shown are observable). Shorter tooltip is easier to scan.

---

## ZONE 3: RIGHT INSIGHT PANEL (SIGNALS, METRICS, FEEDBACK)

### Signal Intelligence Panel (src/components/signal-intelligence-panel.tsx)

#### Change 3.1: Panel Header (Empty State)
**Location**: Line 170  
**Original**: `Signal Intelligence`  
**Revised**: `Signals`  
**Rationale**: Panel context makes "Intelligence" redundant. "Signals" is concise and matches user mental model.

#### Change 3.2: Empty State Message
**Location**: Line 171  
**Original**: `Observable signals will appear as the conversation progresses.`  
**Revised**: `Signals appear as the conversation progresses.`  
**Rationale**: "Observable" is redundant (all signals shown are observable).

#### Change 3.3: Loading State Header
**Location**: Line 179  
**Original**: `Detecting signals...`  
**Revised**: No change required.  
**Rationale**: Clear and accurate.

#### Change 3.4: Behavioral Metrics Section Title
**Location**: Line 193  
**Original**: `Behavioral Metrics`  
**Revised**: No change required.  
**Rationale**: Accurate and matches platform terminology.

#### Change 3.5: Behavioral Metrics Description
**Location**: Lines 194-196  
**Original**: `Observed behaviors during this session, including questioning approach, responsiveness, engagement signals, and next-step clarity.`  
**Revised**: `Behaviors observed during this session: questioning, responsiveness, engagement, and next-step clarity.`  
**Rationale**: 
- "Observed behaviors" → "Behaviors observed" (active voice)
- Remove "including" and "approach/signals" (redundant qualifiers)
- Use colon for cleaner list introduction

#### Change 3.6: Evidence Sheet Title
**Location**: Line 242  
**Original**: `What influenced {metric name}?`  
**Revised**: `What influenced this score?`  
**Rationale**: Metric name is already visible in context. "This score" is clearer and avoids repetition.

#### Change 3.7: Evidence Sheet Description
**Location**: Lines 243-245  
**Original**: `Observable cues detected during the role play that relate to this metric.`  
**Revised**: `Cues detected during the session that relate to this metric.`  
**Rationale**: 
- "Observable" is redundant
- "role play" → "session" (matches UI terminology)

#### Change 3.8: Evidence Section Label
**Location**: Line 251  
**Original**: `Observable Cues`  
**Revised**: `Detected Cues`  
**Rationale**: "Observable" is redundant. "Detected" is more accurate (these are cues that were actually found, not just observable).

---

## ZONE 4: TOP HEADER / ACTIONS

### Roleplay Page Header (src/pages/roleplay.tsx)

#### Change 4.1: Page Title
**Location**: Line 690  
**Original**: `Role Play Simulator`  
**Revised**: `Role Play`  
**Rationale**: "Simulator" is technical. Users understand "Role Play" immediately. Matches navigation label.

#### Change 4.2: Page Description
**Location**: Line 691  
**Original**: `Practice conversations with AI-simulated healthcare professionals`  
**Revised**: `Practice conversations with healthcare professionals`  
**Rationale**: "AI-simulated" is obvious from context. Shorter description is clearer.

#### Change 4.3: Fail-Open Banner
**Location**: Lines 720-722  
**Original**: `⚠️ Limited mode: Session initialization unavailable. You can still browse and start scenarios.`  
**Revised**: `⚠️ Limited mode: Session unavailable. You can still browse scenarios.`  
**Rationale**: 
- "Session initialization" is technical jargon
- "browse and start" is contradictory (can't start if unavailable)
- Simplified to essential information

---

## SUMMARY OF CHANGES

**Total Changes**: 18  
**Zone 1 (Left Nav)**: 3 changes  
**Zone 2 (Primary Work Area)**: 9 changes  
**Zone 3 (Right Insight Panel)**: 5 changes  
**Zone 4 (Top Header)**: 3 changes  

**Principles Applied**:
1. Remove redundant qualifiers ("observable", "intentionally designed")
2. Use active, direct language ("Practice" vs "Participants practice")
3. Match UI terminology consistently ("scenario" vs "role-play")
4. Simplify technical jargon ("Session initialization" → "Session")
5. Reduce visual noise (shorter labels, cleaner descriptions)

**What Was NOT Changed**:
- Layout, spacing, colors, components
- Feature names, metrics, capabilities
- Behavior, logic, scoring, flows
- Any content that was already clear and concise

---

**Next Step**: Await approval to implement these text-only changes.
