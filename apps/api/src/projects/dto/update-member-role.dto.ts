import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectMemberRoleDto {
  @ApiProperty({
    description: '변경할 프로젝트 역할',
    enum: ['PM', 'PL', 'PA'],
    example: 'PL',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['PM', 'PL', 'PA'])
  role: 'PM' | 'PL' | 'PA';

  @ApiProperty({
    description: '담당 분야',
    enum: ['PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'],
    example: 'BACKEND',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'])
  workArea?: 'PLANNING' | 'DESIGN' | 'FRONTEND' | 'BACKEND';
}
