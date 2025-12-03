import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Search,
  Users,
  FileText,
  Shield,
  CheckCircle,
  Brain,
  Play,
  Target,
  ChevronRight,
} from "lucide-react";
import { coachingModules, eqFrameworks } from "@/lib/data";
import type { CoachingModule } from "@shared/schema";

const moduleIcons: Record<string, any> = {
  Search,
  Users,
  FileText,
  Shield,
  CheckCircle,
  Brain,
};

const categoryLabels: Record<string, string> = {
  discovery: "Discovery",
  stakeholder: "Stakeholder",
  clinical: "Clinical",
  objection: "Objection Handling",
  closing: "Closing",
  eq: "Emotional Intelligence",
};

export default function ModulesPage() {
  const [selectedModule, setSelectedModule] = useState<CoachingModule | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const filteredModules = activeTab === "all"
    ? coachingModules
    : coachingModules.filter(m => m.category === activeTab);

  const getFrameworkDetails = (frameworkId: string) => {
    return eqFrameworks.find(f => f.id === frameworkId);
  };

  if (selectedModule) {
    const IconComponent = moduleIcons[selectedModule.icon] || BookOpen;

    return (
      <div className="h-full overflow-auto">
        <div className="p-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedModule(null)}
            data-testid="button-back-modules"
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Modules
          </Button>

          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{categoryLabels[selectedModule.category]}</Badge>
                    </div>
                    <CardTitle className="text-2xl" data-testid="text-module-detail-title">
                      {selectedModule.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedModule.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{selectedModule.progress}%</span>
                  </div>
                  <Progress value={selectedModule.progress} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedModule.frameworks.map((fw) => {
                    const framework = getFrameworkDetails(fw);
                    return (
                      <Badge key={fw} variant="secondary">
                        <Brain className="h-3 w-3 mr-1" />
                        {framework?.name || fw}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Exercises</CardTitle>
                <CardDescription>Complete these exercises to master this module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedModule.exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover-elevate cursor-pointer"
                      data-testid={`exercise-${exercise.id}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{exercise.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {exercise.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      </div>
                      <Button size="sm" data-testid={`button-start-exercise-${exercise.id}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related EQ Frameworks</CardTitle>
                <CardDescription>Understanding these frameworks will help you excel</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {selectedModule.frameworks.map((fw) => {
                    const framework = getFrameworkDetails(fw);
                    if (!framework) return null;
                    return (
                      <AccordionItem key={fw} value={fw}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            {framework.name}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground mb-4">{framework.description}</p>
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Key Principles:</h5>
                            <ul className="space-y-1">
                              {framework.principles.map((p, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <Target className="h-3 w-3 mt-1 flex-shrink-0" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
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
          <h1 className="text-2xl font-bold" data-testid="text-modules-title">Coaching Modules</h1>
          <p className="text-muted-foreground">
            Build your pharma sales mastery with structured learning paths
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="discovery" data-testid="tab-discovery">Discovery</TabsTrigger>
            <TabsTrigger value="stakeholder" data-testid="tab-stakeholder">Stakeholder</TabsTrigger>
            <TabsTrigger value="clinical" data-testid="tab-clinical">Clinical</TabsTrigger>
            <TabsTrigger value="objection" data-testid="tab-objection">Objection</TabsTrigger>
            <TabsTrigger value="closing" data-testid="tab-closing">Closing</TabsTrigger>
            <TabsTrigger value="eq" data-testid="tab-eq">EQ</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const IconComponent = moduleIcons[module.icon] || BookOpen;
            return (
              <Card
                key={module.id}
                className="hover-elevate cursor-pointer"
                onClick={() => setSelectedModule(module)}
                data-testid={`card-module-${module.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2">
                        {categoryLabels[module.category]}
                      </Badge>
                      <h3 className="font-semibold">{module.title}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {module.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {module.frameworks.slice(0, 2).map((fw) => (
                        <Badge key={fw} variant="secondary" className="text-xs">
                          {fw.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {module.exercises.length} exercises
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
