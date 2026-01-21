'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WorkLog } from '@/types/work-log';

interface WorkLogCardProps {
  workLog: WorkLog;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function WorkLogCard({ workLog, isOwner, onEdit, onDelete }: WorkLogCardProps) {
  const progressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-amber-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-slate-300';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">
            {workLog.task?.taskName}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {format(new Date(workLog.workDate), 'M월 d일 (EEEE)', { locale: ko })}
          </p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1 ml-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-blue-600"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-rose-600"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 작업 내용 */}
      <p className="text-slate-600 text-sm whitespace-pre-wrap line-clamp-3 mb-3">
        {workLog.content}
      </p>

      {/* 메타 정보 */}
      <div className="flex items-center gap-4 flex-wrap">
        {workLog.workHours && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>{workLog.workHours}시간</span>
          </div>
        )}

        {workLog.progress !== null && workLog.progress !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', progressColor(workLog.progress))}
                style={{ width: `${workLog.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">
              {workLog.progress}%
            </span>
          </div>
        )}
      </div>

      {/* 이슈 */}
      {workLog.issues && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-slate-600 line-clamp-2">{workLog.issues}</p>
          </div>
        </div>
      )}
    </div>
  );
}
