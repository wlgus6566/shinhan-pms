'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { getTasks } from '@/lib/api/tasks';
import { getProjectMembers } from '@/lib/api/projectMembers';
import { TaskTable } from './TaskTable';
import { TaskFilters, type SortBy, type SortOrder } from './TaskFilters';
import { TaskDetailSheet } from './TaskDetailSheet';
import { AddTaskDialog } from './AddTaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { Task, TaskStatus, TaskDifficulty } from '@/types/task';
import type { ProjectMember } from '@/types/project';

interface TaskListProps {
  projectId: string;
  isPM: boolean;
}

export function TaskList({ projectId, isPM }: TaskListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  // Filtering logic
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      // Search query filter
      if (searchQuery && !task.taskName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'all') {
        const filterIdNum = parseInt(assigneeFilter);
        const isAssignee =
          task.planningAssignee?.id === assigneeFilter ||
          task.designAssignee?.id === assigneeFilter ||
          task.frontendAssignee?.id === assigneeFilter ||
          task.backendAssignee?.id === assigneeFilter;
        if (!isAssignee) return false;
      }

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
        return false;
      }

      // Difficulty filter
      if (difficultyFilter.length > 0 && !difficultyFilter.includes(task.difficulty)) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, assigneeFilter, statusFilter, difficultyFilter]);

  // Sorting logic
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'difficulty':
          const difficultyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
          break;
        case 'endDate':
          const aDate = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const bDate = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'status':
          const statusOrder = {
            WAITING: 1,
            IN_PROGRESS: 2,
            WORK_COMPLETED: 3,
            OPEN_WAITING: 4,
            OPEN_RESPONDING: 5,
            COMPLETED: 6,
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTasks, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearchQuery('');
    setAssigneeFilter('all');
    setStatusFilter([]);
    setDifficultyFilter([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">업무 목록을 불러오는데 실패했습니다</p>
      </div>
    );
  }

  const handleSuccess = () => {
    mutateTasks();
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

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
      />
    </div>
  );
}
