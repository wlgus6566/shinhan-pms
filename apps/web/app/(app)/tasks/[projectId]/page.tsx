'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/lib/api/projects';
import { useProjectMembers } from '@/lib/api/projectMembers';
import { TaskList } from '@/components/task/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, FolderKanban, Calendar } from 'lucide-react';
import type { Project, ProjectMember, ProjectStatus } from '@/types/project';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VARIANTS,
} from '@/lib/constants/project';

export default function TaskManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.projectId as string;

  const {
    project,
    isLoading,
    error,
  } = useProject(projectId);
  const { members, isLoading: membersLoading } = useProjectMembers(projectId);


  // Check if current user is PM of this project
  const isPM = useMemo(() => {
    if (!user || !members || members.length === 0) return false;
    // Convert both to string for comparison to handle type mismatches
    return members.some(
      (m) => String(m.memberId) === String(user.id) && m.role === 'PM',
    );
  }, [user, members]);

  const statusConfig = {
    label: PROJECT_STATUS_LABELS[project?.status as ProjectStatus] || '알 수 없음',
    variant: PROJECT_STATUS_VARIANTS[project?.status as ProjectStatus] || 'outline',
  };

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
      <div className="flex flex-col gap-4 p-3 pt-0 bg-transparent border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FolderKanban className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">
              {project?.name}
            </CardTitle>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-slate-600">
          {(project?.startDate || project?.endDate) && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>
                {project?.startDate || '미정'} ~ {project?.endDate || '미정'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 업무 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">업무 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList error={error} isLoading={isLoading} projectId={projectId} isPM={isPM} projectMembers={members ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
