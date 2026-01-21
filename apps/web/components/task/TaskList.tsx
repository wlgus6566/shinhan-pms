'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import useSWR from 'swr';
import { getTasks, deleteTask } from '@/lib/api/tasks';
import { getProjectMembers } from '@/lib/api/projectMembers';
import { TaskTable } from './TaskTable';
import { TaskFilters, type SortBy, type SortOrder } from './TaskFilters';
import { TaskDetailSheet } from './TaskDetailSheet';
import { AddTaskDialog } from './AddTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { Task, TaskStatus, TaskDifficulty } from '@/types/task';
import type { ProjectMember } from '@/types/project';

interface TaskListProps {
  projectId: string;
  isPM: boolean;
}

// Hoist static objects outside component to prevent recreating on every render
const DIFFICULTY_ORDER = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
const STATUS_ORDER = {
  WAITING: 1,
  IN_PROGRESS: 2,
  WORK_COMPLETED: 3,
  OPEN_WAITING: 4,
  OPEN_RESPONDING: 5,
  OPEN_COMPLETED: 6,
} as const;

// Extract loading state as separate component to avoid re-renders
const LoadingState = memo(() => (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
));
LoadingState.displayName = 'LoadingState';

// Extract error state as separate component
const ErrorState = memo(() => (
  <div className="text-center py-12">
    <p className="text-destructive">업무 목록을 불러오는데 실패했습니다</p>
  </div>
));
ErrorState.displayName = 'ErrorState';

export function TaskList({ projectId, isPM }: TaskListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<TaskDifficulty[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data: tasks, error: tasksError, isLoading: tasksLoading, mutate: mutateTasks } = useSWR<Task[]>(
    `/api/projects/${projectId}/tasks`,
    () => getTasks(projectId),
  );

  const { data: projectMembers, error: membersError, isLoading: membersLoading } = useSWR<ProjectMember[]>(
    `/api/projects/${projectId}/members`,
    () => getProjectMembers(projectId),
  );

  const loading = tasksLoading || membersLoading;
  const error = tasksError || membersError;

  // Calculate status counts based on all tasks
  const statusCounts = useMemo(() => {
    if (!tasks) return {} as Record<TaskStatus, number>;

    const counts = {
      WAITING: 0,
      IN_PROGRESS: 0,
      WORK_COMPLETED: 0,
      OPEN_WAITING: 0,
      OPEN_RESPONDING: 0,
      OPEN_COMPLETED: 0,
    } as Record<TaskStatus, number>;

    tasks.forEach((task) => {
      counts[task.status]++;
    });

    return counts;
  }, [tasks]);

  // Convert arrays to Sets for O(1) lookups (js-set-map-lookups)
  const statusFilterSet = useMemo(() => new Set(statusFilter), [statusFilter]);
  const difficultyFilterSet = useMemo(() => new Set(difficultyFilter), [difficultyFilter]);

  // Filtering logic
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    // Cache lowercase search query to avoid recalculating in loop
    const lowerSearchQuery = searchQuery ? searchQuery.toLowerCase() : '';

    return tasks.filter((task) => {
      // Search query filter - early exit for better performance
      if (lowerSearchQuery && !task.taskName.toLowerCase().includes(lowerSearchQuery)) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'all') {
        const isAssignee =
          task.planningAssignee?.id === assigneeFilter ||
          task.designAssignee?.id === assigneeFilter ||
          task.frontendAssignee?.id === assigneeFilter ||
          task.backendAssignee?.id === assigneeFilter;
        if (!isAssignee) return false;
      }

      // Status filter - use Set for O(1) lookup
      if (statusFilterSet.size > 0 && !statusFilterSet.has(task.status)) {
        return false;
      }

      // Difficulty filter - use Set for O(1) lookup
      if (difficultyFilterSet.size > 0 && !difficultyFilterSet.has(task.difficulty)) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, assigneeFilter, statusFilterSet, difficultyFilterSet]);

  // Sorting logic - use hoisted constants
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'difficulty':
          comparison = DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
          break;
        case 'endDate':
          const aDate = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const bDate = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'status':
          comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTasks, sortBy, sortOrder]);

  // Use useCallback for stable function references (rerender-functional-setstate)
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setAssigneeFilter('all');
    setStatusFilter([]);
    setDifficultyFilter([]);
  }, []);

  const handleSuccess = useCallback(() => {
    mutateTasks();
  }, [mutateTasks]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
    setSheetOpen(false); // Close detail sheet
  }, []);

  const handleDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      mutateTasks(); // Refresh task list
      setSheetOpen(false);
    } catch (err: any) {
      console.error('Error deleting task:', err);
    }
  }, [mutateTasks]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-4">
      {isPM && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            업무 추가
          </Button>
        </div>
      )}

      {/* Filters and Sorting */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        projectMembers={projectMembers || []}
        resetFilters={resetFilters}
        statusCounts={statusCounts}
      />

      {/* Table */}
      <TaskTable tasks={sortedTasks} onTaskClick={handleTaskClick} />

      {isPM && projectMembers && (
        <AddTaskDialog
          projectId={projectId}
          projectMembers={projectMembers}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isPM={isPM}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isPM && editingTask && projectMembers && (
        <EditTaskDialog
          task={editingTask}
          projectMembers={projectMembers}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
