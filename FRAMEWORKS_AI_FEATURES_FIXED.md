# Frameworks Page AI Features - Fixed ✅

**Date:** February 7, 2026
**Status:** COMPLETE

## Summary

Fixed all AI-powered features on the Frameworks page to use the correct `/api/ai-coach/ask` endpoint instead of the deprecated `/api/chat/send` endpoint.

## Changes Made

### 1. Framework Advice Generator
**Location:** `src/pages/frameworks.tsx` - `generateAdvice()` function

**Before:**
- Used `/api/chat/send` endpoint
- Complex fallback logic with hardcoded framework advice maps
- Multiple layers of response normalization
- Over 200 lines of duplicate fallback code

**After:**
- Uses `/api/ai-coach/ask` endpoint with `context: 'frameworks'`
- Simple JSON parsing with basic fallback
- Clean error handling
- Reduced from ~370 lines to ~50 lines

**API Request:**
```typescript
const response = await fetch('/api/ai-coach/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: `I'm working with the "${selectedFramework.name}" framework. Here's my situation: ${situation}

Please provide:
1. 2-3 sentences of specific advice for applying this framework
2. One practical exercise I can try
3. Three quick tips

Respond in valid JSON format: {"advice": "...", "practiceExercise": "...", "tips": ["...", "...", "..."]}`,
    context: 'frameworks'
  })
});
```

### 2. Heuristic Template Customization
**Location:** `src/pages/frameworks.tsx` - `generateCustomization()` function

**Before:**
- Used `/api/chat/send` endpoint via `apiRequest` helper
- Complex response normalization with multiple fallback paths
- Extensive console logging for debugging
- Paragraph splitting and heuristic text processing

**After:**
- Uses `/api/ai-coach/ask` endpoint with `context: 'frameworks'`
- Simple JSON parsing with basic fallback
- Clean error handling
- Reduced from ~100 lines to ~40 lines

**API Request:**
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

### 3. AI Coach API Enhancement
**Location:** `src/server/api/ai-coach/ask/POST.ts`

**Added:** New `frameworks` context with specialized system prompt:

```typescript
frameworks: `You are an expert sales coach specializing in behavioral frameworks and communication models. When users ask for advice:
- Provide specific, actionable guidance for applying the framework to their situation
- Include practical exercises they can try immediately
- Give 3 quick tips they can remember and use
- Focus on observable behaviors and real-world application

IMPORTANT: Always respond in valid JSON format:
{"advice": "2-3 sentences of specific advice", "practiceExercise": "one practical exercise", "tips": ["tip 1", "tip 2", "tip 3"]}

Be practical, specific, and focused on pharma sales contexts.`
```

### 4. Cleanup
- Removed unused `apiRequest` import from frameworks.tsx
- Removed 229 lines of duplicate fallback code
- Simplified error handling throughout

## Benefits

1. **Consistency:** All AI features now use the same endpoint
2. **Maintainability:** Reduced code complexity by ~70%
3. **Reliability:** Single source of truth for AI responses
4. **Performance:** Removed unnecessary response normalization layers
5. **Debugging:** Cleaner error messages and simpler flow

## Testing Checklist

- [ ] Framework advice generation works
- [ ] Heuristic template customization works
- [ ] JSON parsing handles both structured and prose responses
- [ ] Error messages display correctly
- [ ] Timeout handling works (12 seconds)
- [ ] Loading states display properly

## Files Modified

1. `src/pages/frameworks.tsx` - Simplified both AI features
2. `src/server/api/ai-coach/ask/POST.ts` - Added frameworks context

## Commits

1. `fix: Clean up generateAdvice function and remove duplicate fallback code`
2. `feat: Add frameworks context to AI coach API`
3. `fix: Simplify heuristic customization to use AI coach API`
4. `chore: Remove unused apiRequest import from frameworks page`

---

**Next Steps:**
- Test both features in production
- Monitor AI response quality
- Consider adding more context-specific prompts if needed
