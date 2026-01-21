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
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/types/schedule';
import { SCHEDULE_TYPE_LABELS, SCHEDULE_TYPE_CALENDAR_COLORS } from '@/types/schedule';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onScheduleClick?: (schedule: Schedule) => void;
}

export function ScheduleCalendar({
  schedules,
  selectedDate,
  onDateSelect,
  onMonthChange,
  onScheduleClick,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

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

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      const start = parseISO(schedule.startDate);
      const end = parseISO(schedule.endDate);

      return isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end);
    });
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 목록 뷰용 그룹화
  const groupedSchedules = useMemo(() => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach((schedule) => {
      const startDate = format(parseISO(schedule.startDate), 'yyyy-MM-dd');
      if (!grouped[startDate]) {
        grouped[startDate] = [];
      }
      grouped[startDate]!.push(schedule);
    });
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [schedules]);

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
              const schedulesForDay = getSchedulesForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const dayOfWeek = day.getDay();

              return (
                <button
                  key={format(day, 'yyyy-MM-dd')}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    'relative h-24 p-2 border-b border-r border-slate-100 transition-all hover:bg-slate-50',
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

                    {/* 일정 표시 */}
                    {schedulesForDay.length > 0 && isCurrentMonth && (
                      <div className="mt-1 space-y-0.5 overflow-hidden flex-1">
                        {schedulesForDay.slice(0, 2).map((schedule) => (
                          <button
                            key={schedule.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleClick?.(schedule);
                            }}
                            className="w-full px-1.5 py-0.5 text-[10px] font-medium rounded truncate text-left"
                            style={{
                              backgroundColor: schedule.color || SCHEDULE_TYPE_CALENDAR_COLORS[schedule.scheduleType],
                              color: 'white',
                            }}
                            title={schedule.title}
                          >
                            {schedule.isAllDay ? '⏰ ' : ''}
                            {schedule.title}
                          </button>
                        ))}
                        {schedulesForDay.length > 2 && (
                          <div className="px-1.5 text-[10px] text-slate-500">
                            +{schedulesForDay.length - 2}개
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
          {groupedSchedules.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              등록된 일정이 없습니다
            </div>
          ) : (
            groupedSchedules.map(([date, schedules]) => (
              <div key={date} className="border-b border-slate-100 last:border-b-0">
                <div className="px-6 py-3 bg-slate-50 sticky top-0">
                  <span className="font-semibold text-slate-700">
                    {format(new Date(date), 'M월 d일 (EEEE)', { locale: ko })}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">
                    {schedules.length}건
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {schedules.map((schedule) => (
                    <button
                      key={schedule.id}
                      onClick={() => onScheduleClick?.(schedule)}
                      className="w-full px-6 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: schedule.color || SCHEDULE_TYPE_CALENDAR_COLORS[schedule.scheduleType],
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {schedule.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
                            </span>
                            <span className="text-sm text-slate-500">
                              {schedule.isAllDay
                                ? '하루 종일'
                                : `${format(parseISO(schedule.startDate), 'HH:mm')} - ${format(parseISO(schedule.endDate), 'HH:mm')}`}
                            </span>
                          </div>
                        </div>
                        {schedule.location && (
                          <span className="text-sm text-slate-500 truncate max-w-[150px]">
                            📍 {schedule.location}
                          </span>
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
