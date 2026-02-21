import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AICoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: 'modules' | 'help' | 'dashboard' | 'general';
  title?: string;
  description?: string;
}

// Context-specific conversation starters - NO JARGON
const conversationStarters: Record<string, string[]> = {
  dashboard: [
    "How can I improve my listening skills in customer conversations?",
    "What are the best ways to handle objections?",
    "Help me understand my performance scores"
  ],
  modules: [
    "How do I practice discovery questions effectively?",
    "What's the best way to build rapport with healthcare providers?",
    "Help me prepare for difficult conversations"
  ],
  help: [
    "How do I navigate the training modules?",
    "Where can I find my performance history?",
    "How does the roleplay feature work?"
  ],
  general: [
    "How can I become better at reading customer engagement?",
    "What techniques help with building trust?",
    "How do I adapt my style to different personalities?"
  ]
};

// Context-specific suggested topics - NO JARGON
const suggestedTopics: Record<string, string[]> = {
  dashboard: [
    "Understanding my scores",
    "Setting improvement goals",
    "Tracking my progress",
    "Identifying strengths",
    "Working on weak areas"
  ],
  modules: [
    "Discovery techniques",
    "Building rapport",
    "Handling objections",
    "Active listening",
    "Closing conversations"
  ],
  help: [
    "Platform navigation",
    "Feature overview",
    "Account settings",
    "Technical support",
    "Getting started"
  ],
  general: [
    "Communication skills",
    "Customer engagement",
    "Performance improvement",
    "Best practices",
    "Skill development"
  ]
};

export function AICoachDialog({
  open,
  onOpenChange,
  context = 'general',
  title = 'AI Coach',
  description = 'Ask me anything about ReflectivAI'
}: AICoachDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageText,
          context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Coach error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const starters = conversationStarters[context] || conversationStarters.general;
  const topics = suggestedTopics[context] || suggestedTopics.general;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    How can I help you today?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ask me about modules, metrics, scenarios, or anything else!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg h-fit">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg h-fit">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="resize-none"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Suggested Topics Panel */}
          <div className="w-64 flex flex-col gap-4">
            {/* Conversation Starters */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Conversation Starters</h4>
              </div>
              <div className="space-y-2">
                {starters.map((starter, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                    onClick={() => handleSend(starter)}
                    disabled={isLoading}
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>

            {/* Suggested Topics */}
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Suggested Topics</h4>
              <ScrollArea className="h-48">
                <div className="space-y-1 pr-3">
                  {topics.map((topic, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start h-auto py-1.5 px-2 text-xs"
                      onClick={() => handleSend(`Tell me about ${topic.toLowerCase()}`)}
                      disabled={isLoading}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}