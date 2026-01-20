'use client';

import { FolderKanban, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MyTask } from '@/types/work-log';

interface MyTaskListProps {
  tasks: MyTask[];
  selectedTaskId?: string;
  onTaskSelect?: (taskId: string) => void;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  WAITING: { label: '작업 대기', icon: Clock, color: 'text-slate-500' },
  IN_PROGRESS: { label: '작업 중', icon: AlertTriangle, color: 'text-blue-500' },
  WORK_COMPLETED: { label: '작업 완료', icon: CheckCircle2, color: 'text-green-500' },
  OPEN_WAITING: { label: '오픈 대기', icon: Clock, color: 'text-yellow-500' },
  OPEN_RESPONDING: { label: '오픈 대응', icon: AlertTriangle, color: 'text-orange-500' },
  COMPLETED: { label: '완료', icon: CheckCircle2, color: 'text-emerald-500' },
  // Legacy statuses for backward compatibility
  TODO: { label: '작업 대기', icon: Clock, color: 'text-slate-500' },
  DONE: { label: '완료', icon: CheckCircle2, color: 'text-emerald-500' },
  HOLD: { label: '보류', icon: Clock, color: 'text-amber-500' },
};

export function MyTaskList({ tasks, selectedTaskId, onTaskSelect }: MyTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="text-center py-8">
          <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">담당 중인 업무가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">내 업무 목록</h3>
        <p className="text-sm text-slate-500 mt-0.5">{tasks.length}개의 업무</p>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {tasks.map((task) => {
          const status = statusConfig[task.status] ?? statusConfig['WAITING'];
          const StatusIcon = status!.icon;

          return (
            <button
              key={task.id}
              onClick={() => onTaskSelect?.(task.id)}
              className={cn(
                'w-full px-6 py-4 text-left border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50',
                selectedTaskId === task.id && 'bg-blue-50 hover:bg-blue-50'
              )}
            >
              <div className="flex items-start gap-3">
                <StatusIcon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', status!.color)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{task.taskName}</p>
                  {task.project && (
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {task.project.projectName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        task.status === 'TODO' && 'bg-slate-100 text-slate-600',
                        task.status === 'IN_PROGRESS' && 'bg-blue-100 text-blue-600',
                        task.status === 'DONE' && 'bg-emerald-100 text-emerald-600',
                        task.status === 'HOLD' && 'bg-amber-100 text-amber-600'
                      )}
                    >
                      {status!.label}
                    </span>
                    {task.difficulty && (
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          task.difficulty === 'HIGH' && 'bg-rose-100 text-rose-600',
                          task.difficulty === 'MEDIUM' && 'bg-amber-100 text-amber-600',
                          task.difficulty === 'LOW' && 'bg-emerald-100 text-emerald-600'
                        )}
                      >
                        {task.difficulty === 'HIGH' && '높음'}
                        {task.difficulty === 'MEDIUM' && '보통'}
                        {task.difficulty === 'LOW' && '낮음'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
