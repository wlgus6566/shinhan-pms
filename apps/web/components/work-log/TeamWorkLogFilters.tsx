'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, RefreshCcw } from 'lucide-react';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type TaskStatus,
  type TaskDifficulty,
} from '@/types/task';
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
              {filteredAssignees.map((member) => (
                <SelectItem
                  key={member.memberId}
                  value={member.memberId.toString()}
                >
                  {member.member?.name || '알 수 없음'}
                </SelectItem>
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
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const isSelected = statusFilter.includes(status);
              return (
                <Badge
                  key={status}
                  className={cn(
                    'cursor-pointer transition-all border-2 flex items-center gap-1 text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1',
                    STATUS_COLORS[status],
                    isSelected && 'opacity-100 font-semibold',
                  )}
                  onClick={() => toggleStatus(status)}
                >
                  {isSelected && (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {STATUS_LABELS[status]}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 난이도 필터 */}
        <div className="w-full sm:w-[30%]">
          <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">난이도</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map(
              (difficulty) => {
                const isSelected = difficultyFilter.includes(difficulty);
                return (
                  <Badge
                    key={difficulty}
                    className={cn(
                      'cursor-pointer transition-all border-2 flex items-center gap-1 text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1',
                      DIFFICULTY_COLORS[difficulty],
                      isSelected &&
                        'bg-primary border-primary text-primary-foreground',
                    )}
                    onClick={() => toggleDifficulty(difficulty)}
                  >
                    {DIFFICULTY_LABELS[difficulty]}
                  </Badge>
                );
              },
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
