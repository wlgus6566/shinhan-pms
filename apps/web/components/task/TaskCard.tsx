'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, STATUS_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type Task } from '@/types/task';
import { Calendar, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const assignees = [
    { label: '기획', assignee: task.planningAssignee },
    { label: '디자인', assignee: task.designAssignee },
    { label: '프론트', assignee: task.frontendAssignee },
    { label: '백엔드', assignee: task.backendAssignee },
  ].filter(a => a.assignee);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base line-clamp-2">{task.taskName}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <Badge variant="outline" className={DIFFICULTY_COLORS[task.difficulty]}>
              {DIFFICULTY_LABELS[task.difficulty]}
            </Badge>
            <Badge variant="outline" className={STATUS_COLORS[task.status]}>
              {STATUS_LABELS[task.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {task.clientName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">RM:</span>
            <span className="font-medium">{task.clientName}</span>
          </div>
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
