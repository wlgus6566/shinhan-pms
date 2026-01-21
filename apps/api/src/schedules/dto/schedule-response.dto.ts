import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleParticipantDto {
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
}

export class ScheduleResponseDto {
  @ApiProperty({ description: 'Schedule ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Project ID' })
  projectId?: string;

  @ApiProperty({ description: 'Schedule title' })
  title: string;

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

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Updated timestamp' })
  updatedAt?: string;
}
