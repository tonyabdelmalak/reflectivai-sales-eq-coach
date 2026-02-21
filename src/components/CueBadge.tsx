import { Badge } from '@/components/ui/badge';
import { BehavioralCue, RepMetricCue } from '@/lib/observable-cues';
import { Clock, AlertCircle, TrendingDown, Shield, Eye, HelpCircle, Zap, Volume2, UserX, MessageSquare, Ear, Target, Users, Navigation, ListChecks, CheckCircle, Repeat } from 'lucide-react';

interface CueBadgeProps {
  cue: BehavioralCue;
  size?: 'sm' | 'md';
}

const CUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'time-pressure': Clock,
  'low-engagement': TrendingDown,
  'frustration': AlertCircle,
  'defensive': Shield,
  'distracted': Eye,
  'hesitant': HelpCircle,
  'uncomfortable': HelpCircle,
  'impatient': Zap,
  'disinterested': Volume2,
  'withdrawn': UserX,
};

const CUE_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

export function CueBadge({ cue, size = 'md' }: CueBadgeProps) {
  const Icon = CUE_ICONS[cue.id] || AlertCircle;
  const colorClass = CUE_COLORS[cue.severity];

  // Small size for compact display (signal intelligence panel)
  if (size === 'sm') {
    return (
      <Badge
        variant="outline"
        className={`${colorClass} flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium`}
        title={cue.description}
      >
        <Icon className="h-3.5 w-3.5" />
        {cue.label}
      </Badge>
    );
  }

  // Full size for roleplay page - show FULL description like a movie scene
  return (
    <div className={`${colorClass} rounded-lg border px-4 py-3 text-sm`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-semibold mb-1">{cue.label}</div>
          <div className="text-xs leading-relaxed opacity-90">{cue.description}</div>
        </div>
      </div>
    </div>
  );
}

interface CueBadgeGroupProps {
  cues: BehavioralCue[];
  size?: 'sm' | 'md';
}

export function CueBadgeGroup({ cues, size = 'md' }: CueBadgeGroupProps) {
  if (cues.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-3">
      {cues.map((cue, index) => (
        <div key={cue.id} className="flex items-start gap-2">
          <span className="text-sm font-semibold text-muted-foreground mt-1 flex-shrink-0">{index + 1})</span>
          <CueBadge cue={cue} size={size} />
        </div>
      ))}
    </div>
  );
}

// Rep Metric Badge Component
interface RepMetricBadgeProps {
  metric: RepMetricCue;
}

const REP_METRIC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'question-quality': MessageSquare,
  'listening-responsiveness': Ear,
  'making-it-matter': Target,
  'customer-engagement': Users,
  'objection-navigation': Navigation,
  'conversation-control': ListChecks,
  'commitment-gaining': CheckCircle,
  'adaptability': Repeat,
};

export function RepMetricBadge({ metric }: RepMetricBadgeProps) {
  const Icon = REP_METRIC_ICONS[metric.id] || MessageSquare;

  return (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-800 border-green-300 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
      title={metric.description}
    >
      <Icon className="h-3.5 w-3.5" />
      {metric.label}
    </Badge>
  );
}

interface RepMetricBadgeGroupProps {
  metrics: RepMetricCue[];
}

export function RepMetricBadgeGroup({ metrics }: RepMetricBadgeGroupProps) {
  if (metrics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {metrics.map((metric) => (
        <RepMetricBadge key={metric.id} metric={metric} />
      ))}
    </div>
  );
}
