'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { useTasks, deleteTask } from '@/lib/api/tasks';
import { useUrlQueryParams } from '@/hooks/useUrlQueryParams';
import { useSearchButton } from '@/hooks/useSearchButton';
import { TaskTable } from './TaskTable';
import { TaskFilters } from './TaskFilters';
import { TaskDetailSheet } from './TaskDetailSheet';
import { AddTaskDialog } from './AddTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { TablePagination } from '@/components/common/table/TablePagination';
import { KanbanBoard } from './KanbanBoard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { Task, TaskStatus, TaskDifficulty } from '@/types/task';
import type { ProjectMember } from '@/types/project';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table2, LayoutGrid } from 'lucide-react';
interface TaskListProps {
  error: Error | null;
  isLoading: boolean;
  projectId: string;
  isPM: boolean;
  projectMembers: ProjectMember[];
}

// Helper function to parse array params from URL
function parseArrayParam(param: any): string[] {
  if (!param) return [];
  if (Array.isArray(param)) return param;
  return [param];
}

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

export function TaskList({
  error: projectError,
  isLoading,
  projectId,
  isPM,
  projectMembers,
}: TaskListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // URL query params
  const { params, setParam, setParams } = useUrlQueryParams({
    defaults: {
      pageNum: 1,
      view: 'kanban',
    },
  });

  const search = (params.search as string) || '';
  const statusFilter = parseArrayParam(params.status);
  const difficultyFilter = parseArrayParam(params.difficulty);
  const currentPage = (params.pageNum as number) || 1;
  const view = (params.view as 'table' | 'kanban') || 'kanban';

  // Search button hook
  const { searchInput, setSearchInput, handleSearch, handleKeyDown } =
    useSearchButton(params, setParams);

  // API params for server-side filtering
  const apiParams = useMemo(
    () => ({
      pageNum: view === 'kanban' ? 1 : currentPage,
      pageSize: view === 'kanban' ? 0 : undefined, // 0 = fetch all tasks for kanban
      search: search || undefined,
      status: statusFilter.length > 0 ? statusFilter : undefined,
      difficulty: difficultyFilter.length > 0 ? difficultyFilter : undefined,
    }),
    [view, currentPage, search, statusFilter, difficultyFilter],
  );

  const {
    tasks,
    pagination,
    error: tasksError,
    isLoading: tasksLoading,
    isValidating,
    mutate: mutateTasks,
  } = useTasks(projectId, apiParams);

  // Fetch all tasks (unfiltered) for status counts
  const { tasks: allTasks } = useTasks(projectId, { pageSize: 0 });

  const statusCounts = useMemo(() => {
    if (!allTasks) return undefined;
    const counts: Partial<Record<TaskStatus, number>> = {};
    allTasks.forEach((task) => {
      const status = task.status as TaskStatus;
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [allTasks]);

  // Filter handlers
  const handleStatusToggle = useCallback(
    (status: TaskStatus) => {
      const newStatuses = statusFilter.includes(status)
        ? statusFilter.filter((s) => s !== status)
        : [...statusFilter, status];
      setParams({ status: newStatuses, pageNum: 1 });
    },
    [statusFilter, setParams],
  );

  const handleDifficultyToggle = useCallback(
    (difficulty: TaskDifficulty) => {
      const newDifficulties = difficultyFilter.includes(difficulty)
        ? difficultyFilter.filter((d) => d !== difficulty)
        : [...difficultyFilter, difficulty];
      setParams({ difficulty: newDifficulties, pageNum: 1 });
    },
    [difficultyFilter, setParams],
  );

  const resetFilters = useCallback(() => {
    setParams({ search: '', status: [], difficulty: [], pageNum: 1 });
  }, [setParams]);

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

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask(taskId);
        mutateTasks(); // Refresh task list
        setSheetOpen(false);
      } catch (err: any) {
        console.error('Error deleting task:', err);
      }
    },
    [mutateTasks],
  );

  return (
    <div className="space-y-4">
      {/* Filters */}

      <div className="flex justify-between items-center">
        <Tabs
          value={view}
          onValueChange={(newView) => setParam('view', newView)}
        >
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>칸반 보드</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              <span>테이블</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isPM && (
          <Button onClick={() => setDialogOpen(true)} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4 mr-2" />
            업무 추가
          </Button>
        )}
      </div>

      {projectError && <ErrorState />}

      {!isLoading && tasks && tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">업무가 없습니다</p>
        </div>
      )}

      {!isLoading && tasks && tasks.length > 0 && (
        <>
          {view === 'table' ? (
            <>
              <TaskFilters
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearch={handleSearch}
                handleKeyDown={handleKeyDown}
                statusFilter={statusFilter}
                onStatusToggle={handleStatusToggle}
                difficultyFilter={difficultyFilter}
                onDifficultyToggle={handleDifficultyToggle}
                projectMembers={projectMembers || []}
                resetFilters={resetFilters}
                statusCounts={statusCounts}
              />
              <TaskTable
                tasks={tasks || []}
                onTaskClick={handleTaskClick}
                isValidating={isValidating}
              />
            </>
          ) : (
            <KanbanBoard
              tasks={tasks || []}
              onTaskClick={handleTaskClick}
              isValidating={isValidating}
              onRefresh={handleSuccess}
              statusFilter={statusFilter}
              isPM={isPM}
            />
          )}
        </>
      )}

      {/* Pagination - only show in table view */}
      {view === 'table' &&
        !tasksLoading &&
        pagination &&
        pagination.pages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={(page) => setParam('pageNum', page)}
          />
        )}

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

      {/* Mobile FAB */}
      {isPM &&
        createPortal(
          <Button
            onClick={() => setDialogOpen(true)}
            className="gradient-primary border-none fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 sm:hidden"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>,
          document.body,
        )}
    </div>
  );
}
