'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FileText, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useMyWorkLogs, useMyTasks } from '@/lib/api/workLogs';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import {
  WorkLogCalendar,
  WorkLogDialog,
  WorkLogList,
  MyTaskList,
} from '@/components/work-log';
import type { MultiSubmitResult } from '@/components/work-log/WorkLogDialog';
import {
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
} from '@/lib/api/workLogs';
import type {
  WorkLog,
  CreateWorkLogRequest,
  UpdateWorkLogRequest,
} from '@/types/work-log';

export default function WorkLogsPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date()),
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingWorkLogs, setEditingWorkLogs] = useState<WorkLog[]>([]);

  // 프로젝트 필터 탭 (URL 동기화)
  const {
    activeTab: selectedProjectId,
    handleTabChange: setSelectedProjectId,
  } = useTabNavigation('/work-logs', {
    defaultTab: 'all',
    queryKey: 'project',
  });

  // 날짜 범위 계산
  const dateRange = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
  }, [currentMonth]);

  // 데이터 조회 (달력용이므로 전체 조회)
  const {
    workLogs = [],
    isLoading: workLogsLoading,
    mutate: mutateWorkLogs,
  } = useMyWorkLogs(dateRange.startDate, dateRange.endDate, { all: true });

  const { tasks: myTasks = [], isLoading: tasksLoading } = useMyTasks();

  // 고유 프로젝트 목록 추출 (가나다순 정렬)
  const uniqueProjects = useMemo(() => {
    const projectMap = new Map<string, { id: string; projectName: string }>();

    myTasks.forEach((task) => {
      if (task.project && task.project.id) {
        projectMap.set(task.project.id, {
          id: task.project.id,
          projectName: task.project.projectName,
        });
      }
    });

    return Array.from(projectMap.values()).sort((a, b) =>
      a.projectName.localeCompare(b.projectName, 'ko'),
    );
  }, [myTasks]);

  // 프로젝트별 필터링된 업무 목록
  const filteredTasks = useMemo(() => {
    if (selectedProjectId === 'all') return myTasks;
    return myTasks.filter((task) => task.projectId === selectedProjectId);
  }, [myTasks, selectedProjectId]);

  // 프로젝트별 필터링된 일지 목록
  const filteredWorkLogs = useMemo(() => {
    if (selectedProjectId === 'all') return workLogs;

    // 선택된 프로젝트에 속한 taskId 추출
    const projectTaskIds = new Set(
      myTasks
        .filter((task) => task.projectId === selectedProjectId)
        .map((task) => task.id),
    );

    return workLogs.filter((log) => projectTaskIds.has(log.taskId));
  }, [workLogs, myTasks, selectedProjectId]);

  // 프로젝트 전환 시 선택된 업무가 필터 범위에 없으면 리셋
  useEffect(() => {
    if (
      selectedTaskId &&
      !filteredTasks.some((task) => task.id === selectedTaskId)
    ) {
      setSelectedTaskId(undefined);
    }
  }, [selectedTaskId, filteredTasks]);

  // 날짜 선택 핸들러
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // 월 변경 핸들러
  const handleMonthChange = useCallback((date: Date) => {
    const newMonth = startOfMonth(date);
    setCurrentMonth(newMonth);
    setSelectedDate(newMonth); // Sync selected date to first day of new month
  }, []);

  // 일지 작성 다이얼로그 열기
  const handleCreateClick = useCallback(() => {
    setDialogMode('create');
    setEditingWorkLogs([]);
    setDialogOpen(true);
  }, []);

  // 일지 수정 다이얼로그 열기 (단일)
  const handleEditClick = useCallback((workLog: WorkLog) => {
    setDialogMode('edit');
    setEditingWorkLogs([workLog]);
    setSelectedDate(new Date(workLog.workDate));
    setDialogOpen(true);
  }, []);

  // 캘린더에서 업무일지 클릭 시 - 해당 날짜의 모든 업무일지 수정
  const handleWorkLogClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);

      const dateStr = format(date, 'yyyy-MM-dd');
      const logsForDate = filteredWorkLogs.filter(
        (log) => log.workDate === dateStr,
      );

      setDialogMode('edit');
      setEditingWorkLogs(logsForDate);
      setDialogOpen(true);
    },
    [filteredWorkLogs],
  );

  // 일지 전체 삭제 (해당 날짜의 모든 업무일지)
  const handleDelete = useCallback(async () => {
    if (editingWorkLogs && editingWorkLogs.length > 0) {
      await Promise.all(editingWorkLogs.map((log) => deleteWorkLog(log.id)));
      mutateWorkLogs();
    }
  }, [editingWorkLogs, mutateWorkLogs]);

  // 일지 작성/수정 제출 (단일)
  const handleSubmit = useCallback(
    async (
      data: CreateWorkLogRequest | UpdateWorkLogRequest,
      taskId?: string,
    ) => {
      try {
        if (dialogMode === 'create' && taskId) {
          await createWorkLog(taskId, data as CreateWorkLogRequest);
        } else if (dialogMode === 'edit' && editingWorkLogs.length === 1) {
          await updateWorkLog(
            editingWorkLogs[0]!.id,
            data as UpdateWorkLogRequest,
          );
        }
        mutateWorkLogs();
      } catch (error: any) {
        throw error; // 에러를 다시 던져서 다이얼로그가 닫히지 않도록 함 (toast는 interceptor에서 자동 표시)
      }
    },
    [dialogMode, editingWorkLogs, mutateWorkLogs],
  );

  // 다중 수정 핸들러
  const handleMultiUpdate = useCallback(
    async (
      updates: Array<{ workLogId: string; data: UpdateWorkLogRequest }>,
    ): Promise<MultiSubmitResult> => {
      const results = await Promise.allSettled(
        updates.map(({ workLogId, data }) => updateWorkLog(workLogId, data)),
      );

      const success: string[] = [];
      const failed: Array<{ taskId: string; error: string }> = [];

      results.forEach((result, index) => {
        const update = updates[index];
        if (!update) return;
        if (result.status === 'fulfilled') {
          success.push(update.workLogId);
        } else {
          const error = result.reason as any;
          failed.push({
            taskId: update.workLogId,
            error: error?.message || '저장 중 오류가 발생했습니다',
          });
        }
      });

      mutateWorkLogs();
      return { success, failed };
    },
    [mutateWorkLogs],
  );

  // 다중 일지 제출
  const handleMultiSubmit = useCallback(
    async (
      entries: Array<{ taskId: string; data: CreateWorkLogRequest }>,
    ): Promise<MultiSubmitResult> => {
      const results = await Promise.allSettled(
        entries.map(({ taskId, data }) => createWorkLog(taskId, data)),
      );

      const success: string[] = [];
      const failed: Array<{ taskId: string; error: string }> = [];

      results.forEach((result, index) => {
        const entry = entries[index];
        if (!entry) return;
        if (result.status === 'fulfilled') {
          success.push(entry.taskId);
        } else {
          const error = result.reason as any;
          failed.push({
            taskId: entry.taskId,
            error: error?.message || '저장 중 오류가 발생했습니다',
          });
        }
      });

      mutateWorkLogs();
      return { success, failed };
    },
    [mutateWorkLogs],
  );

  const isLoading = workLogsLoading || tasksLoading;

  return (
    <div className="space-y-6 page-animate">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">업무일지</h1>
          <p className="text-slate-500 mt-1">
            담당 업무의 일지를 작성하고 관리하세요
          </p>
        </div>
      </div>

      {/* 프로젝트 필터 탭 */}
      {!isLoading && myTasks.length > 0 && uniqueProjects.length > 0 && (
        <Tabs value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            {uniqueProjects.map((project) => (
              <TabsTrigger
                key={project.id}
                value={project.id}
                className="max-w-[200px] truncate"
                title={project.projectName}
              >
                {project.projectName}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : myTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            담당 업무가 없습니다
          </h3>
          <p className="text-slate-500">
            프로젝트 PM이 업무를 배정하면 여기에서 일지를 작성할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-[30%] order-2 lg:order-1">
            <WorkLogList
              workLogs={filteredWorkLogs}
              currentUserId={user?.id.toString()}
              selectedDate={selectedDate}
              myTasks={filteredTasks}
              onEdit={handleEditClick}
              onCreate={handleCreateClick}
            />
            <MyTaskList tasks={filteredTasks} />
          </div>

          {/* 달력 (모바일에서 먼저 표시) */}
          <div className="flex-1 order-1 lg:order-2">
            <WorkLogCalendar
              workLogs={filteredWorkLogs}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              onWorkLogClick={handleWorkLogClick}
              showUserName={false}
            />
          </div>
        </div>
      )}

      {/* 일지 작성/수정 다이얼로그 */}
      <WorkLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        workLogs={editingWorkLogs}
        existingWorkLogs={filteredWorkLogs}
        selectedDate={selectedDate}
        selectedTaskId={selectedTaskId}
        myTasks={filteredTasks}
        onSubmit={handleSubmit}
        onMultiSubmit={handleMultiSubmit}
        onMultiUpdate={handleMultiUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
