import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { LayoutGrid, List, Filter } from 'lucide-react';
import { coachingModules } from '@/lib/data';
import { MICROCOPY, CAPABILITIES } from '@/lib/governance-constants';

type DensityMode = 'compact' | 'expanded';

export function SkillDevelopmentProgress() {
  const [density, setDensity] = useState<DensityMode>('expanded');
  const [capabilityGroupFilter, setCapabilityGroupFilter] = useState<string>('all');
  const [capabilityFilter, setCapabilityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const metrics = useMemo(() => {
    const total = coachingModules.length;
    const started = coachingModules.filter(m => m.progress > 0 && m.progress < 100).length;
    const completed = coachingModules.filter(m => m.progress === 100).length;
    return { total, started, completed };
  }, []);

  const filteredModules = useMemo(() => {
    return coachingModules.filter(module => {
      if (capabilityGroupFilter !== 'all') return true;
      if (capabilityFilter !== 'all') return true;
      return true;
    });
  }, [capabilityGroupFilter, capabilityFilter]);

  const getProgressLabel = (progress: number) => {
    if (progress === 0) return MICROCOPY.skillDevelopment.progressLabels.notStarted;
    if (progress === 100) return MICROCOPY.skillDevelopment.progressLabels.completed;
    return MICROCOPY.skillDevelopment.progressLabels.inProgress;
  };

  const getProgressVariant = (progress: number): 'secondary' | 'default' | 'outline' => {
    if (progress === 0) return 'outline';
    if (progress === 100) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Skill Development & Progress</h2>
          <p className="text-sm text-muted-foreground">
            Track your learning journey across coaching modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={density === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDensity('compact')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={density === 'expanded' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDensity('expanded')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Modules</CardDescription>
            <CardTitle className="text-2xl">{metrics.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">In Progress</CardDescription>
            <CardTitle className="text-2xl">{metrics.started}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Completed</CardDescription>
            <CardTitle className="text-2xl">{metrics.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {MICROCOPY.skillDevelopment.filterLabels.capabilityGroup}
                </label>
                <Select value={capabilityGroupFilter} onValueChange={setCapabilityGroupFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="sensemaking">Signal Sensemaking</SelectItem>
                    <SelectItem value="response">Signal Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {MICROCOPY.skillDevelopment.filterLabels.capability}
                </label>
                <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Capabilities</SelectItem>
                    {CAPABILITIES.map(cap => (
                      <SelectItem key={cap.id} value={cap.id.toString()}>
                        {cap.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-4 ${density === 'compact' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-1 md:grid-cols-2'}`}>
        {filteredModules.map((module) => (
          <Link key={module.id} href="/modules">
            <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader className={density === 'compact' ? 'pb-2' : 'pb-3'}>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className={density === 'compact' ? 'text-sm' : 'text-base'}>
                    {module.title}
                  </CardTitle>
                  <Badge 
                    variant={getProgressVariant(module.progress)}
                    className="text-xs flex-shrink-0"
                  >
                    {getProgressLabel(module.progress)}
                  </Badge>
                </div>
                {density === 'expanded' && (
                  <CardDescription className="text-sm mt-2">
                    {module.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {density === 'expanded' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                )}
                {density === 'compact' && module.progress > 0 && (
                  <div className="space-y-1">
                    <Progress value={module.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground text-right">{module.progress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
