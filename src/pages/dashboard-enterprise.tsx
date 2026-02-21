import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TodayPanel } from '@/components/dashboard/TodayPanel';
import { PrimaryWorkflows } from '@/components/dashboard/PrimaryWorkflows';
import { CapabilitiesExplainer } from '@/components/dashboard/CapabilitiesExplainer';
import { SkillDevelopmentProgress } from '@/components/dashboard/SkillDevelopmentProgress';

type RoleView = 'rep' | 'manager' | 'enablement' | 'compliance';

export default function DashboardEnterprisePage() {
  const [activeRole, setActiveRole] = useState<RoleView>('rep');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Enterprise Dashboard</h1>
          <p className="text-muted-foreground">
            Signal Intelligence™ capability development and insights
          </p>
        </div>

        <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as RoleView)}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
            <TabsTrigger value="rep">Rep</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
            <TabsTrigger value="enablement">Enablement</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="rep" className="space-y-8 mt-6">
            <TodayPanel />
            <PrimaryWorkflows />
            <CapabilitiesExplainer />
            <SkillDevelopmentProgress />
          </TabsContent>

          <TabsContent value="manager" className="space-y-8 mt-6">
            <TodayPanel />
            <SkillDevelopmentProgress />
          </TabsContent>

          <TabsContent value="enablement" className="space-y-8 mt-6">
            <CapabilitiesExplainer />
            <SkillDevelopmentProgress />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-8 mt-6">
            <CapabilitiesExplainer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
