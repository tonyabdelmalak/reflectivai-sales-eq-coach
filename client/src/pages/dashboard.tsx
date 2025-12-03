import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  BookOpen,
  Database,
  Users,
  Brain,
  TrendingUp,
  Clock,
  Target,
  ChevronRight,
  Search,
  FileText,
  Shield,
  CheckCircle,
} from "lucide-react";
import reflectivAILogo from "@assets/E2ABF40D-E679-443C-A1B7-6681EF25E7E7_1764541714586.png";
import { coachingModules, eqFrameworks } from "@/lib/data";

const stats = [
  { label: "Coaching Sessions", value: "24", change: "+12%", icon: MessageSquare },
  { label: "EQ Score", value: "78", change: "+5", icon: Brain },
  { label: "SQL Queries", value: "156", change: "+8%", icon: Database },
  { label: "Role-Plays", value: "18", change: "+3", icon: Users },
];

const moduleIcons: Record<string, any> = {
  Search,
  Users,
  FileText,
  Shield,
  CheckCircle,
  Brain,
};

export default function Dashboard() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Welcome to ReflectivAI</h1>
          <p className="text-muted-foreground">
            Master emotional intelligence and sales excellence in Life Sciences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</span>
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Start your coaching journey</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/chat">
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-4">
                    <img 
                      src={reflectivAILogo} 
                      alt="ReflectivAI Logo" 
                      className="h-12 w-12 rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold" data-testid="link-quick-ai-coach">AI Coach</h3>
                      <p className="text-sm text-muted-foreground">
                        Get personalized coaching and feedback
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/roleplay">
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-md bg-chart-2 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold" data-testid="link-quick-roleplay">Role-Play Simulator</h3>
                      <p className="text-sm text-muted-foreground">
                        Practice with pharma scenarios
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/sql">
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-md bg-chart-3 flex items-center justify-center flex-shrink-0">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold" data-testid="link-quick-sql">SQL Translator</h3>
                      <p className="text-sm text-muted-foreground">
                        Convert questions to SQL queries
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/knowledge">
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-md bg-chart-4 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold" data-testid="link-quick-knowledge">Knowledge Base</h3>
                      <p className="text-sm text-muted-foreground">
                        FDA, compliance & industry guides
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                EQ Frameworks
              </CardTitle>
              <CardDescription>Core emotional intelligence skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {eqFrameworks.map((framework) => (
                <Link href="/frameworks" key={framework.id}>
                  <div className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer" data-testid={`link-framework-${framework.id}`}>
                    <div className={`h-2 w-2 rounded-full bg-${framework.color}`} />
                    <span className="text-sm font-medium flex-1">{framework.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle>Coaching Modules</CardTitle>
              <CardDescription>Build your sales mastery skills</CardDescription>
            </div>
            <Link href="/modules">
              <Button variant="outline" size="sm" data-testid="button-view-all-modules">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coachingModules.slice(0, 6).map((module) => {
                const IconComponent = moduleIcons[module.icon] || BookOpen;
                return (
                  <Link href="/modules" key={module.id}>
                    <Card className="hover-elevate cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm" data-testid={`text-module-${module.id}`}>{module.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-1.5" />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {module.frameworks.slice(0, 2).map((fw) => (
                            <Badge key={fw} variant="secondary" className="text-xs">
                              {fw.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Completed objection handling practice</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge>+15 XP</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-chart-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Role-play: Oncology KOL Introduction</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <Badge variant="secondary">EQ: 82</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Database className="h-4 w-4 text-chart-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">SQL query: Top prescribers analysis</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
