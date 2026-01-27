'use client';

import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Project, ProjectStatus, ProjectType } from '@/types/project';
import {
  PROJECT_STATUS_BADGE_STYLES,
  PROJECT_TYPE_LABELS,
} from '@/lib/constants/project';

interface ProjectDetailProps {
  project: Project;
}

const fallbackStatus = { label: '알 수 없음', className: 'bg-slate-100 text-slate-700' };

// Cache formatted dates (js-cache-function-results)
const dateFormatCache = new Map<string, string>();
const formatDate = (dateString: string): string => {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }
  const result = new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  dateFormatCache.set(dateString, result);
  return result;
};

export const ProjectDetail = memo(function ProjectDetail({
  project,
}: ProjectDetailProps) {
  const status = PROJECT_STATUS_BADGE_STYLES[project.status as ProjectStatus] || fallbackStatus;

  // Memoize formatted dates
  const formattedStartDate = useMemo(
    () => project.startDate ? formatDate(project.startDate) : '-',
    [project.startDate],
  );
  const formattedEndDate = useMemo(
    () => project.endDate ? formatDate(project.endDate) : '-',
    [project.endDate],
  );
  const formattedCreatedAt = useMemo(
    () => formatDate(project.createdAt.toString()),
    [project.createdAt],
  );
  const formattedUpdatedAt = useMemo(
    () => project.updatedAt ? formatDate(project.updatedAt.toString()) : '-',
    [project.updatedAt],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            프로젝트명
          </h3>
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            클라이언트
          </h3>
          <p className="text-lg font-semibold">{project.client || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            타입
          </h3>
          <Badge variant="outline" className="font-normal">
            {PROJECT_TYPE_LABELS[project.projectType as ProjectType] || project.projectType}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            상태
          </h3>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            시작일
          </h3>
          <p className="text-sm font-medium">{formattedStartDate}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            종료일
          </h3>
          <p className="text-sm font-medium">{formattedEndDate}</p>
        </div>
      </div>

      {project.creator && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            등록자 (PM)
          </h3>
          <p className="text-sm">
            {project.creator.name} ({project.creator.email})
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 pt-4 border-t">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            등록일
          </h3>
          <p className="text-sm text-slate-600">{formattedCreatedAt}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            수정일
          </h3>
          <p className="text-sm text-slate-600">{formattedUpdatedAt}</p>
        </div>
      </div>
    </div>
  );
});
