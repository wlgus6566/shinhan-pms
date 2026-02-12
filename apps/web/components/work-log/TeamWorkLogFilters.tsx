'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, RefreshCcw } from 'lucide-react';
import {
  STATUS_LABELS,
  STATUS_DOT_COLORS,
  type TaskStatus,
  type TaskDifficulty,
} from '@/types/task';
import { DifficultyIndicator } from '@/components/ui/difficulty-indicator';
import type { ProjectMember } from '@/types/project';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { WORK_AREA_LABELS } from '@/lib/constants/project';

interface TeamWorkLogFiltersProps {
  selectedWorkArea: string;
  setSelectedWorkArea: (area: string) => void;
  availableWorkAreas: string[];
  assigneeFilter: string;
  setAssigneeFilter: (assigneeId: string) => void;
  filteredAssignees: ProjectMember[];
  statusFilter: TaskStatus[];
  setStatusFilter: (statuses: TaskStatus[]) => void;
  difficultyFilter: TaskDifficulty[];
  setDifficultyFilter: (difficulties: TaskDifficulty[]) => void;
  resetFilters: () => void;
  statusCounts?: Partial<Record<TaskStatus, number>>;
}

export function TeamWorkLogFilters({
  selectedWorkArea,
  setSelectedWorkArea,
  availableWorkAreas,
  assigneeFilter,
  setAssigneeFilter,
  filteredAssignees,
  statusFilter,
  setStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  resetFilters,
  statusCounts,
}: TeamWorkLogFiltersProps) {
  const toggleStatus = (status: TaskStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const toggleDifficulty = (difficulty: TaskDifficulty) => {
    if (difficultyFilter.includes(difficulty)) {
      setDifficultyFilter(difficultyFilter.filter((d) => d !== difficulty));
    } else {
      setDifficultyFilter([...difficultyFilter, difficulty]);
    }
  };

  const handleWorkAreaChange = (area: string) => {
    setSelectedWorkArea(area);
    // Reset assignee filter when work area changes
    setAssigneeFilter('all');
  };

  // Get label for assignee dropdown based on selected work area
  const assigneeDropdownLabel = useMemo(() => {
    if (selectedWorkArea !== 'all') {
      return `담당자 (${WORK_AREA_LABELS[selectedWorkArea]})`;
    }
    return '담당자 전체';
  }, [selectedWorkArea]);

  // Group assignees by work area
  const groupedAssignees = useMemo(() => {
    const groups = new Map<string, ProjectMember[]>();
    for (const member of filteredAssignees) {
      const area = member.workArea || 'UNKNOWN';
      if (!groups.has(area)) {
        groups.set(area, []);
      }
      groups.get(area)!.push(member);
    }
    return groups;
  }, [filteredAssignees]);

  return (
    <Card className="p-3 sm:p-4 shadow-none flex flex-col gap-3 sm:gap-4 hover:shadow-none">
      {/* 첫 번째 줄: 담당 분야, 담당자, 초기화 */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
          {/* 담당 분야 필터 */}
          <Select value={selectedWorkArea} onValueChange={handleWorkAreaChange}>
            <SelectTrigger className="w-full sm:w-48 h-9 text-xs sm:text-sm">
              <SelectValue placeholder="담당 분야 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">담당 분야 전체</SelectItem>
              {availableWorkAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {WORK_AREA_LABELS[area] || area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 담당자 필터 (cascading) */}
          <Select
            value={assigneeFilter}
            onValueChange={setAssigneeFilter}
            disabled={filteredAssignees.length === 0}
          >
            <SelectTrigger className="w-full sm:w-48 h-9 text-xs sm:text-sm">
              <SelectValue placeholder={assigneeDropdownLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{assigneeDropdownLabel}</SelectItem>
              {Array.from(groupedAssignees.entries()).map(([area, areaMembers]) => (
                <SelectGroup key={area}>
                  <SelectLabel className="text-[11px] text-slate-400 font-medium px-3 pt-2 pb-1">
                    {WORK_AREA_LABELS[area] || area}
                  </SelectLabel>
                  {areaMembers.map((member) => (
                    <SelectItem
                      key={member.memberId}
                      value={member.memberId.toString()}
                    >
                      {member.member?.name || '알 수 없음'}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 초기화 버튼 */}
        <Button variant="outline" onClick={resetFilters} size="sm" className="gap-1.5 h-9 text-xs sm:text-sm">
          <RefreshCcw className="h-3.5 w-3.5" />
          초기화
        </Button>
      </div>

      {/* 두 번째 줄: 상태 및 난이도 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* 상태 필터 */}
        <div className="w-full sm:w-[60%]">
          <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">상태</div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const isSelected = statusFilter.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-xs transition-all cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20 font-semibold text-slate-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600',
                  )}
                  onClick={() => toggleStatus(status)}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_DOT_COLORS[status] }}
                  />
                  {STATUS_LABELS[status]}
                  {statusCounts && (
                    <span className="text-slate-400 font-normal">
                      {statusCounts[status] ?? 0}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="h-3 w-3 text-primary ml-0.5" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 난이도 필터 */}
        <div className="w-full sm:w-[30%]">
          <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">난이도</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(['HIGH', 'MEDIUM', 'LOW'] as TaskDifficulty[]).map(
              (difficulty) => {
                const isSelected = difficultyFilter.includes(difficulty);
                return (
                  <button
                    key={difficulty}
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50',
                    )}
                    onClick={() => toggleDifficulty(difficulty)}
                  >
                    <DifficultyIndicator
                      difficulty={difficulty}
                      showLabel={true}
                      size="sm"
                    />
                    {isSelected && (
                      <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
