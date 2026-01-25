'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Schedule } from '@/types/schedule';
import { SCHEDULE_TYPE_LABELS, SCHEDULE_TYPE_COLORS } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SelectedDateScheduleListProps {
  schedules: Schedule[];
  selectedDate: Date;
  onScheduleClick?: (schedule: Schedule) => void;
}

export function SelectedDateScheduleList({
  schedules,
  selectedDate,
  onScheduleClick,
}: SelectedDateScheduleListProps) {
  // Filter schedules for selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const schedulesForDate = useMemo(() => {
    return schedules
      .filter((schedule) => {
        if (schedule.usageDate) {
          // 연차/반차: usageDate와 정확히 비교
          return schedule.usageDate === selectedDateStr;
        }

        // 일반 일정: 날짜 범위 체크 (startDate <= selectedDate <= endDate)
        const rangeStart = schedule.startDate.split('T')[0];
        const rangeEnd = schedule.endDate.split('T')[0];
        return (
          selectedDateStr >= (rangeStart ?? '') &&
          selectedDateStr <= (rangeEnd ?? '')
        );
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [schedules, selectedDateStr]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">
          {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">
          {schedulesForDate.length}건의 일정
        </p>
      </div>

      {/* Schedule List */}
      <div className="p-4">
        {schedulesForDate.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">이 날짜에 일정이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedulesForDate.map((schedule) => (
              <div
                key={schedule.id}
                onClick={() => onScheduleClick?.(schedule)}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {schedule.scheduleType === 'VACATION' ||
                      schedule.scheduleType === 'HALF_DAY' ? (
                        <h4 className="text-green-800 truncate">
                          🌴 {schedule.creatorName}{' '}
                          {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
                        </h4>
                      ) : (
                        <h4 className="font-semibold text-slate-900 truncate">
                          {schedule.title}
                        </h4>
                      )}
                      {schedule.scheduleType !== 'VACATION' &&
                        schedule.scheduleType !== 'HALF_DAY' && (
                          <Badge
                            className={cn(
                              'text-xs',
                              SCHEDULE_TYPE_COLORS[schedule.scheduleType],
                            )}
                          >
                            {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
                          </Badge>
                        )}
                    </div>
                    <span className="text-[12px] font-medium text-slate-700 truncate block gap-1"></span>
                    {schedule.scheduleType !== 'VACATION' &&
                      schedule.scheduleType !== 'HALF_DAY' && (
                        <p className="text-sm text-slate-600">
                          {format(new Date(schedule?.startDate || ''), 'HH:mm')}{' '}
                          - {format(new Date(schedule?.endDate || ''), 'HH:mm')}
                        </p>
                      )}
                    {schedule?.location && (
                      <p className="text-sm text-slate-500 mt-1">
                        {schedule.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
