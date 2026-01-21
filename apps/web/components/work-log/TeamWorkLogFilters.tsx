'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, RefreshCcw } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type TaskStatus, type TaskDifficulty } from '@/types/task';
import type { ProjectMember } from '@/types/project';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

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
  const workAreaLabels: Record<string, string> = {
    all: '전체',
    PLANNING: '기획',
    DESIGN: '디자인',
    FRONTEND: '프론트엔드',
    BACKEND: '백엔드',
    OPERATION: '운영',
    PROJECT_MANAGEMENT: 'PM',
  };

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

  const hasActiveFilters =
    selectedWorkArea !== 'all' ||
    assigneeFilter !== 'all' ||
    statusFilter.length > 0 ||
    difficultyFilter.length > 0;

  // Get label for assignee dropdown based on selected work area
  const assigneeDropdownLabel = useMemo(() => {
    if (selectedWorkArea !== 'all') {
      return `담당자 (${workAreaLabels[selectedWorkArea]})`;
    }
    return '담당자 전체';
  }, [selectedWorkArea]);

  return (
    <div className="space-y-4">
      {/* 첫 번째 줄: 담당 분야, 담당자, 초기화 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 담당 분야 필터 */}
        <Select value={selectedWorkArea} onValueChange={handleWorkAreaChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="담당 분야 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">담당 분야 전체</SelectItem>
            {availableWorkAreas.map((area) => (
              <SelectItem key={area} value={area}>
                {workAreaLabels[area] || area}
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
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={assigneeDropdownLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{assigneeDropdownLabel}</SelectItem>
            {filteredAssignees.map((member) => (
              <SelectItem key={member.memberId} value={member.memberId.toString()}>
                {member.member?.name || '알 수 없음'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 초기화 버튼 */}
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            초기화
          </Button>
      </div>

      {/* 두 번째 줄: 상태 및 중요도 필터 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 상태 필터 */}
        <div className="w-[60%]">
          <div className="text-sm font-medium mb-2">상태</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const isSelected = statusFilter.includes(status);
              return (
                <Badge
                  key={status}
                  className={cn(
                    'cursor-pointer transition-all border-2 flex items-center gap-1.5',
                    STATUS_COLORS[status],
                    isSelected && 'opacity-100 font-semibold',
                  )}
                  onClick={() => toggleStatus(status)}
                >
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {STATUS_LABELS[status]}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 중요도 필터 */}
        <div className="w-[30%]">
          <div className="text-sm font-medium mb-2">중요도</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((difficulty) => {
              const isSelected = difficultyFilter.includes(difficulty);
              return (
                <Badge
                  key={difficulty}
                  className={cn(
                    'cursor-pointer transition-all border-2 flex items-center gap-1.5',
                    DIFFICULTY_COLORS[difficulty],
                    isSelected && 'opacity-100 font-semibold',
                    )}
                  onClick={() => toggleDifficulty(difficulty)}
                >
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {DIFFICULTY_LABELS[difficulty]}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
