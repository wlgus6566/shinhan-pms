import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';

export interface WeekInfo {
  year: number;
  month: number;
  weekNumber: number;
}

/**
 * 해당 날짜가 속한 주의 월요일 반환
 */
export function getWeekMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * 해당 날짜가 속한 주의 일요일 반환
 */
export function getWeekSunday(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/**
 * 월 내 주차 계산 (목요일 기준으로 월 결정)
 * ISO 주차 규칙: 해당 주의 목요일이 속한 월이 그 주의 월
 */
export function getWeekOfMonth(date: Date): WeekInfo {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  const thursday = addDays(monday, 3);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  // 해당 월의 1일이 속한 주의 월요일 구하기
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstWeekMonday = startOfWeek(firstOfMonth, { weekStartsOn: 1 });

  // 첫 주의 목요일이 해당 월에 속하는지 확인
  const firstWeekThursday = addDays(firstWeekMonday, 3);
  const firstWeekBelongsToMonth = firstWeekThursday.getMonth() + 1 === month;

  // 첫 주가 해당 월에 속하지 않으면 그 다음 주가 1주차
  const adjustedFirstWeekMonday = firstWeekBelongsToMonth
    ? firstWeekMonday
    : addDays(firstWeekMonday, 7);

  const diffInMs = monday.getTime() - adjustedFirstWeekMonday.getTime();
  const weekNumber = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000)) + 1;

  return { year, month, weekNumber };
}

/**
 * 화면 표시: "2026년 1월 2주차 (2026-01-05 ~ 2026-01-11)"
 */
export function formatWeekDisplay(date: Date): string {
  const { year, month, weekNumber } = getWeekOfMonth(date);
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  const sunday = endOfWeek(date, { weekStartsOn: 1 });

  return `${year}년 ${month}월 ${weekNumber}주차 (${format(monday, 'yyyy-MM-dd')} ~ ${format(sunday, 'yyyy-MM-dd')})`;
}
