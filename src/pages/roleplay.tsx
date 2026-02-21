/* =========================================================
   ROLEPLAY.TSX — FULL DROP-IN REPLACEMENT (DEPLOY-SAFE)
   Signal Intelligence only (no emotional intelligence scoring)
   ========================================================= */

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
// Radix Select removed - using native <select> for filters
import {
  Users,
  Play,
  Send,
  RotateCcw,
  Briefcase,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  scenarios,
  diseaseStates,
  specialtiesByDiseaseState,
  allSpecialties,
  hcpCategories,
  influenceDrivers,
} from "@/lib/data";
import {
  SignalIntelligencePanel,
  type SignalIntelligenceCapability,
} from "@/components/signal-intelligence-panel";
import { RoleplayFeedbackDialog } from "@/components/roleplay-feedback-dialog";
import type { Scenario } from "@/types/schema";
import {
  scoreAllMetrics,
  type MetricResult,
  type Transcript,
} from "@/lib/signal-intelligence/scoring";
import {
  detectObservableCues,
  detectRepMetrics,
  type ObservableCue,
} from "@/lib/observable-cues";
import {
  selectDynamicCues,
  createInitialContext,
  updateContext,
  type ConversationContext,
} from "@/lib/dynamic-cue-manager";
import { generateHCPBehavioralDescription } from "@/lib/hcp-behavioral-state";
import { evaluateRepResponse } from "@/lib/rep-response-evaluator";
import { CueBadgeGroup } from "@/components/CueBadge";
import { PreCallPlanDialog } from "@/components/PreCallPlanDialog";

/* =========================================================
   Temporary ErrorBoundary for diagnosis
   ========================================================= */

class RoleplayErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 ROLEPLAY ERROR BOUNDARY CAUGHT:", error);
    console.error("📍 COMPONENT STACK:", errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <h2 className="text-xl font-bold text-destructive mb-4">
              Roleplay Page Error
            </h2>
            <p className="font-mono text-sm mb-4">{this.state.error?.message}</p>
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold mb-2">
                Component Stack
              </summary>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* -----------------------------
   Types
------------------------------ */

type RoleplayMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface SessionPayload {
  session: any | null;
  messages: RoleplayMessage[];
  signals: SignalIntelligenceCapability[];
}

/**
 * IMPORTANT:
 * RoleplayFeedbackDialog expects the *full* ComprehensiveFeedback shape.
 * We therefore normalize into that exact structure with safe defaults.
 */
interface ComprehensiveFeedback {
  overallScore: number;
  performanceLevel: "exceptional" | "strong" | "developing" | "emerging" | "needs-focus";
  eqScores: any[];
  salesSkillScores: any[];
  topStrengths: string[];
  priorityImprovements: string[];
  specificExamples: Array<{ quote: string; analysis: string; isPositive: boolean }>;
  nextSteps: string[];
  overallSummary: string;
}

/* -----------------------------
   Helpers
------------------------------ */

function cap50<T>(items: T[]): T[] {
  return Array.isArray(items) ? items.slice(-50) : [];
}

function stableSignalKey(signal: any): string {
  return `${signal?.type ?? ""}|${signal?.timestamp ?? ""}|${
    signal?.evidence ?? signal?.signal ?? ""
  }`;
}

function dedupeByStableKey<T>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = stableSignalKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

function extractSignals(payload: any): SignalIntelligenceCapability[] {
  const s = payload?.signals ?? payload?.session?.signals;
  return Array.isArray(s) ? s : [];
}

function mapWorkerMessages(
  messages?: Array<{ id?: string; role?: string; content?: string }>
): RoleplayMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.map((m, i) => ({
    id: String(m?.id ?? `msg-${i}`),
    role: m?.role === "user" ? "user" : "assistant",
    content: m?.content ?? "",
  }));
}

/**
 * CRITICAL NORMALIZER
 * Guarantees RoleplayFeedbackDialog will not crash.
 */
function mapToComprehensiveFeedback(
  raw: any,
  metricResults?: MetricResult[]
): ComprehensiveFeedback {
  const root = raw?.analysis ?? raw ?? {};

  // Compute aggregate score from MetricResult[]
  let computedOverallScore = 3;
  if (metricResults && metricResults.length > 0) {
    const applicableScores = metricResults
      .filter((m) => !m.not_applicable && m.overall_score !== null)
      .map((m) => m.overall_score!);
    if (applicableScores.length > 0) {
      const sum = applicableScores.reduce((acc, s) => acc + s, 0);
      computedOverallScore = Math.round((sum / applicableScores.length) * 10) / 10;
    }
  }

  // Map MetricResult[] to eqScores format
  const eqScores =
    metricResults && metricResults.length > 0
      ? metricResults.map((m) => ({
          metricId: m.id,
          score: m.overall_score ?? 3,
          feedback: "",
          observedBehaviors: undefined,
          totalOpportunities: undefined,
          calculationNote: m.not_applicable
            ? "Not applicable to this conversation"
            : undefined,
        }))
      : Array.isArray(root.eqScores)
      ? root.eqScores
      : [];

  return {
    overallScore:
      metricResults && metricResults.length > 0
        ? computedOverallScore
        : typeof root.overallScore === "number"
        ? root.overallScore
        : 3,
    performanceLevel: root.performanceLevel ?? "developing",

    eqScores,
    salesSkillScores: Array.isArray(root.salesSkillScores) ? root.salesSkillScores : [],

    topStrengths:
      Array.isArray(root.topStrengths) && root.topStrengths.length
        ? root.topStrengths.map(String)
        : ["Maintained professional, compliant communication"],

    priorityImprovements:
      Array.isArray(root.priorityImprovements) && root.priorityImprovements.length
        ? root.priorityImprovements.map(String)
        : ["Add a clarifying question before presenting data"],

    specificExamples:
      Array.isArray(root.specificExamples) && root.specificExamples.length
        ? root.specificExamples.map((e: any) => ({
            quote: String(e.quote ?? ""),
            analysis: String(e.analysis ?? ""),
            isPositive: Boolean(e.isPositive),
          }))
        : [],

    nextSteps:
      Array.isArray(root.nextSteps) && root.nextSteps.length
        ? root.nextSteps.map(String)
        : ["Practice reflecting constraints before proposing next steps"],

    overallSummary: String(
      root.overallSummary ??
        root.summary ??
        "Session complete. Review your observable signals and options."
    ),
  };
}

/* =========================================================
   Rep Metric → Scoring Metric ID Alignment (CANONICAL)
   - Keeps rep pills aligned to MetricResult IDs
   - Supports varying detectRepMetrics return shapes (defensive)
   ========================================================= */

const REP_TO_SCORING_ID: Record<string, string> = {
  "question-quality": "question_quality",
  "listening-responsiveness": "listening_responsiveness",
  "making-it-matter": "making_it_matter",
  "customer-engagement": "customer_engagement_signals",
  "objection-navigation": "objection_navigation",
  "conversation-control": "conversation_control_structure",
  "commitment-gaining": "commitment_gaining",
  "adaptability": "adaptability",
};

function toScoringMetricId(repMetricId: string): string {
  return REP_TO_SCORING_ID[repMetricId] ?? repMetricId;
}

function getDetectedMetricId(dm: any): string {
  return String(dm?.metricId ?? dm?.id ?? dm?.metric_id ?? "");
}

function getDetectedMetricName(dm: any): string {
  return String(dm?.metricName ?? dm?.label ?? dm?.name ?? dm?.title ?? getDetectedMetricId(dm));
}

function getDetectedMetricRationale(dm: any): string {
  return String(dm?.rationale ?? dm?.description ?? dm?.analysis ?? "");
}

/* -----------------------------
   Constants
------------------------------ */

const diseaseToCategories: Record<string, string[]> = {
  hiv: ["hiv"],
  oncology: ["oncology"],
  cardiology: ["cardiology"],
  neurology: ["neurology"],
  vaccines: ["vaccines", "covid"],
  "general-medicine": ["hiv", "oncology", "cardiology", "vaccines", "neurology"],
};

/* =========================================================
   Scenario Card (Expandable)
   ========================================================= */

function ScenarioCard({
  scenario,
  onStart,
  onPreCallPlan,
  isStarting,
}: {
  scenario: any;
  onStart: (scenario: any) => void;
  onPreCallPlan: (scenario: any) => void;
  isStarting: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-base leading-tight">
            {scenario.title}
          </CardTitle>
          {scenario.difficulty && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize shrink-0">
              {scenario.difficulty}
            </span>
          )}
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {scenario.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {isExpanded && (
          <>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Stakeholder
              </p>
              <p className="text-sm">{scenario.stakeholder}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Objective
              </p>
              <p className="text-sm line-clamp-2">{scenario.objective}</p>
            </div>

            {scenario.challenges?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Key Challenges
                </p>
                <ul className="text-xs space-y-1">
                  {scenario.challenges.slice(0, 2).map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span className="line-clamp-1">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scenario.hcpMood && (
              <div className="pt-2 border-t">
                <p className="text-xs italic text-amber-600 dark:text-amber-400">
                  {scenario.hcpMood}
                </p>
              </div>
            )}

            {scenario.openingScene && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Opening Scene
                </p>
                <p className="text-xs italic line-clamp-3">
                  {scenario.openingScene}
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded((v) => !v)}
          >
            {isExpanded ? "Collapse Details" : "Expand for Details"}
          </Button>

          <Button
            size="sm"
            disabled={isStarting}
            onClick={() => onStart(scenario)}
          >
            <Play className="h-4 w-4 mr-2" />
            {isStarting ? "Starting..." : "Start Scenario"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Page
   ========================================================= */

function RolePlayPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [input, setInput] = useState("");

  const [selectedDiseaseState, setSelectedDiseaseState] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedHcpCategory, setSelectedHcpCategory] = useState("");
  const [selectedInfluenceDriver, setSelectedInfluenceDriver] = useState("");

  const [sessionSignals, setSessionSignals] = useState<SignalIntelligenceCapability[]>([]);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackScenarioTitle, setFeedbackScenarioTitle] = useState("");
  const [metricResults, setMetricResults] = useState<MetricResult[]>([]);
  const [feedbackData, setFeedbackData] = useState<ComprehensiveFeedback | null>(null);
  const [roleplayEndError, setRoleplayEndError] = useState<string | null>(null);
  const [showCues, setShowCues] = useState(true);
  const [conversationContext, setConversationContext] = useState<ConversationContext>(
    createInitialContext()
  );
  const [allDetectedCues, setAllDetectedCues] = useState<ObservableCue[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [failOpenTriggered, setFailOpenTriggered] = useState(false);
  const [preCallPlanOpen, setPreCallPlanOpen] = useState(false);
  
  // PHASE 1: Store upcoming HCP signals that rep should see BEFORE responding
  const [upcomingHCPSignals, setUpcomingHCPSignals] = useState<{
    cues: ObservableCue[];
    description: ReturnType<typeof generateHCPBehavioralDescription> | null;
  } | null>(null);

  const queryClient = useQueryClient();
  const endCalledForSessionRef = useRef<Set<string>>(new Set());

  // Clear roleplay state when component unmounts
  useEffect(() => {
    return () => {
      setSelectedScenario(null);
      setInput("");
      setSessionSignals([]);
      setShowFeedbackDialog(false);
      setFeedbackScenarioTitle("");
      setMetricResults([]);
      setFeedbackData(null);
      setRoleplayEndError(null);
      setAllDetectedCues([]);
      setCurrentScenario(null);
      setConversationContext(createInitialContext());
    };
  }, []);

  const availableSpecialties = selectedDiseaseState
    ? specialtiesByDiseaseState[selectedDiseaseState] || allSpecialties
    : allSpecialties;

  // Fix React Error #185: Defer state update to avoid setState during render
  useEffect(() => {
    if (selectedSpecialty && !availableSpecialties.includes(selectedSpecialty)) {
      queueMicrotask(() => {
        setSelectedSpecialty("");
      });
    }
  }, [selectedSpecialty, availableSpecialties]);

  const filteredScenarios = (() => {
    if (!selectedDiseaseState) return scenarios;
    const cats = diseaseToCategories[selectedDiseaseState];
    if (!cats) return scenarios;
    return scenarios.filter((s) => cats.includes((s as any).category || ""));
  })();

  const {
    data: roleplayData,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery<SessionPayload>({
    queryKey: ["/api/roleplay/session"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/roleplay/session");
      const json = await res.json();
      return {
        session: json?.session ?? null,
        messages: mapWorkerMessages(json?.session?.messages),
        signals: extractSignals(json),
      };
    },
    staleTime: 5000,
    retry: 1,
  });

  const messages = roleplayData?.messages ?? [];
  
  // PHASE 1: Set initial upcoming HCP signals when scenario starts
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === 'assistant' && showCues) {
      const firstHCPMessage = messages[0];
      const hcpMood = (currentScenario as any)?.hcpMood || '';
      const rawCues = detectObservableCues(firstHCPMessage.content, hcpMood);
      const selectedCues = selectDynamicCues(rawCues, conversationContext, [], undefined, hcpMood);
      
      if (selectedCues.length > 0) {
        const behavioralDesc = generateHCPBehavioralDescription(selectedCues, firstHCPMessage.content);
        setUpcomingHCPSignals({
          cues: selectedCues,
          description: behavioralDesc
        });
        console.log('[PHASE 1] Initial HCP signals set:', selectedCues.map(c => c.name));
      }
    }
  }, [messages.length, showCues]); // Only run when messages first appear

  // 🔒 MEMOIZED CUE CACHE: Prevents cues from changing on every keystroke
  // Cues are calculated once per message and cached by message ID
  const cueCacheByMessageId = useMemo(() => {
    const cache = new Map<string, ObservableCue[]>();
    const hcpMood = (currentScenario as any)?.hcpMood || '';

    messages.forEach((m, idx) => {
      if (m.role === "assistant" && showCues) {
        const rawCues = detectObservableCues(m.content, hcpMood);

        // Get rep metrics from PREVIOUS user message (if exists)
        let repMetrics: any[] = [];
        if (idx > 0 && messages[idx - 1].role === "user") {
          const prevUserMsg = messages[idx - 1];
          const prevHcpMsg =
            idx > 1 && messages[idx - 2].role === "assistant"
              ? messages[idx - 2].content
              : undefined;
          const transcript = messages.slice(0, idx).map((msg) => ({
            speaker: msg.role === "user" ? ("rep" as const) : ("customer" as const),
            text: msg.content,
          }));
          repMetrics = evaluateRepResponse(prevUserMsg.content, prevHcpMsg, transcript);
        }

        // Track the last rep message content for cue selection
        let lastRepMsgForCues: string | undefined = undefined;
        if (idx > 0 && messages[idx - 1].role === "user") {
          lastRepMsgForCues = messages[idx - 1].content;
        }

        // Pass the previous user message (rep) to selectDynamicCues so it can detect hostility.
        const cues = selectDynamicCues(
          rawCues,
          conversationContext,
          repMetrics,
          lastRepMsgForCues,
          hcpMood
        );

        cache.set(m.id, cues);
      }
    });

    return cache;
  }, [messages, showCues, conversationContext]);

  // 🔒 MEMOIZED BEHAVIORAL DESCRIPTION CACHE: Prevents descriptions from changing on every keystroke
  // Descriptions are generated once per message and cached by message ID
  // This prevents Math.random() from causing different descriptions on every render
  const behavioralDescCacheByMessageId = useMemo(() => {
    const cache = new Map<string, string>();

    messages.forEach((m, idx) => {
      if (m.role === "assistant" && showCues && idx > 0) {
        const cues = cueCacheByMessageId.get(m.id) || [];
        const description = generateHCPBehavioralDescription(cues, m.content);
        cache.set(m.id, (description as any).overallDescription);
      }
    });

    return cache;
  }, [messages, showCues, cueCacheByMessageId]);

  // FAIL-OPEN: If session query doesn't resolve in 3 seconds, show scenario grid anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionLoading && messages.length === 0) {
        console.warn("[ROLEPLAY] Session query timeout - forcing fail-open mode");
        setFailOpenTriggered(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [sessionLoading, messages.length]);

  // If session query fails or times out, treat as inactive (show scenario grid)
  // Always show active session if we have a scenario started (even if messages are filtered)
  const isActive = !failOpenTriggered && !sessionError && (messages.length > 0 || currentScenario);

  useEffect(() => {
    if (roleplayData?.signals?.length) {
      setSessionSignals((prev) => dedupeByStableKey(cap50([...prev, ...roleplayData.signals])));
    }
  }, [roleplayData?.signals]);

  // Reset page when component unmounts (user leaves roleplay page)
  useEffect(() => {
    return () => {
      console.log("🔄 Roleplay page unmounting - resetting ALL state");

      // Clear all local state
      setCurrentScenario(null);
      setSelectedScenario(null);
      setSessionSignals([]);
      setFeedbackData(null);
      setMetricResults([]);
      setAllDetectedCues([]);
      setShowFeedbackDialog(false);
      setInput("");
      setConversationContext(createInitialContext());
      setFailOpenTriggered(false);

      // Clear React Query cache to prevent stale session data
      // NOTE: use the real query key used by this page
      queryClient.setQueryData(["/api/roleplay/session"], null);
      queryClient.removeQueries({ queryKey: ["/api/roleplay/session"] });
    };
  }, [queryClient]);

  // Calculate metric results whenever messages change
  useEffect(() => {
    // 🚨 CRITICAL FIX: Don't clear metricResults if feedback dialog is open
    // This prevents the useEffect from clearing scores after endScenarioMutation sets them
    if (showFeedbackDialog) {
      console.log("⏸️ SCORING PAUSED - Feedback dialog is open, preserving metricResults");
      return;
    }

    if (messages.length > 0 && currentScenario) {
      const transcript: Transcript = messages.map((msg) => ({
        speaker: msg.role === "user" ? ("rep" as const) : ("customer" as const),
        text: msg.content,
      }));

      // DEBUG: Log full transcript for diagnosis
      console.log("🔍 [ROLEPLAY] Creating transcript for scoring:", {
        messageCount: messages.length,
        fullTranscript: transcript.map((t, i) => ({
          index: i,
          speaker: t.speaker,
          textPreview: t.text.substring(0, 100) + (t.text.length > 100 ? "..." : ""),
          fullLength: t.text.length,
        })),
      });

      // Extract goal tokens from current scenario
      const goalTokens = new Set<string>();
      const goalText = [currentScenario.objective, ...((currentScenario as any).keyMessages || [])].join(
        " "
      );
      goalText
        .toLowerCase()
        .split(/\W+/)
        .forEach((token) => {
          if (token.length > 3) goalTokens.add(token);
        });

      console.log("🔍 [ROLEPLAY] Calling scoreAllMetrics with", transcript.length, "turns");
      const results = scoreAllMetrics(transcript);
      console.log("🔍 [ROLEPLAY] Scoring complete, got", results.length, "metric results");
      console.log(
        "🔍 [ROLEPLAY] Metric scores:",
        results.map((r) => ({ id: r.id, score: r.overall_score, notApplicable: r.not_applicable }))
      );
      setMetricResults(results);
    } else {
      setMetricResults([]);
    }
  }, [messages, currentScenario, showFeedbackDialog]);

  const startScenarioMutation = useMutation({
    mutationFn: async (scenario: Scenario) => {
      const res = await apiRequest("POST", "/api/roleplay/start", {
        scenarioId: (scenario as any).id,
        scenario,
        context: { diseaseState: selectedDiseaseState, specialty: selectedSpecialty },
      });
      return res.json();
    },
    onSuccess: (data, scenario) => {
      setSessionSignals([]);
      setCurrentScenario(scenario);
      // Defer query invalidation to avoid React Error #185 (setState during render)
      queueMicrotask(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/roleplay/session"] });
      });
    },
  });

  const sendResponseMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/roleplay/respond", { 
        message: content,
        scenarioContext: currentScenario 
      });
      return res.json();
    },
    onSuccess: async (data) => {
      // Extract AI-detected behavioral cues from response
      const aiBehavioralCues = data.behavioralCues || [];
      const aiOverallState = data.overallState || '';
      const aiRepEvaluation = data.repEvaluation || null;
      
      console.log('[AI CUES] Detected from API:', aiBehavioralCues.length, 'cues');
      console.log('[AI EVAL] Rep evaluation:', aiRepEvaluation);
      const newSignals = extractSignals(data);
      if (newSignals.length) {
        setSessionSignals((prev) => dedupeByStableKey(cap50([...prev, ...newSignals])));
      }

      // Invalidate and wait for refetch before scoring
      await new Promise<void>((resolve) => queueMicrotask(resolve));
      await queryClient.invalidateQueries({ queryKey: ["/api/roleplay/session"] });
      await queryClient.refetchQueries({ queryKey: ["/api/roleplay/session"] });

      // Get fresh messages after refetch
      const freshData = queryClient.getQueryData<SessionPayload>(["/api/roleplay/session"]);
      const currentMessages = freshData?.messages ?? [];

      console.log("[LIVE SCORING DEBUG] Current messages count:", currentMessages.length);
      
      // PHASE 1: Use AI-detected behavioral cues from API response
      const latestHCPMessage = currentMessages.length > 0 && currentMessages[currentMessages.length - 1].role === 'assistant'
        ? currentMessages[currentMessages.length - 1]
        : null;
      
      if (latestHCPMessage && showCues && aiBehavioralCues.length > 0) {
        // Convert AI cues to frontend format
        const convertedCues = aiBehavioralCues.map((aiCue: any, index: number) => ({
          id: `ai-cue-${index}`,
          name: aiCue.type,
          label: aiCue.type,
          category: 'ai-detected',
          description: aiCue.evidence,
          behaviors: [
            aiCue.bodyLanguage,
            aiCue.vocalTone,
            aiCue.physicalCues
          ].filter(Boolean)
        }));
        
        // Generate behavioral description from AI cues
        const behavioralDesc = {
          bodyLanguage: aiBehavioralCues[0]?.bodyLanguage || '',
          vocalTone: aiBehavioralCues[0]?.vocalTone || '',
          physicalCues: aiBehavioralCues[0]?.physicalCues || '',
          overallDescription: aiOverallState
        };
        
        // Store AI-detected signals
        setUpcomingHCPSignals({
          cues: convertedCues,
          description: behavioralDesc
        });
        
        console.log('[AI CUES] Upcoming HCP signals set:', convertedCues.map(c => c.name));
      }

      if (currentMessages.length >= 2) {
        const transcript: Transcript = currentMessages.map((msg) => ({
          speaker: msg.role === "user" ? "rep" : "customer",
          text: msg.content,
        }));
        const liveScores = scoreAllMetrics(transcript);
        setMetricResults(liveScores);
        console.log("[LIVE SCORING] Updated metrics during conversation:", liveScores.length);
        console.log(
          "[LIVE SCORING] Scores:",
          liveScores.map((m) => ({ id: m.id, score: m.overall_score, notApplicable: m.not_applicable }))
        );

        // Update conversation context after HCP response
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant" && showCues) {
          // Extract cues from the last HCP message for context update
          const hcpMood = (currentScenario as any)?.hcpMood || '';
          const rawCues = detectObservableCues(lastMessage.content, hcpMood);
          const repMetrics =
            currentMessages.length >= 2
              ? detectRepMetrics(
                  currentMessages[currentMessages.length - 2].content,
                  lastMessage.content
                )
              : [];
          const lastRepMsg =
            currentMessages.length >= 2 ? currentMessages[currentMessages.length - 2]?.content : undefined;

          const cues = selectDynamicCues(rawCues, conversationContext, repMetrics as any, lastRepMsg, hcpMood);
          if (cues.length > 0) {
            setConversationContext((prev) => updateContext(prev, cues, repMetrics as any));
          }
        }
      }
    },
  });

  // Handler for sending messages (clears input after send)
  const handleSendMessage = () => {
    if (!input.trim() || sendResponseMutation.isPending) return;
    
    // PHASE 1: Clear upcoming signals when rep responds (they've now seen and responded to them)
    setUpcomingHCPSignals(null);
    
    sendResponseMutation.mutate(input.trim());
    setInput("");
  };

  const endScenarioMutation = useMutation({
    mutationFn: async () => {
      console.log('[END SESSION] Button clicked - mutation starting');
      // Capture messages BEFORE ending session (backend may clear)
      const currentData = queryClient.getQueryData<SessionPayload>(["/api/roleplay/session"]);
      const messagesBeforeEnd = currentData?.messages ?? [];
      console.log("[END SESSION] Captured messages before end:", messagesBeforeEnd.length);

      const res = await apiRequest("POST", "/api/roleplay/end");
      if (!res.ok) throw new Error("end_failed");
      const responseData = await res.json();

      return { responseData, messagesBeforeEnd };
    },
    onSuccess: async ({ responseData: data, messagesBeforeEnd }) => {
      await new Promise((resolve) => queueMicrotask(resolve));
      await queryClient.invalidateQueries({ queryKey: ["/api/roleplay/session"] });
      await queryClient.refetchQueries({ queryKey: ["/api/roleplay/session"] });

      const finalMessages = messagesBeforeEnd;
      console.log("[END SESSION] Using captured messages for scoring:", finalMessages.length);
      console.log("[END SESSION DEBUG] Final messages count:", finalMessages.length);

      // Worker Response Contract Adapter
      console.log("[WORKER ADAPTER] Raw response:", data);

      let normalizedData = data;
      if ((data as any)?.coach && !(data as any)?.analysis) {
        console.log("[WORKER ADAPTER] Detected Worker response, normalizing...");
        normalizedData = {
          ...data,
          analysis: {
            overallScore: (data as any).coach.overall ?? 3,
            eqMetrics: (data as any).coach.metricResults ?? {},
            strengths: (data as any).coach.strengths ?? [],
            improvements: (data as any).coach.improvements ?? [],
            recommendations: (data as any).coach.recommendations ?? [],
          },
        };
        console.log("[WORKER ADAPTER] Normalized data:", normalizedData);
      }

      // Priority: Worker scores > Client-side fallback
      let scoredMetrics: MetricResult[];

      if ((data as any)?.coach?.metricResults && Array.isArray((data as any).coach.metricResults)) {
        console.log("[WORKER SCORES] Using Cloudflare Worker metricResults:", (data as any).coach.metricResults);
        scoredMetrics = (data as any).coach.metricResults;
      } else {
        console.log("[FALLBACK] Worker metricResults not available, using client-side scoring");
        console.log("[FALLBACK] Scoring with", finalMessages.length, "messages");
        const transcript: Transcript = finalMessages.map((msg) => ({
          speaker: msg.role === "user" ? "rep" : "customer",
          text: msg.content,
        }));
        console.log("[FALLBACK] Created transcript with", transcript.length, "turns");
        scoredMetrics = scoreAllMetrics(transcript);
        console.log("[FALLBACK] Scoring complete, got", scoredMetrics.length, "results");
      }

      setMetricResults(scoredMetrics);

      // Save scores to localStorage for EI Metrics page (Signal Intelligence IDs)
      const { saveRoleplayScores } = await import("@/lib/signal-intelligence/score-storage");

      // Canonical ID mapping: METRICS_SPEC IDs → Signal Intelligence capability IDs
      // ✅ FIX: ensure keys are consistently quoted
      const ID_MAPPING: Record<string, string> = {
        "question_quality": "signal-awareness",
        "listening_responsiveness": "signal-interpretation",
        "making_it_matter": "making-it-matter",
        "customer_engagement_signals": "customer-engagement-monitoring",
        "conversation_control_structure": "conversation-management",
        "adaptability": "adaptive-response",
        "commitment_gaining": "commitment-generation",
        "objection_navigation": "objection-navigation",
      };

      const scoresMap: Record<string, number> = {};
      scoredMetrics.forEach((m) => {
        const canonicalId = ID_MAPPING[m.id] || m.id;
        if (m.overall_score !== null && !m.not_applicable) {
          scoresMap[canonicalId] = m.overall_score;
        }
      });
      saveRoleplayScores(scoresMap);

      // Collect all detected cues from final messages (HCP only)
      const hcpMood = (currentScenario as any)?.hcpMood || '';
      const allCues: ObservableCue[] = [];
      finalMessages.forEach((msg) => {
        if (msg.role === "assistant") {
          const cues = detectObservableCues(msg.content, hcpMood);
          allCues.push(...cues);
        }
      });
      setAllDetectedCues(allCues);

      let feedback;
      try {
        feedback = mapToComprehensiveFeedback(normalizedData, scoredMetrics);
        console.log('[END SESSION] Feedback generated:', feedback);
        console.log('[END SESSION] Metric results:', scoredMetrics);
      } catch (error) {
        console.error('[END SESSION] Error generating feedback:', error);
        // Create minimal fallback feedback
        feedback = {
          overallScore: 3,
          performanceLevel: 'developing',
          eqScores: [],
          salesSkillScores: [],
          topStrengths: ['Session completed'],
          priorityImprovements: ['Continue practicing'],
          specificExamples: [],
          nextSteps: ['Review the conversation'],
          overallSummary: 'Session complete. Unable to generate detailed feedback.'
        };
        console.log('[END SESSION] Using fallback feedback');
      }

      setFeedbackScenarioTitle((data as any)?.scenario?.title || selectedScenario?.title || "Role-Play Session");
      setFeedbackData(feedback);
      console.log('[END SESSION] Setting showFeedbackDialog to true');
      setShowFeedbackDialog(true);
      setRoleplayEndError(null);
    },
    onError: (error) => {
      console.error('[END SESSION] Error occurred:', error);
      setRoleplayEndError("Unable to end role-play.");
    },
  });

  const handleReset = async () => {
    // Clear backend session first
    try {
      await apiRequest("POST", "/api/roleplay/end");
    } catch (error) {
      console.warn("Reset: Failed to end session on backend", error);
    }

    // Clear all local state
    setCurrentScenario(null);
    setSelectedDiseaseState("");
    setSelectedSpecialty("");
    setSelectedHcpCategory("");
    setSelectedInfluenceDriver("");
    setSessionSignals([]);
    setFeedbackData(null);
    setMetricResults([]);
    setAllDetectedCues([]);
    setShowFeedbackDialog(false);
    setInput("");
    setConversationContext(createInitialContext());
    endCalledForSessionRef.current.clear();
    setFailOpenTriggered(false);

    await queryClient.invalidateQueries({ queryKey: ["/api/roleplay/session"] });
    await queryClient.refetchQueries({ queryKey: ["/api/roleplay/session"] });
  };

  /* -----------------------------
     Render
  ------------------------------ */

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-chart-2 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Role-Play Simulator</h1>
            <p className="text-sm text-muted-foreground">
              Practice with Signal Intelligence feedback
            </p>
          </div>
        </div>

        {isActive && (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                console.log('[END SESSION] End Session button clicked');
                endScenarioMutation.mutate();
              }}
              disabled={endScenarioMutation.isPending}
            >
              {endScenarioMutation.isPending ? "Ending..." : "End Session & Get Feedback"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* FAIL-OPEN BANNER */}
      {(failOpenTriggered || sessionError) && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800 px-6 py-2">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            ⚠️ Limited mode: Session initialization unavailable. You can still browse and start scenarios.
          </p>
        </div>
      )}

      {!isActive ? (
        <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Filter Controls - Matching AI Coach Page */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedDiseaseState}
                onChange={(e) => setSelectedDiseaseState(e.target.value)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Disease State</option>
                {diseaseStates.map((disease) => (
                  <option key={(disease as any).id} value={(disease as any).id}>
                    {(disease as any).name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Specialty</option>
                {availableSpecialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>

              <select
                value={selectedHcpCategory}
                onChange={(e) => setSelectedHcpCategory(e.target.value)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">HCP Category</option>
                {hcpCategories.map((category) => (
                  <option key={(category as any).id} value={(category as any).id}>
                    {(category as any).name}
                  </option>
                ))}
              </select>

              <select
                value={selectedInfluenceDriver}
                onChange={(e) => setSelectedInfluenceDriver(e.target.value)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Influence Driver</option>
                {influenceDrivers.map((driver) => (
                  <option key={(driver as any).id} value={(driver as any).id}>
                    {(driver as any).name}
                  </option>
                ))}
              </select>
            </div>

            {/* Practice Signal Intelligence Section */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">
                  Practice Signal Intelligence™ in a Range of Realistic Scenarios
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed mt-2">
                  Each role-play emphasizes different judgment challenges, helping participants strengthen Signal Intelligence™ across diverse conversation types. Participants practice noticing signals, interpreting meaning, and responding thoughtfully as conversations evolve.
                </CardDescription>
                <CardDescription className="text-sm leading-relaxed mt-3">
                  Scenarios are intentionally designed to bring specific behaviors into focus—reflecting the realities of high-stakes professional dialogue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">
                  Depending on the scenario, practice may emphasize behaviors such as:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Asking purposeful questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Noticing shifts in engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Navigating resistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Adjusting approach as new information emerges</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Scenario Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScenarios.map((scenario: any) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isStarting={startScenarioMutation.isPending}
                  onStart={(s) => startScenarioMutation.mutate(s)}
                  onPreCallPlan={(s) => {
                    setCurrentScenario(s);
                    setPreCallPlanOpen(true);
                  }}
                />
              ))}
            </div>

            {filteredScenarios.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No scenarios match your filters. Try adjusting your selection.
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scenario Context Card - Compact */}
            {currentScenario && (
              <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    {(currentScenario as any).title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {((currentScenario as any).stakeholder || "").trim() && (
                    <div>
                      <p className="font-semibold text-muted-foreground mb-1">HCP Profile</p>
                      <p className="text-sm">{(currentScenario as any).stakeholder}</p>
                    </div>
                  )}
                  {((currentScenario as any).hcpMood || "").trim() && (
                    <div>
                      <p className="font-semibold text-muted-foreground mb-1">HCP Mood</p>
                      <p className="text-sm italic text-amber-600 dark:text-amber-400">
                        {(currentScenario as any).hcpMood}
                      </p>
                    </div>
                  )}
                  {((currentScenario as any).openingScene || "").trim() && (
                    <div>
                      <p className="font-semibold text-muted-foreground mb-1">Scene</p>
                      <p className="text-sm italic">
                        {(currentScenario as any).openingScene}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4 pb-4">
                {messages.map((m, idx) => {
                  const cues = cueCacheByMessageId.get(m.id) || [];

                  const prevHcpMessage =
                    idx > 0 && messages[idx - 1].role === "assistant"
                      ? messages[idx - 1].content
                      : undefined;

                  const transcript = messages.slice(0, idx + 1).map((msg) => ({
                    speaker: msg.role === "user" ? ("rep" as const) : ("customer" as const),
                    text: msg.content,
                  }));
                  
                  // Rep metrics for context updates (keep existing behavior)
                  const repMetrics = m.role === "user" ? detectRepMetrics(m.content, prevHcpMessage) : [];

                  const hcpBehavioralDescText =
                    m.role === "assistant" && idx > 0
                      ? behavioralDescCacheByMessageId.get(m.id)
                      : null;

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-chart-2 text-white"
                        }`}
                      >
                        {m.role === "user" ? "You" : <Users className="h-4 w-4" />}
                      </div>

                      <div className="max-w-[80%] space-y-2">
                        <div
                          className={`p-3 rounded-lg ${
                            m.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        </div>

                        {/* HCP Behavioral Description */}
                        {hcpBehavioralDescText && (
                          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700">
                            <p className="text-sm italic text-blue-800 dark:text-blue-200">
                              {hcpBehavioralDescText}
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="pt-3 border-t space-y-2 bg-background flex-shrink-0">
              
              <div className="flex gap-2">
                <Textarea
                  className="min-h-[60px] max-h-[100px] resize-none"
                  placeholder="Type your response..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!input.trim() || sendResponseMutation.isPending) return;
                      // PHASE 1: Clear upcoming signals when rep responds
                      setUpcomingHCPSignals(null);
                      sendResponseMutation.mutate(input.trim());
                      setInput("");
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={sendResponseMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCues(!showCues)}
                  title={showCues ? "Hide observable cues" : "Show observable cues"}
                >
                  {showCues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>

              {roleplayEndError && <div className="text-sm text-destructive">{roleplayEndError}</div>}
            </div>
          </div>

          <Card className="w-full md:w-80 lg:w-96 flex flex-col flex-shrink-0 overflow-hidden hidden md:flex">
            <CardContent className="flex-1 pt-6">
              <SignalIntelligencePanel
                signals={sessionSignals}
                hasActivity={sessionSignals.length > 0}
                isLoading={sendResponseMutation.isPending}
                compact
                metricResults={metricResults}
                detectedCues={allDetectedCues}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <RoleplayFeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        feedback={feedbackData}
        scenarioTitle={feedbackScenarioTitle}
        onStartNew={handleReset}
        detectedCues={allDetectedCues}
        metricResults={metricResults}
      />

      <PreCallPlanDialog
        open={preCallPlanOpen}
        onOpenChange={setPreCallPlanOpen}
        scenario={currentScenario}
      />
    </div>
  );
}

export default function RolePlayPageWithErrorBoundary() {
  return (
    <RoleplayErrorBoundary>
      <RolePlayPage />
    </RoleplayErrorBoundary>
  );
}
