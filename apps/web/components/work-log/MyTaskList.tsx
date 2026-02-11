'use client';

import type { MyTask } from '@/types/work-log';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type TaskStatus,
  type TaskDifficulty,
} from '@/types/task';
import { DifficultyIndicator } from '@/components/ui/difficulty-indicator';
import { cn } from '@/lib/utils';

interface MyTaskListProps {
  tasks: MyTask[];
}

export function MyTaskList({ tasks }: MyTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-slate-500">담당 중인 업무가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-row justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">진행 중인 업무</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          <span className="font-bold">{tasks.length}</span>개의 업무
        </p>
      </div>

      <div className="max-h-[412px] overflow-y-auto">
        {tasks.map((task) => {
          return (
            <div
              key={task.id}
              className={cn(
                'w-full px-6 pt-2 py-3 text-left border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50 ',
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {task.taskName}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        STATUS_COLORS[task.status as TaskStatus],
                      )}
                    >
                      {STATUS_LABELS[task.status as TaskStatus]}
                    </span>
                    {task.difficulty && (
                      <DifficultyIndicator
                        difficulty={task.difficulty as TaskDifficulty}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
