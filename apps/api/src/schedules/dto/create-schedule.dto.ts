import { IsString, IsOptional, IsBoolean, IsDateString, IsArray, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiPropertyOptional({ description: 'Project ID (optional)' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Schedule title (optional for VACATION/HALF_DAY)', example: '프로젝트 킥오프 미팅' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'Schedule description', example: '프로젝트 시작 회의 및 요구사항 논의' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Schedule type',
    enum: ['MEETING', 'SCRUM', 'VACATION', 'HALF_DAY', 'OTHER'],
    example: 'MEETING'
  })
  @IsString()
  @IsIn(['MEETING', 'SCRUM', 'VACATION', 'HALF_DAY', 'OTHER'])
  scheduleType: string;

  @ApiProperty({ description: 'Start date and time', example: '2026-01-25T09:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date and time', example: '2026-01-25T11:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Location', example: '회의실 A' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Is all-day event', example: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional({ description: 'Calendar color', example: '#3b82f6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Participant user IDs',
    type: [String],
    example: ['1', '2', '3']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];

  @ApiPropertyOptional({
    description: 'Team scope for meetings/scrums',
    enum: ['ALL', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'],
    example: 'ALL'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ALL', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'])
  teamScope?: string;

  @ApiPropertyOptional({
    description: 'Half day type (AM/PM) for half-day vacations',
    enum: ['AM', 'PM'],
    example: 'AM'
  })
  @IsOptional()
  @IsString()
  @IsIn(['AM', 'PM'])
  halfDayType?: string;

  @ApiPropertyOptional({
    description: 'Usage date for vacation/half-day',
    example: '2026-01-25'
  })
  @IsOptional()
  @IsDateString()
  usageDate?: string;
}
