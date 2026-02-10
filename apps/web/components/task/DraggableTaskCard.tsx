'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types/task';

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'box-shadow 200ms ease, transform 200ms ease',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl transition-[box-shadow,opacity] duration-200',
        isDragging
          ? 'opacity-90 shadow-xl shadow-blue-500/20 scale-[1.02] rotate-[1deg] z-50 ring-2 ring-blue-400/30'
          : 'opacity-100',
      )}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} onClick={onClick} variant="kanban" />
    </div>
  );
}
