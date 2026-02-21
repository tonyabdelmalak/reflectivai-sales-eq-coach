import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Brain,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Loader2,
  Radio,
  HelpCircle,
  Download,
  ClipboardList,
} from "lucide-react";
import jsPDF from "jspdf";
// Logo removed - using text/icon instead
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { diseaseStates, hcpCategories, influenceDrivers, specialtiesByDiseaseState, allSpecialties } from "@/lib/data";
import { SignalIntelligencePanel, type ObservableSignal } from "@/components/signal-intelligence-panel";
import type { Message } from "@/types/schema";
import { PreCallPlanDialog } from "@/components/PreCallPlanDialog";
import { createPreCallPlan, getPreCallPlanList } from "@/lib/pre-call-plan-storage";
import type { PreCallPlan } from "@/types/pre-call-plan";

const isValidSignalType = (t: unknown): t is ObservableSignal["type"] =>
  t === "verbal" || t === "conversational" || t === "engagement" || t === "contextual";

function normalizeSignals(raw: unknown): ObservableSignal[] {
  if (!Array.isArray(raw)) return [];
  const now = Date.now();
  const ts = new Date().toISOString();

  const out: ObservableSignal[] = [];
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i];
    if (s == null) continue;

    if (typeof s === "string") {
      const text = s.trim();
      if (!text) continue;
      out.push({
        id: `signal-${now}-${i}`,
        type: "contextual",
        signal: text,
        interpretation: "",
        timestamp: ts,
      });
      continue;
    }

    const obj = s as any;
    const signal = typeof obj.signal === "string" ? obj.signal.trim() : "";
    const interpretation = typeof obj.interpretation === "string" ? obj.interpretation.trim() : "";
    const suggestedOptions = Array.isArray(obj.suggestedOptions) ? obj.suggestedOptions : undefined;
    const type: ObservableSignal["type"] = isValidSignalType(obj.type) ? obj.type : "contextual";
    if (!signal && !interpretation && !suggestedOptions) continue;

    out.push({
      id: typeof obj.id === "string" && obj.id ? obj.id : `signal-${now}-${i}`,
      type,
      signal,
      interpretation,
      suggestedOptions,
      timestamp: typeof obj.timestamp === "string" && obj.timestamp ? obj.timestamp : ts,
    });
  }
  return out;
}

type SessionSummary = {
  summary: string;
  keyTakeaways: string[];
  skillsDiscussed: string[];
  actionItems: string[];
  nextSteps: string;
  objectionsSurfaced?: string[];
  signalIntelligenceHighlights?: Array<{
    type: "verbal" | "conversational" | "engagement" | "contextual";
    signal: string;
    evidence?: string;
    interpretation: string;
    suggestedResponse?: string;
  }>;
};

type CoachPromptBundle = {
  conversationStarters: string[];
  suggestedTopics: string[];
  timestamp: string;
};

function formatMessageContent(content: unknown) {
  const safe = typeof content === "string" ? content : content == null ? "" : String(content);
  const lines = safe.split("\n");

  return lines.map((line, lineIndex) => {
    let processedLine = line;

    const headingMatch = processedLine.match(/^#{1,3}\s*(\d+\.?\s*)(.+)$/);
    if (headingMatch) {
      const [, number, title] = headingMatch;
      const cleanTitle = title.replace(/\*\*/g, '');
      return (
        <span key={lineIndex}>
          <strong className="font-semibold">{number}{cleanTitle}</strong>
          {lineIndex < lines.length - 1 && '\n'}
        </span>
      );
    }

    const parts = processedLine.split(/(\*\*[^*]+\*\*)/g);
    const formattedParts = parts.map((part, partIndex) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return <strong key={partIndex} className="font-semibold">{boldText}</strong>;
      }
      return <span key={partIndex}>{part}</span>;
    });

    return (
      <span key={lineIndex}>
        {formattedParts}
        {lineIndex < lines.length - 1 && '\n'}
      </span>
    );
  });
}

function normalizeMessages(raw: unknown): Message[] {
  if (!Array.isArray(raw)) return [];
  const out: Message[] = [];
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i] as any;
    if (!m || (typeof m !== "object" && typeof m !== "function")) continue;
    const role = m.role === "user" || m.role === "assistant" ? m.role : "assistant";
    const content = typeof m.content === "string" ? m.content : m.content == null ? "" : String(m.content);
    const timestamp = typeof m.timestamp === "number" ? m.timestamp : Date.now();
    const id = typeof m.id === "string" && m.id ? m.id : `msg-${timestamp}-${i}`;
    const feedback = m.feedback && typeof m.feedback === "object" ? m.feedback : undefined;
    out.push({ id, role, content, timestamp, feedback } as Message);
  }
  return out;
}

function safePromptList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => typeof x === "string" && x.trim())
    .map((s) => String(s).trim())
    .slice(0, 12);
}

export default function ChatPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");

  // Check for pre-filled prompt from Pre-Call Planning
  useEffect(() => {
    const storedPrompt = sessionStorage.getItem('aiCoachPrompt');
    if (storedPrompt) {
      setInput(storedPrompt);
      sessionStorage.removeItem('aiCoachPrompt');
      textareaRef.current?.focus();
    }
  }, []);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedDiseaseState, setSelectedDiseaseState] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedHcpCategory, setSelectedHcpCategory] = useState<string>("");
  const [selectedInfluenceDriver, setSelectedInfluenceDriver] = useState<string>("");
  const [discEnabled, setDiscEnabled] = useState<boolean>(false);
  const [observableSignals, setObservableSignals] = useState<ObservableSignal[]>([]);
  const [showSessionIndicator, setShowSessionIndicator] = useState(false);
  const [showPreCallPlan, setShowPreCallPlan] = useState(false);
  const [currentPreCallPlan, setCurrentPreCallPlan] = useState<PreCallPlan | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const selectedDisease = diseaseStates.find(d => d.id === selectedDiseaseState);
  const selectedCategory = hcpCategories.find(c => c.id === selectedHcpCategory);
  const selectedDriver = influenceDrivers.find(d => d.id === selectedInfluenceDriver);

  // PDF Export Function
  const exportToPDF = () => {
    if (!summaryMutation.data) return;

    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AI Coach Session Summary", margin, yPos);
    yPos += lineHeight * 2;

    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
    yPos += lineHeight * 2;

    // Overview
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Overview", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const overviewLines = doc.splitTextToSize(summaryMutation.data.summary, maxWidth);
    doc.text(overviewLines, margin, yPos);
    yPos += overviewLines.length * lineHeight + lineHeight;

    // Key Takeaways
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Key Takeaways", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    summaryMutation.data.keyTakeaways.forEach((takeaway, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${takeaway}`, maxWidth - 5);
      if (yPos + lines.length * lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * lineHeight + 2;
    });
    yPos += lineHeight;

    // Skills Discussed
    if (yPos + lineHeight * 3 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Skills Discussed", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(summaryMutation.data.skillsDiscussed.join(", "), margin, yPos, { maxWidth });
    yPos += lineHeight * 2;

    // Action Items
    if (yPos + lineHeight * 3 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Action Items", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    summaryMutation.data.actionItems.forEach((action, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${action}`, maxWidth - 5);
      if (yPos + lines.length * lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * lineHeight + 2;
    });
    yPos += lineHeight;

    // Next Steps
    if (yPos + lineHeight * 3 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Next Steps", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const nextStepsLines = doc.splitTextToSize(summaryMutation.data.nextSteps, maxWidth);
    doc.text(nextStepsLines, margin, yPos);

    // Save PDF
    doc.save(`AI-Coach-Session-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const { data: coachPrompts, isLoading: isPromptsLoading } = useQuery<CoachPromptBundle>({
    queryKey: ["/api/coach/prompts", selectedDiseaseState, selectedSpecialty, selectedHcpCategory, selectedInfluenceDriver],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/coach/prompts", {
        diseaseState: selectedDiseaseState,
        specialty: selectedSpecialty,
        hcpCategory: selectedHcpCategory,
        influenceDriver: selectedInfluenceDriver,
      });
      return response.json() as Promise<CoachPromptBundle>;
    },
    staleTime: 1000 * 60,
  });

  // Default user-friendly conversation starters (fallback if API returns jargon or fails)
  const defaultConversationStarters = [
    "How can I better understand what motivates healthcare providers in my territory?",
    "What are effective ways to handle objections about clinical evidence?",
    "Help me prepare for a conversation with a skeptical physician",
    "What signal intelligence techniques can I use to read HCP engagement?",
    "How do I adapt my communication style to different types of healthcare providers?",
  ];

  const defaultSuggestedTopics = [
    "Building rapport with busy clinicians",
    "Handling objections with confidence",
    "Reading non-verbal cues in conversations",
    "Adapting to different communication styles",
    "Following up effectively after meetings",
  ];

  // Use API data if available and user-friendly, otherwise use defaults
  const rawStarters = safePromptList(coachPrompts?.conversationStarters);
  const rawTopics = safePromptList(coachPrompts?.suggestedTopics);
  
  // Filter out technical jargon (check for common jargon patterns)
  const isJargon = (text: string) => {
    const jargonPatterns = /\b(API|endpoint|query|mutation|schema|database|function|component|props|state)\b/i;
    return jargonPatterns.test(text) || text.length < 10 || text.includes('{}') || text.includes('[]');
  };

  const conversationStarters = rawStarters.filter(s => !isJargon(s)).length > 0 
    ? rawStarters.filter(s => !isJargon(s)) 
    : defaultConversationStarters;
    
  const suggestedTopics = rawTopics.filter(t => !isJargon(t)).length > 0 
    ? rawTopics.filter(t => !isJargon(t)) 
    : defaultSuggestedTopics;

  // Filter specialties based on selected disease state
  const availableSpecialties = selectedDiseaseState
    ? specialtiesByDiseaseState[selectedDiseaseState] || allSpecialties
    : allSpecialties;

  // Clear specialty if it's no longer in filtered list
  useEffect(() => {
    if (selectedSpecialty && !availableSpecialties.includes(selectedSpecialty)) {
      setSelectedSpecialty("");
    }
  }, [selectedDiseaseState, availableSpecialties, selectedSpecialty]);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat/messages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/chat/messages");
      const data = await response.json().catch(() => null);
      if (Array.isArray(data)) {
        return normalizeMessages(data);
      }
      return normalizeMessages((data as any)?.messages);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Send both keys for compatibility with worker (message) and server (content)
      const response = await apiRequest("POST", "/api/chat/send", {
        message: content,
        content,
        context: {
          diseaseState: selectedDiseaseState,
          specialty: selectedSpecialty,
          hcpCategory: selectedHcpCategory,
          influenceDriver: selectedInfluenceDriver,
          discEnabled,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Immediately reflect returned messages to avoid UI gaps if refetch races
      if (Array.isArray(data?.messages)) {
        queryClient.setQueryData(["/api/chat/messages"], normalizeMessages(data.messages));
      } else if (data?.userMessage || data?.aiMessage) {
        queryClient.setQueryData(["/api/chat/messages"], (prev: Message[] | undefined) => {
          const next = Array.isArray(prev) ? [...prev] : [];
          const appended = normalizeMessages([data.userMessage, data.aiMessage]);
          return [...next, ...appended];
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });

      // Update observable signals from the AI response (normalized to prevent runtime crashes)
      const nextSignals = normalizeSignals((data as any)?.signals);
      if (nextSignals.length) {
        setObservableSignals((prev) => [...prev, ...nextSignals]);
      }
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/chat/clear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setObservableSignals([]);
      setShowSummary(false); // Close summary dialog on session reset
      
      // Reset session ID for true fresh start
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("reflectivai-session-id");
      }
      
      // Show "New Session" indicator (auto-dismiss after 3s)
      setShowSessionIndicator(true);
      setTimeout(() => setShowSessionIndicator(false), 3000);
    },
  });

  const summaryMutation = useMutation({
    mutationFn: async () => {
      // Workers may expose summary as GET (parity-v2) or POST (server). Try POST first, then fall back.
      const postRes = await apiRequest("POST", "/api/chat/summary");
      if (postRes.ok) return postRes.json() as Promise<SessionSummary>;

      if (postRes.status === 404 || postRes.status === 405) {
        const getRes = await apiRequest("GET", "/api/chat/summary");
        return getRes.json() as Promise<SessionSummary>;
      }

      return postRes.json() as Promise<SessionSummary>;
    },
  });

  const handleGetSummary = () => {
    setShowSummary(true);
    summaryMutation.mutate();
  };

  // Pre-Call Plan handlers
  const handleOpenPreCallPlan = () => {
    console.log('[AI COACH] Opening Pre-Call Plan dialog');
    if (!user) {
      console.error('[AI COACH] No user found!');
      return;
    }
    
    // Create a new Pre-Call Plan
    const newPlan = createPreCallPlan(user.id, {});
    console.log('[AI COACH] Created new plan:', newPlan);
    setCurrentPreCallPlan(newPlan);
    setShowPreCallPlan(true);
    console.log('[AI COACH] Dialog should be open now');
  };

  const handleRequestAIHelp = (sectionKey: string, currentContent: string) => {
    // Send a message to AI Coach asking for help with this section
    const sectionLabels: Record<string, string> = {
      callObjective: 'Call Objective',
      keyMessages: 'Key Messages',
      hypotheses: 'Hypotheses',
      signalsToListenFor: 'Signals to Listen For',
      questionsToAsk: 'Questions to Ask',
      potentialObjections: 'Potential Objections',
      desiredNextStep: 'Desired Next Step',
    };
    
    const sectionLabel = sectionLabels[sectionKey] || sectionKey;
    const prompt = currentContent
      ? `Help me improve my ${sectionLabel} for my pre-call plan. Here's what I have so far:\n\n${currentContent}\n\nWhat suggestions do you have?`
      : `Help me draft a ${sectionLabel} for my pre-call plan. What should I consider?`;
    
    setInput(prompt);
    setShowPreCallPlan(false);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup effect: Reset chat session when user leaves the page
  useEffect(() => {
    return () => {
      console.log('🧹 Chat page unmounting - clearing session');
      // Clear the session when component unmounts (user navigates away)
      apiRequest("POST", "/api/chat/clear").catch(err => 
        console.error('Failed to clear chat session on unmount:', err)
      );
      // Clear local storage
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("reflectivai-session-id");
      }
    };
  }, []); // Empty deps = runs only on mount/unmount

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              R
            </div>
            <div>
              <h1 className="text-xl font-semibold" data-testid="text-chat-title">AI Coach</h1>
              <p className="text-sm text-muted-foreground">
                Your personal pharma sales coaching assistant
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenPreCallPlan}
              data-testid="button-pre-call-plan"
              className="bg-[#14b8a6] hover:bg-[#0d9488] text-white"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Pre-Call Plan
            </Button>
            {messages.length >= 2 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleGetSummary}
                disabled={summaryMutation.isPending}
                data-testid="button-session-summary"
                className="bg-[#14b8a6] hover:bg-[#0d9488] text-white"
              >
                {summaryMutation.isPending ? (
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Session Summary
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => clearChatMutation.mutate()}
              disabled={clearChatMutation.isPending}
              data-testid="button-clear-chat"
              className="bg-[#14b8a6] hover:bg-[#0d9488] text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="flex justify-center mt-4 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mx-auto">
          <Select value={selectedDiseaseState} onValueChange={setSelectedDiseaseState}>
            <SelectTrigger 
              data-testid="select-disease-state"
              className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#14b8a6] hover:text-white hover:border-[#14b8a6] transition-colors"
            >
              <SelectValue placeholder="Disease State" />
            </SelectTrigger>
            <SelectContent>
              {diseaseStates.map((disease) => (
                <SelectItem key={disease.id} value={disease.id}>
                  {disease.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger 
              data-testid="select-specialty"
              className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#14b8a6] hover:text-white hover:border-[#14b8a6] transition-colors"
            >
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              {availableSpecialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedHcpCategory} onValueChange={setSelectedHcpCategory}>
            <SelectTrigger 
              data-testid="select-hcp-category"
              className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#14b8a6] hover:text-white hover:border-[#14b8a6] transition-colors"
            >
              <SelectValue placeholder="HCP Category" />
            </SelectTrigger>
            <SelectContent>
              {hcpCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedInfluenceDriver} onValueChange={setSelectedInfluenceDriver}>
            <SelectTrigger 
              data-testid="select-influence-driver"
              className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#14b8a6] hover:text-white hover:border-[#14b8a6] transition-colors"
            >
              <SelectValue placeholder="Influence Driver" />
            </SelectTrigger>
            <SelectContent>
              {influenceDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>

        {/* DISC toggle removed per user request */}

        {(selectedDisease || selectedSpecialty || selectedCategory || selectedDriver) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {selectedDisease && (
              <Badge variant="secondary" data-testid="badge-selected-disease">
                {selectedDisease.name}
              </Badge>
            )}
            {selectedSpecialty && (
              <Badge variant="outline" data-testid="badge-selected-specialty">
                {selectedSpecialty}
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="outline" data-testid="badge-selected-category">
                {selectedCategory.name}
              </Badge>
            )}
            {selectedDriver && (
              <Badge variant="outline" data-testid="badge-selected-driver">
                {selectedDriver.name}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Session Indicator - Transient notification for session boundaries */}
      {showSessionIndicator && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <Badge variant="secondary" className="px-4 py-2 text-sm shadow-lg">
            <Sparkles className="h-3 w-3 mr-2 inline" />
            New Session Started
          </Badge>
        </div>
      )}

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-4 pb-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Ask me anything about pharma sales, signal intelligence frameworks,
                    objection handling, or clinical evidence communication.
                  </p>
                  <div className="flex flex-col gap-4 items-center max-w-2xl w-full px-4">
                    {(conversationStarters.length ? conversationStarters : []).slice(0, 3).map((prompt) => {
                      // Only shorten prompts on mobile (screens smaller than 768px)
                      const displayPrompt = prompt;
                      return (
                        <Button
                          key={prompt}
                          variant="outline"
                          size="lg"
                          className="text-sm text-center whitespace-normal h-auto py-3 px-4 w-full max-w-md md:max-w-2xl"
                          onClick={() => handlePromptClick(prompt)}
                          data-testid={`button-prompt-${prompt.slice(0, 20).replace(/\s+/g, '-')}`}
                        >
                          <span className="block md:hidden">{prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt}</span>
                          <span className="hidden md:block">{prompt}</span>
                        </Button>
                      );
                    })}
                    {!conversationStarters.length && !isPromptsLoading && (
                      <p className="text-xs text-muted-foreground">Unable to load conversation starters.</p>
                    )}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : ""
                        }`}
                    >
                      {message.role === "user" ? (
                        <span className="text-sm font-medium">You</span>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">R</div>
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""
                        }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{formatMessageContent(message.content)}</p>
                      </div>
                      {message.feedback && (
                        <div className="mt-2 p-3 bg-card border rounded-lg text-left">
                          {message.feedback.eqScore !== undefined && (
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">
                                Signal Intelligence Score: {message.feedback.eqScore}
                              </span>
                            </div>
                          )}
                          {message.feedback.frameworks && message.feedback.frameworks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {message.feedback.frameworks.map((fw) => (
                                <Badge key={fw} variant="secondary" className="text-xs">
                                  {fw}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {message.feedback.suggestions && message.feedback.suggestions.length > 0 && (
                            <div className="space-y-1">
                              {message.feedback.suggestions.map((s, i) => (
                                <p key={i} className="text-xs text-muted-foreground">
                                  <Lightbulb className="h-3 w-3 inline mr-1" />
                                  {s}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {sendMessageMutation.isPending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm relative">R
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            {/* Topic Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('How can I improve my objection handling skills?')}
                className="text-xs border-[#1e3a8a] border-2"
              >
                Objection Handling
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('What are effective techniques for building rapport with HCPs?')}
                className="text-xs border-[#1e3a8a] border-2"
              >
                Rapport Building
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('What are best practices for closing a sales conversation?')}
                className="text-xs border-[#1e3a8a] border-2"
              >
                Closing Techniques
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('How can I better communicate clinical data to physicians?')}
                className="text-xs border-[#1e3a8a] border-2"
              >
                Clinical Knowledge
              </Button>
            </div>
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sales techniques, behavioral frameworks, objection handling..."
                className="min-h-[60px] resize-none"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="self-end"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-72 flex-shrink-0 hidden lg:flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggested Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedTopics.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="w-full text-left p-2 text-sm rounded-md hover-elevate text-muted-foreground"
                    data-testid={`button-suggested-${prompt.slice(0, 15).replace(/\s+/g, '-')}`}
                  >
                    {prompt}
                  </button>
                ))}
                {!suggestedTopics.length && !isPromptsLoading && (
                  <p className="text-xs text-muted-foreground">Unable to load suggested topics.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Session Summary
            </DialogTitle>
            <DialogDescription>
              Key takeaways and action items from your coaching conversation
            </DialogDescription>
          </DialogHeader>

          {summaryMutation.isPending ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : summaryMutation.isError ? (
            <div className="py-4 text-center">
              <p className="text-destructive mb-4">Failed to generate summary. Please try again.</p>
              <Button onClick={() => summaryMutation.mutate()} data-testid="button-retry-summary">
                Try Again
              </Button>
            </div>
          ) : summaryMutation.data ? (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-chart-1" />
                  Overview
                </h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {summaryMutation.data.summary}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-chart-2" />
                  Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {summaryMutation.data.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-chart-4 flex-shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-chart-3" />
                  Skills Discussed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summaryMutation.data.skillsDiscussed.map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-chart-4" />
                  Action Items
                </h3>
                <ul className="space-y-2">
                  {summaryMutation.data.actionItems.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm bg-primary/5 p-2 rounded-md">
                      <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Next Steps
                </h3>
                <p className="text-sm text-muted-foreground">
                  {summaryMutation.data.nextSteps}
                </p>
              </div>

              {Array.isArray(summaryMutation.data.objectionsSurfaced) && summaryMutation.data.objectionsSurfaced.length > 0 && (
                <div className="pt-2 border-t">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Radio className="h-4 w-4 text-chart-2" />
                    Objections Surfaced
                  </h3>
                  <ul className="space-y-2">
                    {summaryMutation.data.objectionsSurfaced.map((objection, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-chart-3 flex-shrink-0 mt-0.5" />
                        <span>{objection}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(summaryMutation.data.signalIntelligenceHighlights) && summaryMutation.data.signalIntelligenceHighlights.length > 0 && (
                <div className="pt-2 border-t">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-chart-4" />
                    Signal Intelligence Highlights
                  </h3>
                  <div className="space-y-3">
                    {summaryMutation.data.signalIntelligenceHighlights.map((s, i) => (
                      <div key={i} className="p-3 rounded-md border bg-muted/40">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{s.type}</Badge>
                          <span className="text-sm font-medium">{s.signal}</span>
                        </div>
                        {s.evidence && (
                          <p className="text-xs text-muted-foreground mb-1"><strong>Evidence:</strong> {s.evidence}</p>
                        )}
                        <p className="text-xs text-muted-foreground"><strong>Interpretation:</strong> {s.interpretation}</p>
                        {s.suggestedResponse && (
                          <p className="text-xs text-muted-foreground mt-1"><strong>Suggested response:</strong> {s.suggestedResponse}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Export Button */}
              <div className="pt-4 border-t flex justify-end">
                <Button
                  onClick={exportToPDF}
                  variant="default"
                  className="gap-2"
                  data-testid="button-export-pdf"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Pre-Call Plan Dialog */}
      <PreCallPlanDialog
        open={showPreCallPlan}
        onOpenChange={setShowPreCallPlan}
        plan={currentPreCallPlan}
        userId={user?.id || ''}
        onSave={(updatedPlan) => {
          setCurrentPreCallPlan(updatedPlan);
        }}
      />
    </div>
  );
}
