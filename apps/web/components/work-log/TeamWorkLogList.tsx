'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamWorkLogListProps {
  projectId: string;
  projectName: string;
  members: ProjectMember[];
}

export function TeamWorkLogList({ projectId, projectName, members }: TeamWorkLogListProps) {
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

  // 전체 workLogs에서 고유 태스크 기준 상태별 카운트 계산 (필터 적용 전)
  const statusCounts = useMemo(() => {
    const tasksByStatus = new Map<string, Set<string>>();
    workLogs.forEach((log) => {
      const status = log.task?.status as TaskStatus | undefined;
      const taskId = log.task?.id;
      if (status && taskId) {
        if (!tasksByStatus.has(status)) {
          tasksByStatus.set(status, new Set());
        }
        tasksByStatus.get(status)!.add(taskId);
      }
    });
    const counts: Partial<Record<TaskStatus, number>> = {};
    tasksByStatus.forEach((taskIds, status) => {
      counts[status as TaskStatus] = taskIds.size;
    });
    return counts;
  }, [workLogs]);

  // Shared monthly export date
  const [monthlyExportDate, setMonthlyExportDate] = useState<Date>(new Date());
  const exportYear = monthlyExportDate.getFullYear();
  const exportMonth = monthlyExportDate.getMonth() + 1;
  const exportMonthDisplay = format(monthlyExportDate, 'yyyy년 M월', { locale: ko });

  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedWorkArea !== 'all') count++;
    if (assigneeFilter !== 'all') count++;
    if (statusFilter.length > 0) count++;
    if (difficultyFilter.length > 0) count++;
    return count;
  }, [selectedWorkArea, assigneeFilter, statusFilter, difficultyFilter]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile: Compact action bar */}
      <div className="flex sm:hidden gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs justify-between"
          onClick={() => setExportOpen(!exportOpen)}
        >
          <span className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            엑셀 다운로드
          </span>
          <ChevronDown className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            exportOpen && 'rotate-180'
          )} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs justify-between"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            필터
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            filterOpen && 'rotate-180'
          )} />
        </Button>
      </div>

      {/* Mobile: Collapsible export section */}
      <div className={cn(
        'sm:hidden overflow-hidden transition-all duration-300 ease-in-out',
        exportOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <Card className="p-3 space-y-3 shadow-none">
          <WeeklyReportExportButton
            projectId={projectId}
            projectName={projectName}
            defaultStartDate={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
            defaultEndDate={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
          />
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setMonthlyExportDate((prev) => subMonths(prev, 1))}
              aria-label="이전 월"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-center whitespace-nowrap w-[90px]">
              {exportMonthDisplay}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setMonthlyExportDate((prev) => addMonths(prev, 1))}
              aria-label="다음 월"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <MonthlyStaffReportExportButton
            projectId={projectId}
            projectName={projectName}
            year={exportYear}
            month={exportMonth}
          />
          <MonthlyTaskReportExportButton
            projectId={projectId}
            projectName={projectName}
            year={exportYear}
            month={exportMonth}
          />
        </Card>
      </div>

      {/* Mobile: Collapsible filter section */}
      <div className={cn(
        'sm:hidden overflow-hidden transition-all duration-300 ease-in-out',
        filterOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      )}>
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
          statusCounts={statusCounts}
        />
      </div>

      {/* Desktop: Export buttons */}
      <div className="hidden sm:flex flex-row flex-wrap justify-end items-center gap-2">
        <WeeklyReportExportButton
          projectId={projectId}
          projectName={projectName}
          defaultStartDate={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
          defaultEndDate={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
        />
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setMonthlyExportDate((prev) => subMonths(prev, 1))}
            aria-label="이전 월"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-center whitespace-nowrap w-[90px]">
            {exportMonthDisplay}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setMonthlyExportDate((prev) => addMonths(prev, 1))}
            aria-label="다음 월"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <MonthlyStaffReportExportButton
          projectId={projectId}
          projectName={projectName}
          year={exportYear}
          month={exportMonth}
        />
        <MonthlyTaskReportExportButton
          projectId={projectId}
          projectName={projectName}
          year={exportYear}
          month={exportMonth}
        />
      </div>

      {/* Desktop: Filters (always visible) */}
      <div className="hidden sm:block">
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
          statusCounts={statusCounts}
        />
      </div>

      {/* 캘린더 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로드 중...</p>
        </div>
      ) : (
        <WorkLogCalendar
          workLogs={filteredAndSortedWorkLogs}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          showUserName={true}
        />
      )}

      {/* 업무일지 상세 모달 */}
      <TeamWorkLogDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        workLogs={selectedDateLogs}
        memberMap={memberMap}
        members={members}
      />
    </div>
  );
}
