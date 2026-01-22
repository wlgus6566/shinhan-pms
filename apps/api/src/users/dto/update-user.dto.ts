import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import type { Department } from '@repo/schema';

export enum Role {
  PM = 'PM',
  PL = 'PL',
  PA = 'PA',
  MEMBER = 'MEMBER',
}

export enum Position {
  DIVISION_HEAD = 'DIVISION_HEAD',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  PRINCIPAL_LEADER = 'PRINCIPAL_LEADER',
  SENIOR_LEADER = 'SENIOR_LEADER',
  LEADER = 'LEADER',
  TEAM_MEMBER = 'TEAM_MEMBER',
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'DEVELOPMENT',
    description: '파트',
    enum: ['PLANNING', 'DESIGN', 'FRONTEND', 'DEVELOPMENT'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PLANNING', 'DESIGN', 'FRONTEND', 'DEVELOPMENT'], { message: '올바른 파트를 선택해주세요' })
  department?: Department;

  @ApiProperty({
    example: 'TEAM_MEMBER',
    description: '직책',
    enum: Position,
    required: false,
  })
  @IsOptional()
  @IsEnum(Position, { message: '올바른 직책을 선택해주세요' })
  position?: Position;

  @ApiProperty({
    example: 'PM',
    description: '등급',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: '올바른 등급을 선택해주세요' })
  role?: Role;

  @ApiProperty({
    example: true,
    description: '활성 상태',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
