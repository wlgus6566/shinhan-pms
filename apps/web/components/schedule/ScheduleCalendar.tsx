'use client';

import { useState, useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/types/schedule';
import {
  SCHEDULE_TYPE_CALENDAR_COLORS,
  SCHEDULE_TYPE_LABELS,
} from '@/types/schedule';

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import type {
  EventClickArg,
  DatesSetArg,
  EventContentArg,
  DayCellContentArg,
} from '@fullcalendar/core';
import koLocale from '@fullcalendar/core/locales/ko';

// Utilities
import { transformSchedulesToEvents, getScheduleColor } from './calendarUtils';

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
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const calendarRef = useRef<FullCalendar>(null);

  // Transform schedules to FullCalendar events
  const events = useMemo(
    () => transformSchedulesToEvents(schedules),
    [schedules],
  );

  // Navigation handlers
  const handlePrevMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
    }
  };

  const handleNextMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      const today = new Date();
      onDateSelect(today);
    }
  };

  // FullCalendar callbacks
  const handleDateClick = (arg: DateClickArg) => {
    onDateSelect(arg.date);
  };

  const handleEventClick = (arg: EventClickArg) => {
    arg.jsEvent.stopPropagation();
    const schedule = arg.event.extendedProps.schedule as Schedule;
    onScheduleClick?.(schedule);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const newMonth = arg.view.currentStart;

    // Only trigger onMonthChange if the month actually changed
    if (format(newMonth, 'yyyy-MM') !== format(currentMonth, 'yyyy-MM')) {
      setCurrentMonth(newMonth);
      onMonthChange(newMonth);
    }
  };

  // Custom event rendering
  const renderEventContent = (eventInfo: EventContentArg) => {
    const schedule = eventInfo.event.extendedProps.schedule as Schedule;
    const isMultiDay = eventInfo.event.extendedProps.isMultiDay as boolean;

    if (isMultiDay) {
      // Multi-day event bar
      return (
        <div className="w-full h-5 flex items-center px-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-[10px] font-medium text-white truncate">
            {schedule.title}
          </span>
        </div>
      );
    } else {
      // Single-day event with left border
      return (
        <div className="relative w-full py-0.5 cursor-pointer hover:bg-slate-50 transition-colors rounded">
          <span className="text-[10px] font-medium text-slate-700 truncate block flex items-center gap-1">
            <i
              className="w-1 h-3 inline-block"
              style={{
                backgroundColor:
                  SCHEDULE_TYPE_CALENDAR_COLORS[schedule.scheduleType],
              }}
            />
            {schedule.scheduleType === 'VACATION'
              ? '🌴'
              : format(parseISO(schedule.startDate), 'HH:mm')}{' '}
            {schedule.title}
          </span>
        </div>
      );
    }
  };

  // Day cell class names for selected date highlighting
  const getDayCellClassNames = (arg: DayCellContentArg) => {
    const classes: string[] = [];

    // Check if this day is the selected date
    const argDate = format(arg.date, 'yyyy-MM-dd');
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    if (argDate === selectedDateStr) {
      classes.push('fc-day-selected');
    }

    return classes;
  };

  // List view grouped schedules (keep existing implementation)
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-[1200px]">
      {/* Header */}
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
              viewMode === 'month' ? '' : 'text-slate-600',
            )}
            onClick={() => setViewMode('month')}
          >
            <Calendar className="h-4 w-4 mr-1" />월
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-3',
              viewMode === 'list' ? '' : 'text-slate-600',
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            목록
          </Button>
        </div>
      </div>

      {viewMode === 'month' ? (
        /* FullCalendar Month View */
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={currentMonth}
          locale={koLocale}
          headerToolbar={false} // Use custom header
          height="auto"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          dayMaxEvents={2}
          moreLinkText={(num) => `+${num}개`}
          eventContent={renderEventContent}
          dayCellClassNames={getDayCellClassNames}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          firstDay={0} // Sunday
          dayHeaderFormat={{ weekday: 'short' }}
          eventClassNames={(arg) => {
            const isMultiDay = arg.event.extendedProps.isMultiDay as boolean;
            return isMultiDay ? 'fc-multiday-event' : 'fc-singleday-event';
          }}
        />
      ) : (
        /* List View - Keep existing implementation */
        <div className="max-h-[600px] overflow-y-auto">
          {groupedSchedules.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              등록된 일정이 없습니다
            </div>
          ) : (
            groupedSchedules.map(([date, schedules]) => (
              <div
                key={date}
                className="border-b border-slate-100 last:border-b-0"
              >
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
                            backgroundColor: getScheduleColor(schedule),
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
