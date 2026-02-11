'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, AlertCircle, FileText } from 'lucide-react';
import type { WorkLog } from '@/types/work-log';
import type { ProjectMember } from '@/types/project';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type TaskStatus,
  type TaskDifficulty,
} from '@/types/task';
import { DifficultyIndicator } from '@/components/ui/difficulty-indicator';
import { cn } from '@/lib/utils';

interface TeamWorkLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  workLogs: WorkLog[];
  memberMap: Map<string, ProjectMember['member']>;
}

interface GroupedWorkLogs {
  userId: string;
  userName: string;
  userEmail: string;
  logs: WorkLog[];
  totalHours: number;
}

export function TeamWorkLogDetailDialog({
  open,
  onOpenChange,
  selectedDate,
  workLogs,
  memberMap,
}: TeamWorkLogDetailDialogProps) {
  // 작성자별로 그룹화
  const groupedByUser = useMemo(() => {
    const groups = new Map<string, GroupedWorkLogs>();

    workLogs.forEach((log) => {
      const userId = log.userId;
      const userName =
        log.user?.name || memberMap.get(userId)?.name || '알 수 없음';
      const userEmail =
        log.user?.email || memberMap.get(userId)?.email || '';

      if (!groups.has(userId)) {
        groups.set(userId, {
          userId,
          userName,
          userEmail,
          logs: [],
          totalHours: 0,
        });
      }

      const group = groups.get(userId)!;
      group.logs.push(log);
      if (log.workHours) {
        group.totalHours += log.workHours;
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.userName.localeCompare(b.userName),
    );
  }, [workLogs, memberMap]);

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
      <div className="space-y-6">
        {workLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            오늘 작성된 업무일지가 없습니다
          </p>
        ) : (
          groupedByUser.map((group) => (
            <Card key={group.userId} className="border-slate-200">
              {/* 작성자 헤더 */}
              <CardHeader className="pb-3 bg-slate-50/50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {group.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {group.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({group.userEmail})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {group.logs.length}건
                        </span>
                        {group.totalHours > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            총 {group.totalHours}시간
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* 업무일지 목록 */}
              <CardContent className="pt-4 space-y-3">
                {group.logs.map((log, index) => (
                  <div
                    key={log.id}
                    className={cn(
                      'space-y-2',
                      index !== group.logs.length - 1 &&
                        'pb-3 border-b border-slate-100',
                    )}
                  >
                    {/* 작업명 및 뱃지 */}
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-slate-800">
                        {log.task?.taskName || '작업명 없음'}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {log.task?.status && (
                          <Badge
                            className={cn(
                              'text-xs',
                              STATUS_COLORS[log.task.status as TaskStatus],
                            )}
                          >
                            {STATUS_LABELS[log.task.status as TaskStatus]}
                          </Badge>
                        )}
                        {log.task?.difficulty && (
                          <DifficultyIndicator
                            difficulty={log.task.difficulty as TaskDifficulty}
                          />
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
                      {log.workHours !== null &&
                        log.workHours !== undefined && (
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">
                              {log.workHours}시간
                            </span>
                          </div>
                        )}

                      {log.progress !== null && log.progress !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all bg-primary"
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
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </BaseDialog>
  );
}
