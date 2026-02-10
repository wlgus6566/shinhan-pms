'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { KanbanColumn } from './KanbanColumn';
import { updateTask } from '@/lib/api/tasks';
import type { Task, TaskStatus } from '@/types/task';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isValidating?: boolean;
  onRefresh: () => void;
  statusFilter?: string[];
  isPM: boolean;
}

const ALL_STATUSES: TaskStatus[] = [
  'WAITING',
  'IN_PROGRESS',
  'WORK_COMPLETED',
  'TESTING',
  'OPEN_WAITING',
  'OPEN_RESPONDING',
  'COMPLETED',
  'SUSPENDED',
];

export function KanbanBoard({
  tasks,
  onTaskClick,
  onRefresh,
  statusFilter,
  isPM,
}: KanbanBoardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      WAITING: [],
      IN_PROGRESS: [],
      WORK_COMPLETED: [],
      TESTING: [],
      OPEN_WAITING: [],
      OPEN_RESPONDING: [],
      COMPLETED: [],
      SUSPENDED: [],
    };

    tasks.forEach((task) => {
      if (task.status in grouped) {
        grouped[task.status as TaskStatus].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  // Apply status filter - hide cards in non-matching columns
  const filteredTasksByStatus = useMemo(() => {
    const filtered: Record<TaskStatus, Task[]> = { ...tasksByStatus };

    // If status filter is active, only show cards in matching columns
    if (statusFilter && statusFilter.length > 0) {
      Object.keys(filtered).forEach((status) => {
        if (!statusFilter.includes(status as TaskStatus)) {
          filtered[status as TaskStatus] = [];
        }
      });
    }

    return filtered;
  }, [tasksByStatus, statusFilter]);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // PM이 아니면 상태 변경 불가
    if (!isPM) {
      toast.error('프로젝트 PM만 업무 상태를 변경할 수 있습니다');
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    try {
      setIsUpdating(true);
      await updateTask(taskId, { status: newStatus });
      onRefresh(); // SWR mutate
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
        {ALL_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={filteredTasksByStatus[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      {isUpdating && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl shadow-slate-900/10 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm font-medium text-slate-600">상태 변경 중...</span>
          </div>
        </div>
      )}
    </DndContext>
  );
}
