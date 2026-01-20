'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getTasks } from '@/lib/api/tasks';
import { getProjectMembers } from '@/lib/api/projectMembers';
import { TaskCard } from './TaskCard';
import { AddTaskDialog } from './AddTaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { Task } from '@/types/task';
import type { ProjectMember } from '@/types/project';

interface TaskListProps {
  projectId: string;
  isPM: boolean;
}

export function TaskList({ projectId, isPM }: TaskListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

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

      {tasks && tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          등록된 업무가 없습니다
        </div>
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
    </div>
  );
}
