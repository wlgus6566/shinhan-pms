'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search, Check } from 'lucide-react';
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

interface TaskFiltersProps {
  searchInput: string;
  setSearchInput: (query: string) => void;
  handleSearch: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  statusFilter: string[];
  onStatusToggle: (status: TaskStatus) => void;
  difficultyFilter: string[];
  onDifficultyToggle: (difficulty: TaskDifficulty) => void;
  projectMembers: ProjectMember[];
  resetFilters: () => void;
  statusCounts?: Record<TaskStatus, number>;
}

export function TaskFilters({
  searchInput,
  setSearchInput,
  handleSearch,
  handleKeyDown,
  statusFilter,
  onStatusToggle,
  difficultyFilter,
  onDifficultyToggle,
  resetFilters,
  statusCounts,
}: TaskFiltersProps) {
  const hasActiveFilters =
    searchInput || statusFilter.length > 0 || difficultyFilter.length > 0;

  return (
    <div className="space-y-4">
      {/* Search input + Search button */}
      <div className="flex gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="업무명 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 w-[280px]"
          />
        </div>
        <Button
          variant="default"
          size="default"
          onClick={handleSearch}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          검색
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <X className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="w-[50%]">
          <div className="text-sm font-medium mb-2">상태</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const count = statusCounts?.[status] ?? 0;
              return (
                <Badge
                  key={status}
                  className={cn(
                    STATUS_COLORS[status],
                    'cursor-pointer transition-all border-2 flex items-center gap-1.5',
                    statusFilter.includes(status)
                      ? 'opacity-100 font-semibold'
                      : '',
                  )}
                  onClick={() => onStatusToggle(status)}
                >
                  {statusFilter.includes(status) && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {STATUS_LABELS[status]} ({count})
                </Badge>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">난이도</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map(
              (difficulty) => (
                <Badge
                  key={difficulty}
                  className={cn(
                    DIFFICULTY_COLORS[difficulty],
                    'cursor-pointer transition-opacity',
                    difficultyFilter.includes(difficulty)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : '',
                  )}
                  onClick={() => onDifficultyToggle(difficulty)}
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
