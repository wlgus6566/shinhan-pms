'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
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

export type SortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'startDate'
  | 'endDate'
  | 'difficulty'
  | 'status';
export type SortOrder = 'asc' | 'desc';

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assigneeId: string) => void;
  statusFilter: TaskStatus[];
  setStatusFilter: (statuses: TaskStatus[]) => void;
  difficultyFilter: TaskDifficulty[];
  setDifficultyFilter: (difficulties: TaskDifficulty[]) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
  projectMembers: ProjectMember[];
  resetFilters: () => void;
  statusCounts?: Record<TaskStatus, number>;
}

export function TaskFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  resetFilters,
  statusCounts,
}: TaskFiltersProps) {
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

  const hasActiveFilters =
    searchQuery || statusFilter.length > 0 || difficultyFilter.length > 0;

  return (
    <div className="space-y-4">
      {/* 첫 번째 줄: 검색, 담당자, 정렬, 초기화 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 검색 */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="업무명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 초기화 버튼 */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <X className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      {/* 두 번째 줄: 상태 및 난이도 필터 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 상태 필터 */}
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">상태</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const count = statusCounts?.[status] ?? 0;
              return (
                <Badge
                  key={status}
                  className={cn(
                    STATUS_COLORS[status],
                    'cursor-pointer',
                    statusFilter.includes(status)
                      ? 'bg-primary text-primary-foreground'
                      : '',
                  )}
                  onClick={() => toggleStatus(status)}
                >
                  {STATUS_LABELS[status]} ({count})
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 난이도 필터 */}
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">난이도</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map(
              (difficulty) => (
                <Badge
                  key={difficulty}
                  className={cn(
                    DIFFICULTY_COLORS[difficulty],
                    'cursor-pointer',
                    difficultyFilter.includes(difficulty)
                      ? 'bg-primary text-primary-foreground'
                      : '',
                  )}
                  onClick={() => toggleDifficulty(difficulty)}
                >
                  {DIFFICULTY_LABELS[difficulty]}
                </Badge>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
