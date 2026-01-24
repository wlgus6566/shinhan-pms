'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { FileText, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useMyWorkLogs, useMyTasks } from '@/lib/api/workLogs';
import {
  WorkLogCalendar,
  WorkLogDialog,
  WorkLogList,
  MyTaskList,
} from '@/components/work-log';
import {
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
} from '@/lib/api/workLogs';
import type { WorkLog, CreateWorkLogRequest, UpdateWorkLogRequest } from '@/types/work-log';

export default function WorkLogsPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // 날짜 범위 계산
  const dateRange = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
  }, [currentMonth]);

  // 데이터 조회
  const {
    workLogs = [],
    isLoading: workLogsLoading,
    mutate: mutateWorkLogs,
  } = useMyWorkLogs(dateRange.startDate, dateRange.endDate);

  const { tasks: myTasks = [], isLoading: tasksLoading } = useMyTasks();

  // 고유 프로젝트 목록 추출 (가나다순 정렬)
  const uniqueProjects = useMemo(() => {
    const projectMap = new Map<string, { id: string; projectName: string }>();

    myTasks.forEach(task => {
      if (task.project && task.project.id) {
        projectMap.set(task.project.id, {
          id: task.project.id,
          projectName: task.project.projectName
        });
      }
    });

    return Array.from(projectMap.values()).sort((a, b) =>
      a.projectName.localeCompare(b.projectName, 'ko')
    );
  }, [myTasks]);

  // 프로젝트별 필터링된 업무 목록
  const filteredTasks = useMemo(() => {
    if (selectedProjectId === 'all') return myTasks;
    return myTasks.filter(task => task.projectId === selectedProjectId);
  }, [myTasks, selectedProjectId]);

  // 프로젝트별 필터링된 일지 목록
  const filteredWorkLogs = useMemo(() => {
    if (selectedProjectId === 'all') return workLogs;

    // 선택된 프로젝트에 속한 taskId 추출
    const projectTaskIds = new Set(
      myTasks
        .filter(task => task.projectId === selectedProjectId)
        .map(task => task.id)
    );

    return workLogs.filter(log => projectTaskIds.has(log.taskId));
  }, [workLogs, myTasks, selectedProjectId]);

  // 어제 일지 (복사 기능용)
  const previousLog = useMemo(() => {
    if (!selectedTaskId) return null;
    const yesterday = format(subDays(selectedDate, 1), 'yyyy-MM-dd');
    return workLogs.find(
      (log) => log.taskId === selectedTaskId && log.workDate === yesterday
    ) || null;
  }, [workLogs, selectedTaskId, selectedDate]);

  // 프로젝트 전환 시 선택된 업무가 필터 범위에 없으면 리셋
  useEffect(() => {
    if (selectedTaskId && !filteredTasks.some(task => task.id === selectedTaskId)) {
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
    setEditingWorkLog(null);
    setDialogOpen(true);
  }, []);

  // 일지 수정 다이얼로그 열기
  const handleEditClick = useCallback((workLog: WorkLog) => {
    setDialogMode('edit');
    setEditingWorkLog(workLog);
    setSelectedDate(new Date(workLog.workDate));
    setDialogOpen(true);
  }, []);

  // 일지 작성/수정 제출
  const handleSubmit = useCallback(
    async (data: CreateWorkLogRequest | UpdateWorkLogRequest, taskId?: string) => {
      try {
        if (dialogMode === 'create' && taskId) {
          await createWorkLog(taskId, data as CreateWorkLogRequest);
        } else if (dialogMode === 'edit' && editingWorkLog) {
          await updateWorkLog(editingWorkLog.id, data as UpdateWorkLogRequest);
        }
        mutateWorkLogs();
      } catch (error: any) {
        // 409 Conflict: 중복 업무일지
        if (error?.statusCode === 409) {
          alert(error.message || '해당 날짜에 이미 업무일지가 존재합니다');
        } else {
          // 기타 에러
          alert(error?.message || '업무일지 저장 중 오류가 발생했습니다');
        }
        throw error; // 에러를 다시 던져서 다이얼로그가 닫히지 않도록 함
      }
    },
    [dialogMode, editingWorkLog, mutateWorkLogs]
  );

  // 일지 삭제
  const handleDelete = useCallback(async () => {
    if (editingWorkLog) {
      await deleteWorkLog(editingWorkLog.id);
      mutateWorkLogs();
    }
  }, [editingWorkLog, mutateWorkLogs]);

  // 일지 삭제 (카드에서)
  const handleDeleteFromCard = useCallback(
    async (workLog: WorkLog) => {
      if (confirm('정말 삭제하시겠습니까?')) {
        await deleteWorkLog(workLog.id);
        mutateWorkLogs();
      }
    },
    [mutateWorkLogs]
  );

  const isLoading = workLogsLoading || tasksLoading;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">업무일지</h1>
          <p className="text-slate-500 mt-1">
            담당 업무의 일지를 작성하고 관리하세요
          </p>
        </div>
      </div>

      {/* 프로젝트 필터 탭 */}
      {!isLoading && myTasks.length > 0 && uniqueProjects.length > 0 && (
        <Tabs
          value={selectedProjectId}
          onValueChange={setSelectedProjectId}
        >
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            {uniqueProjects.map(project => (
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
        <div className="flex gap-6">
          <div className="flex flex-col gap-6 w-[30%]">
            <MyTaskList
              tasks={filteredTasks}
              selectedTaskId={selectedTaskId}
              onTaskSelect={setSelectedTaskId}
            />
             <WorkLogList
              workLogs={filteredWorkLogs}
              currentUserId={user?.id.toString()}
              selectedDate={selectedDate}
              onEdit={handleEditClick}
              onDelete={handleDeleteFromCard}
              onCreate={handleCreateClick}
            />
          </div>
          
          {/* 가운데: 달력 */}
          <div className="flex-1">
            <WorkLogCalendar
              workLogs={filteredWorkLogs}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />
          </div>
        </div>
      )}

      {/* 일지 작성/수정 다이얼로그 */}
      <WorkLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        workLog={editingWorkLog}
        selectedDate={selectedDate}
        selectedTaskId={selectedTaskId}
        myTasks={myTasks}
        previousLog={previousLog}
        onSubmit={handleSubmit}
        onDelete={dialogMode === 'edit' ? handleDelete : undefined}
      />
    </div>
  );
}
