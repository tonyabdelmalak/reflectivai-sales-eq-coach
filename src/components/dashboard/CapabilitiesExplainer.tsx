import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';
import { CAPABILITIES, MICROCOPY, SIGNAL_INTELLIGENCE_DEFINITIONS } from '@/lib/governance-constants';

export function CapabilitiesExplainer() {
  const [viewMode, setViewMode] = useState<'canonical' | 'governance'>('canonical');

  const sensemakingCapabilities = CAPABILITIES.filter(c => c.group === 'Signal Sensemaking');
  const responseCapabilities = CAPABILITIES.filter(c => c.group === 'Signal Response');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Signal Intelligence Capabilities</h2>
          <p className="text-sm text-muted-foreground">
            Behavior-based framework for professional judgment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'canonical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('canonical')}
          >
            Canonical
          </Button>
          <Button
            variant={viewMode === 'governance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('governance')}
          >
            Governance
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Framework Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {viewMode === 'canonical' 
              ? SIGNAL_INTELLIGENCE_DEFINITIONS.canonical
              : SIGNAL_INTELLIGENCE_DEFINITIONS.governanceForward
            }
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Signal Sensemaking (1-3)</h3>
          <p className="text-sm text-muted-foreground">Recognizing and interpreting observable patterns</p>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {sensemakingCapabilities.map((capability) => (
            <AccordionItem key={capability.id} value={`capability-${capability.id}`} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <Badge variant="outline" className="flex-shrink-0">{capability.id}</Badge>
                  <span className="font-medium">{capability.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div>
                  <p className="text-sm font-medium mb-1">Definition</p>
                  <p className="text-sm text-muted-foreground">{capability.definition}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Behavioral Metric</p>
                  <Badge variant="secondary" className="text-xs">{capability.behavioralMetric}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Observable Indicators</p>
                  <ul className="space-y-1">
                    {capability.observableIndicators.map((indicator, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    What This Is NOT
                  </p>
                  <ul className="space-y-1">
                    {capability.whatThisIsNot.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">×</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Signal Response (4-8)</h3>
          <p className="text-sm text-muted-foreground">Adapting behavior based on observed signals</p>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {responseCapabilities.map((capability) => (
            <AccordionItem key={capability.id} value={`capability-${capability.id}`} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <Badge variant="outline" className="flex-shrink-0">{capability.id}</Badge>
                  <span className="font-medium">{capability.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div>
                  <p className="text-sm font-medium mb-1">Definition</p>
                  <p className="text-sm text-muted-foreground">{capability.definition}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Behavioral Metric</p>
                  <Badge variant="secondary" className="text-xs">{capability.behavioralMetric}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Observable Indicators</p>
                  <ul className="space-y-1">
                    {capability.observableIndicators.map((indicator, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    What This Is NOT
                  </p>
                  <ul className="space-y-1">
                    {capability.whatThisIsNot.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">×</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Governance & Boundaries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Ethical Boundary</p>
            <p className="text-sm text-muted-foreground italic">
              {MICROCOPY.governancePanel.ethicalBoundary}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Core Principle</p>
            <p className="text-sm text-muted-foreground italic">
              {MICROCOPY.governancePanel.signalsReminder}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">What Signal Intelligence Is NOT</p>
            <ul className="space-y-1">
              {MICROCOPY.governancePanel.whatSignalIntelligenceIsNot.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
