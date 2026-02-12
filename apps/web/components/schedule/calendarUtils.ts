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
 * UTC 시간 문자열을 로컬 시간 문자열로 변환
 * "2026-02-15T15:00:00.000Z" -> KST "2026-02-16T00:00:00"
 */
function convertUTCToLocalString(utcString: string): string {
  const date = new Date(utcString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * UTC 시간 문자열에서 로컬 날짜(YYYY-MM-DD)만 추출
 */
export function utcToLocalDateStr(utcString: string): string {
  const date = new Date(utcString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a schedule spans multiple days (로컬 타임존 기준)
 */
export function isMultiDaySchedule(schedule: Schedule): boolean {
  const start = utcToLocalDateStr(schedule.startDate);
  const end = utcToLocalDateStr(schedule.endDate);
  return start !== end;
}

/**
 * Transforms a Schedule object to FullCalendar EventInput format
 */
export function transformScheduleToEvent(schedule: Schedule): EventInput {
  // 연차/반차(usageDate 있음)는 항상 단일일 이벤트로 처리
  const isMultiDay = schedule.usageDate ? false : isMultiDaySchedule(schedule);
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
    startDate = convertUTCToLocalString(schedule.startDate);
    endDate = convertUTCToLocalString(schedule.endDate);
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
