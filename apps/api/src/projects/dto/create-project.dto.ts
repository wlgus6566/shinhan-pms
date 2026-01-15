import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, Length, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: '프로젝트명',
    example: '신한카드 PMS',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100, { message: '프로젝트명은 2-100자 사이여야 합니다' })
  projectName: string;

  @ApiProperty({
    description: '프로젝트 설명',
    example: '프로젝트 관리 시스템 개발',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '설명은 최대 1000자까지 입력 가능합니다' })
  description?: string;

  @ApiProperty({
    description: '시작일',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '시작일은 YYYY-MM-DD 형식이어야 합니다' })
  startDate?: string;

  @ApiProperty({
    description: '종료일',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '종료일은 YYYY-MM-DD 형식이어야 합니다' })
  endDate?: string;
}
