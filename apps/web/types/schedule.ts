import type {
  ScheduleType,
  TeamScope,
  HalfDayType,
  ParticipantStatus,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '@repo/schema';

export type { ScheduleType, TeamScope, HalfDayType, ParticipantStatus, CreateScheduleRequest, UpdateScheduleRequest };

export interface ScheduleParticipant {
  id: string;
  name: string;
  email: string;
  status: ParticipantStatus;
  workArea?:
    | 'PROJECT_MANAGEMENT'
    | 'PLANNING'
    | 'DESIGN'
    | 'FRONTEND'
    | 'BACKEND';
}

export interface Schedule {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  scheduleType: ScheduleType;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
  participants: ScheduleParticipant[];
  createdBy: string;
  creatorName: string;
  createdAt: string;
  updatedAt?: string;
  teamScope?: TeamScope; // 회의/스크럼 시 팀 범위
  halfDayType?: HalfDayType; // 반차 시 오전/오후
  usageDate?: string; // 연차/반차 사용일
}

// 일정 타입 라벨
export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  MEETING: '회의',
  SCRUM: '스크럼',
  VACATION: '연차',
  HALF_DAY: '반차',
  OTHER: '기타',
};

// 일정 타입별 색상 (Tailwind CSS 클래스)
export const SCHEDULE_TYPE_COLORS: Record<ScheduleType, string> = {
  MEETING: 'bg-blue-100 text-blue-700 border-blue-200',
  SCRUM: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  VACATION: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  HALF_DAY: 'bg-teal-100 text-teal-700 border-teal-200',
  OTHER: 'bg-slate-100 text-slate-700 border-slate-200',
};

// 캘린더 이벤트 색상 (배경색만)
export const SCHEDULE_TYPE_CALENDAR_COLORS: Record<ScheduleType, string> = {
  MEETING: '#3b82f6', // blue-500
  SCRUM: '#6366f1', // indigo-500
  VACATION: '#71e178', // emerald-500
  HALF_DAY: '#14b8a6', // teal-500
  OTHER: '#64748b', // slate-500
};

// 참가 상태 라벨
export const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
  PENDING: '대기 중',
  ACCEPTED: '수락',
  DECLINED: '거절',
};

// 참가 상태 색상
export const PARTICIPANT_STATUS_COLORS: Record<ParticipantStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
  DECLINED: 'bg-red-100 text-red-700 border-red-200',
};

// 팀 범위 라벨
export const TEAM_SCOPE_LABELS: Record<TeamScope, string> = {
  ALL: '전사 일정',
  PLANNING: '기획팀 일정',
  DESIGN: '디자인팀 일정',
  FRONTEND: '프론트엔드팀 일정',
  BACKEND: '백엔드팀 일정',
};

// 팀 범위 필터 색상 (체크박스용 컬러 도트)
export const TEAM_SCOPE_FILTER_COLORS: Record<TeamScope, string> = {
  ALL: '#F2994A', // Muted Orange
  PLANNING: '#9B51E0', // Soft Purple
  DESIGN: '#2D9CDB', // Calm Blue
  FRONTEND: '#27AE60', // Balanced Green
  BACKEND: '#EB5757', // Soft Red
};

// 반차 타입 라벨
export const HALF_DAY_TYPE_LABELS: Record<HalfDayType, string> = {
  AM: '오전',
  PM: '오후',
};
