'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, AlertCircle } from 'lucide-react';
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
import {
  WORK_AREA_LABELS,
  WORK_AREA_COLORS,
} from '@/lib/constants/project';

interface TeamWorkLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  workLogs: WorkLog[];
  memberMap: Map<string, ProjectMember['member']>;
  members: ProjectMember[];
}

interface GroupedWorkLogs {
  userId: string;
  userName: string;
  userEmail: string;
  logs: WorkLog[];
  totalHours: number;
}

interface WorkAreaGroup {
  workArea: string;
  workAreaLabel: string;
  users: GroupedWorkLogs[];
  totalHours: number;
}

export function TeamWorkLogDetailDialog({
  open,
  onOpenChange,
  selectedDate,
  workLogs,
  memberMap,
  members,
}: TeamWorkLogDetailDialogProps) {
  // memberId → workArea 매핑
  const memberWorkAreaMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => {
      map.set(m.memberId.toString(), m.workArea);
    });
    return map;
  }, [members]);

  // 분야별 → 작성자별 2단계 그룹화
  const groupedByWorkArea = useMemo(() => {
    const userGroups = new Map<
      string,
      GroupedWorkLogs & { workArea: string }
    >();

    workLogs.forEach((log) => {
      const userId = log.userId;
      const userName =
        log.user?.name || memberMap.get(userId)?.name || '알 수 없음';
      const userEmail = log.user?.email || memberMap.get(userId)?.email || '';
      const workArea = memberWorkAreaMap.get(userId) || 'UNKNOWN';

      if (!userGroups.has(userId)) {
        userGroups.set(userId, {
          userId,
          userName,
          userEmail,
          logs: [],
          totalHours: 0,
          workArea,
        });
      }

      const group = userGroups.get(userId)!;
      group.logs.push(log);
      if (log.workHours) {
        group.totalHours += log.workHours;
      }
    });

    const areaGroups = new Map<string, WorkAreaGroup>();

    Array.from(userGroups.values()).forEach((userGroup) => {
      const { workArea } = userGroup;
      if (!areaGroups.has(workArea)) {
        areaGroups.set(workArea, {
          workArea,
          workAreaLabel: WORK_AREA_LABELS[workArea] || workArea,
          users: [],
          totalHours: 0,
        });
      }
      const areaGroup = areaGroups.get(workArea)!;
      areaGroup.users.push(userGroup);
      areaGroup.totalHours += userGroup.totalHours;
    });

    areaGroups.forEach((group) => {
      group.users.sort((a, b) => a.userName.localeCompare(b.userName));
    });

    const areaOrder = Object.keys(WORK_AREA_LABELS);
    return Array.from(areaGroups.values()).sort(
      (a, b) => areaOrder.indexOf(a.workArea) - areaOrder.indexOf(b.workArea),
    );
  }, [workLogs, memberMap, memberWorkAreaMap]);

  const getAreaColor = (workArea: string) =>
    WORK_AREA_COLORS[workArea as keyof typeof WORK_AREA_COLORS] || '#64748B';

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
      <div className="space-y-5">
        {workLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm">작성된 업무일지가 없습니다</p>
          </div>
        ) : (
          groupedByWorkArea.map((areaGroup) => {
            const areaColor = getAreaColor(areaGroup.workArea);

            return (
              <div key={areaGroup.workArea} className="space-y-2.5">
                {/* 분야 헤더 */}
                <div
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${areaColor}08` }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: areaColor }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: areaColor }}
                  >
                    {areaGroup.workAreaLabel}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium px-1.5 py-0 h-5"
                  >
                    {areaGroup.users.length}명
                  </Badge>
                  {areaGroup.totalHours > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                      <Clock className="h-3 w-3" />
                      {areaGroup.totalHours}h
                    </span>
                  )}
                </div>

                {/* 분야 내 사용자별 카드 */}
                <div className="space-y-2.5 pl-1">
                  {areaGroup.users.map((group) => (
                    <Card
                      key={group.userId}
                      className="overflow-hidden border-slate-200/80 shadow-sm"
                      style={{ borderLeftColor: areaColor, borderLeftWidth: 3 }}
                    >
                      {/* 작성자 헤더 */}
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback
                            className="text-xs font-semibold text-white"
                            style={{ backgroundColor: areaColor }}
                          >
                            {group.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800 truncate">
                              {group.userName}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                              {group.userEmail}
                            </span>
                          </div>
                        </div>
                        {group.totalHours > 0 && (
                          <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 tabular-nums">
                            <Clock className="h-3 w-3" />
                            {group.totalHours}h
                          </span>
                        )}
                      </div>

                      {/* 업무일지 목록 */}
                      <CardContent className="p-0 divide-y divide-slate-100">
                        {group.logs.map((log) => (
                          <div key={log.id} className="px-4 py-3 space-y-2">
                            {/* 작업명 및 뱃지 */}
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[13px] font-medium text-slate-800 leading-snug">
                                {log.task?.taskName || '작업명 없음'}
                              </p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {log.task?.status && (
                                  <Badge
                                    className={cn(
                                      'text-[10px] px-1.5 py-0 h-5',
                                      STATUS_COLORS[
                                        log.task.status as TaskStatus
                                      ],
                                    )}
                                  >
                                    {
                                      STATUS_LABELS[
                                        log.task.status as TaskStatus
                                      ]
                                    }
                                  </Badge>
                                )}
                                {log.task?.difficulty && (
                                  <DifficultyIndicator
                                    difficulty={
                                      log.task.difficulty as TaskDifficulty
                                    }
                                  />
                                )}
                              </div>
                            </div>

                            {/* 내용 */}
                            <p className="text-[13px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {log.content}
                            </p>

                            {/* 메타 정보 */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5">
                              {log.workHours != null && (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 tabular-nums">
                                  <Clock className="h-3 w-3" />
                                  {log.workHours}시간
                                </span>
                              )}

                              {log.progress != null && (
                                <div className="inline-flex items-center gap-1.5">
                                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all"
                                      style={{ width: `${log.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-500 tabular-nums">
                                    {log.progress}%
                                  </span>
                                </div>
                              )}

                              {log.issues && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                  <AlertCircle className="h-3 w-3" />
                                  이슈
                                </span>
                              )}
                            </div>

                            {/* 이슈 내용 */}
                            {log.issues && (
                              <div className="text-xs text-amber-700 bg-amber-50/70 px-3 py-2 rounded border border-amber-200/60 leading-relaxed">
                                {log.issues}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </BaseDialog>
  );
}
