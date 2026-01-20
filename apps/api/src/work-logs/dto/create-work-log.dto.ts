import { IsString, IsOptional, IsNumber, IsDateString, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateWorkLogDto {
  @ApiProperty({ description: '작업 날짜', example: '2026-01-20' })
  @IsDateString({}, { message: '작업 날짜는 YYYY-MM-DD 형식이어야 합니다' })
  workDate: string;

  @ApiProperty({ description: '작업 내용', example: '메인 페이지 UI 구현 완료' })
  @IsString()
  @MaxLength(2000, { message: '작업 내용은 최대 2000자까지 입력 가능합니다' })
  content: string;

  @ApiProperty({ description: '작업 시간 (시간 단위, 0.5~24.0)', required: false, example: 4.5 })
  @IsOptional()
  @IsNumber()
  @Min(0.5, { message: '작업 시간은 최소 0.5시간입니다' })
  @Max(24, { message: '작업 시간은 최대 24시간입니다' })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  workHours?: number;

  @ApiProperty({ description: '진행률 (0~100)', required: false, example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '진행률은 최소 0%입니다' })
  @Max(100, { message: '진행률은 최대 100%입니다' })
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  progress?: number;

  @ApiProperty({ description: '이슈/블로커', required: false, example: 'API 연동 지연으로 인한 일정 조정 필요' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '이슈 내용은 최대 1000자까지 입력 가능합니다' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  issues?: string;
}
