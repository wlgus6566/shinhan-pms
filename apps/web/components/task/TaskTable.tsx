'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, STATUS_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type Task } from '@/types/task';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskTableProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd', { locale: ko });
    } catch {
      return '-';
    }
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (start === '-' && end === '-') return '-';
    if (start === '-') return end;
    if (end === '-') return start;
    return `${start} ~ ${end}`;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">업무명</TableHead>
            <TableHead className="w-[100px]">중요도</TableHead>
            <TableHead className="w-[120px]">진행상태</TableHead>
            <TableHead className="min-w-[200px]">담당자</TableHead>
            <TableHead className="w-[200px]">기간</TableHead>
            <TableHead className="w-[120px] hidden md:table-cell">담당PM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                조건에 맞는 업무가 없습니다
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onTaskClick?.(task)}
              >
                <TableCell className="font-medium">{task.taskName}</TableCell>
                <TableCell>
                  <Badge className={DIFFICULTY_COLORS[task.difficulty]}>
                    {DIFFICULTY_LABELS[task.difficulty]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[task.status]}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {task.planningAssignee && (
                      <Badge variant="outline" className="text-xs">
                        기획: {task.planningAssignee.name}
                      </Badge>
                    )}
                    {task.designAssignee && (
                      <Badge variant="outline" className="text-xs">
                        디자인: {task.designAssignee.name}
                      </Badge>
                    )}
                    {task.frontendAssignee && (
                      <Badge variant="outline" className="text-xs">
                        FE: {task.frontendAssignee.name}
                      </Badge>
                    )}
                    {task.backendAssignee && (
                      <Badge variant="outline" className="text-xs">
                        BE: {task.backendAssignee.name}
                      </Badge>
                    )}
                    {!task.planningAssignee && !task.designAssignee && !task.frontendAssignee && !task.backendAssignee && (
                      <span className="text-xs text-muted-foreground">미배정</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {formatDateRange(task.startDate, task.endDate)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {task.clientName || '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
