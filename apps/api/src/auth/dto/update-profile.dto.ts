import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Department } from './signup.dto';

export class UpdateProfileDto {
  @ApiProperty({
    example: '홍길동',
    description: '이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다' })
  @MaxLength(50, { message: '이름은 최대 50자까지 입력 가능합니다' })
  name?: string;

  @ApiProperty({
    example: 'DEVELOPMENT',
    description: '파트',
    enum: Department,
    required: false,
  })
  @IsOptional()
  @IsEnum(Department, { message: '올바른 파트를 선택해주세요' })
  department?: Department;
}
