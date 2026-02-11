'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search, Check } from 'lucide-react';
import {
  STATUS_LABELS,
  STATUS_DOT_COLORS,
  type TaskStatus,
  type TaskDifficulty,
} from '@/types/task';
import { DifficultyIndicator } from '@/components/ui/difficulty-indicator';
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
  statusCounts?: Partial<Record<TaskStatus, number>>;
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
            className="pl-9 w-full sm:w-[280px]"
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[60%]">
          <div className="text-sm font-medium mb-2">상태</div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const isSelected = statusFilter.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-all cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20 font-semibold text-slate-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600',
                  )}
                  onClick={() => onStatusToggle(status)}
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

        <div>
          <div className="text-sm font-medium mb-2">난이도</div>
          <div className="flex flex-wrap gap-2">
            {(['HIGH', 'MEDIUM', 'LOW'] as TaskDifficulty[]).map(
              (difficulty) => {
                const isSelected = difficultyFilter.includes(difficulty);
                return (
                  <button
                    key={difficulty}
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50',
                    )}
                    onClick={() => onDifficultyToggle(difficulty)}
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
    </div>
  );
}
