'use client';

import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';

interface ProjectDetailProps {
  project: Project;
}

// Hoist static data outside component (rendering-hoist-jsx)
const statusMap = {
  PENDING: { label: '대기', className: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: '진행중', className: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: '완료', className: 'bg-green-100 text-green-700' },
  ON_HOLD: { label: '보류', className: 'bg-orange-100 text-orange-700' },
} as const;

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
  const status = statusMap[project.status];

  // Memoize formatted dates
  const formattedStartDate = useMemo(
    () => formatDate(project.startDate),
    [project.startDate],
  );
  const formattedEndDate = useMemo(
    () => formatDate(project.endDate),
    [project.endDate],
  );
  const formattedCreatedAt = useMemo(
    () => formatDate(project.createdAt),
    [project.createdAt],
  );
  const formattedUpdatedAt = useMemo(
    () => formatDate(project.updatedAt),
    [project.updatedAt],
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          프로젝트명
        </h3>
        <p className="text-lg font-semibold">{project.name}</p>
      </div>

      {project.description && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            설명
          </h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}

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

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            상태
          </h3>
          <Badge className={status.className}>{status.label}</Badge>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            진행률
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-emotion-primary h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {project.progress}%
            </span>
          </div>
        </div>
      </div>

      {project.creator && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            등록자
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
