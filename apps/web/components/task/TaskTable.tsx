'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskTableProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  isValidating?: boolean;
}

export function TaskTable({
  tasks,
  onTaskClick,
  isValidating,
}: TaskTableProps) {
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
    <div className="border rounded-lg relative">
      {/* Background refetch overlay */}
      {isValidating && tasks.length > 0 && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="">업무명</TableHead>
            <TableHead className="w-[120px]">업무 구분</TableHead>
            <TableHead className="w-[100px]">난이도</TableHead>
            <TableHead className="w-[120px]">진행상태</TableHead>
            <TableHead className="min-w-[200px]">담당자</TableHead>
            <TableHead className="w-[120px]">오픈일</TableHead>
            <TableHead className="w-[200px]">기간</TableHead>
            <TableHead className="w-[120px] hidden md:table-cell">
              담당PM
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-12 text-muted-foreground"
              >
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
                <TableCell className="font-medium line-clamp-1">
                  {task.taskName}
                </TableCell>
                <TableCell className="text-sm">
                  {task.taskType?.name || '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      DIFFICULTY_COLORS[task.difficulty as TaskDifficulty]
                    }
                  >
                    {DIFFICULTY_LABELS[task.difficulty as TaskDifficulty]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[task.status as TaskStatus]}>
                    {STATUS_LABELS[task.status as TaskStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {task.planningAssignees &&
                      task.planningAssignees.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          기획: {task.planningAssignees[0]!.name}
                          {task.planningAssignees.length > 1 &&
                            ` 외 ${task.planningAssignees.length - 1}`}
                        </Badge>
                      )}
                    {task.designAssignees &&
                      task.designAssignees.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          디자인: {task.designAssignees[0]!.name}
                          {task.designAssignees.length > 1 &&
                            ` 외 ${task.designAssignees.length - 1}`}
                        </Badge>
                      )}
                    {task.frontendAssignees &&
                      task.frontendAssignees.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          FE: {task.frontendAssignees[0]!.name}
                          {task.frontendAssignees.length > 1 &&
                            ` 외 ${task.frontendAssignees.length - 1}`}
                        </Badge>
                      )}
                    {task.backendAssignees &&
                      task.backendAssignees.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          BE: {task.backendAssignees[0]!.name}
                          {task.backendAssignees.length > 1 &&
                            ` 외 ${task.backendAssignees.length - 1}`}
                        </Badge>
                      )}
                    {(!task.planningAssignees ||
                      task.planningAssignees.length === 0) &&
                      (!task.designAssignees ||
                        task.designAssignees.length === 0) &&
                      (!task.frontendAssignees ||
                        task.frontendAssignees.length === 0) &&
                      (!task.backendAssignees ||
                        task.backendAssignees.length === 0) && (
                        <span className="text-xs text-muted-foreground">
                          미배정
                        </span>
                      )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {formatDate(task.openDate)}
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
