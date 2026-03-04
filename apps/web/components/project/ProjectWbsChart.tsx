'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  eachDayOfInterval,
  differenceInCalendarDays,
  isSameDay,
  parseISO,
  getDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Search,
  Info,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Task } from '@repo/schema';

import { useWbsTasks, exportWbsExcel } from '@/lib/api/tasks';
import { useProjectTaskTypes } from '@/lib/api/projects';
import { useProjectMembers } from '@/lib/api/projectMembers';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// ============================================================================
// Constants
// ============================================================================

const DAY_COLUMN_WIDTH = 50;
const LEFT_PANEL_WIDTH = 280;
const TASK_TYPE_COL_WIDTH = 80;
const TASK_BAR_HEIGHT = 24;
const ASSIGNEE_BAR_HEIGHT = 18;
const ROW_HEIGHT = 44;
const ASSIGNEE_ROW_HEIGHT = 36;

/** WBS role color map (hex) - 연한 파스텔 톤 */
const ROLE_COLORS: Record<string, string> = {
  PLANNING: '#93c5fd',
  DESIGN: '#c4b5fd',
  PUBLISHING: '#fdba74',
  FRONTEND: '#86efac',
  BACKEND: '#fcd34d',
};

/** Short labels for legend */
const ROLE_LEGEND_LABELS: Record<string, string> = {
  PLANNING: '기획 진행',
  DESIGN: '디자인 진행',
  PUBLISHING: '퍼블 진행',
  FRONTEND: '프론트 진행',
  BACKEND: '백엔드 진행',
};

/** Korean day-of-week labels */
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// ============================================================================
// Types
// ============================================================================

interface ProjectWbsChartProps {
  projectId: string;
}

interface AssigneeRow {
  role: string;
  roleLabel: string;
  name: string;
  memberId: string;
  color: string;
  startDate?: string;
  endDate?: string;
}

interface ProcessedTask {
  task: Task;
  assignees: AssigneeRow[];
}

// ============================================================================
// Helper functions
// ============================================================================

function collectAssignees(task: Task): AssigneeRow[] {
  const result: AssigneeRow[] = [];
  const seen = new Set<string>();

  const addFromField = (
    assignees: Task['planningAssignees'],
    role: string,
    roleLabel: string,
  ) => {
    if (!assignees) return;
    for (const a of assignees) {
      const key = `${role}-${a.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        role,
        roleLabel,
        name: a.name,
        memberId: a.id,
        color: ROLE_COLORS[role] || '#6b7280',
        startDate: a.startDate || task.startDate,
        endDate: a.endDate || task.endDate,
      });
    }
  };

  addFromField(task.planningAssignees, 'PLANNING', '기획');
  addFromField(task.designAssignees, 'DESIGN', '디자인');
  addFromField(task.frontendAssignees, 'FRONTEND', '프론트엔드');
  addFromField(task.backendAssignees, 'BACKEND', '백엔드');

  return result;
}

function getAssigneeNames(task: Task): string {
  const names: string[] = [];
  const seen = new Set<string>();

  const collect = (assignees?: { id: string; name: string }[]) => {
    if (!assignees) return;
    for (const a of assignees) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        names.push(a.name);
      }
    }
  };

  collect(task.planningAssignees);
  collect(task.designAssignees);
  collect(task.frontendAssignees);
  collect(task.backendAssignees);

  return names.join(', ');
}

function getTaskRoleColors(task: Task): string[] {
  const colors: string[] = [];
  if (task.planningAssignees?.length) colors.push(ROLE_COLORS['PLANNING']!);
  if (task.designAssignees?.length) colors.push(ROLE_COLORS['DESIGN']!);
  if (task.frontendAssignees?.length) colors.push(ROLE_COLORS['FRONTEND']!);
  if (task.backendAssignees?.length) colors.push(ROLE_COLORS['BACKEND']!);
  if (colors.length === 0) colors.push('#94a3b8');
  return colors;
}

function buildGradient(colors: string[]): string {
  if (colors.length === 1) return colors[0]!;
  const step = 100 / colors.length;
  const stops = colors
    .map(
      (c, i) =>
        `${c} ${Math.round(i * step)}%, ${c} ${Math.round((i + 1) * step)}%`,
    )
    .join(', ');
  return `linear-gradient(90deg, ${stops})`;
}

// ============================================================================
// Sub-components
// ============================================================================

function DatePickerButton({
  value,
  onChange,
  label,
}: {
  value: Date;
  onChange: (d: Date) => void;
  label: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-[130px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-1 h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs">{format(value, 'yyyy-MM-dd')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ko}
          selected={value}
          onSelect={(d) => d && onChange(d)}
          defaultMonth={value}
        />
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProjectWbsChart({ projectId }: ProjectWbsChartProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ------ Data fetching ------
  const { tasks: rawTasks, isLoading: tasksLoading } = useWbsTasks(projectId);
  const { taskTypes, isLoading: taskTypesLoading } = useProjectTaskTypes(
    projectId,
    {
      pageSize: 9999,
    },
  );
  const { members, isLoading: membersLoading } = useProjectMembers(projectId);

  // ------ Filter state ------
  const now = new Date();
  const [filterStartDate, setFilterStartDate] = useState<Date>(
    startOfMonth(now),
  );
  const [filterEndDate, setFilterEndDate] = useState<Date>(
    endOfMonth(addMonths(now, 1)),
  );
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // Applied filters (only update when "조회" button clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: startOfMonth(now),
    endDate: endOfMonth(addMonths(now, 1)),
    role: 'ALL',
    assignee: 'ALL',
    taskType: 'ALL',
  });

  // ------ Collapsed rows (default: all expanded) ------
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  const toggleTask = useCallback((taskId: string) => {
    setCollapsedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // ------ Apply filters ------
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({
      startDate: filterStartDate,
      endDate: filterEndDate,
      role: selectedRole,
      assignee: selectedAssignee,
      taskType: selectedTaskType,
    });
    setCollapsedTasks(new Set());
  }, [
    filterStartDate,
    filterEndDate,
    selectedRole,
    selectedAssignee,
    selectedTaskType,
  ]);

  // ------ Excel Download ------
  const handleExportExcel = useCallback(
    async (flat = false) => {
      try {
        setIsExporting(true);
        const startStr = format(appliedFilters.startDate, 'yyyy-MM-dd');
        const endStr = format(appliedFilters.endDate, 'yyyy-MM-dd');
        await exportWbsExcel(projectId, startStr, endStr, flat);
      } catch {
        toast.error('엑셀 다운로드에 실패했습니다');
      } finally {
        setIsExporting(false);
      }
    },
    [projectId, appliedFilters.startDate, appliedFilters.endDate],
  );

  // ------ Date columns ------
  const dateColumns = useMemo(() => {
    return eachDayOfInterval({
      start: appliedFilters.startDate,
      end: appliedFilters.endDate,
    });
  }, [appliedFilters.startDate, appliedFilters.endDate]);

  const totalChartWidth = dateColumns.length * DAY_COLUMN_WIDTH;

  // ------ Today position ------
  const todayIndex = useMemo(() => {
    const idx = dateColumns.findIndex((d) => isSameDay(d, now));
    return idx >= 0 ? idx : -1;
  }, [dateColumns, now]);

  // ------ Filtered & processed tasks ------
  const processedTasks = useMemo<ProcessedTask[]>(() => {
    if (!rawTasks) return [];

    return rawTasks
      .filter((task) => {
        // Date overlap check (skip if no dates set)
        if (task.startDate && task.endDate) {
          const taskStart = parseISO(task.startDate);
          const taskEnd = parseISO(task.endDate);
          if (
            taskEnd < appliedFilters.startDate ||
            taskStart > appliedFilters.endDate
          ) {
            return false;
          }
        }

        // Task type filter
        if (
          appliedFilters.taskType !== 'ALL' &&
          task.taskTypeId !== appliedFilters.taskType
        ) {
          return false;
        }

        // Collect all assignees for role/assignee filtering
        const allAssignees = collectAssignees(task);

        // Role filter
        if (appliedFilters.role !== 'ALL') {
          const hasRole = allAssignees.some(
            (a) => a.role === appliedFilters.role,
          );
          if (!hasRole) return false;
        }

        // Assignee filter
        if (appliedFilters.assignee !== 'ALL') {
          const hasAssignee = allAssignees.some(
            (a) => a.memberId === appliedFilters.assignee,
          );
          if (!hasAssignee) return false;
        }

        return true;
      })
      .map((task) => {
        let assignees = collectAssignees(task);

        // Filter assignees by role
        if (appliedFilters.role !== 'ALL') {
          assignees = assignees.filter((a) => a.role === appliedFilters.role);
        }

        // Filter assignees by specific person
        if (appliedFilters.assignee !== 'ALL') {
          assignees = assignees.filter(
            (a) => a.memberId === appliedFilters.assignee,
          );
        }

        return { task, assignees };
      })
      .sort((a, b) => {
        const aName = a.task.taskType?.name || '';
        const bName = b.task.taskType?.name || '';
        return aName.localeCompare(bName, 'ko');
      });
  }, [rawTasks, appliedFilters]);

  // ------ Active roles (roles with at least 1 assignee in project tasks) ------
  const activeRoles = useMemo(() => {
    if (!rawTasks) return new Set<string>();
    const roles = new Set<string>();
    for (const task of rawTasks) {
      if (task.planningAssignees?.length) roles.add('PLANNING');
      if (task.designAssignees?.length) roles.add('DESIGN');
      if (task.frontendAssignees?.length) roles.add('FRONTEND');
      if (task.backendAssignees?.length) roles.add('BACKEND');
    }
    return roles;
  }, [rawTasks]);

  // ------ Role filter options (only roles with assignees) ------
  const roleFilterOptions = useMemo(() => {
    const allRoles: { value: string; label: string }[] = [
      { value: 'PLANNING', label: '기획' },
      { value: 'DESIGN', label: '디자인' },
      { value: 'FRONTEND', label: '프론트엔드' },
      { value: 'BACKEND', label: '백엔드' },
    ];
    return allRoles.filter((r) => activeRoles.has(r.value));
  }, [activeRoles]);

  // ------ Assignee filter options ------
  const assigneeOptions = useMemo(() => {
    if (!members) return [];
    return members
      .map((m) => ({
        value: m.memberId?.toString() || m.member?.id?.toString() || '',
        label: m.member?.name || '',
      }))
      .filter((o) => o.value && o.label);
  }, [members]);

  // ------ Bar position calculation ------
  const getBarStyle = useCallback(
    (startDateStr: string, endDateStr: string) => {
      const taskStart = parseISO(startDateStr);
      const taskEnd = parseISO(endDateStr);
      const chartStart = appliedFilters.startDate;
      const chartEnd = appliedFilters.endDate;

      // Clamp to visible range
      const visibleStart = taskStart < chartStart ? chartStart : taskStart;
      const visibleEnd = taskEnd > chartEnd ? chartEnd : taskEnd;

      const leftDays = differenceInCalendarDays(visibleStart, chartStart);
      const spanDays = differenceInCalendarDays(visibleEnd, visibleStart) + 1;

      return {
        left: leftDays * DAY_COLUMN_WIDTH + 2,
        width: Math.max(spanDays * DAY_COLUMN_WIDTH - 4, 8),
      };
    },
    [appliedFilters.startDate, appliedFilters.endDate],
  );

  // ------ Loading state ------
  if (tasksLoading || taskTypesLoading || membersLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
            <p className="text-sm">WBS 차트를 불러오는 중...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* ================================================================ */}
      {/* Filter Bar */}
      {/* ================================================================ */}
      <div className="border-b border-slate-200 bg-slate-50/50 px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Date Range */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">기간</label>
            <div className="flex items-center gap-1.5">
              <DatePickerButton
                value={filterStartDate}
                onChange={setFilterStartDate}
                label="시작일"
              />
              <span className="text-xs text-slate-400">~</span>
              <DatePickerButton
                value={filterEndDate}
                onChange={setFilterEndDate}
                label="종료일"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">역할</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {roleFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">담당자</label>
            <Select
              value={selectedAssignee}
              onValueChange={setSelectedAssignee}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {assigneeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Type Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">
              업무유형
            </label>
            <Select
              value={selectedTaskType}
              onValueChange={setSelectedTaskType}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {taskTypes?.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id}>
                    {tt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button size="sm" className="h-8" onClick={handleApplyFilters}>
            <Search className="h-3.5 w-3.5 mr-1" />
            조회
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => handleExportExcel(false)}
            disabled={isExporting}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {isExporting ? '다운로드 중...' : '엑셀 다운로드'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => handleExportExcel(true)}
            disabled={isExporting}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {isExporting ? '다운로드 중...' : '병합해제 다운로드'}
          </Button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Gantt Chart */}
      {/* ================================================================ */}
      <div className="relative overflow-x-auto" ref={scrollContainerRef}>
        <div
          className="relative"
          style={{ minWidth: LEFT_PANEL_WIDTH + totalChartWidth }}
        >
          {/* ------ Header Row ------ */}
          <div className="flex bg-slate-800 text-white sticky top-0 z-20">
            {/* Left Panel Header */}
            <div
              className="flex-shrink-0 sticky left-0 z-30 bg-slate-800 border-r border-slate-600"
              style={{ width: LEFT_PANEL_WIDTH }}
            >
              <div className="flex h-12 items-center">
                <div
                  className="flex items-center justify-center text-xs font-medium border-r border-slate-600"
                  style={{ width: TASK_TYPE_COL_WIDTH }}
                >
                  업무유형
                </div>
                <div className="flex-1 flex items-center justify-center text-xs font-medium">
                  업무명
                </div>
              </div>
            </div>

            {/* Date Columns Header */}
            <div className="flex">
              {dateColumns.map((date, idx) => {
                const dayOfWeek = getDay(date);
                const isWknd = dayOfWeek === 0 || dayOfWeek === 6;
                const isToday = isSameDay(date, now);
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex-shrink-0 flex flex-col items-center justify-center h-12 text-[10px] leading-tight border-r border-slate-600/50',
                      isWknd && 'bg-slate-700/50',
                      isToday && 'bg-blue-900/40',
                    )}
                    style={{ width: DAY_COLUMN_WIDTH }}
                  >
                    <span className="font-medium">{format(date, 'M/d')}</span>
                    <span
                      className={cn(
                        'text-slate-400',
                        dayOfWeek === 0 && 'text-red-400',
                        dayOfWeek === 6 && 'text-blue-400',
                      )}
                    >
                      ({DAY_LABELS[dayOfWeek]})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ------ Body Rows ------ */}
          {processedTasks.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              조회된 업무가 없습니다
            </div>
          ) : (
            processedTasks.map(({ task, assignees }, taskIdx) => {
              const isExpanded = !collapsedTasks.has(task.id);
              const assigneeNames = assignees.map((a) => a.name).join(', ');
              const prevTaskType =
                taskIdx > 0
                  ? processedTasks[taskIdx - 1]?.task.taskType?.id
                  : null;
              const isFirstInGroup = task.taskType?.id !== prevTaskType;
              const nextTaskType =
                taskIdx < processedTasks.length - 1
                  ? processedTasks[taskIdx + 1]?.task.taskType?.id
                  : null;
              const isLastInGroup = task.taskType?.id !== nextTaskType;
              const roleColors =
                assignees.length > 0
                  ? [...new Set(assignees.map((a) => a.color))]
                  : getTaskRoleColors(task);
              const barStyle =
                task.startDate && task.endDate
                  ? getBarStyle(task.startDate, task.endDate)
                  : null;

              return (
                <div key={task.id}>
                  {/* Task Row */}
                  <div
                    className={cn(
                      'flex cursor-pointer hover:bg-blue-50/50 transition-colors',
                      taskIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                      isFirstInGroup &&
                        taskIdx > 0 &&
                        'border-t border-slate-300',
                    )}
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => toggleTask(task.id)}
                  >
                    {/* Left Panel */}
                    <div
                      className={cn(
                        'flex-shrink-0 sticky left-0 z-10 border-r border-slate-200',
                        taskIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                      )}
                      style={{ width: LEFT_PANEL_WIDTH }}
                    >
                      <div className="flex h-full items-center">
                        {/* Task Type */}
                        <div
                          className={cn(
                            'flex items-center justify-center h-full px-1',
                            !isFirstInGroup && 'border-t-0',
                          )}
                          style={{ width: TASK_TYPE_COL_WIDTH }}
                        >
                          {isFirstInGroup ? (
                            task.taskType ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 max-w-[70px] truncate"
                              >
                                {task.taskType.name}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-slate-300">
                                -
                              </span>
                            )
                          ) : null}
                        </div>

                        {/* Task Name + Expand Icon + Assignees */}
                        <div className="flex-1 flex items-center gap-1.5 px-2 min-w-0">
                          {assignees.length > 0 ? (
                            isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                            )
                          ) : (
                            <div className="w-3.5 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-slate-800 truncate leading-tight">
                              {task.taskName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Gantt Bar */}
                    <div
                      className="relative flex-1"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {/* Weekend backgrounds */}
                      {dateColumns.map((date, idx) => {
                        const dayOfWeek = getDay(date);
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) return null;
                        return (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 bg-slate-100/30"
                            style={{
                              left: idx * DAY_COLUMN_WIDTH,
                              width: DAY_COLUMN_WIDTH,
                            }}
                          />
                        );
                      })}

                      {/* Today line */}
                      {todayIndex >= 0 && (
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-400 z-[5]"
                          style={{
                            left:
                              todayIndex * DAY_COLUMN_WIDTH +
                              DAY_COLUMN_WIDTH / 2,
                          }}
                        />
                      )}

                      {/* Task bar */}
                      {barStyle && (
                        <div
                          className="absolute rounded-sm shadow-sm"
                          style={{
                            left: barStyle.left,
                            width: barStyle.width,
                            top: (ROW_HEIGHT - TASK_BAR_HEIGHT) / 2,
                            height: TASK_BAR_HEIGHT,
                            backgroundColor: '#4E79A7',
                          }}
                        >
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-[9px] text-white font-medium truncate px-1">
                              {task.taskName}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Open date indicator (vertical bold line) */}
                      {task.openDate &&
                        (() => {
                          const openDate = parseISO(task.openDate);
                          const openDayIdx = differenceInCalendarDays(
                            openDate,
                            appliedFilters.startDate,
                          );
                          if (
                            openDayIdx < 0 ||
                            openDayIdx >= dateColumns.length
                          )
                            return null;
                          return (
                            <div
                              className="absolute top-1 bottom-1 w-[3px] bg-slate-700 rounded-full z-[6]"
                              style={{
                                left:
                                  openDayIdx * DAY_COLUMN_WIDTH +
                                  DAY_COLUMN_WIDTH / 2 -
                                  1,
                              }}
                              title={`완료 예정: ${format(openDate, 'yyyy-MM-dd')}`}
                            />
                          );
                        })()}
                    </div>
                  </div>

                  {/* Expanded Assignee Sub-rows */}
                  {isExpanded &&
                    assignees.map((assignee, aIdx) => {
                      const assigneeBarStyle =
                        assignee.startDate && assignee.endDate
                          ? getBarStyle(assignee.startDate, assignee.endDate)
                          : barStyle;

                      return (
                        <div
                          key={`${task.id}-${assignee.role}-${assignee.memberId}`}
                          className="flex bg-slate-100/80"
                          style={{ height: ASSIGNEE_ROW_HEIGHT }}
                        >
                          {/* Left Panel - Assignee info */}
                          <div
                            className="flex-shrink-0 sticky left-0 z-10 bg-slate-100/80 border-r border-slate-200"
                            style={{ width: LEFT_PANEL_WIDTH }}
                          >
                            <div className="flex h-full items-center">
                              <div
                                className="border-r border-slate-100 h-full"
                                style={{ width: TASK_TYPE_COL_WIDTH }}
                              />
                              <div className="flex-1 flex items-center gap-2 px-2 pl-8">
                                <div
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: assignee.color }}
                                />
                                <span className="text-[10px] text-slate-500 flex-shrink-0">
                                  {assignee.roleLabel}
                                </span>
                                <span className="text-[11px] text-slate-700 truncate">
                                  {assignee.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Panel - Assignee bar */}
                          <div
                            className="relative flex-1"
                            style={{ height: ASSIGNEE_ROW_HEIGHT }}
                          >
                            {/* Weekend backgrounds */}
                            {dateColumns.map((date, idx) => {
                              const dayOfWeek = getDay(date);
                              if (dayOfWeek !== 0 && dayOfWeek !== 6)
                                return null;
                              return (
                                <div
                                  key={idx}
                                  className="absolute top-0 bottom-0 bg-slate-100/30"
                                  style={{
                                    left: idx * DAY_COLUMN_WIDTH,
                                    width: DAY_COLUMN_WIDTH,
                                  }}
                                />
                              );
                            })}

                            {/* Today line */}
                            {todayIndex >= 0 && (
                              <div
                                className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-400 z-[5]"
                                style={{
                                  left:
                                    todayIndex * DAY_COLUMN_WIDTH +
                                    DAY_COLUMN_WIDTH / 2,
                                }}
                              />
                            )}

                            {/* Assignee bar */}
                            {assigneeBarStyle && (
                              <div
                                className="absolute rounded-sm"
                                style={{
                                  left: assigneeBarStyle.left,
                                  width: assigneeBarStyle.width,
                                  top:
                                    (ASSIGNEE_ROW_HEIGHT -
                                      ASSIGNEE_BAR_HEIGHT) /
                                    2,
                                  height: ASSIGNEE_BAR_HEIGHT,
                                  backgroundColor: assignee.color,
                                  opacity: 0.7,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* Legend */}
      {/* ================================================================ */}
      <div className="border-t border-slate-200 px-4 py-3 bg-slate-50/30">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {Object.entries(ROLE_LEGEND_LABELS)
            .filter(([key]) => activeRoles.has(key))
            .map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ROLE_COLORS[key] }}
                />
                <span className="text-[11px] text-slate-600">{label}</span>
              </div>
            ))}
          <div className="flex items-center gap-1.5">
            <div className="w-[3px] h-3 bg-slate-700 rounded-full" />
            <span className="text-[11px] text-slate-600">
              오픈일 (상용배포일)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-dashed border-red-400" />
            <span className="text-[11px] text-slate-600">오늘</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
