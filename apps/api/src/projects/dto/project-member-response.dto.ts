import { ApiProperty } from '@nestjs/swagger';
import type { ProjectMember, UserDetailInfo } from '@repo/schema';

class UserDetailInfoDto implements UserDetailInfo {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '사용자 이름' })
  name: string;

  @ApiProperty({ description: '사용자 이메일' })
  email: string;

  @ApiProperty({ description: '부서' })
  department: string;

  @ApiProperty({ description: '직급', required: false })
  position?: string;

  @ApiProperty({ description: '역할' })
  role: string;
}

export class ProjectMemberResponseDto implements ProjectMember {
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
    enum: ['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'PUBLISHING', 'FRONTEND', 'BACKEND'],
  })
  workArea: string;

  @ApiProperty({ description: '비고', required: false })
  notes?: string;

  @ApiProperty({
    description: '멤버 정보',
    type: UserDetailInfoDto,
    required: false,
  })
  member?: UserDetailInfo;

  @ApiProperty({ description: '생성일시' })
  createdAt: string;

  @ApiProperty({ description: '수정일시', required: false })
  updatedAt?: string;
}
