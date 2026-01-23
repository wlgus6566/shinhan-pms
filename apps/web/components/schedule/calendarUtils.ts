import type { EventInput } from '@fullcalendar/core';
import type { Schedule } from '@/types/schedule';
import { SCHEDULE_TYPE_CALENDAR_COLORS, TEAM_SCOPE_FILTER_COLORS } from '@/types/schedule';

/**
 * Determines the color for a schedule based on priority:
 * 1. schedule.color (if set)
 * 2. teamScope color (if teamScope is set)
 * 3. scheduleType color (fallback)
 */
export function getScheduleColor(schedule: Schedule): string {
  if (schedule.color) {
    return schedule.color;
  }

  if (schedule.teamScope) {
    return TEAM_SCOPE_FILTER_COLORS[schedule.teamScope];
  }

  return SCHEDULE_TYPE_CALENDAR_COLORS[schedule.scheduleType];
}

/**
 * Checks if a schedule spans multiple days
 */
export function isMultiDaySchedule(schedule: Schedule): boolean {
  const start = schedule.startDate.slice(0, 10); // YYYY-MM-DD
  const end = schedule.endDate.slice(0, 10);
  return start !== end;
}

/**
 * Transforms a Schedule object to FullCalendar EventInput format
 */
export function transformScheduleToEvent(schedule: Schedule): EventInput {
  const isMultiDay = isMultiDaySchedule(schedule);
  const color = getScheduleColor(schedule);

  return {
    id: schedule.id,
    title: schedule.title,
    start: schedule.startDate,
    end: schedule.endDate,
    allDay: schedule.isAllDay,
    backgroundColor: color,
    borderColor: color,
    textColor: isMultiDay ? '#ffffff' : '#334155', // white for multi-day, slate-700 for single-day
    classNames: isMultiDay ? 'fc-multiday-event' : 'fc-singleday-event',
    extendedProps: {
      schedule, // Store original schedule for click handlers
      isMultiDay,
    },
  };
}

/**
 * Transforms an array of Schedule objects to FullCalendar EventInput array
 */
export function transformSchedulesToEvents(schedules: Schedule[]): EventInput[] {
  return schedules.map(transformScheduleToEvent);
}
