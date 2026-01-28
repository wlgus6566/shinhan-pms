'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyProjects } from '@/lib/api/projects';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { ProjectScheduleList } from '@/components/schedule/ProjectScheduleList';
import { SchedulePageSkeleton } from '@/components/schedule/skeleton/SchedulePageSkeleton';
import { Calendar } from 'lucide-react';

export default function TeamSchedulesPage() {
  const { projects, isLoading, error } = useMyProjects();

  // 첫 번째 프로젝트 ID를 기본값으로 사용
  const defaultProjectId =
    projects && projects.length > 0 ? String(projects[0]?.id) : '';

  const { activeTab, handleTabChange } = useTabNavigation('/schedule', {
    defaultTab: defaultProjectId,
    queryKey: 'project',
  });

  if (isLoading) {
    return <SchedulePageSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-2">
              프로젝트를 불러오는데 실패했습니다
            </p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              프로젝트 일정 관리
            </h1>
            <p className="text-muted-foreground mt-1">
              프로젝트의 일정을 관리하고 공유하세요
            </p>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-slate-50">
            <Calendar className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              참여 중인 프로젝트가 없습니다
            </h3>
            <p className="text-sm text-muted-foreground">
              프로젝트에 참여하면 팀 일정을 확인할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            프로젝트 일정 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            프로젝트 팀의 일정을 관리하고 공유하세요
          </p>
        </div>

        {/* Project Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList>
            {projects.map((project) => (
              <TabsTrigger
                key={project.id}
                value={String(project.id)}
                className="whitespace-nowrap"
              >
                {project.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {projects.map((project) => (
            <TabsContent
              key={project.id}
              value={String(project.id)}
              className="space-y-6"
            >
              <ProjectScheduleList projectId={String(project.id)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
