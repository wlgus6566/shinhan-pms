import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'hong.gildong@shinhancard.com',
    description: '이메일',
  })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요' })
  email: string;

  @ApiProperty({
    example: 'Test1234!',
    description: '비밀번호',
  })
  @IsString()
  password: string;
}
