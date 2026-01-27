import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Schedule, ScheduleParticipant } from '@repo/schema';

export class ScheduleParticipantDto implements ScheduleParticipant {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({
    description: 'Participation status',
    enum: ['PENDING', 'ACCEPTED', 'DECLINED']
  })
  status: string;

  @ApiPropertyOptional({ description: 'Work area' })
  workArea?: string;
}

export class ScheduleResponseDto implements Schedule {
  @ApiProperty({ description: 'Schedule ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Project ID' })
  projectId?: string;

  @ApiPropertyOptional({ description: 'Schedule title' })
  title?: string;

  @ApiPropertyOptional({ description: 'Schedule description' })
  description?: string;

  @ApiProperty({
    description: 'Schedule type',
    enum: ['MEETING', 'SCRUM', 'VACATION', 'HALF_DAY', 'OTHER']
  })
  scheduleType: string;

  @ApiProperty({ description: 'Start date and time' })
  startDate: string;

  @ApiProperty({ description: 'End date and time' })
  endDate: string;

  @ApiPropertyOptional({ description: 'Location' })
  location?: string;

  @ApiProperty({ description: 'Is all-day event' })
  isAllDay: boolean;

  @ApiPropertyOptional({ description: 'Calendar color' })
  color?: string;

  @ApiProperty({ description: 'Participants', type: [ScheduleParticipantDto] })
  participants: ScheduleParticipantDto[];

  @ApiProperty({ description: 'Creator user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Creator user name' })
  creatorName: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Updated timestamp' })
  updatedAt?: string;

  @ApiPropertyOptional({
    description: 'Team scope for meetings/scrums',
    enum: ['ALL', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND']
  })
  teamScope?: string;

  @ApiPropertyOptional({
    description: 'Half day type (AM/PM) for half-day vacations',
    enum: ['AM', 'PM']
  })
  halfDayType?: string;

  @ApiPropertyOptional({ description: 'Usage date for vacation/half-day' })
  usageDate?: string;
}
