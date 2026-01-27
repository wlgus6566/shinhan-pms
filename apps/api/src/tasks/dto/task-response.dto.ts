import { ApiProperty } from '@nestjs/swagger';
import type { Task, UserBasicInfo } from '@repo/schema';

class UserBasicInfoDto implements UserBasicInfo {
  @ApiProperty({ description: '사용자 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  name: string;

  @ApiProperty({ description: '사용자 이메일', example: 'hong@example.com' })
  email: string;
}

export class TaskResponseDto implements Task {
  @ApiProperty({ description: '업무 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '프로젝트 ID', example: '1' })
  projectId: string;

  @ApiProperty({ description: '업무명', example: '회원가입 기능 개발' })
  taskName: string;

  @ApiProperty({ description: '설명', required: false })
  description?: string;

  @ApiProperty({ description: '난이도', enum: ['HIGH', 'MEDIUM', 'LOW'] })
  difficulty: string;

  @ApiProperty({ description: '클라이언트명', required: false })
  clientName?: string;

  @ApiProperty({ description: '기획 담당자 목록', type: [UserBasicInfoDto], required: false })
  planningAssignees?: UserBasicInfo[];

  @ApiProperty({ description: '디자인 담당자 목록', type: [UserBasicInfoDto], required: false })
  designAssignees?: UserBasicInfo[];

  @ApiProperty({ description: '프론트엔드 담당자 목록', type: [UserBasicInfoDto], required: false })
  frontendAssignees?: UserBasicInfo[];

  @ApiProperty({ description: '백엔드 담당자 목록', type: [UserBasicInfoDto], required: false })
  backendAssignees?: UserBasicInfo[];

  @ApiProperty({ description: '상태', enum: ['TODO', 'IN_PROGRESS', 'DONE'] })
  status: string;

  @ApiProperty({ description: '시작일', required: false })
  startDate?: string;

  @ApiProperty({ description: '종료일', required: false })
  endDate?: string;

  @ApiProperty({ description: '오픈일(상용배포일)', required: false })
  openDate?: string;

  @ApiProperty({ description: '비고', required: false })
  notes?: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: string;

  @ApiProperty({ description: '수정일시', required: false })
  updatedAt?: string;
}
