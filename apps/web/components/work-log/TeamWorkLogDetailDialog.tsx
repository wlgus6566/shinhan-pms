'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, AlertCircle } from 'lucide-react';
import type { WorkLog } from '@/types/work-log';
import type { ProjectMember } from '@/types/project';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '@/types/task';
import { cn } from '@/lib/utils';

interface TeamWorkLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  workLogs: WorkLog[];
  memberMap: Map<string, ProjectMember['member']>;
}

export function TeamWorkLogDetailDialog({
  open,
  onOpenChange,
  selectedDate,
  workLogs,
  memberMap,
}: TeamWorkLogDetailDialogProps) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={
        format(selectedDate, 'yyyy년 MM월 dd일 (EEEE)', { locale: ko }) +
        ' 팀 업무일지'
      }
    >
      <div className="space-y-4">
        {workLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            오늘 작성된 업무일지가 없습니다
          </p>
        ) : (
          workLogs.map((log) => (
            <Card key={log.id} className="border-slate-200">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* 헤더: 작성자, 작업명 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {log.user?.name ||
                            memberMap.get(log.userId)?.name ||
                            '알 수 없음'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (
                          {log.user?.email ||
                            memberMap.get(log.userId)?.email ||
                            ''}
                          )
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {log.task?.taskName || '작업명 없음'}
                      </p>
                    </div>

                    {/* Status and Difficulty Badges */}
                    <div className="flex items-center gap-2">
                      {log.task?.status && (
                        <Badge
                          className={cn(
                            'text-xs',
                            STATUS_COLORS[log.task.status],
                          )}
                        >
                          {STATUS_LABELS[log.task.status]}
                        </Badge>
                      )}
                      {log.task?.difficulty && (
                        <Badge
                          className={cn(
                            'text-xs',
                            DIFFICULTY_COLORS[log.task.difficulty],
                          )}
                        >
                          {DIFFICULTY_LABELS[log.task.difficulty]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {log.content}
                    </p>
                  </div>

                  {/* 통계 */}
                  <div className="flex flex-wrap gap-3">
                    {log.workHours !== null && log.workHours !== undefined && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{log.workHours}시간</span>
                      </div>
                    )}

                    {log.progress !== null && log.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={
                              'h-full rounded-full transition-all bg-primary'
                            }
                            style={{ width: `${log.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {log.progress}% 진행
                        </span>
                      </div>
                    )}

                    {log.issues && (
                      <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="font-medium">이슈 있음</span>
                      </div>
                    )}
                  </div>

                  {/* 이슈 내용 */}
                  {log.issues && (
                    <div className="bg-orange-50 p-3 rounded border border-orange-200">
                      <p className="text-xs font-medium text-orange-700 mb-1">
                        이슈:
                      </p>
                      <p className="text-xs text-orange-700">{log.issues}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </BaseDialog>
  );
}
