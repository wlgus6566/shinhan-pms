import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Department } from '../../auth/dto/signup.dto';

export enum Role {
  PM = 'PM',
  PL = 'PL',
  PA = 'PA',
  MEMBER = 'MEMBER',
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'DEVELOPMENT',
    description: '파트',
    enum: Department,
    required: false,
  })
  @IsOptional()
  @IsEnum(Department, { message: '올바른 파트를 선택해주세요' })
  department?: Department;

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
