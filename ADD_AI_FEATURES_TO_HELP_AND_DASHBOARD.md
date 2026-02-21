# ✅ ADD AI FEATURES TO HELP CENTER & DASHBOARD

**Date:** February 6, 2026  
**Status:** Ready to implement

---

## 🎯 GOAL

Add AI-powered features to Help Center and Dashboard pages using the SAME pattern as the working Chat page.

---

## 📋 FEATURES TO ADD

### 1. Help Center - AI Support

**Location:** `/help` page  
**Feature:** "Ask AI Support" button/section  
**Functionality:**
- User can ask questions about the platform
- AI provides helpful answers using platform knowledge
- Uses `/api/chat/send` endpoint
- Follows same pattern as chat.tsx

**UI Components:**
- Text input for question
- "Ask AI" button
- Loading state (spinner)
- AI response display area
- Error handling with fallback

### 2. Dashboard - AI Performance Coach

**Location:** `/dashboard` page  
**Feature:** "AI Performance Coach" section  
**Functionality:**
- User can ask for coaching advice
- AI provides personalized coaching tips
- Uses `/api/chat/send` endpoint
- Follows same pattern as chat.tsx

**UI Components:**
- Text input for coaching question
- "Get Coaching" button
- Loading state (spinner)
- AI coaching response display
- Error handling with fallback

---

## 🔧 IMPLEMENTATION PATTERN

### Reference: Working Chat Page

**File:** `src/pages/chat.tsx`

```typescript
import { apiRequest } from "@/lib/queryClient";
import { normalizeAIResponse } from "@/lib/normalizeAIResponse";

const sendMessageMutation = useMutation({
  mutationFn: async (content: string) => {
    const response = await apiRequest("POST", "/api/chat/send", {
      message: content,
      content,
      context: { /* optional context */ },
    });
    return response.json();
  },
  onSuccess: (data) => {
    // Handle response
    if (Array.isArray(data?.messages)) {
      // Process messages
    }
  },
});
```

### Pattern for Help Center

```typescript
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { normalizeAIResponse } from "@/lib/normalizeAIResponse";

const [aiQuestion, setAiQuestion] = useState("");
const [aiAnswer, setAiAnswer] = useState<string | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAskAI = async () => {
  if (!aiQuestion.trim()) return;
  
  setIsGenerating(true);
  setError(null);
  setAiAnswer(null);

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 12000);

  try {
    const response = await apiRequest("POST", "/api/chat/send", {
      message: aiQuestion,
      content: `Help Center Question: ${aiQuestion}`,
      context: {
        type: "help_support"
      }
    }, { signal: abortController.signal });

    const rawText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Worker returned ${response.status}`);
    }
    
    const normalized = normalizeAIResponse(rawText);
    
    // Extract AI message from Worker response
    let aiMessage = '';
    if (normalized.json && normalized.json.messages && Array.isArray(normalized.json.messages)) {
      const messages = normalized.json.messages;
      const lastMessage = messages[messages.length - 1];
      aiMessage = lastMessage?.content || '';
    } else {
      aiMessage = normalized.text || '';
    }

    if (aiMessage && aiMessage.trim().length > 0) {
      setAiAnswer(aiMessage.trim());
    } else {
      throw new Error('Empty AI response');
    }
  } catch (err) {
    console.error('[HELP] AI request failed:', err);
    setError('Unable to get AI response. Please try again or browse help articles.');
  } finally {
    clearTimeout(timeoutId);
    setIsGenerating(false);
  }
};
```

### Pattern for Dashboard

```typescript
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { normalizeAIResponse } from "@/lib/normalizeAIResponse";

const [coachQuestion, setCoachQuestion] = useState("");
const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleGetCoaching = async () => {
  if (!coachQuestion.trim()) return;
  
  setIsGenerating(true);
  setError(null);
  setCoachAdvice(null);

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 12000);

  try {
    const response = await apiRequest("POST", "/api/chat/send", {
      message: coachQuestion,
      content: `Performance Coaching Question: ${coachQuestion}`,
      context: {
        type: "performance_coaching"
      }
    }, { signal: abortController.signal });

    const rawText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Worker returned ${response.status}`);
    }
    
    const normalized = normalizeAIResponse(rawText);
    
    // Extract AI message from Worker response
    let aiMessage = '';
    if (normalized.json && normalized.json.messages && Array.isArray(normalized.json.messages)) {
      const messages = normalized.json.messages;
      const lastMessage = messages[messages.length - 1];
      aiMessage = lastMessage?.content || '';
    } else {
      aiMessage = normalized.text || '';
    }

    if (aiMessage && aiMessage.trim().length > 0) {
      setCoachAdvice(aiMessage.trim());
    } else {
      throw new Error('Empty AI response');
    }
  } catch (err) {
    console.error('[DASHBOARD] AI coaching request failed:', err);
    setError('Unable to get coaching advice. Please try again later.');
  } finally {
    clearTimeout(timeoutId);
    setIsGenerating(false);
  }
};
```

---

## 📦 REQUIRED IMPORTS

```typescript
import { apiRequest } from "@/lib/queryClient";
import { normalizeAIResponse } from "@/lib/normalizeAIResponse";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
```

---

## 🎨 UI COMPONENTS

### Help Center AI Support Section

```tsx
{/* AI Support Section */}
<Card className="mt-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-primary" />
      AI Support
    </CardTitle>
    <CardDescription>
      Ask our AI assistant for instant help
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Textarea
      placeholder="Ask a question... (e.g., 'How do I start a roleplay session?')"
      value={aiQuestion}
      onChange={(e) => setAiQuestion(e.target.value)}
      rows={3}
      disabled={isGenerating}
    />
    <Button
      onClick={handleAskAI}
      disabled={!aiQuestion.trim() || isGenerating}
      className="w-full"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Getting answer...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Ask AI
        </>
      )}
    </Button>

    {error && (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    {aiAnswer && (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="whitespace-pre-wrap text-sm">
            {aiAnswer}
          </div>
        </CardContent>
      </Card>
    )}
  </CardContent>
</Card>
```

### Dashboard AI Performance Coach Section

```tsx
{/* AI Performance Coach */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Brain className="h-5 w-5 text-primary" />
      AI Performance Coach
    </CardTitle>
    <CardDescription>
      Get personalized coaching advice
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Textarea
      placeholder="Ask for coaching advice... (e.g., 'How can I improve my objection handling?')"
      value={coachQuestion}
      onChange={(e) => setCoachQuestion(e.target.value)}
      rows={3}
      disabled={isGenerating}
    />
    <Button
      onClick={handleGetCoaching}
      disabled={!coachQuestion.trim() || isGenerating}
      className="w-full"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Getting coaching...
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-2" />
          Get Coaching
        </>
      )}
    </Button>

    {error && (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    {coachAdvice && (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="whitespace-pre-wrap text-sm">
            {coachAdvice}
          </div>
        </CardContent>
      </Card>
    )}
  </CardContent>
</Card>
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Help Center (help.tsx)
- [ ] Import `apiRequest` and `normalizeAIResponse`
- [ ] Add state variables (aiQuestion, aiAnswer, isGenerating, error)
- [ ] Implement `handleAskAI` function
- [ ] Add AI Support card to UI
- [ ] Test with sample questions
- [ ] Verify error handling
- [ ] Push to GitHub via API

### Dashboard (dashboard.tsx)
- [ ] Import `apiRequest` and `normalizeAIResponse`
- [ ] Add state variables (coachQuestion, coachAdvice, isGenerating, error)
- [ ] Implement `handleGetCoaching` function
- [ ] Add AI Performance Coach card to UI
- [ ] Test with sample coaching questions
- [ ] Verify error handling
- [ ] Push to GitHub via API

---

## 🚀 DEPLOYMENT WORKFLOW

1. **Fetch files from GitHub** (source of truth)
2. **Make changes locally** (add AI features)
3. **Test locally** (verify functionality)
4. **Push via GitHub API** (NOT `git push`)
5. **Verify on GitHub** (check commit)
6. **Test in production** (verify deployment)

---

## 🎯 SUCCESS CRITERIA

- ✅ Help Center has working "Ask AI" feature
- ✅ Dashboard has working "AI Performance Coach" feature
- ✅ Both use `/api/chat/send` endpoint
- ✅ Both use `normalizeAIResponse` for parsing
- ✅ Both have proper error handling
- ✅ Both have loading states
- ✅ Both have 12-second timeout
- ✅ Both follow same pattern as chat.tsx

---

**READY TO IMPLEMENT!**
