/**
 * Pre-Call Planning Page
 * 
 * List and manage pre-call plans for HCP conversations.
 * Coaching assistance only - no evaluation.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ClipboardList, Plus, Trash2, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PreCallPlanDialog } from "@/components/PreCallPlanDialog";
import { 
  getPreCallPlanList, 
  createPreCallPlan, 
  deletePreCallPlan 
} from "@/lib/pre-call-plan-storage";
import type { PreCallPlan } from "@/types/pre-call-plan";

export default function PreCallPlanningPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PreCallPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PreCallPlan | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Load plans on mount
  useEffect(() => {
    if (user) {
      const userPlans = getPreCallPlanList(user.id);
      setPlans(userPlans);
    }
  }, [user]);

  const handleCreateNew = () => {
    if (!user) return;
    const newPlan = createPreCallPlan(user.id, {});
    setPlans(prev => [newPlan, ...prev]);
    setSelectedPlan(newPlan);
    setShowDialog(true);
  };

  const handleOpenPlan = (plan: PreCallPlan) => {
    setSelectedPlan(plan);
    setShowDialog(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePreCallPlan(planId, user.id);
      setPlans(prev => prev.filter(p => p.id !== planId));
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    // Refresh plans list
    if (user) {
      const userPlans = getPreCallPlanList(user.id);
      setPlans(userPlans);
    }
  };



  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Pre-Call Planning</h1>
            <p className="text-muted-foreground">Prepare for your HCP conversations</p>
          </div>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Coaching notice */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Coaching assistance only.</strong> Pre-Call Plans help you think through your approach
            and prepare for HCP conversations. No evaluation or scoring.
          </p>
        </CardContent>
      </Card>

      {/* Plans list - Enterprise-grade list view */}
      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Plans Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first Pre-Call Plan to start preparing for HCP conversations.
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Left: Title and Date */}
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-base font-semibold truncate">
                      {plan.title || "Untitled Plan"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(plan.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenPlan(plan)}
                      className="bg-[#14b8a6] hover:bg-[#0d9488] text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Open Plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-Call Plan Dialog */}
      <PreCallPlanDialog
        open={showDialog}
        onOpenChange={handleDialogClose}
        plan={selectedPlan}
        userId={user?.id || ''}
        onSave={(updatedPlan) => {
          setSelectedPlan(updatedPlan);
          // Refresh the list
          setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        }}
      />
    </div>
  );
}
