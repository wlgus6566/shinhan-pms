/**
 * Recurring Schedule Utilities
 * 반복 일정 인스턴스 생성 로직
 */

export interface RecurrenceOptions {
  startDate: Date;
  endDate: Date;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceEndDate: Date;
  recurrenceDaysOfWeek?: number[]; // 0=일, 1=월, 2=화, ..., 6=토
}

export interface ScheduleInstance {
  startDate: Date;
  endDate: Date;
  instanceDate: string; // ISO 날짜 문자열
}

/**
 * 정기 일정 규칙에 따라 일정 인스턴스 배열 생성
 * @param options 반복 옵션
 * @param maxInstances 최대 생성 개수 (기본 1000)
 * @returns 일정 인스턴스 배열
 */
export function generateRecurrenceInstances(
  options: RecurrenceOptions,
  maxInstances = 1000,
): ScheduleInstance[] {
  const { startDate, endDate, recurrenceType, recurrenceEndDate, recurrenceDaysOfWeek } = options;
  const instances: ScheduleInstance[] = [];

  // 일정 기간 계산 (밀리초)
  const duration = endDate.getTime() - startDate.getTime();

  // WEEKLY + recurrenceDaysOfWeek: 지정된 요일마다 인스턴스 생성
  if (recurrenceType === 'WEEKLY' && recurrenceDaysOfWeek && recurrenceDaysOfWeek.length > 0) {
    // 시작일이 속한 주의 일요일(0)부터 탐색
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 해당 주 일요일

    let currentWeekStart = new Date(weekStart);
    let iterationCount = 0;

    while (currentWeekStart <= recurrenceEndDate && iterationCount < maxInstances) {
      for (const dayOfWeek of recurrenceDaysOfWeek) {
        const instanceStart = new Date(currentWeekStart);
        instanceStart.setDate(instanceStart.getDate() + dayOfWeek);
        // 시작 시간 설정 (원본 시간 유지)
        instanceStart.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds());

        // 시작일 이전이거나 종료일 이후이면 건너뛰기
        if (instanceStart < startDate || instanceStart > recurrenceEndDate) {
          continue;
        }

        const instanceEnd = new Date(instanceStart.getTime() + duration);

        instances.push({
          startDate: instanceStart,
          endDate: instanceEnd,
          instanceDate: instanceStart.toISOString().split('T')[0],
        });
        iterationCount++;
      }
      // 다음 주로 이동
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    // 날짜순 정렬
    instances.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    return instances;
  }

  // 기존 로직: DAILY, MONTHLY, YEARLY 및 recurrenceDaysOfWeek 없는 WEEKLY
  let currentDate = new Date(startDate);
  let iterationCount = 0;

  while (currentDate <= recurrenceEndDate && iterationCount < maxInstances) {
    const instanceStart = new Date(currentDate);
    const instanceEnd = new Date(currentDate.getTime() + duration);

    instances.push({
      startDate: instanceStart,
      endDate: instanceEnd,
      instanceDate: instanceStart.toISOString().split('T')[0],
    });

    currentDate = getNextOccurrence(currentDate, recurrenceType);
    iterationCount++;
  }

  return instances;
}

/**
 * 반복 유형에 따라 다음 발생 날짜 계산
 * @param currentDate 현재 날짜
 * @param recurrenceType 반복 유형
 * @returns 다음 발생 날짜
 */
function getNextOccurrence(
  currentDate: Date,
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
): Date {
  const nextDate = new Date(currentDate);

  switch (recurrenceType) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      // 월말 처리 (예: 1월 31일 → 2월 28일)
      if (nextDate.getDate() !== currentDate.getDate()) {
        nextDate.setDate(0); // 이전 달의 마지막 날
      }
      break;

    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      // 윤년 처리 (2월 29일 → 2월 28일)
      if (
        currentDate.getMonth() === 1 &&
        currentDate.getDate() === 29 &&
        !isLeapYear(nextDate.getFullYear())
      ) {
        nextDate.setDate(28);
      }
      break;
  }

  return nextDate;
}

/**
 * 윤년 여부 확인
 * @param year 연도
 * @returns 윤년 여부
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
