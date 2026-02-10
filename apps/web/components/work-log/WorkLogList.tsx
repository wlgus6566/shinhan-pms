'use client';

import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, Plus, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkLogCard } from './WorkLogCard';
import type { WorkLog } from '@/types/work-log';

interface WorkLogListProps {
  workLogs: WorkLog[];
  currentUserId?: string;
  selectedDate: Date;
  onEdit?: (workLog: WorkLog) => void;
  onDelete?: (workLog: WorkLog) => void;
  onCreate?: () => void;
}

export function WorkLogList({
  workLogs,
  currentUserId,
  selectedDate,
  onEdit,
  onDelete,
  onCreate,
}: WorkLogListProps) {
  // 선택된 날짜의 일지 필터링
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const logsForSelectedDate = useMemo(() => {
    return workLogs.filter((log) => log.workDate === selectedDateStr);
  }, [workLogs, selectedDateStr]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">
          {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">
          <span className="font-bold">{logsForSelectedDate.length}</span>건의
          업무일지
        </p>
        {/* {onCreate && (
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            일지 작성
          </Button>
        )} */}
      </div>

      {/* 일지 목록 */}
      <div className="max-h-[500px] overflow-y-auto p-4">
        {logsForSelectedDate.length === 0 ? (
          <div className="py-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-500 mb-4 text-center font-bold">
              작성된 업무일지가 없어요.
            </p>
            {onCreate && (
              <Button
                variant="outline"
                onClick={onCreate}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                업무일지 작성하기
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {logsForSelectedDate.map((log) => (
              <WorkLogCard
                key={log.id}
                workLog={log}
                isOwner={currentUserId === log.userId}
                onEdit={onEdit ? () => onEdit(log) : undefined}
                onDelete={onDelete ? () => onDelete(log) : undefined}
              />
            ))}
          </div>
        )}
      </div>
      {/* Floating Action Button - Portal to body to escape transform context */}
      {onCreate &&
        typeof document !== 'undefined' &&
        createPortal(
          <Button
            onClick={onCreate}
            className="gradient-primary border-none fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
            size="icon"
          >
            <PenLine className="h-6 w-6" />
          </Button>,
          document.body,
        )}
    </div>
  );
}
