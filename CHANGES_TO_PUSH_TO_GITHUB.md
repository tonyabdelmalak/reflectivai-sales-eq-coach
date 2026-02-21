# Changes That Need to Be Pushed to GitHub

## Status: NOT YET IN GITHUB REPOSITORY

These changes were made in the Airo development environment but have NOT been pushed to your GitHub repository yet.

---

## File 1: `src/pages/dashboard.tsx`

### Changes Made:

#### 1. AI Insights Section - Navy Blue Background with Teal Borders

**Location:** Lines ~200-350 (AI Insights section)

**Find this code:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Today's Focus */}
  <Card className="border-primary/20">
```

**Replace with:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Today's Focus */}
  <Card className="border-2 border-primary" style={{ backgroundColor: 'hsl(215, 60%, 15%)' }}>
```

**Apply to all 3 cards:**
- Today's Focus
- Focus Area
- Motivation

All should have: `className="border-2 border-primary"` and `style={{ backgroundColor: 'hsl(215, 60%, 15%)' }}`

#### 2. Content Text - Darker and More Readable

**In all 3 AI Insights cards, change:**

**From:**
```tsx
<CardTitle className="text-sm font-medium text-muted-foreground">
```

**To:**
```tsx
<CardTitle className="text-sm font-semibold text-foreground">
```

**From:**
```tsx
<p className="text-sm text-muted-foreground">
```

**To:**
```tsx
<p className="text-sm text-foreground/80">
```

**Icons - change from `text-muted-foreground` to `text-primary`:**
```tsx
<Target className="h-4 w-4 text-primary" />
<TrendingUp className="h-4 w-4 text-primary" />
<Sparkles className="h-4 w-4 text-primary" />
```

#### 3. Quick Actions - All Icons Teal Background

**Location:** Lines ~400-550 (Quick Actions section)

**Find all 4 cards and update their icon containers:**

**AI Coach:**
```tsx
<div className="rounded-full p-3 bg-primary">
  <MessageSquare className="h-6 w-6 text-primary-foreground" />
</div>
```

**Role Play Simulator:**
```tsx
<div className="rounded-full p-3 bg-primary">
  <Users className="h-6 w-6 text-primary-foreground" />
</div>
```

**Exercises:**
```tsx
<div className="rounded-full p-3 bg-primary">
  <Dumbbell className="h-6 w-6 text-primary-foreground" />
</div>
```

**Coaching Modules:**
```tsx
<div className="rounded-full p-3 bg-primary">
  <BookOpen className="h-6 w-6 text-primary-foreground" />
</div>
```

---

## File 2: `src/pages/chat.tsx`

### Add PDF Export to AI Coach Session Summary

#### Step 1: Add imports at the top

**Find:**
```tsx
import { Download } from "lucide-react";
```

**Add after it:**
```tsx
import jsPDF from "jspdf";
import { toast } from "sonner";
```

#### Step 2: Add export function

**Find the SessionSummaryDialog component (around line 100-150)**

**Add this function inside the component, after the state declarations:**

```tsx
const handleExportSummaryPDF = () => {
  if (!summary) {
    toast.error("No summary data to export");
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AI Coach Session Summary", margin, yPos);
    yPos += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
    yPos += 15;

    // Overview
    if (summary.overview) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Overview", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const overviewLines = doc.splitTextToSize(summary.overview, maxWidth);
      doc.text(overviewLines, margin, yPos);
      yPos += overviewLines.length * 5 + 10;
    }

    // Key Takeaways
    if (summary.keyTakeaways && summary.keyTakeaways.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Key Takeaways", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      summary.keyTakeaways.forEach((takeaway, i) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${takeaway}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 7;
    }

    // Skills Discussed
    if (summary.skillsDiscussed && summary.skillsDiscussed.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Skills Discussed", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      summary.skillsDiscussed.forEach((skill, i) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${skill}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 7;
    }

    // Action Items
    if (summary.actionItems && summary.actionItems.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Action Items", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      summary.actionItems.forEach((item, i) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${item}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 7;
    }

    // Next Steps
    if (summary.nextSteps && summary.nextSteps.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Next Steps", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      summary.nextSteps.forEach((step, i) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${step}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 7;
    }

    // Objections Surfaced
    if (summary.objectionsSurfaced && summary.objectionsSurfaced.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Objections Surfaced", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      summary.objectionsSurfaced.forEach((objection, i) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${objection}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 7;
    }

    // Signal Intelligence Highlights
    if (summary.signalIntelligenceHighlights && summary.signalIntelligenceHighlights.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Signal Intelligence Highlights", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      summary.signalIntelligenceHighlights.forEach((highlight, i) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${highlight}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
    }

    // Save PDF
    const filename = `AI-Coach-Summary-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    toast.success("Summary exported to PDF");
  } catch (error) {
    console.error("PDF export error:", error);
    toast.error("Failed to export PDF");
  }
};
```

#### Step 3: Add Export button to dialog footer

**Find the DialogFooter in SessionSummaryDialog (around line 250-280):**

**Replace:**
```tsx
<div className="flex justify-end gap-2">
  <Button variant="outline" onClick={() => setShowSummary(false)}>
    Close
  </Button>
</div>
```

**With:**
```tsx
<div className="flex justify-between gap-2">
  <Button variant="outline" onClick={handleExportSummaryPDF}>
    <Download className="h-4 w-4 mr-2" />
    Export to PDF
  </Button>
  <Button variant="outline" onClick={() => setShowSummary(false)}>
    Close
  </Button>
</div>
```

---

## File 3: `src/components/roleplay-feedback-dialog.tsx`

### Add PDF Export to Role Play Evaluation

#### Step 1: Add imports at the top

**Find:**
```tsx
import {
  Award,
  TrendingUp,
  Target,
  MessageSquareQuote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Brain,
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
```

**Replace with:**
```tsx
import {
  Award,
  TrendingUp,
  Target,
  MessageSquareQuote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Brain,
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Download,
} from "lucide-react";
```

**Find:**
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
```

**Add after it:**
```tsx
import jsPDF from "jspdf";
import { toast } from "sonner";
```

#### Step 2: Add export function

**Find the component function start (around line 580-610):**

```tsx
export function RoleplayFeedbackDialog({
  open,
  onOpenChange,
  feedback,
  scenarioTitle,
  onStartNew,
  detectedCues,
  metricResults,
}: RoleplayFeedbackDialogProps) {
  if (!feedback) return null;

  const [enabledExtras, setEnabledExtras] = useState<string[]>(() => readEnabledEIMetricIds());

  useEffect(() => {
    const handler = () => setEnabledExtras(readEnabledEIMetricIds());
    window.addEventListener(EI_METRICS_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(EI_METRICS_SETTINGS_EVENT, handler);
  }, []);
```

**Add this function right after the useEffect:**

```tsx
  const handleExportPDF = () => {
    if (!feedback) {
      toast.error("No feedback data to export");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Role Play Session Evaluation", margin, yPos);
      yPos += 10;

      // Scenario
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Scenario: ${scenarioTitle || "Role Play Session"}`, margin, yPos);
      yPos += 7;

      // Date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
      yPos += 15;

      // Overall Score
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Overall Score: ${feedback.overallScore}/5`, margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Performance Level: ${feedback.performanceLevel}`, margin, yPos);
      yPos += 15;

      // Overall Summary
      if (feedback.overallSummary) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Overall Summary", margin, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(feedback.overallSummary, maxWidth);
        doc.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 5 + 10;
      }

      // Signal Intelligence Scores
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Signal Intelligence Scores", margin, yPos);
      yPos += 10;

      feedback.eqScores.forEach((score) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${score.metricName}: ${score.score}/5`, margin, yPos);
        yPos += 6;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const feedbackLines = doc.splitTextToSize(score.feedback, maxWidth - 5);
        doc.text(feedbackLines, margin + 5, yPos);
        yPos += feedbackLines.length * 4 + 8;
      });

      // Sales Skills (if any)
      if (feedback.salesSkillScores && feedback.salesSkillScores.length > 0) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Sales Skills", margin, yPos);
        yPos += 10;

        feedback.salesSkillScores.forEach((skill) => {
          if (yPos > 260) { doc.addPage(); yPos = 20; }
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${skill.skillName}: ${skill.score}/5`, margin, yPos);
          yPos += 6;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const skillLines = doc.splitTextToSize(skill.feedback, maxWidth - 5);
          doc.text(skillLines, margin + 5, yPos);
          yPos += skillLines.length * 4 + 8;
        });
      }

      // Key Strengths
      if (feedback.keyStrengths && feedback.keyStrengths.length > 0) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Key Strengths", margin, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        feedback.keyStrengths.forEach((strength, i) => {
          if (yPos > 270) { doc.addPage(); yPos = 20; }
          const lines = doc.splitTextToSize(`${i + 1}. ${strength}`, maxWidth - 5);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 5 + 3;
        });
        yPos += 7;
      }

      // Areas for Improvement
      if (feedback.areasForImprovement && feedback.areasForImprovement.length > 0) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Areas for Improvement", margin, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        feedback.areasForImprovement.forEach((area, i) => {
          if (yPos > 270) { doc.addPage(); yPos = 20; }
          const lines = doc.splitTextToSize(`${i + 1}. ${area}`, maxWidth - 5);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 5 + 3;
        });
        yPos += 7;
      }

      // Next Steps
      if (feedback.nextSteps && feedback.nextSteps.length > 0) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Recommended Next Steps", margin, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        feedback.nextSteps.forEach((step, i) => {
          if (yPos > 270) { doc.addPage(); yPos = 20; }
          const lines = doc.splitTextToSize(`${i + 1}. ${step}`, maxWidth - 5);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 5 + 3;
        });
      }

      // Save PDF
      const filename = `Roleplay-Evaluation-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success("Evaluation exported to PDF");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };
```

#### Step 3: Add Export button to dialog footer

**Find the dialog footer (around line 1240-1250):**

**Replace:**
```tsx
<div className="p-4 border-t bg-muted/30 flex items-center justify-between gap-4">
  <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-feedback">
    <X className="h-4 w-4 mr-2" />
    Close
  </Button>

  {onStartNew && (
    <Button onClick={onStartNew} data-testid="button-start-new-scenario">
      Start New Scenario
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  )}
</div>
```

**With:**
```tsx
<div className="p-4 border-t bg-muted/30 flex items-center justify-between gap-4">
  <div className="flex items-center gap-2">
    <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-feedback">
      <X className="h-4 w-4 mr-2" />
      Close
    </Button>
    <Button variant="outline" onClick={handleExportPDF}>
      <Download className="h-4 w-4 mr-2" />
      Export to PDF
    </Button>
  </div>

  {onStartNew && (
    <Button onClick={onStartNew} data-testid="button-start-new-scenario">
      Start New Scenario
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  )}
</div>
```

---

## Summary

**3 files need to be modified:**

1. **`src/pages/dashboard.tsx`** - UI styling improvements (AI Insights + Quick Actions)
2. **`src/pages/chat.tsx`** - Add PDF export to AI Coach
3. **`src/components/roleplay-feedback-dialog.tsx`** - Add PDF export to Role Play

**After making these changes:**
1. Commit to your GitHub repository
2. Push to main branch
3. GitHub Actions will automatically deploy to Cloudflare Pages

---

**Generated:** February 5, 2026
**Status:** AWAITING MANUAL APPLICATION TO GITHUB REPOSITORY
