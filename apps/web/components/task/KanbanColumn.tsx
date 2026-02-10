'use client';

import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { DraggableTaskCard } from './DraggableTaskCard';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, type Task, type TaskStatus } from '@/types/task';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px] lg:min-w-[320px] lg:max-w-[320px] snap-start">
      {/* Header: 상태명 + 개수 */}
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-t-lg border-b-2',
          STATUS_COLORS[status],
        )}
      >
        <h3 className="font-semibold">{STATUS_LABELS[status]}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 space-y-3 min-h-[200px] bg-gray-50 rounded-b-lg',
          isOver && 'bg-blue-50 ring-2 ring-blue-300',
        )}
      >
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            업무 없음
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}
