import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';

export enum Department {
  PLANNING = 'PLANNING',
  DESIGN = 'DESIGN',
  PUBLISHING = 'PUBLISHING',
  DEVELOPMENT = 'DEVELOPMENT',
}

export class SignupDto {
  @ApiProperty({
    example: 'hong.gildong@emotion.co.kr',
    description: '이메일',
  })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요' })
  email: string;

  @ApiProperty({
    example: 'Test1234!',
    description: '비밀번호 (최소 8자, 영문+숫자+특수문자)',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다',
  })
  password: string;

  @ApiProperty({
    example: '홍길동',
    description: '이름',
  })
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다' })
  @MaxLength(50, { message: '이름은 최대 50자까지 입력 가능합니다' })
  name: string;

  @ApiProperty({
    example: 'DEVELOPMENT',
    description: '파트',
    enum: Department,
  })
  @IsEnum(Department, { message: '올바른 파트를 선택해주세요' })
  department: Department;
}
