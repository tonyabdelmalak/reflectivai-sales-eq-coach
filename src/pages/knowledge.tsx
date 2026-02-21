import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { normalizeAIResponse } from "@/lib/normalizeAIResponse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Library,
  Search,
  ChevronRight,
  FileText,
  Shield,
  Beaker,
  Users,
  DollarSign,
  Scale,
  BookOpen,
  Sparkles,
  Send,
  MessageSquare,
  Copy,
  Check,
  Wand2,
} from "lucide-react";
import { knowledgeArticles, heuristicTemplates } from "@/lib/data";
import type { KnowledgeArticle, HeuristicTemplate } from "@/types/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";


const categoryIcons: Record<string, any> = {
  fda: Scale,
  "clinical-trials": Beaker,
  compliance: Shield,
  "hcp-engagement": Users,
  "market-access": DollarSign,
  pricing: DollarSign,
};

const categoryLabels: Record<string, string> = {
  fda: "FDA & Regulatory",
  "clinical-trials": "Clinical Trials",
  compliance: "Compliance",
  "hcp-engagement": "HCP Engagement",
  "market-access": "Market Access",
  pricing: "Pricing",
};

const PHARMA_DEFINITIONS: Record<string, { answer: string; relatedTopics: string[] }> = {
  "pi": {
    answer: "A Principal Investigator (PI) is a medical professional, typically a physician or researcher, who leads a clinical trial at a specific site. The PI is responsible for the overall conduct of the study, patient safety, data integrity, and regulatory compliance at their site.",
    relatedTopics: ["Clinical Trials", "Study Coordinator", "IRB Approval"]
  },
  "ind": {
    answer: "An Investigational New Drug (IND) application is a request for FDA authorization to administer an investigational drug to humans. It contains preclinical data, manufacturing information, clinical protocols, and investigator information.",
    relatedTopics: ["FDA Approval Process", "Clinical Trials", "Phase 1 Studies"]
  },
  "nda": {
    answer: "A New Drug Application (NDA) is the formal request to the FDA for approval to market a new drug in the United States. It includes all data from preclinical and clinical studies, manufacturing details, and proposed labeling.",
    relatedTopics: ["FDA Approval", "Drug Development", "Clinical Trials"]
  },
  "irb": {
    answer: "An Institutional Review Board (IRB) is an independent ethics committee that reviews and approves clinical research involving human subjects. The IRB ensures that the rights, safety, and welfare of research participants are protected.",
    relatedTopics: ["Clinical Trials", "Ethics", "Informed Consent"]
  },
  "gcp": {
    answer: "Good Clinical Practice (GCP) is an international ethical and scientific quality standard for designing, conducting, recording, and reporting clinical trials. GCP ensures the rights, safety, and well-being of trial subjects are protected.",
    relatedTopics: ["Clinical Trials", "Regulatory Compliance", "ICH Guidelines"]
  },
  "hcp": {
    answer: "A Healthcare Professional (HCP) is a licensed medical practitioner such as a physician, nurse practitioner, pharmacist, or other qualified healthcare provider who delivers medical care to patients.",
    relatedTopics: ["Medical Affairs", "Sales Strategy", "Clinical Education"]
  },
  "kol": {
    answer: "A Key Opinion Leader (KOL) is a respected healthcare professional or researcher who influences peers through expertise, publications, and presentations. KOLs play a critical role in shaping medical practice and treatment adoption.",
    relatedTopics: ["Medical Affairs", "Thought Leadership", "Advisory Boards"]
  },
  "adverse event": {
    answer: "An Adverse Event (AE) is any undesirable medical occurrence in a patient administered a pharmaceutical product, whether or not considered related to the treatment. AEs must be documented and reported according to regulatory requirements.",
    relatedTopics: ["Pharmacovigilance", "Safety Monitoring", "Clinical Trials"]
  },
  "informed consent": {
    answer: "Informed Consent is the process by which a patient or research subject voluntarily confirms their willingness to participate in a clinical trial or treatment, after being informed of all relevant aspects including risks, benefits, and alternatives.",
    relatedTopics: ["Clinical Trials", "Patient Rights", "IRB Requirements"]
  }
};

function getDefinitionFallback(question: string): { answer: string; relatedTopics: string[] } | null {
  const normalized = question.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(PHARMA_DEFINITIONS)) {
    if (normalized.includes(key) || normalized.includes(key.replace(/\s+/g, ''))) {
      return value;
    }
  }
  
  return null;
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<{ answer: string; relatedTopics: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Template customization state
  const [selectedTemplate, setSelectedTemplate] = useState<HeuristicTemplate | null>(null);
  const [templateSituation, setTemplateSituation] = useState("");
  const [customization, setCustomization] = useState<{ customizedTemplate: string; example: string; tips: string[] } | null>(null);
  const [isGeneratingCustomization, setIsGeneratingCustomization] = useState(false);
  const [customizationError, setCustomizationError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateCustomization = async () => {
    if (!selectedTemplate || !templateSituation.trim()) return;
    
    setIsGeneratingCustomization(true);
    setCustomizationError(null);

    // Create AbortController with 12-second timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 12000);

    try {
      // Call GROQ API directly (using hardcoded key since backend secrets not accessible from frontend)
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
              content: `Template: "${selectedTemplate.template}"\nSituation: "${templateSituation}"\n\nCustomize this template for my situation.`
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

  const handleCopyTemplate = async (template: HeuristicTemplate) => {
    await navigator.clipboard.writeText(template.template);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCustomized = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId("customized");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setAiAnswer(null); // Clear previous answer

    // Create AbortController with 12-second timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 12000);

    try {
      const contextInfo = selectedArticle 
        ? `Context: The user is reading about "${selectedArticle.title}" (${selectedArticle.summary})`
        : "Context: General pharma knowledge base question";

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
              content: 'You are an expert pharmaceutical sales knowledge assistant. Provide clear, accurate answers about FDA regulations, clinical trials, compliance, and pharma industry topics.'
            },
            {
              role: 'user',
              content: `${contextInfo}\n\nQuestion: ${aiQuestion}`
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || '';

      console.log("[KNOWLEDGE] AI Response:", aiMessage.substring(0, 200));

      // Use the AI message as the answer
      if (aiMessage && aiMessage.trim().length > 0) {
        setAiAnswer({
          answer: aiMessage.trim(),
          relatedTopics: [] // Worker doesn't return related topics for knowledge base
        });
        setError(null);
      } else {
        throw new Error('Empty AI response');
      }
    } catch (err) {
      console.error("[P0 KNOWLEDGE] Error in handleAskAi:", err);
      
      // Check if request was aborted (timeout)
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      
      const definitionFallback = getDefinitionFallback(aiQuestion);
      
      if (definitionFallback) {
        console.log("[P0 KNOWLEDGE] Using definition fallback for:", aiQuestion);
        setAiAnswer(definitionFallback);
        setError(null);
      } else {
        // Deterministic fallback response
        const fallbackAnswer = selectedArticle
          ? `Based on the article "${selectedArticle.title}": ${selectedArticle.summary} Try refining your question to a specific term or concept.`
          : "Try refining your question to a specific term (e.g., endpoints, hazard ratio, confidence interval).";
        
        setAiAnswer({
          answer: fallbackAnswer,
          relatedTopics: []
        });
        setError(null); // Clear error to show fallback cleanly
      }
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };

  const filteredArticles = knowledgeArticles.filter((article) => {
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (selectedArticle) {
    const IconComponent = categoryIcons[selectedArticle.category] || FileText;

    return (
      <div className="h-full overflow-auto bg-background">
        <div className="container mx-auto p-6 max-w-6xl">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
              setSelectedArticle(null);
              setAiAnswer(null);
              setAiQuestion("");
              setError(null);
            }}
            data-testid="button-back-knowledge"
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Knowledge Base
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <IconComponent className="h-3 w-3" />
                  {categoryLabels[selectedArticle.category]}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-3" data-testid="text-article-title">
                {selectedArticle.title}
              </h1>
              <p className="text-lg text-muted-foreground">{selectedArticle.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedArticle.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
                    {selectedArticle.content.split("\n\n").map((paragraph, index) => {
                      if (paragraph.startsWith("## ")) {
                        return (
                          <h2 key={index} className="text-xl font-semibold mt-6 mb-3">
                            {paragraph.replace("## ", "")}
                          </h2>
                        );
                      }
                      if (paragraph.startsWith("### ")) {
                        return (
                          <h3 key={index} className="text-lg font-medium mt-4 mb-2">
                            {paragraph.replace("### ", "")}
                          </h3>
                        );
                      }
                      if (paragraph.startsWith("- ")) {
                        const items = paragraph.split("\n").filter((line) => line.startsWith("- "));
                        return (
                          <ul key={index} className="space-y-2">
                            {items.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                                <span>{item.replace("- ", "")}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p key={index} className="text-muted-foreground mb-4">
                          {paragraph}
                        </p>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Ask AI About This Topic
                    </CardTitle>
                    <CardDescription>
                      Get AI-powered answers related to this article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAskAi();
                          }
                        }}
                        placeholder="Ask a question about this topic..."
                        className="min-h-[80px] resize-none text-sm"
                        data-testid="input-ai-question"
                      />
                    </div>
                    <Button
                      onClick={handleAskAi}
                      disabled={!aiQuestion.trim() || isGenerating}
                      className="w-full"
                      data-testid="button-ask-ai"
                    >
                      {isGenerating ? (
                        <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isGenerating ? "Thinking..." : "Ask AI"}
                    </Button>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    )}

                    {aiAnswer && (
                      <div className="space-y-3 pt-3 border-t">
                        <Alert>
                          <AlertDescription className="text-xs">
                            Generated for this session. Content may clear on navigation.
                          </AlertDescription>
                        </Alert>
                        {aiAnswer.answer && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {aiAnswer.answer}
                            </div>
                          </div>
                        )}
                        {aiAnswer.relatedTopics && aiAnswer.relatedTopics.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">Related Topics:</p>
                            <div className="flex flex-wrap gap-1">
                              {aiAnswer.relatedTopics.map((topic, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-chart-4 flex items-center justify-center">
              <Library className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-knowledge-title">Knowledge Base</h1>
              <p className="text-muted-foreground">
                Industry guides covering FDA regulations, clinical trials, and compliance
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-2">AI-Powered Q&A</p>
                  <div className="flex gap-2">
                    <Input
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAskAi();
                        }
                      }}
                      placeholder="Ask any question about pharma regulations, clinical trials, compliance..."
                      className="bg-background"
                      data-testid="input-global-ai-question"
                    />
                    <Button
                      onClick={handleAskAi}
                      disabled={!aiQuestion.trim() || isGenerating}
                      data-testid="button-global-ask-ai"
                    >
                      {isGenerating ? (
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  {aiAnswer && (
                    <div className="mt-4 p-3 bg-background rounded-lg border">
                      <Alert className="mb-3">
                        <AlertDescription className="text-xs">
                          Generated for this session. Content may clear on navigation.
                        </AlertDescription>
                      </Alert>
                      {aiAnswer.answer && (
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">
                          {aiAnswer.answer}
                        </div>
                      )}
                      {aiAnswer.relatedTopics && aiAnswer.relatedTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {aiAnswer.relatedTopics.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              data-testid="input-search-knowledge"
            />
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="all" data-testid="tab-all-articles">All</TabsTrigger>
              <TabsTrigger value="fda" data-testid="tab-fda">
                <Scale className="h-3 w-3 mr-1" />
                FDA
              </TabsTrigger>
              <TabsTrigger value="clinical-trials" data-testid="tab-clinical-trials">
                <Beaker className="h-3 w-3 mr-1" />
                Clinical Trials
              </TabsTrigger>
              <TabsTrigger value="compliance" data-testid="tab-compliance">
                <Shield className="h-3 w-3 mr-1" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="hcp-engagement" data-testid="tab-hcp-engagement">
                <Users className="h-3 w-3 mr-1" />
                HCP
              </TabsTrigger>
              <TabsTrigger value="market-access" data-testid="tab-market-access">
                <DollarSign className="h-3 w-3 mr-1" />
                Market Access
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Communication Templates Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Communication Templates
              </CardTitle>
              <CardDescription>
                Proven conversation frameworks you can customize with AI for your specific situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {heuristicTemplates.slice(0, 6).map((template) => (
                  <Card key={template.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.template}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateSituation("");
                            setCustomization(null);
                            setCustomizationError(null);
                          }}
                          className="text-xs"
                        >
                          <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                          Customize
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyTemplate(template)}
                          className="text-xs"
                        >
                          {copiedId === template.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => {
                const IconComponent = categoryIcons[article.category] || FileText;
                return (
                  <Card
                    key={article.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                    data-testid={`card-article-${article.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-2">
                            {categoryLabels[article.category]}
                          </Badge>
                          <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {article.summary}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Template Customization Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                value={templateSituation}
                onChange={(e) => setTemplateSituation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    generateCustomization();
                  }
                }}
                placeholder="e.g., Meeting with a skeptical cardiologist who is concerned about drug costs for elderly patients"
                className="min-h-[80px] resize-none"
              />
            </div>

            <Button
              onClick={generateCustomization}
              disabled={!templateSituation.trim() || isGeneratingCustomization}
              className="w-full"
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
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">{customization.example}</p>
                    </div>
                  </div>
                )}

                {customization.tips && customization.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Delivery Tips:</h4>
                    <ul className="space-y-2">
                      {customization.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{tip}</span>
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
