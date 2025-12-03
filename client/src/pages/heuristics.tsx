import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Copy,
  Check,
  MessageSquare,
  Shield,
  Sparkles,
  Search,
  Handshake,
  Brain,
} from "lucide-react";
import { heuristicTemplates } from "@/lib/data";
import type { HeuristicTemplate } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  objection: Shield,
  "value-proposition": Sparkles,
  closing: Target,
  discovery: Search,
  rapport: Handshake,
};

const categoryLabels: Record<string, string> = {
  objection: "Objection Handling",
  "value-proposition": "Value Proposition",
  closing: "Closing Techniques",
  discovery: "Discovery Questions",
  rapport: "Rapport Building",
};

export default function HeuristicsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates =
    activeCategory === "all"
      ? heuristicTemplates
      : heuristicTemplates.filter((t) => t.category === activeCategory);

  const handleCopy = async (template: HeuristicTemplate) => {
    await navigator.clipboard.writeText(template.template);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-chart-1 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-heuristics-title">Heuristic Language Templates</h1>
              <p className="text-muted-foreground">
                Proven language patterns for pharma sales conversations
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all" data-testid="tab-all-heuristics">All</TabsTrigger>
            <TabsTrigger value="discovery" data-testid="tab-discovery-heuristics">
              <Search className="h-3 w-3 mr-1" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="objection" data-testid="tab-objection-heuristics">
              <Shield className="h-3 w-3 mr-1" />
              Objection
            </TabsTrigger>
            <TabsTrigger value="value-proposition" data-testid="tab-value-heuristics">
              <Sparkles className="h-3 w-3 mr-1" />
              Value Prop
            </TabsTrigger>
            <TabsTrigger value="closing" data-testid="tab-closing-heuristics">
              <Target className="h-3 w-3 mr-1" />
              Closing
            </TabsTrigger>
            <TabsTrigger value="rapport" data-testid="tab-rapport-heuristics">
              <Handshake className="h-3 w-3 mr-1" />
              Rapport
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const IconComponent = categoryIcons[template.category] || MessageSquare;
            return (
              <Card key={template.id} data-testid={`card-heuristic-${template.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {categoryLabels[template.category]}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(template)}
                      data-testid={`button-copy-${template.id}`}
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-chart-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Template</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium">{template.template}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Example</h4>
                    <div className="bg-primary/5 p-3 rounded-lg border-l-2 border-primary">
                      <p className="text-sm text-muted-foreground italic">"{template.example}"</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">When to Use</h4>
                    <p className="text-sm text-muted-foreground">{template.useCase}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t">
                    <span className="text-xs text-muted-foreground mr-1">EQ Principles:</span>
                    {template.eqPrinciples.map((principle) => (
                      <Badge key={principle} variant="secondary" className="text-xs">
                        <Brain className="h-2 w-2 mr-1" />
                        {principle.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Using Heuristic Templates Effectively</CardTitle>
            <CardDescription>Tips for natural, authentic application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">1. Adapt, Don't Recite</h4>
                <p className="text-sm text-muted-foreground">
                  Use these templates as frameworks, not scripts. Adapt the language to your personal style and the specific situation.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">2. Combine with EQ</h4>
                <p className="text-sm text-muted-foreground">
                  Each template is designed to work with specific EQ frameworks. Apply the underlying principles for maximum impact.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">3. Practice Regularly</h4>
                <p className="text-sm text-muted-foreground">
                  Use the role-play simulator to practice these templates until they become natural extensions of your conversation style.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
