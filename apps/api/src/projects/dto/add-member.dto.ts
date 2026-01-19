import { IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    enum: ['PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'],
    example: 'BACKEND',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'])
  workArea: 'PLANNING' | 'DESIGN' | 'FRONTEND' | 'BACKEND';
}
