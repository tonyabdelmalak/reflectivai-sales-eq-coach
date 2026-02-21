import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Lightbulb, Target, Zap } from 'lucide-react';
import { MICROCOPY } from '@/lib/governance-constants';

interface TodayPanelProps {
  tip?: string;
  focusArea?: string;
  motivation?: string;
}

export function TodayPanel({ tip, focusArea, motivation }: TodayPanelProps) {
  // Mobile: collapsed by default
  const [isOpen, setIsOpen] = useState(false);

  const todayTip = tip || 'Notice when customers shift from asking about features to asking about implementation—this signals readiness to explore next steps.';
  const todayFocus = focusArea || 'Signal Interpretation: Practice forming working hypotheses about what customer signals indicate.';
  const todayMotivation = motivation || 'Strong signal interpretation helps you respond to what customers need, not just what they say.';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{MICROCOPY.todayPanel.title}</CardTitle>
              <CardDescription className="text-sm">
                {MICROCOPY.todayPanel.whyThisMatters}
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <button 
                className="rounded-md p-2 hover:bg-muted transition-colors flex-shrink-0"
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium">Today's Tip</p>
                <p className="text-sm text-muted-foreground">{todayTip}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium">Focus Area</p>
                <p className="text-sm text-muted-foreground">{todayFocus}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium">Why This Matters</p>
                <p className="text-sm text-muted-foreground">{todayMotivation}</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground italic">
                AI highlights patterns to guide attention. You apply judgment.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
