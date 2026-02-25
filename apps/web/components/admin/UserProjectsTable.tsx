'use client';

import Link from 'next/link';
import { useUserProjects } from '@/lib/api/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, FolderOpen } from 'lucide-react';
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_BADGE_STYLES,
  PROJECT_ROLE_LABELS,
  WORK_AREA_LABELS,
} from '@/lib/constants/project';
import type { ProjectType, ProjectStatus, ProjectRole, WorkArea } from '@/types/project';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

interface UserProjectsTableProps {
  userId: string | number;
}

export function UserProjectsTable({ userId }: UserProjectsTableProps) {
  const { projects, isLoading } = useUserProjects(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FolderOpen className="h-10 w-10 mb-2" />
        <p className="text-sm">투입된 프로젝트가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>프로젝트명</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>고객사</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>담당 분야</TableHead>
            <TableHead>기간</TableHead>
            <TableHead>투입일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const statusStyle = PROJECT_STATUS_BADGE_STYLES[project.status as ProjectStatus];
            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/projects/${project.projectId}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {project.projectName}
                  </Link>
                </TableCell>
                <TableCell>
                  {PROJECT_TYPE_LABELS[project.projectType as ProjectType] || project.projectType}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusStyle?.className || ''}
                  >
                    {statusStyle?.label || project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.client || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={project.role === 'PM' ? 'default' : project.role === 'PL' ? 'secondary' : 'outline'}>
                    {PROJECT_ROLE_LABELS[project.role as ProjectRole] || project.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {WORK_AREA_LABELS[project.workArea as WorkArea] || project.workArea}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(project.createdAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
