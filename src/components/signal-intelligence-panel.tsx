import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageCircle,
  Clock,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { MetricResult } from "@/lib/signal-intelligence/scoring";
import { getCuesForMetric } from "@/lib/observable-cue-to-metric-map";
import type { ObservableCue } from "@/lib/observable-cues";
import { BEHAVIORAL_METRIC_IDS, METRICS_VERSION } from "@/lib/signal-intelligence/metrics-spec";
import { CueBadge } from "@/components/CueBadge";
import { behavioralMetrics } from "@/lib/data";

// Capability to Metric Mapping
const METRIC_TO_CAPABILITY: Record<string, string> = {
  'question_quality': 'Signal Awareness',
  'listening_responsiveness': 'Signal Awareness',
  'making_it_matter': 'Value Communication',
  'customer_engagement_signals': 'Engagement Detection',
  'objection_navigation': 'Objection Handling',
  'conversation_control_structure': 'Conversation Management',
  'commitment_gaining': 'Commitment Gaining',
  'adaptability': 'Adaptive Response',
};

export type SignalIntelligenceCapability = {
  id?: string;
  type: "verbal" | "conversational" | "engagement" | "contextual";
  signal: string;
  interpretation: string;
  evidence?: string;
  suggestedOptions?: string[];
  timestamp?: string;
}

type SignalIntelligencePanelProps = {
  signals: SignalIntelligenceCapability[];
  isLoading?: boolean;
  hasActivity?: boolean;
  compact?: boolean;
  metricResults?: MetricResult[];
  detectedCues?: ObservableCue[];
}

const signalTypeConfig = {
  verbal: {
    label: "VERBAL",
    icon: MessageCircle,
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/10",
    borderColor: "border-amber-200 dark:border-amber-800/30"
  },
  conversational: {
    label: "CONVERSATIONAL",
    icon: MessageCircle,
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/10",
    borderColor: "border-emerald-200 dark:border-emerald-800/30"
  },
  engagement: {
    label: "ENGAGEMENT",
    icon: Eye,
    color: "text-sky-700 dark:text-sky-300",
    bgColor: "bg-sky-50/50 dark:bg-sky-950/10",
    borderColor: "border-sky-200 dark:border-sky-800/30"
  },
  contextual: {
    label: "CONTEXTUAL",
    icon: Clock,
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-50/50 dark:bg-violet-950/10",
    borderColor: "border-violet-200 dark:border-violet-800/30"
  }
};

function getSafeSignalType(type: unknown): SignalIntelligenceCapability["type"] {
  if (
    type === "verbal" ||
    type === "conversational" ||
    type === "engagement" ||
    type === "contextual"
  ) {
    return type;
  }
  return "contextual";
}

function getSignalConfig(type: unknown) {
  return signalTypeConfig[getSafeSignalType(type)];
}

function SignalCard({ signal }: { signal: SignalIntelligenceCapability }) {
  const config = getSignalConfig(signal.type);

  if (!signal.signal && !signal.interpretation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between py-2 border-b border-border/40 last:border-0"
    >
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[9px] py-0 px-1.5 ${config.color} border-current font-bold tracking-wide`}>
            {config.label}
          </Badge>
          <span className="text-xs font-semibold text-foreground">{signal.signal}</span>
        </div>

        <p className="text-xs text-muted-foreground leading-snug pl-0">
          {signal.interpretation}
        </p>

        {signal.evidence && (
          <p className="text-[11px] text-muted-foreground/70 italic leading-snug pl-0">
              Evidence: “{signal.evidence}”
          </p>
        )}

        {Array.isArray(signal.suggestedOptions) &&
          signal.suggestedOptions.length > 0 && (
            <div className="mt-1 space-y-0.5 pl-0">
              {signal.suggestedOptions.map((opt, i) => (
                <div key={i} className="text-xs text-primary pl-2 border-l-2 border-primary/30 leading-snug">
                  {opt}
                </div>
              ))}
            </div>
          )}
      </div>
    </motion.div>
  );
}

export function SignalIntelligencePanel({
  signals,
  isLoading,
  hasActivity,
  compact = false,
  metricResults = [],
  detectedCues = []
}: SignalIntelligencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const validSignals = signals.filter(
    s => s?.signal?.trim() || s?.interpretation?.trim()
  );

  const hasMetrics = metricResults.length > 0;

  if (!hasActivity && validSignals.length === 0) {
    return (
      <div className="space-y-3">
        <Header title="Signals" />
        <EmptyState text="Signals will appear as the conversation progresses." />
      </div>
    );
  }

  if (isLoading && validSignals.length === 0) {
    return (
      <div className="space-y-3">
        <Header title="Detecting signals..." pulse />
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const displaySignals = compact ? validSignals.slice(-3) : validSignals;

  return (
    <div className="space-y-4">
      {hasMetrics && (
        <div className="space-y-1.5 rounded-lg p-3 border-2" style={{ backgroundColor: 'hsl(215, 60%, 15%)', borderColor: 'hsl(var(--primary))' }}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Behavioral Metrics</h4>
            <span className="text-[10px] text-white/60 font-mono">{METRICS_VERSION}</span>
          </div>
          <p className="text-[11px] text-white/80 leading-tight">
            Observed behaviors during this session, including questioning approach, responsiveness, engagement signals, and next-step clarity.
          </p>
          <div className="space-y-0.5">
            {BEHAVIORAL_METRIC_IDS.map(metricId => {
              const m = metricResults.find(r => r.id === metricId);
              const metricName = metricId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              
              // DEBUG: Log metric matching
              if (!m) {
                console.log(`[SCORING PANEL] No metric found for ID: ${metricId}`);
                console.log(`[SCORING PANEL] Available metric IDs:`, metricResults.map(r => r.id));
              }
              
              const score = m?.overall_score ?? null;
              const isNotApplicable = m?.not_applicable === true;
              
              const relevantMappings = getCuesForMetric(metricId as any);
              const relevantCues = detectedCues.filter(cue => 
                relevantMappings.some(mapping => mapping.cueId === cue.id)
              );
              const hasEvidence = relevantCues.length > 0;

              const capabilityLabel = METRIC_TO_CAPABILITY[metricId];
              
              return (
                <div 
                  key={metricId} 
                  id={`metric-${metricId}`}
                  className="flex items-center justify-between text-xs group scroll-mt-4 py-1.5"
                >
                  <div className="flex flex-col gap-0.5 flex-1">
                    {capabilityLabel && (
                      <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">
                        {capabilityLabel}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-medium">{m?.metric || metricName}</span>
                    {hasEvidence && (
                      <Sheet>
                        <SheetTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle>What influenced {m?.metric || metricName}?</SheetTitle>
                            <SheetDescription>
                              Observable cues detected during the role play that relate to this metric.
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-6">
                            <>
                            {/* Observable Cues */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold">Detected Cues</h4>
                              {relevantCues.map((cue, idx) => {
                                const mapping = relevantMappings.find(m => m.cueId === cue.id);
                                return (
                                  <div key={idx} className="space-y-2 p-3 border rounded-lg">
                                    <CueBadge cue={cue} size="sm" />
                                    {mapping && (
                                      <div className="space-y-1">
                                        {mapping.component && (
                                          <p className="text-xs font-medium text-muted-foreground">
                                            Component: {mapping.component}
                                          </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                          {mapping.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Coaching Insights */}
                            {(() => {
                              const metricData = behavioralMetrics.find(bm => bm.id === metricId);
                              if (metricData?.coachingInsight && metricData.coachingInsight.length > 0) {
                                return (
                                  <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="text-sm font-semibold text-blue-900">Coaching Insights</h4>
                                    <ul className="space-y-1.5">
                                      {metricData.coachingInsight.map((insight, idx) => (
                                        <li key={idx} className="text-xs text-blue-800 flex items-start gap-2">
                                          <span className="text-blue-600 mt-0.5">•</span>
                                          <span>{insight}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            </>
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                    </div>
                  </div>
                  <span className="font-semibold text-primary text-sm">
                    {isNotApplicable ? 'N/A' : (score !== null && score !== undefined ? score.toFixed(1) : '—')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {!hasMetrics && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Behavioral Metrics</h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Start a Role Play to generate a Signal Intelligence Score.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-1.5 rounded-lg p-3 border-2 bg-card">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Signals</h4>
          {!compact && displaySignals.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight">
          Observable communication patterns detected during the conversation.
        </p>

        <AnimatePresence>
          {(isExpanded || compact) && displaySignals.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-[300px] overflow-y-auto space-y-0 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {displaySignals.map((s, i) => (
                  <SignalCard key={s.id ?? i} signal={s} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {displaySignals.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-xs text-muted-foreground">Signals will appear as the conversation progresses.</p>
          </div>
        )}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
            <AlertCircle className="h-3 w-3" />
            <span>Observable signals only</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">
            Signal Intelligence reflects observable communication patterns.
            These are hypotheses, not conclusions about emotion, intent, or competence.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function Header({
  title,
  count,
  pulse
}: {
  title: string;
  count?: number;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Activity className={`h-4 w-4 text-primary ${pulse ? "animate-pulse" : ""}`} />
      <h4 className="text-sm font-medium">{title}</h4>
      {typeof count === "number" && count > 0 && (
        <Badge variant="secondary" className="text-xs py-0">
          {count}
        </Badge>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
      <Activity className="h-8 w-8 mb-2 opacity-30" />
      <p className="text-xs">{text}</p>
    </div>
  );
}
