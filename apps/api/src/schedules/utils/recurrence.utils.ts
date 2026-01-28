/**
 * Recurring Schedule Utilities
 * 반복 일정 인스턴스 생성 로직
 */

export interface RecurrenceOptions {
  startDate: Date;
  endDate: Date;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceEndDate: Date;
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
  const { startDate, endDate, recurrenceType, recurrenceEndDate } = options;
  const instances: ScheduleInstance[] = [];

  // 일정 기간 계산 (밀리초)
  const duration = endDate.getTime() - startDate.getTime();

  let currentDate = new Date(startDate);
  let iterationCount = 0;

  while (currentDate <= recurrenceEndDate && iterationCount < maxInstances) {
    // 현재 인스턴스 추가
    const instanceStart = new Date(currentDate);
    const instanceEnd = new Date(currentDate.getTime() + duration);

    instances.push({
      startDate: instanceStart,
      endDate: instanceEnd,
      instanceDate: instanceStart.toISOString().split('T')[0], // YYYY-MM-DD
    });

    // 다음 발생 날짜 계산
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
