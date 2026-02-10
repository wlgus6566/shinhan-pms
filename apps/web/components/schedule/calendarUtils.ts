import type { EventInput } from '@fullcalendar/core';
import type { Schedule, TeamScope, ScheduleType } from '@/types/schedule';
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
    return TEAM_SCOPE_FILTER_COLORS[schedule.teamScope as TeamScope];
  }

  return SCHEDULE_TYPE_CALENDAR_COLORS[schedule.scheduleType as ScheduleType];
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
 * UTC 시간 문자열을 로컬 시간으로 변환 (타임존 무시)
 * "2026-01-21T20:50:00.000Z" -> "2026-01-21T20:50:00"
 */
function convertUTCToLocalIgnoringTimezone(utcString: string): string {
  // 'Z'를 제거하여 타임존 정보 제거
  return utcString.replace('Z', '');
}

/**
 * Transforms a Schedule object to FullCalendar EventInput format
 */
export function transformScheduleToEvent(schedule: Schedule): EventInput {
  const isMultiDay = isMultiDaySchedule(schedule);
  const color = getScheduleColor(schedule);

  // 연차/반차의 경우 usageDate를 기준으로 표시
  let startDate: string;
  let endDate: string;

  if (schedule.usageDate) {
    // usageDate가 있으면 (연차/반차) usageDate 사용
    startDate = schedule.usageDate;
    endDate = schedule.usageDate;
  } else {
    // 일반 일정은 기존 로직 사용
    startDate = convertUTCToLocalIgnoringTimezone(schedule.startDate);
    endDate = convertUTCToLocalIgnoringTimezone(schedule.endDate);
  }

  return {
    id: schedule.instanceDate ? `${schedule.id}-${schedule.instanceDate}` : schedule.id,
    title: schedule.title,
    start: startDate,
    end: endDate,
    allDay: schedule.isAllDay || !!schedule.usageDate, // 연차/반차는 종일 이벤트로 표시
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
