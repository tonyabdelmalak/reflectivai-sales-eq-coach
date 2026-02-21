# 📋 SINGLE SOURCE OF TRUTH - IMPLEMENTATION ANALYSIS

**Document:** SINGLE SOURCE OF TRUTH map and text 1.22.26.pdf  
**Date Analyzed:** February 3, 2026  
**Platform:** ReflectivAI Training Platform  
**Status:** 🔍 STRATEGIC ANALYSIS & RECOMMENDATIONS

---

## 🎯 EXECUTIVE SUMMARY

**PDF Status:** Document downloaded (490KB) - Manual review required for detailed content extraction.

**Critical Question:** Where should Single Source of Truth updates be implemented?

### Implementation Priority Matrix

| Target | Purpose | Update Frequency | Priority | Rationale |
|--------|---------|------------------|----------|----------|
| **Training Platform** (This App) | Active learning, roleplay, real-time feedback | High - Daily/Weekly | 🔴 **CRITICAL** | Primary user touchpoint, direct training impact |
| **Marketing Site** | Public-facing content, lead generation | Low - Monthly/Quarterly | 🟡 MEDIUM | Prospects, not active users |
| **Documentation** | Reference material, onboarding | Medium - Monthly | 🟢 LOW | Supporting material |

---

## 🏗️ CURRENT PLATFORM ARCHITECTURE

### ReflectivAI Training Platform (THIS APP)

**Purpose:** Interactive training simulator for healthcare sales reps

**Core Components:**
1. **Roleplay Simulator** (`/roleplay`) - HCP conversation practice with real-time feedback
2. **Signal Intelligence Panel** - Live detection of observable cues during conversations
3. **Behavioral Metrics** - 8-metric scoring system for rep performance
4. **Knowledge Base** (`/knowledge`) - Training content library
5. **Frameworks** (`/frameworks`) - Structured methodologies
6. **Modules** (`/modules`) - Learning paths with practice questions

**Current Data Sources:**
```
src/lib/
├── data.ts (96KB)                      # Scenarios, HCP profiles, questions
├── coaching-content.ts (47KB)          # Guidance and tips
├── observable-cues.ts (18KB)           # Signal detection rules
├── behavioral-metrics-spec.ts (27KB)   # Scoring criteria
├── help-content.ts (35KB)              # User documentation
├── scoring.ts (40KB)                   # Scoring algorithms
└── signal-intelligence/                # Signal detection engine
    ├── metrics-spec.ts
    ├── capability-metric-map.ts
    └── signal-detector.ts
```

---

## 🔄 SINGLE SOURCE OF TRUTH PRINCIPLES

### What is a Single Source of Truth?

A **Single Source of Truth (SSOT)** ensures:
1. **One authoritative source** for each piece of information
2. **No conflicting versions** across different systems
3. **Automatic propagation** of updates to all consumers
4. **Version control** and audit trails
5. **Consistency** across all touchpoints

### Why It Matters for ReflectivAI

**Problem Without SSOT:**
- ❌ Training platform shows outdated methodology
- ❌ Marketing site promotes different framework version
- ❌ Sales reps learn conflicting approaches
- ❌ Metrics don't align with current best practices
- ❌ Manual updates required in multiple places
- ❌ Risk of inconsistency and errors

**Solution With SSOT:**
- ✅ One master document defines methodology
- ✅ Platform automatically reflects latest updates
- ✅ Marketing site pulls from same source
- ✅ Consistency across all channels
- ✅ Single update point
- ✅ Version control and rollback capability

---

## 📊 IMPLEMENTATION STRATEGY OPTIONS

### Option 1: Platform as Primary SSOT ⭐ RECOMMENDED

**Approach:** Training platform database/config is the authoritative source

**Architecture:**
```
Platform Database/Config (Master)
    ↓
    ├─→ Training App (real-time access)
    ├─→ Marketing Site (API/export)
    └─→ Documentation (auto-generated)
```

**Pros:**
- ✅ Platform always has latest content
- ✅ Real-time updates for active learners
- ✅ Marketing site pulls from live data
- ✅ Single update point
- ✅ No additional infrastructure

**Cons:**
- ❌ Requires API for marketing site
- ❌ Marketing team depends on platform availability

**Best For:** Organizations where training platform is mission-critical and always available

---

### Option 2: External CMS as SSOT

**Approach:** Headless CMS (Contentful, Sanity, Strapi) as master source

**Architecture:**
```
Headless CMS (Master)
    ↓
    ├─→ Training App (API fetch)
    ├─→ Marketing Site (API fetch)
    └─→ Documentation (API fetch)
```

**Pros:**
- ✅ Non-technical team can update content
- ✅ Version control built-in
- ✅ Multiple consumers from one source
- ✅ Workflow/approval processes
- ✅ Content preview before publish

**Cons:**
- ❌ Additional infrastructure cost ($50-500/month)
- ❌ API dependency for platform
- ❌ Requires migration of existing content
- ❌ Learning curve for team

**Best For:** Organizations with dedicated content team and budget for CMS

---

### Option 3: Git Repository as SSOT

**Approach:** Markdown/JSON files in Git repo (current approach)

**Architecture:**
```
Git Repository (Master)
    ↓
    ├─→ Training App (build-time import)
    ├─→ Marketing Site (build-time import)
    └─→ Documentation (generated from source)
```

**Pros:**
- ✅ Version control native
- ✅ Free (already using Git)
- ✅ Developer-friendly
- ✅ Easy rollback
- ✅ Code review process

**Cons:**
- ❌ Requires technical knowledge to update
- ❌ No real-time updates (requires rebuild/deploy)
- ❌ Not suitable for non-technical team
- ❌ Slower iteration cycle

**Best For:** Developer-managed content with infrequent updates

---

## 🎯 RECOMMENDED APPROACH: HYBRID MODEL

### Strategy: Git + Platform Database + Marketing CMS

**Rationale:** Different content types have different requirements

---

#### 1. **Core Methodology** → Git Repository

**Content:**
- Framework definitions
- Behavioral metrics specifications
- Observable cues taxonomy
- Scoring algorithms
- Metric calculation rules

**Why Git:**
- ✅ Requires careful review before changes (methodology is foundational)
- ✅ Version controlled with full history
- ✅ Developer-managed (technical content)
- ✅ Infrequent updates (quarterly)
- ✅ Code review process ensures quality

**Files:**
```
src/lib/
├── behavioral-metrics-spec.ts
├── observable-cues.ts
├── scoring.ts
└── signal-intelligence/
```

---

#### 2. **Training Content** → Platform Database (Future)

**Content:**
- Roleplay scenarios
- HCP profiles
- Practice questions
- Coaching tips
- Module content

**Why Database:**
- ✅ Frequent updates (weekly)
- ✅ Can be managed via admin UI (future feature)
- ✅ Real-time changes without deployment
- ✅ User-generated content potential
- ✅ A/B testing capability

**Current State:** Hardcoded in `data.ts`  
**Future State:** MySQL database with admin UI

---

#### 3. **Marketing Content** → Marketing Site CMS

**Content:**
- Landing pages
- Blog posts
- Case studies
- Sales collateral
- Pricing pages

**Why Separate:**
- ✅ Marketing team autonomy
- ✅ Different update cadence (daily)
- ✅ SEO optimization needs
- ✅ A/B testing requirements
- ✅ Independent deployment

**Integration:** Pull methodology definitions from platform API

---

## 🔧 IMPLEMENTATION ROADMAP

### Phase 1: Audit & Document (Week 1-2) ✅ IN PROGRESS

**Tasks:**
1. ✅ Review SSOT document (PDF) - **AWAITING CONTENT EXTRACTION**
2. ✅ Identify all content types in platform
3. ✅ Map current data sources
4. ✅ Document dependencies
5. ⏳ Identify conflicts/inconsistencies (pending PDF review)

**Deliverables:**
- ✅ Content inventory (see table below)
- ✅ Dependency map (see architecture diagrams)
- ⏳ Gap analysis (pending PDF content)

---

### Phase 2: Update Platform with SSOT Changes (Week 3-4)

**Priority: 🔴 CRITICAL**

**Tasks:**
1. Extract methodology changes from PDF
2. Update `behavioral-metrics-spec.ts` with new definitions
3. Modify `observable-cues.ts` with updated taxonomy
4. Adjust `scoring.ts` algorithms per SSOT
5. Refresh `data.ts` scenarios to align with methodology
6. Update `coaching-content.ts` with new guidance

**Testing:**
- Run roleplay sessions with updated content
- Verify scoring calculations match SSOT
- Check signal detection accuracy
- Validate feedback quality

**Deployment:**
- Deploy to production
- Monitor for errors
- Collect user feedback

---

### Phase 3: Marketing Site Alignment (Week 5-6)

**Priority: 🟡 MEDIUM**

**Tasks:**
1. Update methodology overview page
2. Refresh feature descriptions
3. Align case studies with new terminology
4. Update sales collateral
5. SEO optimization for new keywords

**Integration Points:**
- Methodology definitions (pull from platform)
- Behavioral metrics list (pull from platform)
- Observable cues examples (pull from platform)
- Marketing copy (managed independently)

---

### Phase 4: Build Admin Interface (Week 7-12)

**Priority: 🟢 LOW (Future Enhancement)**

**Features:**
1. **Content Management Dashboard**
   - View all SSOT content
   - Edit with validation
   - Preview changes
   - Publish workflow

2. **Version Control**
   - Track changes
   - Compare versions
   - Rollback capability
   - Audit log

3. **Sync Status**
   - Show propagation status
   - Identify stale content
   - Force refresh

**Tech Stack:**
- Admin UI: React + shadcn (already in use)
- Backend: API routes (already configured)
- Storage: MySQL + JSON columns
- Validation: Zod schemas

---

## 📋 CONTENT INVENTORY & SSOT ASSIGNMENT

### Training Platform Content

| Content Type | Current Location | Size | SSOT Location | Update Frequency | Owner | Priority |
|--------------|------------------|------|---------------|------------------|-------|----------|
| Behavioral Metrics | `behavioral-metrics-spec.ts` | 27KB | Git | Quarterly | Product | 🔴 CRITICAL |
| Observable Cues | `observable-cues.ts` | 18KB | Git | Monthly | Training | 🔴 CRITICAL |
| Scoring Rules | `scoring.ts` | 40KB | Git | Quarterly | Product | 🔴 CRITICAL |
| Roleplay Scenarios | `data.ts` | 96KB | Git → DB | Weekly | Training | 🟡 HIGH |
| HCP Profiles | `data.ts` | (included) | Git → DB | Monthly | Training | 🟡 HIGH |
| Coaching Content | `coaching-content.ts` | 47KB | Git → DB | Weekly | Training | 🟡 HIGH |
| Help Documentation | `help-content.ts` | 35KB | Git | Monthly | Product | 🟢 MEDIUM |
| Framework Definitions | `data.ts` | (included) | Git | Quarterly | Product | 🔴 CRITICAL |
| Module Content | `modulePracticeQuestions.ts` | 16KB | Git → DB | Weekly | Training | 🟡 HIGH |

### Marketing Site Content

| Content Type | Current Location | SSOT Location | Update Frequency | Owner | Integration |
|--------------|------------------|---------------|------------------|-------|-------------|
| Methodology Overview | Marketing CMS | Platform API | Quarterly | Marketing | Pull from API |
| Feature Descriptions | Marketing CMS | Platform API | Monthly | Marketing | Pull from API |
| Case Studies | Marketing CMS | Marketing CMS | Monthly | Marketing | Independent |
| Blog Posts | Marketing CMS | Marketing CMS | Weekly | Marketing | Independent |
| Pricing | Marketing CMS | Marketing CMS | Quarterly | Sales | Independent |

---

## 🚨 CRITICAL DECISIONS NEEDED

### Decision 1: PDF Content Review

**Question:** What are the specific methodology changes in the SSOT document?

**Action Required:**
1. Manual review of PDF (environment limitations prevent automatic extraction)
2. Extract key changes:
   - New behavioral metrics?
   - Updated observable cues?
   - Modified scoring algorithms?
   - Changed terminology?
   - New frameworks?

**Impact:** Cannot proceed with platform updates until PDF content is reviewed

---

### Decision 2: Update Timeline

**Question:** When do SSOT changes need to be live in production?

**Options:**
- **Immediate (This Week):** High urgency, critical methodology changes
- **Short-term (2-4 Weeks):** Normal priority, planned update cycle
- **Long-term (1-3 Months):** Low urgency, incremental improvements

**Recommendation:** Depends on nature of changes in PDF

---

### Decision 3: Marketing Site Dependency

**Question:** Should marketing site depend on platform API for methodology content?

**Options:**
- **Yes:** Always in sync, single source
- **No:** Independent, more resilient
- **Hybrid:** Core methodology from API, marketing copy independent

**Recommendation:** **Hybrid approach**
- Pull methodology definitions from platform API
- Maintain marketing copy/benefits independently
- Implement fallback to cached version if API unavailable

---

## 🔍 ANALYSIS OF PDF DOCUMENT

**Document Title:** "SINGLE SOURCE OF TRUTH map and text 1.22.26"

**File Details:**
- Size: 490KB
- Date: January 22, 2026
- Format: PDF with likely visual map + text descriptions

**Expected Contents:**
1. **Visual Map** - Diagram showing information architecture
2. **Text Definitions** - Detailed descriptions of each component
3. **Methodology Updates** - Changes to behavioral metrics, cues, scoring
4. **Terminology** - Standardized language across platform
5. **Relationships** - How different components connect

**Action Required:**
1. **Manual Review** - Open PDF and extract key points
2. **Identify Changes** - Compare to current platform implementation
3. **Gap Analysis** - Find discrepancies between document and code
4. **Update Plan** - Prioritize changes for implementation

**Status:** ⏳ **AWAITING MANUAL PDF REVIEW**

---

## 📝 IMMEDIATE NEXT STEPS

### For You (User)

1. **Review PDF Document**
   - Open `SINGLE SOURCE OF TRUTH map and text 1.22.26.pdf`
   - Extract key methodology changes
   - Identify new behavioral metrics
   - Note observable cue updates
   - Document scoring changes
   - Share findings with me

2. **Prioritize Changes**
   - Which changes are critical?
   - Which can wait?
   - What's the timeline?

3. **Provide Context**
   - Why was SSOT document created?
   - What problems does it solve?
   - Who are the stakeholders?

### For Me (AI Agent)

**Once PDF content is shared:**

1. **Create Gap Analysis**
   - Compare SSOT to current platform
   - Identify all discrepancies
   - Prioritize by impact

2. **Generate Update Plan**
   - List all files to modify
   - Provide code changes
   - Create test plan

3. **Implement Changes**
   - Update behavioral metrics
   - Modify observable cues
   - Adjust scoring algorithms
   - Refresh scenarios
   - Update coaching content

4. **Test & Deploy**
   - Run roleplay sessions
   - Verify calculations
   - Deploy to production
   - Monitor for issues

---

## 🎯 RECOMMENDATIONS SUMMARY

### For Training Platform (THIS APP) - 🔴 CRITICAL PRIORITY

**Why Critical:**
- Platform is primary user touchpoint (reps train daily)
- Outdated methodology = poor training outcomes
- Scoring must reflect current best practices
- Direct impact on rep performance

**Immediate Actions:**
1. Review PDF and extract methodology changes
2. Update core files (`behavioral-metrics-spec.ts`, `observable-cues.ts`, `scoring.ts`)
3. Test thoroughly with roleplay sessions
4. Deploy to production
5. Monitor user feedback

**Timeline:** 1-2 weeks

---

### For Marketing Site - 🟡 MEDIUM PRIORITY

**Why Medium:**
- Marketing site is for prospects, not active users
- Content updates less frequent
- Can tolerate slight lag behind platform
- Marketing copy needs independent control

**Immediate Actions:**
1. Update methodology overview page
2. Refresh feature descriptions
3. Align terminology with platform
4. Update case studies

**Timeline:** 2-4 weeks (after platform updates)

---

### For Documentation - 🟢 LOW PRIORITY

**Why Low:**
- Documentation is reference material
- Users primarily learn through doing (roleplay)
- Can be updated after platform changes
- Less time-sensitive

**Immediate Actions:**
1. Update help content with new terminology
2. Add changelog for methodology updates
3. Refresh screenshots if UI changed

**Timeline:** 4-6 weeks (after platform and marketing)

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Understand SSOT Document ⏳ IN PROGRESS
- [ ] Download and review PDF
- [ ] Extract methodology changes
- [ ] Identify new metrics/cues
- [ ] Document scoring updates
- [ ] Create implementation plan
- [ ] Share findings with development team

### Phase 2: Update Platform ⏳ PENDING PDF REVIEW
- [ ] Modify `behavioral-metrics-spec.ts`
- [ ] Update `observable-cues.ts`
- [ ] Adjust `scoring.ts` algorithms
- [ ] Refresh `data.ts` scenarios
- [ ] Update `coaching-content.ts`
- [ ] Update `help-content.ts`

### Phase 3: Test & Validate ⏳ PENDING UPDATES
- [ ] Run roleplay sessions
- [ ] Verify metric calculations
- [ ] Check signal detection accuracy
- [ ] Validate feedback quality
- [ ] User acceptance testing
- [ ] Performance testing

### Phase 4: Deploy & Monitor ⏳ PENDING TESTING
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Measure training outcomes
- [ ] Iterate based on data

### Phase 5: Marketing Site Sync ⏳ PENDING PLATFORM DEPLOY
- [ ] Update methodology page
- [ ] Refresh feature descriptions
- [ ] Update case studies
- [ ] Align messaging
- [ ] SEO optimization

---

## 📊 SUCCESS METRICS

### Platform Metrics
- **Content Accuracy:** 100% alignment with SSOT
- **Update Latency:** < 24 hours from SSOT change to platform
- **User Confusion:** < 5% support tickets about outdated content
- **Training Outcomes:** Improved scores after SSOT implementation
- **System Stability:** No regressions in scoring/feedback

### Marketing Metrics
- **Messaging Consistency:** 100% alignment with platform methodology
- **Lead Quality:** Prospects understand actual product capabilities
- **Sales Cycle:** Reduced due to accurate expectations
- **SEO Performance:** Improved rankings for methodology keywords

---

## 🎓 CONCLUSION

### Key Takeaways

1. **Platform First:** Training platform should be updated FIRST with SSOT changes
2. **Hybrid Approach:** Core methodology in Git, training content in DB (future)
3. **Marketing Independence:** Marketing site pulls definitions but manages copy
4. **Gradual Migration:** Don't try to build full SSOT infrastructure immediately
5. **User Impact:** Platform updates directly affect training quality

### Critical Path

```
1. Review PDF → 2. Update Platform → 3. Test → 4. Deploy → 5. Update Marketing
```

### Risk Mitigation

**Risk:** Platform and marketing site show conflicting information  
**Mitigation:** Update platform first, then marketing within 1 week

**Risk:** Breaking changes to scoring algorithms  
**Mitigation:** Version scoring, allow gradual migration, extensive testing

**Risk:** User confusion from sudden methodology changes  
**Mitigation:** Add changelog, in-app notifications, updated help content

---

## 📞 WHAT I NEED FROM YOU

### To Proceed with Implementation:

1. **PDF Content Summary**
   - What are the key methodology changes?
   - Are there new behavioral metrics?
   - Have observable cues been updated?
   - Are scoring algorithms different?
   - Is there new terminology?

2. **Timeline & Priorities**
   - When do changes need to be live?
   - Which changes are most critical?
   - Are there any breaking changes?

3. **Stakeholder Context**
   - Who created the SSOT document?
   - Who needs to approve changes?
   - Are there other systems affected?

---

**Status:** 📋 **AWAITING PDF CONTENT REVIEW**

**Next Step:** Please share key points from the PDF document so I can create a specific implementation plan with code changes for this platform.

**Document Location:** `/tmp/single-source-of-truth.pdf` (downloaded, awaiting manual review)
