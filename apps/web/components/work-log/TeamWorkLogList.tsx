'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Clock, AlertCircle } from 'lucide-react';
import { WorkLogCalendar } from './WorkLogCalendar';
import { TeamWorkLogFilters } from './TeamWorkLogFilters';
import { WeeklyReportExportButton } from './WeeklyReportExportButton';
import type { WorkLog } from '@/types/work-log';
import type { ProjectMember } from '@/types/project';
import type { TaskStatus, TaskDifficulty } from '@/types/task';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '@/types/task';
import { useProjectWorkLogs, getProjectWorkLogs } from '@/lib/api/workLogs';
import { cn } from '@/lib/utils';

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
        (log) => log.task?.status && statusFilter.includes(log.task.status),
      );
    }

    // 4. Filter by difficulty
    if (difficultyFilter.length > 0) {
      result = result.filter(
        (log) =>
          log.task?.difficulty &&
          difficultyFilter.includes(log.task.difficulty),
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
    <div className="space-y-6">
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

      {/* Export Button */}
      <div className="flex justify-end">
        <WeeklyReportExportButton
          projectId={projectId}
          defaultStartDate={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
          defaultEndDate={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {format(selectedDate, 'yyyy년 MM월 dd일 (EEEE)', { locale: ko })}{' '}
              팀 업무일지
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedDateLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                오늘 작성된 업무일지가 없습니다
              </p>
            ) : (
              selectedDateLogs.map((log) => (
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
                        {log.workHours !== null &&
                          log.workHours !== undefined && (
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">
                                {log.workHours}시간
                              </span>
                            </div>
                          )}

                        {log.progress !== null &&
                          log.progress !== undefined && (
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
                          <p className="text-xs text-orange-700">
                            {log.issues}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
