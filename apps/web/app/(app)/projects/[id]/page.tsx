'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProject } from '@/lib/api/projects';
import { getProjectMembers } from '@/lib/api/projectMembers';
import { ProjectDetail } from '@/components/project/ProjectDetail';
import { ProjectMembersTable } from '@/components/project/ProjectMembersTable';
import { TeamWorkLogList } from '@/components/work-log/TeamWorkLogList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Project, ProjectMember } from '@/types/project';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive state with useMemo (rerender-derived-state)
  const canEdit = useMemo(
    () => user?.role === 'SUPER_ADMIN' || user?.role === 'PM',
    [user?.role],
  );

  useEffect(() => {
    if (projectId) {
      Promise.all([getProject(projectId), getProjectMembers(projectId)])
        .then(([projectData, membersData]) => {
          setProject(projectData);
          setMembers(membersData);
        })
        .catch((err) => {
          setError(err.message);
          setTimeout(() => router.push('/projects'), 2000);
        })
        .finally(() => setLoading(false));
    }
  }, [projectId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive">
                {error || '프로젝트를 찾을 수 없습니다'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                잠시 후 목록으로 이동합니다...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
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
        <p className="text-muted-foreground mt-1">프로젝트 상세 정보입니다</p>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
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
          <TeamWorkLogList projectId={projectId} members={members} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
