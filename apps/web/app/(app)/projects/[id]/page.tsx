'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProject } from '@/lib/api/projects';
import { ProjectDetail } from '@/components/project/ProjectDetail';
import { ProjectMembersTable } from '@/components/project/ProjectMembersTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Project } from '@/types/project';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive state with useMemo (rerender-derived-state)
  const canEdit = useMemo(
    () => user?.role === 'SUPER_ADMIN' || user?.role === 'PM',
    [user?.role],
  );

  useEffect(() => {
    if (projectId) {
      getProject(projectId)
        .then(setProject)
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
      <div className="max-w-3xl">
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
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로젝트 목록으로
          </Link>
        </Button>

        {canEdit && (
          <Button asChild>
            <Link href={`/projects/${projectId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Link>
          </Button>
        )}
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
          <TabsTrigger value="members">팀원 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6">
              <ProjectDetail project={project} />
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
      </Tabs>
    </div>
  );
}
