import { generateRecurrenceInstances, RecurrenceOptions } from './recurrence.utils';

describe('generateRecurrenceInstances', () => {
  // 헬퍼: 날짜 생성 (로컬 타임존)
  const d = (dateStr: string) => new Date(dateStr);

  describe('DAILY 반복', () => {
    it('매일 인스턴스를 생성한다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T09:00:00'),
        endDate: d('2026-01-05T18:00:00'),
        recurrenceType: 'DAILY',
        recurrenceEndDate: d('2026-01-07T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3);
      expect(instances[0].instanceDate).toBe('2026-01-05');
      expect(instances[1].instanceDate).toBe('2026-01-06');
      expect(instances[2].instanceDate).toBe('2026-01-07');
    });

    it('종료 시간이 올바르게 설정된다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T09:00:00'),
        endDate: d('2026-01-05T18:00:00'),
        recurrenceType: 'DAILY',
        recurrenceEndDate: d('2026-01-06T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances[0].startDate.getHours()).toBe(9);
      expect(instances[0].endDate.getHours()).toBe(18);
      expect(instances[1].startDate.getHours()).toBe(9);
      expect(instances[1].endDate.getHours()).toBe(18);
    });

    it('야간 일정(22:00~02:00)에서 종료 시간이 다음 날이 된다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T22:00:00'),
        endDate: d('2026-01-06T02:00:00'),
        recurrenceType: 'DAILY',
        recurrenceEndDate: d('2026-01-07T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3);
      // 첫째 날: 1/5 22:00 ~ 1/6 02:00
      expect(instances[0].startDate.getHours()).toBe(22);
      expect(instances[0].endDate.getHours()).toBe(2);
      expect(instances[0].endDate.getDate()).toBe(instances[0].startDate.getDate() + 1);
    });

    it('시작/종료 시간이 같으면 같은 날로 유지된다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T09:00:00'),
        endDate: d('2026-01-05T09:00:00'),
        recurrenceType: 'DAILY',
        recurrenceEndDate: d('2026-01-05T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(1);
      expect(instances[0].startDate.getTime()).toBe(instances[0].endDate.getTime());
    });
  });

  describe('WEEKLY 반복', () => {
    it('매주 같은 요일에 인스턴스를 생성한다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T10:00:00'), // 월요일
        endDate: d('2026-01-05T12:00:00'),
        recurrenceType: 'WEEKLY',
        recurrenceEndDate: d('2026-01-19T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3); // 1/5, 1/12, 1/19
      expect(instances[0].instanceDate).toBe('2026-01-05');
      expect(instances[1].instanceDate).toBe('2026-01-12');
      expect(instances[2].instanceDate).toBe('2026-01-19');
    });
  });

  describe('WEEKLY + recurrenceDaysOfWeek 반복', () => {
    it('지정된 요일에만 인스턴스를 생성한다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T09:00:00'), // 월요일
        endDate: d('2026-01-05T18:00:00'),
        recurrenceType: 'WEEKLY',
        recurrenceEndDate: d('2026-01-11T23:59:59'),
        recurrenceDaysOfWeek: [1, 3, 5], // 월, 수, 금
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3);
      expect(instances[0].instanceDate).toBe('2026-01-05'); // 월
      expect(instances[1].instanceDate).toBe('2026-01-07'); // 수
      expect(instances[2].instanceDate).toBe('2026-01-09'); // 금
    });

    it('야간 일정도 올바르게 처리한다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T22:00:00'), // 월요일
        endDate: d('2026-01-06T02:00:00'),
        recurrenceType: 'WEEKLY',
        recurrenceEndDate: d('2026-01-12T23:59:59'),
        recurrenceDaysOfWeek: [1, 3], // 월, 수
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3); // 1/5(월), 1/7(수), 1/12(월)
      for (const instance of instances) {
        expect(instance.startDate.getHours()).toBe(22);
        expect(instance.endDate.getHours()).toBe(2);
        expect(instance.endDate.getDate()).toBe(instance.startDate.getDate() + 1);
      }
    });

    it('날짜순으로 정렬된다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-05T09:00:00'),
        endDate: d('2026-01-05T18:00:00'),
        recurrenceType: 'WEEKLY',
        recurrenceEndDate: d('2026-01-18T23:59:59'),
        recurrenceDaysOfWeek: [5, 1, 3], // 금, 월, 수 (비순서)
      };

      const instances = generateRecurrenceInstances(options);

      for (let i = 1; i < instances.length; i++) {
        expect(instances[i].startDate.getTime()).toBeGreaterThan(
          instances[i - 1].startDate.getTime(),
        );
      }
    });

    it('시작일 이전 요일은 건너뛴다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-07T09:00:00'), // 수요일
        endDate: d('2026-01-07T18:00:00'),
        recurrenceType: 'WEEKLY',
        recurrenceEndDate: d('2026-01-11T23:59:59'),
        recurrenceDaysOfWeek: [1, 3, 5], // 월, 수, 금
      };

      const instances = generateRecurrenceInstances(options);

      // 월요일(1/5)은 시작일 이전이므로 건너뜀
      expect(instances[0].instanceDate).toBe('2026-01-07'); // 수
      expect(instances[1].instanceDate).toBe('2026-01-09'); // 금
    });
  });

  describe('MONTHLY 반복', () => {
    it('매월 같은 날에 인스턴스를 생성한다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-15T09:00:00'),
        endDate: d('2026-01-15T18:00:00'),
        recurrenceType: 'MONTHLY',
        recurrenceEndDate: d('2026-03-15T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3);
      expect(instances[0].instanceDate).toBe('2026-01-15');
      expect(instances[1].instanceDate).toBe('2026-02-15');
      expect(instances[2].instanceDate).toBe('2026-03-15');
    });

    it('월말 처리: 1월 31일 → 2월 28일', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-31T09:00:00'),
        endDate: d('2026-01-31T18:00:00'),
        recurrenceType: 'MONTHLY',
        recurrenceEndDate: d('2026-03-31T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3);
      expect(instances[0].instanceDate).toBe('2026-01-31');
      expect(instances[1].startDate.getMonth()).toBe(1); // 2월
      expect(instances[1].startDate.getDate()).toBe(28); // 28일
    });
  });

  describe('YEARLY 반복', () => {
    it('매년 같은 날에 인스턴스를 생성한다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-06-15T09:00:00'),
        endDate: d('2026-06-15T18:00:00'),
        recurrenceType: 'YEARLY',
        recurrenceEndDate: d('2028-06-15T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3);
      expect(instances[0].instanceDate).toBe('2026-06-15');
      expect(instances[1].instanceDate).toBe('2027-06-15');
      expect(instances[2].instanceDate).toBe('2028-06-15');
    });

    it('윤년 처리: 2월 29일 → 비윤년 2월 28일', () => {
      const options: RecurrenceOptions = {
        startDate: d('2028-02-29T09:00:00'), // 2028 윤년
        endDate: d('2028-02-29T18:00:00'),
        recurrenceType: 'YEARLY',
        recurrenceEndDate: d('2030-03-01T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options);

      expect(instances).toHaveLength(3);
      expect(instances[0].instanceDate).toBe('2028-02-29');
      expect(instances[1].startDate.getMonth()).toBe(1); // 2월
      expect(instances[1].startDate.getDate()).toBe(28); // 2029 비윤년
    });
  });

  describe('maxInstances 제한', () => {
    it('최대 인스턴스 수를 초과하지 않는다', () => {
      const options: RecurrenceOptions = {
        startDate: d('2026-01-01T09:00:00'),
        endDate: d('2026-01-01T18:00:00'),
        recurrenceType: 'DAILY',
        recurrenceEndDate: d('2030-12-31T23:59:59'),
      };

      const instances = generateRecurrenceInstances(options, 5);

      expect(instances).toHaveLength(5);
    });
  });
});
