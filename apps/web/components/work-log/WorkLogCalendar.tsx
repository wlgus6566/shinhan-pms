'use client';

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isWeekend,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WorkLog } from '@/types/work-log';

interface WorkLogCalendarProps {
  workLogs: WorkLog[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export function WorkLogCalendar({
  workLogs,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: WorkLogCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  const workLogDates = useMemo(() => {
    const dates = new Set<string>();
    workLogs.forEach((log) => {
      dates.add(log.workDate);
    });
    return dates;
  }, [workLogs]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    onDateSelect(today);
    onMonthChange(startOfMonth(today));
  };

  const getLogsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workLogs.filter((log) => log.workDate === dateStr);
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 목록 뷰용 그룹화
  const groupedLogs = useMemo(() => {
    const grouped: Record<string, WorkLog[]> = {};
    workLogs.forEach((log) => {
      if (!grouped[log.workDate]) {
        grouped[log.workDate] = [];
      }
      grouped[log.workDate]!.push(log);
    });
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [workLogs]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            오늘
          </Button>
        </div>

        <h2 className="text-lg font-bold text-slate-800">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-3',
              viewMode === 'month' ? '' : 'text-slate-600'
            )}
            onClick={() => setViewMode('month')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            월
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-3',
              viewMode === 'list' ? '' : 'text-slate-600'
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            목록
          </Button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={cn(
                  'py-3 text-center text-xs font-semibold',
                  index === 0 && 'text-rose-500',
                  index === 6 && 'text-blue-500',
                  index !== 0 && index !== 6 && 'text-slate-500'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasLogs = workLogDates.has(dateStr);
              const logsForDay = getLogsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isWeekendDay = isWeekend(day);
              const dayOfWeek = day.getDay();

              return (
                <button
                  key={dateStr}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    'relative h-24 py-2 px-1 border-b border-r border-slate-100 transition-all hover:bg-slate-50',
                    !isCurrentMonth && 'bg-slate-50/50',
                    isSelected && 'bg-blue-50 hover:bg-blue-50',
                    index % 7 === 6 && 'border-r-0'
                  )}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full',
                        !isCurrentMonth && 'text-slate-300',
                        isCurrentMonth && dayOfWeek === 0 && 'text-rose-500',
                        isCurrentMonth && dayOfWeek === 6 && 'text-blue-500',
                        isCurrentMonth &&
                          dayOfWeek !== 0 &&
                          dayOfWeek !== 6 &&
                          'text-slate-700',
                        isTodayDate &&
                          'bg-blue-500 text-white font-bold',
                        isSelected && !isTodayDate && 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* 일지 표시 */}
                    {hasLogs && isCurrentMonth && (
                      <div className="mt-1 space-y-0.5 overflow-hidden flex-1">
                        {logsForDay.slice(0, 2).map((log) => (
                          <div
                            key={log.id}
                            className="px-1.5 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-100 rounded truncate"
                            title={log.task?.taskName}
                          >
                            {log.task?.taskName}
                          </div>
                        ))}
                        {logsForDay.length > 2 && (
                          <div className="px-1.5 text-[10px] text-slate-500">
                            +{logsForDay.length - 2}개
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* 목록 뷰 */
        <div className="max-h-[600px] overflow-y-auto">
          {groupedLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              작성된 업무일지가 없습니다
            </div>
          ) : (
            groupedLogs.map(([date, logs]) => (
              <div key={date} className="border-b border-slate-100 last:border-b-0">
                <div className="px-6 py-3 bg-slate-50 sticky top-0">
                  <span className="font-semibold text-slate-700">
                    {format(new Date(date), 'M월 d일 (EEEE)', { locale: ko })}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">
                    {logs.length}건
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => onDateSelect(new Date(date))}
                      className="w-full px-6 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {log.task?.taskName}
                          </p>
                          <p className="text-sm text-slate-500 truncate mt-0.5">
                            {log.content}
                          </p>
                        </div>
                        {log.progress !== null && log.progress !== undefined && (
                         <>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={'h-full rounded-full transition-all bg-primary'}
                                style={{ width: `${log.progress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-blue-600">
                            {log.progress}%
                          </span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
