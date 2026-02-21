# AI Customization Functionality - Critical Fix Required

## Issue Status: BROKEN - Missing API Key

### Root Cause
The AI customization features are **NOT WORKING** because `GROQ_API_KEY` is not configured in secrets.

### Affected Features
1. **Frameworks Page** - Template Customization ("Customize" button)
2. **Heuristics Page** - Template Customization
3. **Dashboard** - AI Performance Coach
4. **Modules Page** - AI Coach Dialog
5. **Help Page** - AI Support Assistant

### Technical Flow

#### 1. User Action
- User clicks "Customize" button on a template
- Dialog opens with template and situation input
- User enters situation and clicks "Generate Personalized Template"

#### 2. API Call
```typescript
const response = await fetch('/api/ai-coach/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: `Template: "${selectedTemplate.template}"
Situation: "${heuristicSituation}"

Please customize this template for my specific situation. Respond in valid JSON format:
{"customizedTemplate": "adapted template", "example": "example dialogue", "tips": ["tip1", "tip2", "tip3"]}`,
    context: 'frameworks'
  }),
  signal: abortController.signal
});
```

#### 3. Backend Handler
**File:** `src/server/api/ai-coach/ask/POST.ts`

```typescript
// Get GROQ API key from secrets
const apiKey = getSecret('GROQ_API_KEY') as string;
if (!apiKey) {
  console.error('GROQ_API_KEY not found in secrets');
  return res.status(500).json({ error: 'AI service not configured' });
}
```

**CURRENT STATE:** `apiKey` is `undefined` → Returns 500 error

#### 4. Error Handling
```typescript
if (!response.ok) {
  throw new Error(`API returned ${response.status}`);
}
```

**Result:** User sees "Failed to generate customization. Please try again."

### Solution

#### Step 1: Get GROQ API Key
1. Go to https://console.groq.com/keys
2. Sign up for free account (if needed)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

#### Step 2: Add Secret
**Option A: Via Secrets Form (Recommended)**
- A secrets request form has been displayed
- Paste the GROQ API key
- Click "Save"

**Option B: Via Settings**
- Go to Settings → Secrets
- Add new secret:
  - Name: `GROQ_API_KEY`
  - Value: `gsk_...` (your key)
- Save

#### Step 3: Verify
1. Restart the development server (if needed)
2. Go to Frameworks page
3. Click "Customize" on any template
4. Enter a situation
5. Click "Generate Personalized Template"
6. Should see customized template, example, and tips

### Expected Behavior (After Fix)

**Success Response:**
```json
{
  "answer": "{\"customizedTemplate\": \"...\", \"example\": \"...\", \"tips\": [...]}",
  "context": "frameworks",
  "timestamp": "2026-02-07T..."
}
```

**Parsed Result:**
```typescript
{
  customizedTemplate: "Adapted template with specific details",
  example: "Realistic dialogue example",
  tips: ["Tip 1", "Tip 2", "Tip 3"]
}
```

**UI Display:**
- ✅ Customized Template section (with copy button)
- ✅ Example Dialogue section
- ✅ Delivery Tips section (3 actionable tips)

### Code Verification

#### ✅ Frontend Wiring (CORRECT)
- `src/pages/frameworks.tsx` line 726: "Customize" button → `setSelectedTemplate(template)`
- Line 819: Dialog opens when `selectedTemplate` is set
- Line 854: "Generate" button → `generateCustomization()`
- Line 149: API call to `/api/ai-coach/ask`
- Line 170-186: JSON parsing and state update
- Line 873-939: Display customization results

#### ✅ Backend Wiring (CORRECT)
- `src/server/api/ai-coach/ask/POST.ts` exists
- Line 6: `getSecret('GROQ_API_KEY')` call
- Line 65: `context === 'frameworks'` enables JSON mode
- Line 66: `response_format: { type: 'json_object' }`
- Line 70-81: GROQ API call
- Line 87: Returns `answer` field

#### ❌ Missing Configuration (BROKEN)
- `GROQ_API_KEY` not in `/alloc/config.json`
- Backend returns 500 error
- Frontend shows "Failed to generate customization"

### Testing After Fix

#### Test Case 1: Frameworks Template Customization
1. Navigate to `/frameworks`
2. Scroll to "Heuristic Templates" section
3. Click "Customize" on "Feel-Felt-Found" template
4. Enter situation: "Meeting with a skeptical cardiologist concerned about drug costs"
5. Click "Generate Personalized Template"
6. **Expected:** See customized template, example dialogue, and 3 tips
7. **Expected:** Can copy customized template

#### Test Case 2: Dashboard AI Coach
1. Navigate to `/dashboard`
2. Scroll to "AI Performance Coach" section
3. Enter question: "How can I improve my objection handling?"
4. Click "Get Coaching"
5. **Expected:** See AI-generated coaching advice

#### Test Case 3: Heuristics Template Customization
1. Navigate to `/heuristics`
2. Click "Customize" on any template
3. Enter situation
4. Click "Generate"
5. **Expected:** See customized template

### Monitoring

**Backend Logs:**
```bash
# Success
[AI Coach] Request received: context=frameworks
[AI Coach] GROQ API call successful
[AI Coach] Response sent: 200

# Failure (current state)
[AI Coach] GROQ_API_KEY not found in secrets
[AI Coach] Response sent: 500
```

**Frontend Console:**
```javascript
// Success
"Customization generated successfully"

// Failure (current state)
"Customization generation error: Error: API returned 500"
```

### Summary

**Status:** 🔴 BROKEN
**Cause:** Missing `GROQ_API_KEY` secret
**Fix:** Add GROQ API key to secrets
**ETA:** Immediate (once key is added)
**Impact:** All AI features currently non-functional

---

**CRITICAL:** This is NOT a code issue. The code is correctly wired. The ONLY issue is missing API key configuration.
