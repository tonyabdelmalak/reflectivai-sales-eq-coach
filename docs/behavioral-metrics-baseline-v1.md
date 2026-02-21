# Behavioral Metrics Baseline v1

**Created:** 2026-02-11  
**Tag:** v1-si-metrics-stable  
**Branch:** stable/si-metrics-pre-v2-lock  
**Purpose:** Rollback-safe checkpoint prior to deterministic SI-v2 recalibration

---

## Current Metric IDs (8 Total)

1. `question_quality`
2. `listening_responsiveness`
3. `making_it_matter`
4. `customer_engagement_signals`
5. `objection_navigation`
6. `conversation_control_structure`
7. `commitment_gaining`
8. `adaptability`

**Source:** `BEHAVIORAL_METRIC_IDS` in `src/lib/signal-intelligence/metrics-spec.ts` (line 8-17)

---

## Current Components

### 1. Question Quality
- `open_closed_ratio` (weight: 0.25)
- `relevance_to_goals` (weight: 0.25)
- `sequencing_logic` (weight: 0.25)
- `follow_up_depth` (weight: 0.25)

### 2. Listening & Responsiveness
- `paraphrasing` (weight: 0.33)
- `acknowledgment` (weight: 0.33)
- `pivot_responsiveness` (weight: 0.33)

### 3. Making It Matter
- `customer_context_alignment` (weight: 0.5)
- `outcome_translation` (weight: 0.5)

### 4. Customer Engagement Signals
- `customer_verbal_participation` (weight: 0.25)
- `responsiveness_to_cues` (weight: 0.25)
- `momentum_continuity` (weight: 0.25)
- `signal_amplification` (weight: 0.25)

### 5. Objection Navigation
- `non_defensive_response` (weight: 0.5)
- `constructive_engagement` (weight: 0.5)

### 6. Conversation Control & Structure
- `directional_clarity` (weight: 0.33)
- `adaptive_steering` (weight: 0.33)
- `purposeful_closure` (weight: 0.33)

### 7. Commitment Gaining
- `next_step_clarity` (weight: 0.5)
- `customer_ownership` (weight: 0.5)

### 8. Adaptability
- `situational_responsiveness` (weight: 0.5)
- `approach_adjustment` (weight: 0.5)

---

## Current Formulas

**Score Scale:** 1.0 - 5.0  
**Precision:** 1 decimal place  
**Rounding:** `Math.round(n * 10) / 10` (round half up)  
**Aggregation:** Average of applicable components

**Formula (all metrics):**
```typescript
function averageApplicable(components: ComponentResult[]): number | null {
  const applicable = components.filter(c => c.applicable && c.score !== null);
  if (applicable.length === 0) return null;
  const sum = applicable.reduce((acc, c) => acc + (c.score || 0), 0);
  return round1(sum / applicable.length);
}
```

---

## Current metricsVersion

**Not explicitly set** - No version constant in current implementation

---

## Files Tied to Scoring

### Core Scoring Logic
1. `src/lib/signal-intelligence/scoring.ts` (1216 lines)
   - Main scoring engine
   - Component scoring functions
   - Utility functions

2. `src/lib/signal-intelligence/metrics-spec.ts` (411 lines)
   - Metric definitions
   - Component specifications
   - Heuristics documentation

### Supporting Files
3. `src/lib/signal-intelligence/capability-metric-map.ts`
   - Maps capabilities to metrics

4. `src/lib/signal-intelligence/score-storage.ts`
   - LocalStorage persistence

---

## Files Tied to UI Rendering

### Display Components
1. `src/components/signal-intelligence-panel.tsx`
   - Real-time signal tracking during roleplay
   - Live metric display

2. `src/components/roleplay-feedback-dialog.tsx`
   - Post-session comprehensive feedback
   - Final evaluation panel
   - Metric breakdowns

3. `src/components/rep-metric-evaluation.tsx`
   - Inline metric evaluation display

### Data Pages
4. `src/pages/ei-metrics.tsx`
   - Historical metrics dashboard
   - Score visualization

---

## Current Scoring Approach

### Characteristics
- **Deterministic:** Same input → same output
- **Frontend-only:** No backend dependencies
- **Observable behavior:** Text pattern matching
- **No ML:** Rule-based heuristics
- **Component-based:** Each metric has 2-4 components
- **Equal weighting:** Components averaged equally (or explicit weights)

### Known Issues (Pre-v2)
1. No explicit version tracking
2. Some components use weighted averages, others simple averages
3. Heuristics documented in strings, not enforced in code
4. No validation that panels show identical outputs
5. Missing components: `contextual_relevance`, `forward_value`

---

## Rollback Instructions

### To restore this baseline:

```bash
# Option 1: Reset to tag
git checkout v1-si-metrics-stable

# Option 2: Reset to branch
git checkout stable/si-metrics-pre-v2-lock

# Option 3: Cherry-pick specific files
git checkout v1-si-metrics-stable -- src/lib/signal-intelligence/
git checkout v1-si-metrics-stable -- src/components/signal-intelligence-panel.tsx
git checkout v1-si-metrics-stable -- src/components/roleplay-feedback-dialog.tsx
```

---

## Next Phase: SI-v2 Recalibration

### Planned Changes
1. Add `METRICS_VERSION = 'SI-v2-locked-2026-02-11'`
2. Implement `contextual_relevance` component
3. Implement `forward_value` component
4. Enforce deterministic scoring rules
5. Ensure panel output consistency
6. Lock file scope to 4 files only

### Files to Modify (ONLY)
- `src/lib/signal-intelligence/scoring.ts`
- `src/lib/signal-intelligence/metrics-spec.ts`
- `src/components/signal-intelligence-panel.tsx`
- `src/components/roleplay-feedback-dialog.tsx`

**Any other file modified → STOP**

---

**END OF BASELINE DOCUMENTATION**
