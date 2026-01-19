import { IsNotEmpty, IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AddProjectMemberDto {
  @ApiProperty({
    description: '추가할 멤버의 ID',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;

  @ApiProperty({
    description: '프로젝트 내 역할',
    enum: ['PM', 'PL', 'PA'],
    example: 'PA',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['PM', 'PL', 'PA'])
  role: 'PM' | 'PL' | 'PA';

  @ApiProperty({
    description: '담당 분야',
    enum: ['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'],
    example: 'BACKEND',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'])
  workArea: 'PROJECT_MANAGEMENT' | 'PLANNING' | 'DESIGN' | 'FRONTEND' | 'BACKEND';

  @ApiProperty({
    description: '비고',
    required: false,
    example: '프로젝트 핵심 인원',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  notes?: string;
}
