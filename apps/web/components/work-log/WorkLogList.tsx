'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FileText, Plus } from 'lucide-react';
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
        <div>
          <h3 className="font-bold text-slate-800">
            {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {logsForSelectedDate.length}건의 업무일지
          </p>
        </div>
        {/* {onCreate && (
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            일지 작성
          </Button>
        )} */}
      </div>

      {/* 일지 목록 */}
      <div className="p-4">
        {logsForSelectedDate.length === 0 ? (
          <div className="py-4 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
            오늘 작성된 업무일지가 없습니다
            </p>
            {onCreate && (
              <Button variant="outline" onClick={onCreate}>
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
        {/* Floating Action Button */}
        {onCreate && (
        <Button
        onClick={onCreate}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
      )}
    </div>
  );
}
