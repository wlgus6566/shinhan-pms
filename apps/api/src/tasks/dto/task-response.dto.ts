import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({ description: '업무 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '프로젝트 ID', example: '1' })
  projectId: string;

  @ApiProperty({ description: '업무명', example: '회원가입 기능 개발' })
  taskName: string;

  @ApiProperty({ description: '설명', required: false })
  description?: string;

  @ApiProperty({ description: '중요도', enum: ['HIGH', 'MEDIUM', 'LOW'] })
  difficulty: string;

  @ApiProperty({ description: '클라이언트명', required: false })
  clientName?: string;

  @ApiProperty({ description: '기획 담당자 ID', required: false })
  planningAssigneeId?: string;

  @ApiProperty({ description: '디자인 담당자 ID', required: false })
  designAssigneeId?: string;

  @ApiProperty({ description: '프론트엔드 담당자 ID', required: false })
  frontendAssigneeId?: string;

  @ApiProperty({ description: '백엔드 담당자 ID', required: false })
  backendAssigneeId?: string;

  @ApiProperty({ description: '상태', enum: ['TODO', 'IN_PROGRESS', 'DONE'] })
  status: string;

  @ApiProperty({ description: '시작일', required: false })
  startDate?: Date;

  @ApiProperty({ description: '종료일', required: false })
  endDate?: Date;

  @ApiProperty({ description: '비고', required: false })
  notes?: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', required: false })
  updatedAt?: Date;
}
