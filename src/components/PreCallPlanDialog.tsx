/**
 * Pre-Call Plan Dialog Component
 * 
 * Editable form for HCP call preparation.
 * NO EVALUATION - Coaching assistance only.
 */

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ClipboardList,
  Save,
  Check,
  X,
  Info,
  Download,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PreCallPlan, PreCallPlanDraft } from '@/types/pre-call-plan';
import { PRE_CALL_PLAN_SECTIONS } from '@/types/pre-call-plan';
import { autosavePreCallPlan } from '@/lib/pre-call-plan-storage';

interface PreCallPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PreCallPlan | null;
  userId: string;
  onSave?: (plan: PreCallPlan) => void;
}

export function PreCallPlanDialog({
  open,
  onOpenChange,
  plan,
  userId,
  onSave,
}: PreCallPlanDialogProps) {
  const [draft, setDraft] = useState<PreCallPlanDraft>({});
  const [title, setTitle] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Initialize draft from plan
  useEffect(() => {
    if (plan) {
      setDraft({
        callObjective: plan.callObjective,
        keyMessages: plan.keyMessages,
        hypotheses: plan.hypotheses,
        signalsToListenFor: plan.signalsToListenFor,
        questionsToAsk: plan.questionsToAsk,
        potentialObjections: plan.potentialObjections,
        desiredNextStep: plan.desiredNextStep,
        notes: plan.notes,
      });
      setTitle(plan.title || '');
    } else {
      setDraft({});
      setTitle('');
    }
  }, [plan]);

  // Autosave handler
  const handleAutosave = (updates: Partial<PreCallPlanDraft>) => {
    if (!plan) return;

    setAutosaveStatus('saving');
    autosavePreCallPlan(plan.id, userId, updates, (success) => {
      setAutosaveStatus(success ? 'saved' : 'idle');
      setTimeout(() => setAutosaveStatus('idle'), 2000);
    });
  };

  // Update field handler
  const updateField = (key: keyof PreCallPlanDraft, value: string) => {
    const updates = { [key]: value };
    setDraft(prev => ({ ...prev, ...updates }));
    handleAutosave(updates);
  };

  // Update title handler
  const updateTitle = (value: string) => {
    setTitle(value);
    handleAutosave({ title: value });
  };



  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title || 'Pre-Call Plan', margin, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created: ${new Date(plan.createdAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Sections
    PRE_CALL_PLAN_SECTIONS.forEach((section) => {
      const content = draft[section.key] || '';
      if (content) {
        // Section title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(section.label, margin, yPosition);
        yPosition += 7;

        // Section content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(content, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }
    });

    // Save PDF
    const fileName = `${title || 'pre-call-plan'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle>Pre-Call Plan</DialogTitle>
                <DialogDescription>
                  Prepare for your HCP conversation
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              {autosaveStatus === 'saving' && (
                <Badge variant="outline" className="text-xs">
                  Saving...
                </Badge>
              )}
              {autosaveStatus === 'saved' && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Coaching assistance notice */}
        <div className="flex items-start gap-2 p-3 bg-muted rounded-md text-sm">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            <strong>Coaching assistance only.</strong> This tool helps you prepare and think through your approach.
            No evaluation or scoring.
          </p>
        </div>

        {/* Title field */}
        <div className="space-y-2">
          <Label htmlFor="plan-title">Plan Title (Optional)</Label>
          <Input
            id="plan-title"
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="e.g., Dr. Smith - Q1 Follow-up"
            className="font-medium"
          />
        </div>

        <Separator />

        {/* Scrollable sections */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {PRE_CALL_PLAN_SECTIONS.map((section) => (
              <div key={section.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={section.key} className="text-base font-semibold">
                      {section.label}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">{section.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <Textarea
                  id={section.key}
                  value={draft[section.key] || ''}
                  onChange={(e) => updateField(section.key, e.target.value)}
                  placeholder={section.placeholder}
                  className="min-h-[100px] resize-y"
                />
              </div>
            ))}

            {/* Additional notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={draft.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any other thoughts, context, or reminders..."
                className="min-h-[80px] resize-y"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Changes are automatically saved
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
