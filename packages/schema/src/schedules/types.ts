/**
 * Schedules - Response 타입 정의
 */

import { z } from 'zod';
import { AuditFieldsSchema } from '../common/types';

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

export const ScheduleParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.string(),
  workArea: z.string().optional(),
});

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

export const ScheduleSchema = z
  .object({
    id: z.string(),
    projectId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    scheduleType: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().optional(),
    isAllDay: z.boolean(),
    color: z.string().optional(),
    participants: z.array(ScheduleParticipantSchema),
    createdBy: z.string(),
    creatorName: z.string(),
    teamScope: z.string().optional(),
    halfDayType: z.string().optional(),
    usageDate: z.string().optional(),
  })
  .merge(AuditFieldsSchema);
