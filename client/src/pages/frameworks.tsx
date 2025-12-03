import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Ear,
  Heart,
  Handshake,
  ChevronRight,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { eqFrameworks } from "@/lib/data";
import type { EQFramework } from "@shared/schema";

const frameworkIcons: Record<string, any> = {
  disc: Brain,
  "active-listening": Ear,
  "empathy-mapping": Heart,
  "rapport-building": Handshake,
};

export default function FrameworksPage() {
  const [selectedFramework, setSelectedFramework] = useState<EQFramework | null>(null);

  if (selectedFramework) {
    const IconComponent = frameworkIcons[selectedFramework.id] || Brain;

    return (
      <div className="h-full overflow-auto">
        <div className="p-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedFramework(null)}
            data-testid="button-back-frameworks"
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Frameworks
          </Button>

          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-md bg-${selectedFramework.color} flex items-center justify-center`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl" data-testid="text-framework-detail-title">
                      {selectedFramework.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {selectedFramework.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Key Principles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedFramework.principles.map((principle, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`h-6 w-6 rounded-full bg-${selectedFramework.color}/10 flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-xs font-medium text-${selectedFramework.color}`}>{index + 1}</span>
                        </div>
                        <span className="text-sm">{principle}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">In pharma sales contexts:</p>
                    <p className="text-sm text-muted-foreground">
                      Apply this framework when meeting with healthcare providers to build stronger relationships and understand their unique prescribing motivations.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Practice daily:</p>
                    <p className="text-sm text-muted-foreground">
                      Use the role-play simulator to practice applying this framework in realistic pharma scenarios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Techniques & Examples</CardTitle>
                <CardDescription>
                  Practical techniques with real-world pharma sales examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {selectedFramework.techniques.map((technique, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold mb-1">{technique.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {technique.description}
                      </p>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Example:</p>
                        <p className="text-sm italic">"{technique.example}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl font-bold" data-testid="text-frameworks-title">Emotional Intelligence Frameworks</h1>
          <p className="text-muted-foreground">
            Master the core EQ frameworks essential for pharma sales success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {eqFrameworks.map((framework) => {
            const IconComponent = frameworkIcons[framework.id] || Brain;
            return (
              <Card
                key={framework.id}
                className="hover-elevate cursor-pointer"
                onClick={() => setSelectedFramework(framework)}
                data-testid={`card-framework-${framework.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-md bg-${framework.color} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{framework.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {framework.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Key Principles:</h4>
                    <ul className="space-y-1">
                      {framework.principles.slice(0, 3).map((principle, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{principle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {framework.techniques.length} techniques
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Learn More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Why Emotional Intelligence Matters in Pharma Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-chart-1" />
                </div>
                <h4 className="font-medium mb-1">Build Trust</h4>
                <p className="text-sm text-muted-foreground">
                  Healthcare providers are more likely to engage with reps who demonstrate genuine understanding
                </p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-3">
                  <Ear className="h-6 w-6 text-chart-2" />
                </div>
                <h4 className="font-medium mb-1">Understand Needs</h4>
                <p className="text-sm text-muted-foreground">
                  EQ skills help uncover the real challenges and priorities of your stakeholders
                </p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto mb-3">
                  <Handshake className="h-6 w-6 text-chart-3" />
                </div>
                <h4 className="font-medium mb-1">Drive Results</h4>
                <p className="text-sm text-muted-foreground">
                  Strong relationships lead to better access, more productive discussions, and improved outcomes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
