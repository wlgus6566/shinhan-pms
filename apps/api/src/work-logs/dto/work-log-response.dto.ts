import { ApiProperty } from '@nestjs/swagger';

export class WorkLogUserDto {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '사용자 이름' })
  name: string;

  @ApiProperty({ description: '사용자 이메일' })
  email: string;
}

export class WorkLogTaskDto {
  @ApiProperty({ description: '업무 ID' })
  id: string;

  @ApiProperty({ description: '업무명' })
  taskName: string;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: string;
}

export class WorkLogResponseDto {
  @ApiProperty({ description: '업무일지 ID' })
  id: string;

  @ApiProperty({ description: '업무 ID' })
  taskId: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '작업 날짜', example: '2026-01-20' })
  workDate: string;

  @ApiProperty({ description: '작업 내용' })
  content: string;

  @ApiProperty({ description: '작업 시간', required: false })
  workHours?: number;

  @ApiProperty({ description: '진행률', required: false })
  progress?: number;

  @ApiProperty({ description: '이슈/블로커', required: false })
  issues?: string;

  @ApiProperty({ description: '업무 정보', type: WorkLogTaskDto, required: false })
  task?: WorkLogTaskDto;

  @ApiProperty({ description: '작성자 정보', type: WorkLogUserDto, required: false })
  user?: WorkLogUserDto;

  @ApiProperty({ description: '생성일시' })
  createdAt: string;

  @ApiProperty({ description: '수정일시', required: false })
  updatedAt?: string;
}
