/**
 * Rep Metric Evaluation Component
 * Displays real-time evaluation of sales rep responses across 8 behavioral metrics
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RepMetricCategory =
  | "question"
  | "listening"
  | "value"
  | "engagement"
  | "objection"
  | "control"
  | "commitment"
  | "adaptability";

export interface RepMetricScore {
  metricId: string;
  metricName: string;
  score: number | null; // 1–5 or null if not applicable
  detected: boolean;
  rationale: string;
  category: RepMetricCategory;
}

interface RepMetricEvaluationProps {
  metrics: RepMetricScore[];
  compact?: boolean;
}

/* ============================================================
   ICONS
   ============================================================ */

const METRIC_ICONS: Record<RepMetricCategory, React.ReactNode> = {
  question: "❓",
  listening: "👂",
  value: "💎",
  engagement: "🤝",
  objection: "🛡️",
  control: "🎯",
  commitment: "✅",
  adaptability: "🔄",
};

/* ============================================================
   SCORE STYLING
   ============================================================ */

interface ScoreConfig {
  bg: string;
  text: string;
  icon: React.ReactNode;
}

const SCORE_COLORS: Record<1 | 2 | 3 | 4 | 5, ScoreConfig> = {
  5: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  4: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  3: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  2: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    icon: <TrendingDown className="h-4 w-4" />,
  },
  1: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
};

function normalizeScore(score: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(score);
  if (rounded <= 1) return 1;
  if (rounded === 2) return 2;
  if (rounded === 3) return 3;
  if (rounded === 4) return 4;
  return 5;
}

function getScoreLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Strong";
  if (score >= 2.5) return "Adequate";
  if (score >= 1.5) return "Developing";
  return "Needs Focus";
}

/* ============================================================
   METRIC CARD
   ============================================================ */

function MetricScoreCard({
  metric,
  compact,
}: {
  metric: RepMetricScore;
  compact?: boolean;
}) {
  const icon = METRIC_ICONS[metric.category];

  const hasScore = metric.score !== null;
  const scoreKey = hasScore ? normalizeScore(metric.score!) : null;
  const scoreConfig = scoreKey ? SCORE_COLORS[scoreKey] : null;

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-sm font-medium">{metric.metricName}</p>
            {metric.detected && metric.rationale && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {metric.rationale}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasScore && scoreConfig ? (
            <>
              <Badge
                variant="outline"
                className={cn("text-xs", scoreConfig.bg, scoreConfig.text)}
              >
                {metric.score!.toFixed(1)}/5
              </Badge>
              {scoreConfig.icon}
            </>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Not Detected
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("transition-all", metric.detected && "ring-2 ring-primary/20")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <CardTitle className="text-base">{metric.metricName}</CardTitle>
          </div>

          {hasScore && scoreConfig && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md",
                scoreConfig.bg,
                scoreConfig.text
              )}
            >
              {scoreConfig.icon}
              <span className="text-sm font-semibold">
                {metric.score!.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {hasScore ? (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{getScoreLabel(metric.score!)}</span>
                <span>{metric.score!.toFixed(1)}/5.0</span>
              </div>
              <Progress value={(metric.score! / 5) * 100} className="h-2" />
            </div>

            {metric.rationale && (
              <p className="text-sm text-muted-foreground">
                {metric.rationale}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <Badge variant="secondary" className="text-xs">
              Not Demonstrated
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              This metric was not detected in your response
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export function RepMetricEvaluation({
  metrics,
  compact = false,
}: RepMetricEvaluationProps) {
  if (!metrics?.length) return null;

  const detected = metrics.filter(
    (m) => m.detected && m.score !== null
  );

  const average =
    detected.length > 0
      ? detected.reduce((sum, m) => sum + (m.score ?? 0), 0) /
        detected.length
      : null;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div>
          <h4 className="text-sm font-semibold">Response Evaluation</h4>
          <p className="text-xs text-muted-foreground">
            {detected.length} of {metrics.length} metrics demonstrated
          </p>
        </div>

        {average !== null && (
          <div className="text-right">
            <div className="text-2xl font-bold">
              {average.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg Score
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {compact ? (
        <div className="space-y-0 border border-border rounded-lg p-3">
          {metrics.map((metric) => (
            <MetricScoreCard
              key={metric.metricId}
              metric={metric}
              compact
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <MetricScoreCard
              key={metric.metricId}
              metric={metric}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   INLINE VERSION
   ============================================================ */

export function InlineRepMetricEvaluation({
  metrics,
}: {
  metrics: RepMetricScore[];
}) {
  const scored = metrics
    .filter((m) => m.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  if (!scored.length) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Continue the conversation to see your behavioral scores...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {scored.map((metric) => {
        const scoreKey = normalizeScore(metric.score!);
        const scoreConfig = SCORE_COLORS[scoreKey];
        const icon = METRIC_ICONS[metric.category];

        return (
          <Badge
            key={metric.metricId}
            variant="outline"
            className={cn("text-xs", scoreConfig.bg, scoreConfig.text)}
            title={metric.rationale}
          >
            <span className="mr-1">{icon}</span>
            {metric.metricName}: {metric.score!.toFixed(1)}
          </Badge>
        );
      })}
    </div>
  );
}
