'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types/task';
import { Calendar, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const difficultyLabels: Record<string, string> = {
  HIGH: '상',
  MEDIUM: '중',
  LOW: '하',
};

const difficultyColors: Record<string, string> = {
  HIGH: 'bg-red-500/10 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-500/10 text-green-700 border-green-200',
};

const statusLabels: Record<string, string> = {
  TODO: '할 일',
  IN_PROGRESS: '진행 중',
  DONE: '완료',
  HOLD: '보류',
};

const statusColors: Record<string, string> = {
  TODO: 'bg-gray-500/10 text-gray-700 border-gray-200',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 border-blue-200',
  DONE: 'bg-green-500/10 text-green-700 border-green-200',
  HOLD: 'bg-orange-500/10 text-orange-700 border-orange-200',
};

export function TaskCard({ task }: TaskCardProps) {
  const assignees = [
    { label: '기획', assignee: task.planningAssignee },
    { label: '디자인', assignee: task.designAssignee },
    { label: '프론트', assignee: task.frontendAssignee },
    { label: '백엔드', assignee: task.backendAssignee },
  ].filter(a => a.assignee);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base line-clamp-2">{task.taskName}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <Badge variant="outline" className={difficultyColors[task.difficulty]}>
              {difficultyLabels[task.difficulty]}
            </Badge>
            <Badge variant="outline" className={statusColors[task.status]}>
              {statusLabels[task.status]}
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
