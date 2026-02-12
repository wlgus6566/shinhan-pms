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

  // WEEKLY + recurrenceDaysOfWeek: 지정된 요일마다 인스턴스 생성
  if (recurrenceType === 'WEEKLY' && recurrenceDaysOfWeek && recurrenceDaysOfWeek.length > 0) {
    // 시작일이 속한 주의 일요일(0)부터 탐색 (UTC 기준)
    const weekStart = new Date(startDate);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay()); // 해당 주 일요일

    let currentWeekStart = new Date(weekStart);
    let iterationCount = 0;

    while (currentWeekStart <= recurrenceEndDate && iterationCount < maxInstances) {
      for (const dayOfWeek of recurrenceDaysOfWeek) {
        const instanceStart = new Date(currentWeekStart);
        instanceStart.setUTCDate(instanceStart.getUTCDate() + dayOfWeek);
        // 시작 시간 설정 (원본 UTC 시간 유지)
        instanceStart.setUTCHours(startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds(), startDate.getUTCMilliseconds());

        // 시작일 이전이거나 종료일 이후이면 건너뛰기
        if (instanceStart < startDate || instanceStart > recurrenceEndDate) {
          continue;
        }

        const instanceEnd = calculateInstanceEnd(instanceStart, endDate);

        instances.push({
          startDate: instanceStart,
          endDate: instanceEnd,
          instanceDate: instanceStart.toISOString().split('T')[0],
        });
        iterationCount++;
      }
      // 다음 주로 이동
      currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() + 7);
    }

    // 날짜순 정렬
    instances.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    return instances;
  }

  // 기존 로직: DAILY, MONTHLY, YEARLY 및 recurrenceDaysOfWeek 없는 WEEKLY
  // UTC 메서드를 사용하여 toISOString()과 일관성 유지
  let currentDate = new Date(startDate);
  let iterationCount = 0;

  while (currentDate <= recurrenceEndDate && iterationCount < maxInstances) {
    const instanceStart = new Date(currentDate);
    const instanceEnd = calculateInstanceEnd(instanceStart, endDate);

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
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      break;

    case 'WEEKLY':
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      break;

    case 'MONTHLY':
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
      // 월말 처리 (예: 1월 31일 → 2월 28일)
      if (nextDate.getUTCDate() !== currentDate.getUTCDate()) {
        nextDate.setUTCDate(0); // 이전 달의 마지막 날
      }
      break;

    case 'YEARLY':
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
      // 윤년 처리: setUTCFullYear이 2월 29일 → 3월 1일로 롤오버하므로 월+일 함께 설정
      if (
        currentDate.getUTCMonth() === 1 &&
        currentDate.getUTCDate() === 29 &&
        !isLeapYear(nextDate.getUTCFullYear())
      ) {
        nextDate.setUTCMonth(1, 28); // 2월 28일
      }
      break;
  }

  return nextDate;
}

/**
 * 인스턴스 종료 시간 계산
 * 시작일에 endDate의 시/분/초를 적용하고, 야간 일정(종료가 시작보다 이전)이면 다음 날로 처리
 * @param instanceStart 인스턴스 시작 시간
 * @param endDate 원본 종료 시간 (시/분/초 참조용)
 * @returns 인스턴스 종료 시간
 */
function calculateInstanceEnd(instanceStart: Date, endDate: Date): Date {
  const instanceEnd = new Date(instanceStart);
  instanceEnd.setUTCHours(endDate.getUTCHours(), endDate.getUTCMinutes(), endDate.getUTCSeconds(), endDate.getUTCMilliseconds());
  // endTime이 startTime보다 이전이면 다음 날로 처리 (야간 일정)
  if (instanceEnd < instanceStart) {
    instanceEnd.setUTCDate(instanceEnd.getUTCDate() + 1);
  }
  return instanceEnd;
}

/**
 * 윤년 여부 확인
 * @param year 연도
 * @returns 윤년 여부
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
