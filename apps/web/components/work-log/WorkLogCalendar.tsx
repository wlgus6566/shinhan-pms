'use client';

import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WorkLog } from '@/types/work-log';

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
import { transformWorkLogsToEvents } from './workLogCalendarUtils';
import { progressColor } from './WorkLogCard';

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
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const calendarRef = useRef<FullCalendar>(null);

  // Transform workLogs to FullCalendar events
  const events = useMemo(() => transformWorkLogsToEvents(workLogs), [workLogs]);

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
    // Select the date of the clicked event
    onDateSelect(arg.event.start || new Date());
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
    const workLog = eventInfo.event.extendedProps.workLog as WorkLog;

    return (
      <div className="flex justify-start items-center gap-1 relative w-full px-1 py-0.5 cursor-pointer transition-colors rounded border-none">
        <span className="text-[12px] font-medium text-blue-700 truncate block">
          {workLog.task?.taskName || '업무일지'}
        </span>
      </div>
    );
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
          headerToolbar={false}
          height="auto"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          dayMaxEvents={2}
          moreLinkText={(num) => `+${num}개`}
          eventContent={renderEventContent}
          dayCellClassNames={getDayCellClassNames}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          firstDay={0}
        />
      ) : (
        /* 목록 뷰 */
        <div className="max-h-[1000px] overflow-y-auto">
          {groupedLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              작성된 업무일지가 없습니다
            </div>
          ) : (
            groupedLogs.map(([date, logs]) => (
              <div
                key={date}
                className="border-b border-slate-100 last:border-b-0"
              >
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
                        {log.progress !== null &&
                          log.progress !== undefined && (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`${progressColor(log.progress)} h-full rounded-full transition-all`}
                                    style={{ width: `${log.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-blue-600">
                                  {log.progress}%
                                </span>
                              </div>
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
