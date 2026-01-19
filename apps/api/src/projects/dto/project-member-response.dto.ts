import { ApiProperty } from '@nestjs/swagger';

export class ProjectMemberResponseDto {
  @ApiProperty({ description: '프로젝트 멤버 ID' })
  id: string;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: string;

  @ApiProperty({ description: '멤버 ID' })
  memberId: string;

  @ApiProperty({ description: '프로젝트 역할', enum: ['PM', 'PL', 'PA'] })
  role: string;

  @ApiProperty({
    description: '담당 분야',
    enum: ['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'],
  })
  workArea: string;

  @ApiProperty({ description: '비고', required: false })
  notes?: string;

  @ApiProperty({ description: '멤버 정보', required: false })
  member?: {
    id: string;
    name: string;
    email: string;
    department: string;
    position?: string;
    role: string;
  };

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', required: false })
  updatedAt?: Date;
}
