'use client';

import { useState, useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  CalendarDays,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/types/schedule';
import { TEAM_SCOPE_FILTER_COLORS, TeamScope } from '@/types/schedule';

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import type {
  EventClickArg,
  DatesSetArg,
  EventContentArg,
  DayCellContentArg,
} from '@fullcalendar/core';
import koLocale from '@fullcalendar/core/locales/ko';

// Utilities
import { transformSchedulesToEvents } from './calendarUtils';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onScheduleClick?: (schedule: Schedule) => void;
}

// UTC 시간 문자열을 로컬 시간으로 변환 (타임존 무시)
const parseUTCAsLocal = (utcString: string) => {
  // 'Z'를 제거하여 타임존 정보 제거한 후 파싱
  return parseISO(utcString.replace('Z', ''));
};

export function ScheduleCalendar({
  schedules,
  selectedDate,
  onDateSelect,
  onMonthChange,
  onScheduleClick,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>(
    'month',
  );
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
          <span className="text-[12px] font-medium text-slate-700 truncate">
            {schedule.title}
          </span>
        </div>
      );
    } else {
      // Single-day event with left border
      return (
        <div className="flex justify-start items-center gap-1 relative w-full py-0.5 cursor-pointer transition-colors rounded">
          <i
            className="w-1 h-3 inline-block"
            style={{
              backgroundColor:
                TEAM_SCOPE_FILTER_COLORS[schedule.teamScope as TeamScope],
            }}
          />
          <span className="text-[12px] font-medium text-slate-700 truncate block gap-1">
            {schedule.scheduleType === 'VACATION'
              ? `🌴 ${schedule.creatorName}  연차`
              : schedule.scheduleType === 'HALF_DAY'
                ? `🌴 ${schedule.creatorName}  반차`
                : `${format(parseUTCAsLocal(schedule.startDate), 'HH:mm')} ${schedule.title}`}
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-3',
              viewMode === 'week' ? '' : 'text-slate-600',
            )}
            onClick={() => setViewMode('week')}
          >
            <CalendarDays className="h-4 w-4 mr-1" />주
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-3',
              viewMode === 'day' ? '' : 'text-slate-600',
            )}
            onClick={() => setViewMode('day')}
          >
            <Clock className="h-4 w-4 mr-1" />일
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
          key="month"
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          initialDate={currentMonth}
          locale={koLocale}
          headerToolbar={false} // Use custom header
          height="auto"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          dayMaxEvents={4}
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
      ) : viewMode === 'week' ? (
        /* FullCalendar Week View */
        <FullCalendar
          key="week"
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="timeGridWeek"
          initialDate={currentMonth}
          locale={koLocale}
          headerToolbar={false} // Use custom header
          height="auto"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          firstDay={1} // Monday
          slotDuration="00:30:00"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={true}
          allDayText="종일"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
          nowIndicator={true}
          eventContent={renderEventContent}
          eventClassNames={(arg) => {
            const isMultiDay = arg.event.extendedProps.isMultiDay as boolean;
            return isMultiDay ? 'fc-multiday-event' : 'fc-singleday-event';
          }}
        />
      ) : viewMode === 'day' ? (
        /* FullCalendar Day View */
        <FullCalendar
          key="day"
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="timeGridDay"
          initialDate={currentMonth}
          locale={koLocale}
          headerToolbar={false} // Use custom header
          height="auto"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          slotDuration="00:30:00"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={true}
          allDayText="종일"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          dayHeaderFormat={{ weekday: 'long', month: 'long', day: 'numeric' }}
          nowIndicator={true}
          eventContent={renderEventContent}
          eventClassNames={(arg) => {
            const isMultiDay = arg.event.extendedProps.isMultiDay as boolean;
            return isMultiDay ? 'fc-multiday-event' : 'fc-singleday-event';
          }}
        />
      ) : (
        /* FullCalendar List View */
        <FullCalendar
          key="list"
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="listWeek"
          initialDate={currentMonth}
          locale={koLocale}
          headerToolbar={false} // Use custom header
          height="auto"
          events={events}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          listDayFormat={{ month: 'long', day: 'numeric', weekday: 'long' }}
          listDaySideFormat={false}
          noEventsText="등록된 일정이 없습니다"
        />
      )}
    </div>
  );
}
