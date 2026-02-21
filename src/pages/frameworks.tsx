import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Ear,
  Heart,
  Handshake,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Send,
  Target,
  Copy,
  Check,
  Shield,
  Search,
  Wand2,
} from "lucide-react";
import { eqFrameworks, communicationStyleModels, heuristicTemplates } from "@/lib/data";
import type { EQFramework, HeuristicTemplate } from "@/types/schema";
import { normalizeAIResponse } from "@/lib/normalizeAIResponse";


import { MessageSquareText } from "lucide-react";

const frameworkIcons: Record<string, any> = {
  disc: MessageSquareText,
  "signal-awareness": Search,
  "signal-interpretation": Ear,
  "customer-engagement": MessageSquare,
  "value-connection": Sparkles,
  "objection-navigation": Shield,
  "conversation-management": Target,
  "adaptive-response": Wand2,
  "commitment-generation": Handshake,
};

const heuristicCategoryIcons: Record<string, any> = {
  objection: Shield,
  "value-proposition": Sparkles,
  closing: Target,
  discovery: Search,
  rapport: Handshake,
};

const heuristicCategoryLabels: Record<string, string> = {
  objection: "Objection Handling",
  "value-proposition": "Value Proposition",
  closing: "Closing Techniques",
  discovery: "Discovery Questions",
  rapport: "Rapport Building",
};

export default function FrameworksPage() {
  const [activeTab, setActiveTab] = useState("communication");
  const [selectedFramework, setSelectedFramework] = useState<EQFramework | null>(null);
  const [situation, setSituation] = useState("");
  const [aiAdvice, setAiAdvice] = useState<{ advice: string; practiceExercise: string; tips: string[] } | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);
  const [activeHeuristicCategory, setActiveHeuristicCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<HeuristicTemplate | null>(null);
  const [heuristicSituation, setHeuristicSituation] = useState("");
  const [customization, setCustomization] = useState<{ customizedTemplate: string; example: string; tips: string[] } | null>(null);
  const [isGeneratingCustomization, setIsGeneratingCustomization] = useState(false);
  const [customizationError, setCustomizationError] = useState<string | null>(null);

  const generateAdvice = async () => {
    if (!situation.trim() || !selectedFramework) return;
    
    setIsGeneratingAdvice(true);
    setAdviceError(null);
    setAiAdvice(null); // Clear previous advice

    try {
      // Call GROQ API directly
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert sales coach specializing in behavioral frameworks for pharmaceutical sales. Respond ONLY with valid JSON. No markdown, no extra text.'
            },
            {
              role: 'user',
              content: `I'm working with the "${selectedFramework.name}" framework. Here's my situation: ${situation}\n\nProvide: {"advice": "2-3 sentences", "practiceExercise": "one exercise", "tips": ["tip1", "tip2", "tip3"]}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || '';

      // Try to parse JSON from response
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiAdvice({
          advice: parsed.advice || '',
          practiceExercise: parsed.practiceExercise || '',
          tips: Array.isArray(parsed.tips) ? parsed.tips : []
        });
      } else {
        // Fallback: display as plain advice
        setAiAdvice({
          advice: aiMessage || 'Unable to generate structured advice.',
          practiceExercise: '',
          tips: []
        });
      }
    } catch (error: unknown) {
      console.error('Advice generation error:', error);
      setAdviceError('Failed to generate advice. Please try again.');
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  const generateCustomization = async () => {
    if (!selectedTemplate || !heuristicSituation.trim()) return;
    
    setIsGeneratingCustomization(true);
    setCustomizationError(null);

    // Create AbortController with 12-second timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 12000);

    try {
      // Call GROQ API directly
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert sales coach. Customize communication templates for specific situations. Respond ONLY with valid JSON: {"customizedTemplate": "adapted template", "example": "dialogue example", "tips": ["tip1", "tip2", "tip3"]}'
            },
            {
              role: 'user',
              content: `Template: "${selectedTemplate.template}"\nSituation: "${heuristicSituation}"\n\nCustomize this template for my situation.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || '';

      // Try to parse JSON from response
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setCustomization({
          customizedTemplate: parsed.customizedTemplate || '',
          example: parsed.example || '',
          tips: Array.isArray(parsed.tips) ? parsed.tips : []
        });
      } else {
        // Fallback: display as plain customization
        setCustomization({
          customizedTemplate: aiMessage || 'Unable to generate customization.',
          example: '',
          tips: []
        });
      }
    } catch (error: unknown) {
      console.error('Customization generation error:', error);
      setCustomizationError('Failed to generate customization. Please try again.');
    } finally {
      clearTimeout(timeoutId);
      setIsGeneratingCustomization(false);
    }
  };



  const filteredTemplates =
    activeHeuristicCategory === "all"
      ? heuristicTemplates
      : heuristicTemplates.filter((t) => t.category === activeHeuristicCategory);

  const handleCopy = async (template: HeuristicTemplate) => {
    await navigator.clipboard.writeText(template.template);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCustomized = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId("customized");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (selectedFramework) {
    const IconComponent = frameworkIcons[selectedFramework.id] || Brain;

    return (
      <div className="h-full overflow-auto bg-background">
        <div className="p-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => {
                setSelectedFramework(null);
                setAiAdvice(null);
                setSituation("");
                setAdviceError(null);
              }}
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

            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Coach
                </CardTitle>
                <CardDescription>
                  Describe your situation and get personalized advice on applying {selectedFramework.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      generateAdvice();
                    }
                  }}
                  placeholder="Describe your sales situation... e.g., 'I'm meeting with a skeptical oncologist who prefers data-driven discussions'"
                  className="min-h-[80px] resize-none bg-background"
                  data-testid="input-framework-situation"
                />
                <Button
                  onClick={generateAdvice}
                  disabled={!situation.trim() || isGeneratingAdvice}
                  className="w-full"
                  data-testid="button-get-framework-advice"
                >
                  {isGeneratingAdvice ? (
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingAdvice ? "Getting Personalized Advice..." : "Get AI Advice"}
                </Button>

                {adviceError && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-xs">{adviceError}</AlertDescription>
                  </Alert>
                )}

                {aiAdvice && (
                  <div className="space-y-4 pt-4 border-t">
                    <Alert>
                      <AlertDescription className="text-xs">
                        Generated for this session • Content clears on navigation
                      </AlertDescription>
                    </Alert>
                    {aiAdvice.advice && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Personalized Advice
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {aiAdvice.advice}
                        </p>
                      </div>
                    )}

                    {aiAdvice.practiceExercise && (
                      <div className="p-3 bg-background rounded-lg border">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-chart-2" />
                          Practice Exercise
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {aiAdvice.practiceExercise}
                        </p>
                      </div>
                    )}

                    {aiAdvice.tips && aiAdvice.tips.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Quick Tips:</h4>
                        <ul className="space-y-1">
                          {aiAdvice.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
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
    <div className="h-full overflow-auto bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-4 mb-10">
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-frameworks-title">Selling and Coaching Frameworks</h1>
          <div className="text-muted-foreground space-y-3 text-base leading-relaxed max-w-4xl">
            <p>
              ReflectivAI is powered by Signal Intelligence — the ability to notice, interpret, and respond appropriately to observable signals during professional interactions.
            </p>
            <p>
              Our AI highlights meaningful behavioral signals. Sales professionals apply judgment using demonstrated behavioral capabilities, communication models, and coaching tools that work in real conversations.
            </p>
          </div>
        </div>

        {/* Three-Layer Hierarchy Overview */}
        <Card className="mb-10 border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-base font-semibold mb-1">Signal Intelligence</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">Core measurement layer - what we measure and optimize</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-base font-semibold mb-1">Behavioral Models</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">Supporting insight layer - how to adapt communication</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-base font-semibold mb-1">Coaching Tools</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">Action layer - how improvement happens</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="flex-wrap h-auto gap-2 p-1.5">
            <TabsTrigger value="communication" data-testid="tab-communication-styles" className="px-6 py-3">
              <MessageSquareText className="h-4 w-4 mr-2" />
              Behavioral Models
            </TabsTrigger>
            <TabsTrigger value="empathy" data-testid="tab-empathy-adaptation" className="px-6 py-3">
              <Heart className="h-4 w-4 mr-2" />
              Signal Intelligence Frameworks
            </TabsTrigger>
            <TabsTrigger value="heuristics" data-testid="tab-heuristics" className="px-6 py-3">
              <Target className="h-4 w-4 mr-2" />
              Coaching Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communication" className="mt-8">
            <Card className="mb-8 border-amber-500/30 bg-amber-500/5 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <MessageSquareText className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-amber-700 dark:text-amber-400 mb-2">Important Distinction</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      DISC is an optional behavioral communication lens that can support signal-intelligent interactions—but it is not a signal intelligence framework. It describes observable communication preferences, not emotional capability or demonstrated skills.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              {communicationStyleModels.map((framework) => {
                const IconComponent = frameworkIcons[framework.id] || MessageSquareText;
                return (
                  <Card
                    key={framework.id}
                    className="hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedFramework(framework)}
                    data-testid={`card-framework-${framework.id}`}
                  >
                    <CardContent className="p-7">
                      <div className="flex items-start gap-5 mb-5">
                        {framework.id !== 'disc' && (
                          <div className={`h-14 w-14 rounded-xl bg-${framework.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                            <IconComponent className="h-7 w-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{framework.name}</h3>
                            <Badge variant="outline" className="text-xs">Behavioral Model</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {framework.description}
                          </p>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h4 className="text-sm font-semibold mb-3">Communication Styles:</h4>
                        <ul className="space-y-2">
                          {framework.principles.map((principle, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                              <span>{principle}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {framework.techniques.length} techniques
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Coach
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:text-primary">
                          Learn More
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="empathy" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eqFrameworks.map((framework) => {
                const IconComponent = frameworkIcons[framework.id] || Heart;
                return (
                  <Card
                    key={framework.id}
                    className="hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedFramework(framework)}
                    data-testid={`card-framework-${framework.id}`}
                  >
                    <CardContent className="p-7">
                      <div className="flex items-start gap-5 mb-5">
                        <div className="h-14 w-14 rounded-xl bg-[#14b8a6] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <IconComponent className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-2">
                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{framework.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {framework.description}
                          </p>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h4 className="text-sm font-semibold mb-3">Key Principles:</h4>
                        <ul className="space-y-2">
                          {framework.principles.slice(0, 3).map((principle, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                              <span className="line-clamp-2">{principle}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {framework.techniques.length} techniques
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Coach
                          </Badge>
                        </div>
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

            <Card className="mt-8 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Why Signal Intelligence Matters in Pharma Sales</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-5">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2 text-base">Build Trust</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Healthcare providers are more likely to engage with reps who demonstrate genuine understanding
                    </p>
                  </div>
                  <div className="text-center p-5">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Ear className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2 text-base">Understand Needs</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Signal Intelligence skills help uncover the real challenges and priorities of your stakeholders
                    </p>
                  </div>
                  <div className="text-center p-5">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Handshake className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2 text-base">Close More</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Strong emotional connections lead to higher engagement and better outcomes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heuristics" className="mt-8">
            <Card className="mb-8 border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-base mb-2">AI-Powered Template Customization</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Click "Customize with AI" on any template to personalize it for your specific situation. Signal Intelligence highlights observable cues that suggest when and how to adapt.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeHeuristicCategory} onValueChange={setActiveHeuristicCategory} className="mb-6">
              <TabsList className="flex-wrap h-auto gap-2 p-1.5">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {filteredTemplates.map((template) => {
                const IconComponent = heuristicCategoryIcons[template.category] || MessageSquare;
                return (
                  <Card key={template.id} data-testid={`card-heuristic-${template.id}`} className="hover:border-primary hover:shadow-md transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {heuristicCategoryLabels[template.category]}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setHeuristicSituation("");
                            setCustomization(null);
                            setCustomizationError(null);
                          }}
                            data-testid={`button-customize-${template.id}`}
                            className="text-xs"
                          >
                            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                            Customize
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(template)}
                            data-testid={`button-copy-${template.id}`}
                          >
                            {copiedId === template.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Template</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-medium leading-relaxed">{template.template}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-3">Example</h4>
                        <div className="bg-primary/5 p-4 rounded-lg border-l-2 border-primary">
                          <p className="text-sm text-muted-foreground italic leading-relaxed">"{template.example}"</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2">When to Use</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{template.useCase}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t">
                        <span className="text-xs text-muted-foreground mr-1 font-medium">Signal Intelligence:</span>
                        {template.eqPrinciples.map((principle) => (
                          <Badge key={principle} variant="secondary" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            {principle.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Using Heuristic Templates Effectively</CardTitle>
                <CardDescription>Tips for natural, authentic application</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-3 text-base">1. Adapt, Don't Recite</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Use the AI customization feature to adapt templates to your specific situation and stakeholder
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">2. Practice First</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the role-play simulator to practice delivering templates naturally before real meetings
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">3. Be Authentic</h4>
                    <p className="text-sm text-muted-foreground">
                      Adapt the language to match your personal style while maintaining the structural effectiveness
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Customize Template with AI
            </DialogTitle>
            <DialogDescription>
              Describe your specific situation and get a personalized version of the "{selectedTemplate?.name}" template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Original Template:</p>
              <p className="text-sm text-muted-foreground">{selectedTemplate?.template}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Describe your situation:</label>
              <Textarea
                value={heuristicSituation}
                onChange={(e) => setHeuristicSituation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      generateCustomization();
                    }
                  }}
                placeholder="e.g., Meeting with a skeptical cardiologist who is concerned about drug costs for elderly patients"
                className="min-h-[80px] resize-none"
                data-testid="input-customization-situation"
              />
            </div>

            <Button
              onClick={generateCustomization}
              disabled={!heuristicSituation.trim() || isGeneratingCustomization}
              className="w-full"
              data-testid="button-generate-customization"
            >
              {isGeneratingCustomization ? (
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGeneratingCustomization ? "Generating..." : "Generate Personalized Template"}
            </Button>

            {customizationError && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{customizationError}</AlertDescription>
              </Alert>
            )}

            {customization && (
              <div className="space-y-4 pt-4 border-t">
                <Alert>
                  <AlertDescription className="text-xs">
                    Generated for this session • Content clears on navigation
                  </AlertDescription>
                </Alert>
                {customization.customizedTemplate && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Customized Template:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCustomized(customization.customizedTemplate)}
                        data-testid="button-copy-customized"
                      >
                        {copiedId === "customized" ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
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
                    <div className="p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                      <p className="text-sm whitespace-pre-wrap">{customization.customizedTemplate}</p>
                    </div>
                  </div>
                )}

                {customization.example && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Example Dialogue:</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground italic">"{customization.example}"</p>
                    </div>
                  </div>
                )}

                {customization.tips && customization.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tips for Delivery:</h4>
                    <ul className="space-y-1">
                      {customization.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
