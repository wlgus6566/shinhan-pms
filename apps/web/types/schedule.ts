export type ScheduleType = 'MEETING' | 'SCRUM' | 'VACATION' | 'HALF_DAY' | 'OTHER';

export type ParticipantStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface ScheduleParticipant {
  id: string;
  name: string;
  email: string;
  status: ParticipantStatus;
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
  createdAt: string;
  updatedAt?: string;
}

export interface CreateScheduleRequest {
  projectId?: string;
  title: string;
  description?: string;
  scheduleType: ScheduleType;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
  participantIds?: string[];
}

export interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  scheduleType?: ScheduleType;
  startDate?: string;
  endDate?: string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
  participantIds?: string[];
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
  MEETING: '#3b82f6',      // blue-500
  SCRUM: '#6366f1',        // indigo-500
  VACATION: '#10b981',     // emerald-500
  HALF_DAY: '#14b8a6',     // teal-500
  OTHER: '#64748b',        // slate-500
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
