'use client';

import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertCircle,
  Clock,
  Plus,
  PenLine,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkLogCard } from './WorkLogCard';
import type { WorkLog, MyTask } from '@/types/work-log';

interface WorkLogListProps {
  workLogs: WorkLog[];
  currentUserId?: string;
  selectedDate: Date;
  myTasks?: MyTask[];
  onEdit?: (workLog: WorkLog) => void;
  onDelete?: (workLog: WorkLog) => void;
  onCreate?: () => void;
}

export function WorkLogList({
  workLogs,
  currentUserId,
  selectedDate,
  myTasks = [],
  onEdit,
  onDelete,
  onCreate,
}: WorkLogListProps) {
  // 선택된 날짜의 일지 필터링
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const logsForSelectedDate = useMemo(() => {
    return workLogs.filter((log) => log.workDate === selectedDateStr);
  }, [workLogs, selectedDateStr]);

  // 프로젝트별 그룹핑
  const groupedByProject = useMemo(() => {
    if (logsForSelectedDate.length === 0) return [];

    // myTasks에서 projectId → projectName 매핑 생성
    const projectNameMap = new Map<string, string>();
    myTasks.forEach((task) => {
      if (task.project?.projectName) {
        projectNameMap.set(task.projectId, task.project.projectName);
      }
    });

    const groups: {
      projectId: string;
      projectName: string;
      logs: WorkLog[];
    }[] = [];
    const groupIndexMap = new Map<string, number>();

    logsForSelectedDate.forEach((log) => {
      const projectId = log.task?.projectId || 'unknown';
      const projectName = projectNameMap.get(projectId) || '프로젝트 미지정';

      if (!groupIndexMap.has(projectId)) {
        groupIndexMap.set(projectId, groups.length);
        groups.push({ projectId, projectName, logs: [] });
      }
      groups[groupIndexMap.get(projectId)!]!.logs.push(log);
    });

    return groups;
  }, [logsForSelectedDate, myTasks]);

  // 선택된 날짜의 총 근무시간 계산
  const totalHours = useMemo(() => {
    return logsForSelectedDate.reduce(
      (sum, log) => sum + (log.workHours || 0),
      0,
    );
  }, [logsForSelectedDate]);

  const REQUIRED_HOURS = 8;
  const remainingHours = REQUIRED_HOURS - totalHours;
  const isHoursShort = logsForSelectedDate.length > 0 && remainingHours > 0;

  // 모든 업무에 대한 일지가 작성되었는지 체크
  const allTasksLogged = useMemo(() => {
    if (myTasks.length === 0) return false;
    const loggedTaskIds = new Set(logsForSelectedDate.map((log) => log.taskId));
    return myTasks.every((task) => loggedTaskIds.has(task.id));
  }, [myTasks, logsForSelectedDate]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">
          {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
        </h3>
        <div className="text-right">
          <p className="text-sm text-slate-500">
            <span className="font-bold">{logsForSelectedDate.length}</span>건의 내
            업무일지
          </p>
          {logsForSelectedDate.length > 0 && (
            <p className={`text-xs mt-0.5 font-medium ${isHoursShort ? 'text-amber-600' : 'text-emerald-600'}`}>
              총 {totalHours}h / {REQUIRED_HOURS}h
            </p>
          )}
        </div>
        {/* {onCreate && (
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            일지 작성
          </Button>
        )} */}
      </div>

      {/* 일지 목록 */}
      <div className="max-h-[500px] overflow-y-auto p-4">
        {/* 모든 업무일지 작성 완료 배너 */}
        {allTasksLogged && logsForSelectedDate.length > 0 && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 px-4 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-700">
              오늘의 모든 업무일지를 작성했어요!
            </p>
          </div>
        )}
        {/* 8시간 미달 경고 배너 */}
        {isHoursShort && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200/60 px-4 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-700">
                근무시간이 {remainingHours}시간 부족해요
              </p>
              <p className="text-xs text-amber-600/80 mt-0.5">
                현재 {totalHours}시간 / 필요 {REQUIRED_HOURS}시간
              </p>
            </div>
          </div>
        )}
        {logsForSelectedDate.length === 0 ? (
          <div className="py-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-500 mb-4 text-center font-bold">
              작성된 업무일지가 없어요.
            </p>
            {onCreate && (
              <Button
                variant="outline"
                onClick={onCreate}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                업무일지 작성하기
              </Button>
            )}
          </div>
        ) : groupedByProject.length > 1 ? (
          /* 프로젝트가 2개 이상일 때만 그룹핑 표시 */
          <div className="space-y-4">
            {groupedByProject.map((group) => (
              <div key={group.projectId} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <FolderOpen className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-600">
                    {group.projectName}
                  </span>
                  <div className="flex-1 border-t border-slate-100 ml-1" />
                </div>
                <div className="space-y-2">
                  {group.logs.map((log) => (
                    <WorkLogCard
                      key={log.id}
                      workLog={log}
                      isOwner={currentUserId === log.userId}
                      onEdit={onEdit ? () => onEdit(log) : undefined}
                      onDelete={onDelete ? () => onDelete(log) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 프로젝트가 1개일 때는 기존처럼 플랫 리스트 */
          <div className="space-y-3">
            {logsForSelectedDate.map((log) => (
              <WorkLogCard
                key={log.id}
                workLog={log}
                isOwner={currentUserId === log.userId}
                onEdit={onEdit ? () => onEdit(log) : undefined}
                onDelete={onDelete ? () => onDelete(log) : undefined}
              />
            ))}
          </div>
        )}
      </div>
      {/* Floating Action Button - Portal to body to escape transform context */}
      {onCreate &&
        typeof document !== 'undefined' &&
        createPortal(
          <Button
            onClick={onCreate}
            className="gradient-primary border-none fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
            size="icon"
          >
            <PenLine className="h-6 w-6" />
          </Button>,
          document.body,
        )}
    </div>
  );
}
