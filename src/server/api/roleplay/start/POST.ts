import { setSession } from "/src/server/api/roleplay/_shared/sessions.ts";
function deriveInitialStateFromScene(scenarioDescription, scenarioTags) {
  const desc = scenarioDescription.toLowerCase();
  const tags = (scenarioTags || []).map((t) => t.toLowerCase());
  if (tags.includes("overwhelmed") || tags.includes("short-staffed") || tags.includes("rushed") || tags.includes("burdened") || desc.includes("overwhelmed") || desc.includes("short-staffed") || desc.includes("rushed") || desc.includes("burdened")) {
    return "busy";
  }
  if (tags.includes("frustrated") || desc.includes("frustrated")) {
    return "irritated";
  }
  if (tags.includes("analytical") && !tags.includes("frustrated") && !tags.includes("overwhelmed")) {
    return "neutral";
  }
  return "busy";
}
function generateTurn0Dialogue(state, scenarioContext) {
  switch (state) {
    case "busy":
      return "I only have a few minutes. What is this about?";
    case "irritated":
      return "I'm very busy right now.";
    case "neutral":
      return "Yes, what can I help you with?";
    default:
      return "I only have a few minutes. What is this about?";
  }
}
export default async function handler(req, res) {
  try {
    const {
      scenarioId,
      scenarioTitle,
      scenarioDescription,
      scenarioTags,
      scenarioContext
    } = req.body;
    if (!scenarioId) {
      return res.status(400).json({
        error: "scenarioId is required"
      });
    }
    const sessionId = req.headers["x-session-id"] || "default";
    const initialState = deriveInitialStateFromScene(scenarioDescription || "", scenarioTags);
    const turn0Dialogue = generateTurn0Dialogue(initialState, scenarioContext);
    const session = {
      active: true,
      scenarioId,
      scenario: {
        id: scenarioId,
        title: scenarioTitle || "Role-Play Session",
        description: scenarioDescription || ""
      },
      messages: [{
        role: "assistant",
        content: turn0Dialogue,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          hcpState: initialState,
          turnNumber: 0,
          lockedState: initialState
        }
      }],
      metadata: {
        hcpState: initialState,
        turnNumber: 0,
        lockedState: initialState,
        stateDominant: false
      },
      startedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setSession(sessionId, session);
    console.log("[ROLEPLAY START] Session created:", sessionId);
    console.log("[ROLEPLAY START] Session data:", {
      active: session.active,
      messageCount: session.messages.length
    });
    const {
      getSession
    } = await import("/src/server/api/roleplay/_shared/sessions.ts");
    const storedSession = getSession(sessionId);
    console.log("[ROLEPLAY START] Verification - session stored:", !!storedSession);
    return res.json(session);
  } catch (error) {
    console.error("[ROLEPLAY START] Error:", error);
    return res.status(500).json({
      error: "Failed to start session",
      message: String(error)
    });
  }
}

//# sourceMappingURL=data:application/json;base64,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QkQsV0FBVzFCLFNBQVM7QUFDMUNzQixZQUFRQyxJQUFJLG1EQUFtRCxDQUFDLENBQUNJLGFBQWE7QUFFOUUsV0FBT2xDLElBQUlLLEtBQUtNLE9BQU87QUFBQSxFQUN6QixTQUFTTCxPQUFPO0FBQ2R1QixZQUFRdkIsTUFBTSwyQkFBMkJBLEtBQUs7QUFDOUMsV0FBT04sSUFBSUksT0FBTyxHQUFHLEVBQUVDLEtBQUs7QUFBQSxNQUMxQkMsT0FBTztBQUFBLE1BQ1A2QixTQUFTQyxPQUFPOUIsS0FBSztBQUFBLElBQ3ZCLENBQUM7QUFBQSxFQUNIO0FBQ0YiLCJuYW1lcyI6WyJzZXRTZXNzaW9uIiwiZGVyaXZlSW5pdGlhbFN0YXRlRnJvbVNjZW5lIiwic2NlbmFyaW9EZXNjcmlwdGlvbiIsInNjZW5hcmlvVGFncyIsImRlc2MiLCJ0b0xvd2VyQ2FzZSIsInRhZ3MiLCJtYXAiLCJ0IiwiaW5jbHVkZXMiLCJnZW5lcmF0ZVR1cm4wRGlhbG9ndWUiLCJzdGF0ZSIsInNjZW5hcmlvQ29udGV4dCIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJzY2VuYXJpb0lkIiwic2NlbmFyaW9UaXRsZSIsImJvZHkiLCJzdGF0dXMiLCJqc29uIiwiZXJyb3IiLCJzZXNzaW9uSWQiLCJoZWFkZXJzIiwiaW5pdGlhbFN0YXRlIiwidHVybjBEaWFsb2d1ZSIsInNlc3Npb24iLCJhY3RpdmUiLCJzY2VuYXJpbyIsImlkIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2VzIiwicm9sZSIsImNvbnRlbnQiLCJ0aW1lc3RhbXAiLCJEYXRlIiwidG9JU09TdHJpbmciLCJtZXRhZGF0YSIsImhjcFN0YXRlIiwidHVybk51bWJlciIsImxvY2tlZFN0YXRlIiwic3RhdGVEb21pbmFudCIsInN0YXJ0ZWRBdCIsImNvbnNvbGUiLCJsb2ciLCJtZXNzYWdlQ291bnQiLCJsZW5ndGgiLCJnZXRTZXNzaW9uIiwic3RvcmVkU2Vzc2lvbiIsIm1lc3NhZ2UiLCJTdHJpbmciXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiUE9TVC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBzZXRTZXNzaW9uIH0gZnJvbSAnLi4vX3NoYXJlZC9zZXNzaW9ucy5qcyc7XG5cbmZ1bmN0aW9uIGRlcml2ZUluaXRpYWxTdGF0ZUZyb21TY2VuZShzY2VuYXJpb0Rlc2NyaXB0aW9uOiBzdHJpbmcsIHNjZW5hcmlvVGFncz86IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgY29uc3QgZGVzYyA9IHNjZW5hcmlvRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgdGFncyA9IChzY2VuYXJpb1RhZ3MgfHwgW10pLm1hcCh0ID0+IHQudG9Mb3dlckNhc2UoKSk7XG4gIFxuICBpZiAodGFncy5pbmNsdWRlcygnb3ZlcndoZWxtZWQnKSB8fCB0YWdzLmluY2x1ZGVzKCdzaG9ydC1zdGFmZmVkJykgfHwgdGFncy5pbmNsdWRlcygncnVzaGVkJykgfHwgdGFncy5pbmNsdWRlcygnYnVyZGVuZWQnKSB8fFxuICAgICAgZGVzYy5pbmNsdWRlcygnb3ZlcndoZWxtZWQnKSB8fCBkZXNjLmluY2x1ZGVzKCdzaG9ydC1zdGFmZmVkJykgfHwgZGVzYy5pbmNsdWRlcygncnVzaGVkJykgfHwgZGVzYy5pbmNsdWRlcygnYnVyZGVuZWQnKSkge1xuICAgIHJldHVybiAnYnVzeSc7XG4gIH1cbiAgXG4gIGlmICh0YWdzLmluY2x1ZGVzKCdmcnVzdHJhdGVkJykgfHwgZGVzYy5pbmNsdWRlcygnZnJ1c3RyYXRlZCcpKSB7XG4gICAgcmV0dXJuICdpcnJpdGF0ZWQnO1xuICB9XG4gIFxuICBpZiAodGFncy5pbmNsdWRlcygnYW5hbHl0aWNhbCcpICYmICF0YWdzLmluY2x1ZGVzKCdmcnVzdHJhdGVkJykgJiYgIXRhZ3MuaW5jbHVkZXMoJ292ZXJ3aGVsbWVkJykpIHtcbiAgICByZXR1cm4gJ25ldXRyYWwnO1xuICB9XG4gIFxuICByZXR1cm4gJ2J1c3knO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVR1cm4wRGlhbG9ndWUoc3RhdGU6IHN0cmluZywgc2NlbmFyaW9Db250ZXh0OiBhbnkpOiBzdHJpbmcge1xuICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgY2FzZSAnYnVzeSc6XG4gICAgICByZXR1cm4gXCJJIG9ubHkgaGF2ZSBhIGZldyBtaW51dGVzLiBXaGF0IGlzIHRoaXMgYWJvdXQ/XCI7XG4gICAgY2FzZSAnaXJyaXRhdGVkJzpcbiAgICAgIHJldHVybiBcIkknbSB2ZXJ5IGJ1c3kgcmlnaHQgbm93LlwiO1xuICAgIGNhc2UgJ25ldXRyYWwnOlxuICAgICAgcmV0dXJuIFwiWWVzLCB3aGF0IGNhbiBJIGhlbHAgeW91IHdpdGg/XCI7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBcIkkgb25seSBoYXZlIGEgZmV3IG1pbnV0ZXMuIFdoYXQgaXMgdGhpcyBhYm91dD9cIjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgc2NlbmFyaW9JZCwgc2NlbmFyaW9UaXRsZSwgc2NlbmFyaW9EZXNjcmlwdGlvbiwgc2NlbmFyaW9UYWdzLCBzY2VuYXJpb0NvbnRleHQgfSA9IHJlcS5ib2R5O1xuICAgIFxuICAgIGlmICghc2NlbmFyaW9JZCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdzY2VuYXJpb0lkIGlzIHJlcXVpcmVkJyB9KTtcbiAgICB9XG4gICAgXG4gICAgY29uc3Qgc2Vzc2lvbklkID0gcmVxLmhlYWRlcnNbJ3gtc2Vzc2lvbi1pZCddIGFzIHN0cmluZyB8fCAnZGVmYXVsdCc7XG4gICAgXG4gICAgY29uc3QgaW5pdGlhbFN0YXRlID0gZGVyaXZlSW5pdGlhbFN0YXRlRnJvbVNjZW5lKHNjZW5hcmlvRGVzY3JpcHRpb24gfHwgJycsIHNjZW5hcmlvVGFncyk7XG4gICAgY29uc3QgdHVybjBEaWFsb2d1ZSA9IGdlbmVyYXRlVHVybjBEaWFsb2d1ZShpbml0aWFsU3RhdGUsIHNjZW5hcmlvQ29udGV4dCk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIG5ldyBzZXNzaW9uXG4gICAgY29uc3Qgc2Vzc2lvbiA9IHtcbiAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIHNjZW5hcmlvSWQsXG4gICAgICBzY2VuYXJpbzoge1xuICAgICAgICBpZDogc2NlbmFyaW9JZCxcbiAgICAgICAgdGl0bGU6IHNjZW5hcmlvVGl0bGUgfHwgJ1JvbGUtUGxheSBTZXNzaW9uJyxcbiAgICAgICAgZGVzY3JpcHRpb246IHNjZW5hcmlvRGVzY3JpcHRpb24gfHwgJydcbiAgICAgIH0sXG4gICAgICBtZXNzYWdlczogW1xuICAgICAgICB7XG4gICAgICAgICAgcm9sZTogJ2Fzc2lzdGFudCcsXG4gICAgICAgICAgY29udGVudDogdHVybjBEaWFsb2d1ZSxcbiAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgaGNwU3RhdGU6IGluaXRpYWxTdGF0ZSxcbiAgICAgICAgICAgIHR1cm5OdW1iZXI6IDAsXG4gICAgICAgICAgICBsb2NrZWRTdGF0ZTogaW5pdGlhbFN0YXRlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgaGNwU3RhdGU6IGluaXRpYWxTdGF0ZSxcbiAgICAgICAgdHVybk51bWJlcjogMCxcbiAgICAgICAgbG9ja2VkU3RhdGU6IGluaXRpYWxTdGF0ZSxcbiAgICAgICAgc3RhdGVEb21pbmFudDogZmFsc2VcbiAgICAgIH0sXG4gICAgICBzdGFydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgIH07XG4gICAgXG4gICAgc2V0U2Vzc2lvbihzZXNzaW9uSWQsIHNlc3Npb24pO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdbUk9MRVBMQVkgU1RBUlRdIFNlc3Npb24gY3JlYXRlZDonLCBzZXNzaW9uSWQpO1xuICAgIGNvbnNvbGUubG9nKCdbUk9MRVBMQVkgU1RBUlRdIFNlc3Npb24gZGF0YTonLCB7IGFjdGl2ZTogc2Vzc2lvbi5hY3RpdmUsIG1lc3NhZ2VDb3VudDogc2Vzc2lvbi5tZXNzYWdlcy5sZW5ndGggfSk7XG4gICAgXG4gICAgLy8gVmVyaWZ5IHNlc3Npb24gd2FzIHN0b3JlZFxuICAgIGNvbnN0IHsgZ2V0U2Vzc2lvbiB9ID0gYXdhaXQgaW1wb3J0KCcuLi9fc2hhcmVkL3Nlc3Npb25zLmpzJyk7XG4gICAgY29uc3Qgc3RvcmVkU2Vzc2lvbiA9IGdldFNlc3Npb24oc2Vzc2lvbklkKTtcbiAgICBjb25zb2xlLmxvZygnW1JPTEVQTEFZIFNUQVJUXSBWZXJpZmljYXRpb24gLSBzZXNzaW9uIHN0b3JlZDonLCAhIXN0b3JlZFNlc3Npb24pO1xuICAgIFxuICAgIHJldHVybiByZXMuanNvbihzZXNzaW9uKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUk9MRVBMQVkgU1RBUlRdIEVycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBcbiAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHN0YXJ0IHNlc3Npb24nLFxuICAgICAgbWVzc2FnZTogU3RyaW5nKGVycm9yKVxuICAgIH0pO1xuICB9XG59XG4iXSwiZmlsZSI6Ii9hcHAvc3JjL3NlcnZlci9hcGkvcm9sZXBsYXkvc3RhcnQvUE9TVC50cyJ9