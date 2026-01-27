/**
 * Schedules - Response 타입 정의
 */

// ============================================
// Schedule Participant
// ============================================

export interface ScheduleParticipant {
  id: string;
  name: string;
  email: string;
  status: string;
  workArea?: string;
}

// ============================================
// Schedule Response
// ============================================

export interface Schedule {
  id: string;
  projectId?: string;
  title?: string;
  description?: string;
  scheduleType: string;
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
  teamScope?: string;
  halfDayType?: string;
  usageDate?: string;
}
