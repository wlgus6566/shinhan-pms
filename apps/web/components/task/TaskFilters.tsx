'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, X, Search } from 'lucide-react';
import { STATUS_LABELS, DIFFICULTY_LABELS, type TaskStatus, type TaskDifficulty } from '@/types/task';
import type { ProjectMember } from '@/types/project';

export type SortBy = 'difficulty' | 'endDate' | 'status' | 'createdAt';
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
}

export function TaskFilters({
  searchQuery,
  setSearchQuery,
  assigneeFilter,
  setAssigneeFilter,
  statusFilter,
  setStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  projectMembers,
  resetFilters,
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

  const hasActiveFilters = searchQuery || assigneeFilter !== 'all' || statusFilter.length > 0 || difficultyFilter.length > 0;

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

        {/* 담당자 필터 */}
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="담당자 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">담당자 전체</SelectItem>
            {projectMembers.map((member) => (
              <SelectItem key={member.id} value={member.id.toString()}>
                {member.member?.name || 'Unknown'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 정렬 */}
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="difficulty">우선순위순</SelectItem>
              <SelectItem value="endDate">마감일순</SelectItem>
              <SelectItem value="status">상태순</SelectItem>
              <SelectItem value="createdAt">생성일순</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* 초기화 버튼 */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <X className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      {/* 두 번째 줄: 상태 및 중요도 필터 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 상태 필터 */}
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">상태</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
              <Button
                key={status}
                variant={statusFilter.includes(status) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleStatus(status)}
                className="text-xs"
              >
                {STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </div>

        {/* 중요도 필터 */}
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">중요도</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((difficulty) => (
              <Button
                key={difficulty}
                variant={difficultyFilter.includes(difficulty) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleDifficulty(difficulty)}
                className="text-xs"
              >
                {DIFFICULTY_LABELS[difficulty]}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
