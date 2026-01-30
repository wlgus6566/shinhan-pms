'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { WorkLogCalendar } from './WorkLogCalendar';
import { TeamWorkLogFilters } from './TeamWorkLogFilters';
import { WeeklyReportExportButton } from './WeeklyReportExportButton';
import { MonthlyStaffReportExportButton } from './MonthlyStaffReportExportButton';
import { MonthlyTaskReportExportButton } from './MonthlyTaskReportExportButton';
import { TeamWorkLogDetailDialog } from './TeamWorkLogDetailDialog';
import type { WorkLog } from '@/types/work-log';
import type { ProjectMember } from '@/types/project';
import type { TaskStatus, TaskDifficulty } from '@/types/task';
import { getProjectWorkLogs } from '@/lib/api/workLogs';

interface TeamWorkLogListProps {
  projectId: string;
  members: ProjectMember[];
}

export function TeamWorkLogList({ projectId, members }: TeamWorkLogListProps) {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [selectedWorkArea, setSelectedWorkArea] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<TaskDifficulty[]>(
    [],
  );
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchWorkLogs = async () => {
      setLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const data = await getProjectWorkLogs(projectId, startDate, endDate);
        setWorkLogs(data);
      } catch (error) {
        console.error('Failed to fetch work logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkLogs();
  }, [projectId, currentMonth]);

  const memberMap = new Map(
    members.map((m) => [m.memberId.toString(), m.member]),
  );

  // Cascading filter helper: Filter assignees by work area
  const filteredAssignees = useMemo(() => {
    if (selectedWorkArea === 'all') return members;
    return members.filter((m) => m.workArea === selectedWorkArea);
  }, [members, selectedWorkArea]);

  // Reset function
  const resetFilters = () => {
    setSelectedWorkArea('all');
    setAssigneeFilter('all');
    setStatusFilter([]);
    setDifficultyFilter([]);
  };

  // Comprehensive filtering and sorting
  const filteredAndSortedWorkLogs = useMemo(() => {
    let result = [...workLogs];

    // 1. Filter by work area
    if (selectedWorkArea !== 'all') {
      const memberIds = members
        .filter((m) => m.workArea === selectedWorkArea)
        .map((m) => m.memberId.toString());
      result = result.filter((log) => memberIds.includes(log.userId));
    }

    // 2. Filter by assignee
    if (assigneeFilter !== 'all') {
      result = result.filter((log) => log.userId === assigneeFilter);
    }

    // 3. Filter by status
    if (statusFilter.length > 0) {
      result = result.filter(
        (log) =>
          log.task?.status && statusFilter.includes(log.task.status as any),
      );
    }

    // 4. Filter by difficulty
    if (difficultyFilter.length > 0) {
      result = result.filter(
        (log) =>
          log.task?.difficulty &&
          difficultyFilter.includes(log.task.difficulty as any),
      );
    }

    // 5. Sort by work date (descending - newest first)
    result.sort((a, b) => b.workDate.localeCompare(a.workDate));

    return result;
  }, [
    workLogs,
    selectedWorkArea,
    assigneeFilter,
    statusFilter,
    difficultyFilter,
    members,
  ]);

  // 선택한 날짜의 업무일지들
  const selectedDateLogs = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return filteredAndSortedWorkLogs.filter((log) => log.workDate === dateStr);
  }, [selectedDate, filteredAndSortedWorkLogs]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const logsForDate = filteredAndSortedWorkLogs.filter(
      (log) => log.workDate === dateStr,
    );

    if (logsForDate.length > 0) {
      setDialogOpen(true);
    }
  };

  const handleMonthChange = (date: Date) => {
    const newMonth = startOfMonth(date);
    setCurrentMonth(newMonth);
    setSelectedDate(newMonth); // Sync selected date to first day of new month
  };

  // 프로젝트에 있는 담당 분야 목록 추출
  const availableWorkAreas = useMemo(() => {
    const areas = new Set(members.map((m) => m.workArea));
    return Array.from(areas).sort();
  }, [members]);

  return (
    <div className="space-y-4">
      <div className="flex flex-row flex-wrap justify-end gap-2">
        <WeeklyReportExportButton
          projectId={projectId}
          defaultStartDate={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
          defaultEndDate={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
        />
        <div className="flex flex-row flex-wrap gap-2">
          <MonthlyStaffReportExportButton
            projectId={projectId}
            defaultDate={currentMonth}
          />
          <MonthlyTaskReportExportButton
            projectId={projectId}
            defaultDate={currentMonth}
          />
        </div>
      </div>
      {/* Filters */}
      <TeamWorkLogFilters
        selectedWorkArea={selectedWorkArea}
        setSelectedWorkArea={setSelectedWorkArea}
        availableWorkAreas={availableWorkAreas}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        filteredAssignees={filteredAssignees}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        resetFilters={resetFilters}
      />

      {/* 캘린더 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로드 중...</p>
        </div>
      ) : (
        <>
          <WorkLogCalendar
            workLogs={filteredAndSortedWorkLogs}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
            showUserName={true}
          />
        </>
      )}

      {/* 업무일지 상세 모달 */}
      <TeamWorkLogDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        workLogs={selectedDateLogs}
        memberMap={memberMap}
      />
    </div>
  );
}
