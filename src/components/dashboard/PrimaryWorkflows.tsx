import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Dumbbell, BookOpen, ArrowRight } from 'lucide-react';
import { MICROCOPY } from '@/lib/governance-constants';

const workflows = [
  {
    id: 'ai-coach',
    title: MICROCOPY.workflows.aiCoach.title,
    description: MICROCOPY.workflows.aiCoach.description,
    whyItMatters: MICROCOPY.workflows.aiCoach.whyItMattersToday,
    capabilities: MICROCOPY.workflows.aiCoach.supportedCapabilities,
    icon: MessageSquare,
    route: '/chat',
    recommended: true,
  },
  {
    id: 'roleplay',
    title: MICROCOPY.workflows.roleplay.title,
    description: MICROCOPY.workflows.roleplay.description,
    whyItMatters: MICROCOPY.workflows.roleplay.whyItMattersToday,
    capabilities: MICROCOPY.workflows.roleplay.supportedCapabilities,
    icon: Users,
    route: '/roleplay',
    recommended: false,
  },
  {
    id: 'exercises',
    title: MICROCOPY.workflows.exercises.title,
    description: MICROCOPY.workflows.exercises.description,
    whyItMatters: MICROCOPY.workflows.exercises.whyItMattersToday,
    capabilities: MICROCOPY.workflows.exercises.supportedCapabilities,
    icon: Dumbbell,
    route: '/exercises',
    recommended: false,
  },
  {
    id: 'modules',
    title: 'Coaching Modules',
    description: 'Structured learning modules for skill development',
    whyItMatters: 'Build foundational skills through guided learning paths',
    capabilities: ['All Signal Intelligence capabilities'],
    icon: BookOpen,
    route: '/modules',
    recommended: false,
  },
];

export function PrimaryWorkflows() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Primary Workflows</h2>
        <p className="text-sm text-muted-foreground">
          Practice and develop Signal Intelligence capabilities
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {workflows.map((workflow) => {
          const Icon = workflow.icon;
          return (
            <Link key={workflow.id} href={workflow.route}>
              <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{workflow.title}</CardTitle>
                      </div>
                    </div>
                    {workflow.recommended && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {workflow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Why it matters today</p>
                    <p className="text-sm text-muted-foreground">{workflow.whyItMatters}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Supported Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.capabilities.map((cap, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-primary pt-2">
                    <span>Get started</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
