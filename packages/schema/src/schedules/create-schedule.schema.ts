import { z } from 'zod';
import { ScheduleTypeEnum, TeamScopeEnum, HalfDayTypeEnum } from '../common/enums';

export const CreateScheduleSchema = z
  .object({
    projectId: z.string().optional(),
    title: z
      .string()
      .min(1, '제목을 입력해주세요')
      .max(100, '제목은 100자 이하여야 합니다')
      .optional(), // VACATION/HALF_DAY에서 선택적
    description: z.string().optional(),
    scheduleType: ScheduleTypeEnum,
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    location: z
      .string()
      .max(200, '장소는 200자 이하여야 합니다')
      .optional(),
    isAllDay: z.boolean().default(false).optional(),
    color: z.string().optional(),
    participantIds: z.array(z.string()).optional(),
    teamScope: TeamScopeEnum.nullable().optional(),
    halfDayType: HalfDayTypeEnum.nullable().optional(),
    usageDate: z.string().optional(),
  })
  // 조건부 검증 1: 연차/반차가 아닌 경우 startDate, endDate 필수
  .refine(
    (data) => {
      if (data.scheduleType !== 'VACATION' && data.scheduleType !== 'HALF_DAY') {
        return data.startDate !== undefined && data.startDate.trim().length > 0 &&
               data.endDate !== undefined && data.endDate.trim().length > 0;
      }
      return true;
    },
    {
      message: '시작 날짜와 종료 날짜를 입력해주세요',
      path: ['startDate'],
    }
  )
  // 조건부 검증 2: 연차/반차인 경우 usageDate 필수
  .refine(
    (data) => {
      if (data.scheduleType === 'VACATION' || data.scheduleType === 'HALF_DAY') {
        return data.usageDate !== undefined && data.usageDate.trim().length > 0;
      }
      return true;
    },
    {
      message: '사용일을 선택해주세요',
      path: ['usageDate'],
    }
  )
  // 조건부 검증 3: 반차인 경우 halfDayType 필수
  .refine(
    (data) => {
      if (data.scheduleType === 'HALF_DAY') {
        return data.halfDayType !== undefined && data.halfDayType !== null;
      }
      return true;
    },
    {
      message: '오전/오후를 선택해주세요',
      path: ['halfDayType'],
    }
  )
  // 조건부 검증 4: 종료 날짜 >= 시작 날짜
  .refine(
    (data) => {
      if (
        data.startDate &&
        data.endDate &&
        data.scheduleType !== 'VACATION' &&
        data.scheduleType !== 'HALF_DAY'
      ) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
      path: ['endDate'],
    }
  )
  // 조건부 검증 5: MEETING/SCRUM은 location 필수
  .refine(
    (data) => {
      if (data.scheduleType === 'MEETING' || data.scheduleType === 'SCRUM') {
        return data.location !== undefined && data.location.trim().length > 0;
      }
      return true;
    },
    {
      message: '회의와 스크럼은 장소가 필수입니다',
      path: ['location'],
    }
  )
  // 조건부 검증 6: MEETING/SCRUM은 teamScope 필수
  .refine(
    (data) => {
      if (data.scheduleType === 'MEETING' || data.scheduleType === 'SCRUM') {
        return data.teamScope !== undefined && data.teamScope !== null;
      }
      return true;
    },
    {
      message: '팀 범위를 선택해주세요',
      path: ['teamScope'],
    }
  );

export type CreateScheduleRequest = z.infer<typeof CreateScheduleSchema>;
