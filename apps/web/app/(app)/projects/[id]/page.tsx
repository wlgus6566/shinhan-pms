'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/lib/api/projects';
import { useProjectMembers } from '@/lib/api/projectMembers';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { ProjectDetail } from '@/components/project/ProjectDetail';
import { ProjectMembersTable } from '@/components/project/ProjectMembersTable';
import { ProjectDetailSkeleton } from '@/components/project/skeleton/ProjectDetailSkeleton';
import { TeamWorkLogList } from '@/components/work-log/TeamWorkLogList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const projectId = params.id as string;

  // Tab state management with URL sync
  const { activeTab, handleTabChange } = useTabNavigation(
    `/projects/${projectId}`,
    { defaultTab: 'info' },
  );

  // Fetch data using SWR hooks
  const {
    project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId);
  const {
    members,
    isLoading: membersLoading,
    error: membersError,
  } = useProjectMembers(projectId);

  const loading = projectLoading || membersLoading;
  const error = projectError || membersError;

  // Derive state with useMemo (rerender-derived-state)
  const canEdit = useMemo(
    () => user?.role === 'SUPER_ADMIN' || user?.role === 'PM',
    [user?.role],
  );

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || (!loading && !project)) {
    return (
      <div className="max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive">
                {error?.message || '프로젝트를 찾을 수 없습니다'}
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/projects">프로젝트 목록으로</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show nothing if data is still loading or missing
  if (!project) {
    return null;
  }

  return (
    <div className="max-w-[1920px] page-animate">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로젝트 목록으로
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {project.name}
        </h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="members">멤버 관리</TabsTrigger>
          <TabsTrigger value="team-logs">팀 업무일지</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6">
              <ProjectDetail project={project} />
              {canEdit && (
                <div className="flex justify-end">
                  <Button className="mt-4" asChild>
                    <Link href={`/projects/${projectId}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="pt-6">
              <ProjectMembersTable
                projectId={projectId}
                creatorId={project.creatorId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-logs">
          <TeamWorkLogList projectId={projectId} members={members || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
