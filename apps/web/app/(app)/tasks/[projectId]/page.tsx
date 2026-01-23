'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getProject } from '@/lib/api/projects';
import { getProjectMembers } from '@/lib/api/projectMembers';
import { TaskList } from '@/components/task/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, FolderKanban, Calendar } from 'lucide-react';
import type { Project, ProjectMember } from '@/types/project';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';

const statusLabels: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: '진행중', variant: 'default' },
  COMPLETED: { label: '완료', variant: 'secondary' },
  SUSPENDED: { label: '중단', variant: 'destructive' },
};

export default function TaskManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is PM of this project
  const isPM = useMemo(() => {
    if (!user || !members || members.length === 0) return false;
    // Convert both to string for comparison to handle type mismatches
    return members.some(m => String(m.memberId) === String(user.id) && m.role === 'PM');
  }, [user, members]);

  useEffect(() => {
    if (projectId) {
      Promise.all([
        getProject(projectId),
        getProjectMembers(projectId),
      ])
        .then(([projectData, membersData]) => {
          setProject(projectData);
          setMembers(membersData);
        })
        .catch((err) => {
          setError(err.message || '프로젝트를 불러오는데 실패했습니다');
        })
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.back()}
              >
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = statusLabels[project.status as ProjectStatus] ?? statusLabels.ACTIVE;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              프로젝트 목록
            </Link>
          </Button>
        </div>
      </div>

      {/* 프로젝트 정보 카드 */}
      <Card className="bg-gradient-to-r from-slate-50 to-white border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  {project.name}
                </CardTitle>
                {project.client && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {project.client}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={statusConfig.variant}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  {project.startDate || '미정'} ~ {project.endDate || '미정'}
                </span>
              </div>
            )}
            {project.description && (
              <p className="text-slate-500">{project.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 업무 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">업무 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList projectId={projectId} isPM={isPM} />
        </CardContent>
      </Card>
    </div>
  );
}
