import { IsString, IsOptional, IsNumber, IsIn, Length, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ description: '작업명', example: '메인 페이지 개발' })
  @IsString()
  @Length(2, 100, { message: '작업명은 2-100자 사이여야 합니다' })
  taskName: string;

  @ApiProperty({ description: '작업내용', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '작업내용은 최대 1000자까지 입력 가능합니다' })
  description?: string;

  @ApiProperty({ description: '난이도', enum: ['HIGH', 'MEDIUM', 'LOW'] })
  @IsString()
  @IsIn(['HIGH', 'MEDIUM', 'LOW'], { message: '난이도는 HIGH, MEDIUM, LOW 중 하나여야 합니다' })
  difficulty: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({ description: '담당 RM (고객사 이름)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '담당 RM은 최대 100자까지 입력 가능합니다' })
  clientName?: string;

  @ApiProperty({ description: '기획 담당자 ID', required: false })
  @IsOptional()
  @IsNumber()
  planningAssigneeId?: number;

  @ApiProperty({ description: '디자인 담당자 ID', required: false })
  @IsOptional()
  @IsNumber()
  designAssigneeId?: number;

  @ApiProperty({ description: '프론트엔드 담당자 ID', required: false })
  @IsOptional()
  @IsNumber()
  frontendAssigneeId?: number;

  @ApiProperty({ description: '백엔드 담당자 ID', required: false })
  @IsOptional()
  @IsNumber()
  backendAssigneeId?: number;

  @ApiProperty({ description: '시작일', required: false, example: '2026-01-20' })
  @IsOptional()
  @IsDateString({}, { message: '시작일은 YYYY-MM-DD 형식이어야 합니다' })
  startDate?: string;

  @ApiProperty({ description: '종료일', required: false, example: '2026-01-30' })
  @IsOptional()
  @IsDateString({}, { message: '종료일은 YYYY-MM-DD 형식이어야 합니다' })
  endDate?: string;

  @ApiProperty({ description: '비고', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  notes?: string;
}
