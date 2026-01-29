'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type Task,
  type TaskDifficulty,
  type TaskStatus,
} from '@/types/task';
import { Calendar, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  variant?: 'default' | 'kanban';
}

export function TaskCard({
  task,
  onClick,
  variant = 'default',
}: TaskCardProps) {
  const assignees = [
    { label: '기획', assignee: task.planningAssignees?.[0] },
    { label: '디자인', assignee: task.designAssignees?.[0] },
    { label: '프론트', assignee: task.frontendAssignees?.[0] },
    { label: '백엔드', assignee: task.backendAssignees?.[0] },
  ].filter((a) => a.assignee);

  return (
    <Card
      className="hover:shadow-md hover:bg-muted/50 transition cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base line-clamp-2">
            {task.taskName}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            <Badge
              className={DIFFICULTY_COLORS[task.difficulty as TaskDifficulty]}
            >
              {DIFFICULTY_LABELS[task.difficulty as TaskDifficulty]}
            </Badge>
            {variant !== 'kanban' && (
              <Badge className={STATUS_COLORS[task.status as TaskStatus]}>
                {STATUS_LABELS[task.status as TaskStatus]}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {assignees.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assignees.map(({ label, assignee }) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}: {assignee?.name}
              </Badge>
            ))}
          </div>
        )}

        {(task.startDate || task.endDate) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {task.startDate && <span>{task.startDate}</span>}
            {task.startDate && task.endDate && <span>~</span>}
            {task.endDate && <span>{task.endDate}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
