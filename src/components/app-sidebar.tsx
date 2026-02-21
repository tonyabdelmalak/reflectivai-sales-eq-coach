import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Database,
  Library,
  Users,
  Brain,
  Lightbulb,
  Activity,
  Dumbbell,
  Loader2,
  RotateCcw,
  HelpCircle,
  User,
  ChevronDown,
  ChevronRight,
  Target,
  BarChart3,
  GraduationCap,
  Settings,
  Bot,
  Play,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSessionId, SESSION_ID_EVENT } from "@/lib/queryClient";

interface DailyFocus {
  title: string;
  focus: string;
  microTask: string;
  reflection: string;
}

interface DashboardInsights {
  dailyTip: string;
  focusArea: string;
  suggestedExercise: { title: string; description: string };
  motivationalQuote: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

// Mobile-optimized navigation with collapsible sections
const navSections: NavSection[] = [
  {
    id: "core-activities",
    title: "Core Activities",
    icon: Target,
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Role Play Simulator",
        url: "/roleplay",
        icon: Play,
      },
      {
        title: "AI Coach",
        url: "/chat",
        icon: Bot,
      },
      {
        title: "Pre-Call Planning",
        url: "/pre-call-planning",
        icon: ClipboardList,
      },
      {
        title: "Exercises",
        url: "/exercises",
        icon: Dumbbell,
      },
      {
        title: "Coaching Modules",
        url: "/modules",
        icon: BookOpen,
      },
    ],
  },
  {
    id: "insights-measurement",
    title: "Insights & Measurement",
    icon: BarChart3,
    items: [
      {
        title: "Behavioral Metrics",
        url: "/ei-metrics",
        icon: Activity,
      },
      {
        title: "Data and Reports",
        url: "/data-reports",
        icon: Database,
      },
    ],
  },
  {
    id: "enablement",
    title: "Enablement",
    icon: GraduationCap,
    items: [
      {
        title: "Selling and Coaching Frameworks",
        url: "/frameworks",
        icon: Brain,
      },
      {
        title: "Knowledge Base",
        url: "/knowledge",
        icon: Library,
      },
    ],
  },
  {
    id: "system",
    title: "System",
    icon: Settings,
    items: [
      {
        title: "Help Center",
        url: "/help",
        icon: HelpCircle,
      },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find which section contains the active page
  const activeSectionId = navSections.find(section =>
    section.items.some(item => item.url === location)
  )?.id;

  // Auto-expand active section on mount and route change
  useEffect(() => {
    if (activeSectionId) {
      setExpandedSections(new Set([activeSectionId]));
    }
  }, [activeSectionId]);

  const toggleSection = (sectionId: string) => {
    // Click-only toggle: expand/collapse on click
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        // Collapse the section
        next.delete(sectionId);
      } else {
        // Expand the section
        next.add(sectionId);
      }
      return next;
    });
  };

  const isSectionExpanded = (sectionId: string) => {
    return expandedSections.has(sectionId);
  };

  const [sessionId, setSessionId] = useState<string>(() => getSessionId() || "anon");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setSessionId(getSessionId() || "anon");
    window.addEventListener(SESSION_ID_EVENT, handler);
    return () => window.removeEventListener(SESSION_ID_EVENT, handler);
  }, []);

  const { data: insights, isLoading: isInsightsLoading, refetch: refetchInsights, isFetching: isInsightsFetching } = useQuery<DashboardInsights>({
    queryKey: ["/api/dashboard/insights"],
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 px-2 bg-white rounded flex items-center">
            <img 
              src="/logo.png" 
              alt="ReflectivAI Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight" data-testid="text-app-name">ReflectivAI</span>
            <span className="text-xs text-muted-foreground">Sales Enablement</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* User Profile */}
      <div className="px-4 py-2 border-b border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 h-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">SR</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Sales Rep</div>
                <div className="text-xs text-muted-foreground">rep@pharma.com</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile & Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navSections.map((section) => {
                const isExpanded = isSectionExpanded(section.id);
                const isActive = section.id === activeSectionId;

                return (
                  <div key={section.id}>
                    {/* Section Header */}
                    <SidebarMenuItem>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                          "hover:bg-[#14b8a6]/20 hover:text-[#14b8a6]",
                          "font-semibold text-sm",
                          isActive && "bg-[#14b8a6]/10 text-[#14b8a6]"
                        )}
                      >
                        <section.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1 text-left">{section.title}</span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </button>
                    </SidebarMenuItem>

                    {/* Sub-items */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200 ease-in-out",
                        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="ml-4 mt-1 space-y-1">
                        {section.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={location === item.url}
                              className={cn(
                                "hover:bg-[#14b8a6]/15 hover:text-[#14b8a6] transition-colors duration-200",
                                "py-2 text-sm font-normal",
                                "data-[active=true]:bg-[#14b8a6] data-[active=true]:text-white",
                                "data-[active=true]:border-l-2 data-[active=true]:border-[#14b8a6]"
                              )}
                            >
                              <Link
                                href={item.url}
                                data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                className="flex items-center gap-3 pl-2"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Today's Tip */}
        <div className="rounded-md bg-muted p-4" data-testid="card-todays-tip">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Today's Tip</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => refetchInsights()}
              disabled={isInsightsFetching}
              data-testid="button-refresh-tip"
            >
              <RotateCcw className={`h-3 w-3 ${isInsightsFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {isInsightsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <div className="space-y-2" data-testid="text-todays-tip">
              <p className="text-xs text-muted-foreground">
                {insights?.dailyTip || "Unable to load today's tip. Tap refresh."}
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
