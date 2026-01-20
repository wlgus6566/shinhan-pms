'use client';

import { useState, useCallback, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMyWorkLogs, useMyTasks } from '@/lib/hooks/useWorkLogs';
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

  // 어제 일지 (복사 기능용)
  const previousLog = useMemo(() => {
    if (!selectedTaskId) return null;
    const yesterday = format(subDays(selectedDate, 1), 'yyyy-MM-dd');
    return workLogs.find(
      (log) => log.taskId === selectedTaskId && log.workDate === yesterday
    ) || null;
  }, [workLogs, selectedTaskId, selectedDate]);

  // 날짜 선택 핸들러
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // 월 변경 핸들러
  const handleMonthChange = useCallback((date: Date) => {
    setCurrentMonth(startOfMonth(date));
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
      if (dialogMode === 'create' && taskId) {
        await createWorkLog(taskId, data as CreateWorkLogRequest);
      } else if (dialogMode === 'edit' && editingWorkLog) {
        await updateWorkLog(editingWorkLog.id, data as UpdateWorkLogRequest);
      }
      mutateWorkLogs();
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
          <h1 className="text-2xl font-bold text-slate-800">내 업무일지</h1>
          <p className="text-slate-500 mt-1">
            담당 업무의 일지를 작성하고 관리하세요
          </p>
        </div>
      </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 내 업무 목록 */}
          <div className="lg:col-span-1">
            <MyTaskList
              tasks={myTasks}
              selectedTaskId={selectedTaskId}
              onTaskSelect={setSelectedTaskId}
            />
          </div>
          
          {/* 가운데: 달력 */}
          <div className="lg:col-span-1">
            <WorkLogCalendar
              workLogs={workLogs}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />
          </div>

          {/* 오른쪽: 선택된 날짜의 일지 */}
          <div className="lg:col-span-1">
            <WorkLogList
              workLogs={workLogs}
              currentUserId={user?.id.toString()}
              selectedDate={selectedDate}
              onEdit={handleEditClick}
              onDelete={handleDeleteFromCard}
              onCreate={handleCreateClick}
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
