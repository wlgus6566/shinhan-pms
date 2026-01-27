import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({ description: '프로젝트 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '프로젝트명', example: '이모션 PMS' })
  name: string;

  @ApiProperty({ description: '클라이언트', example: '신한카드', required: false })
  client?: string;

  @ApiProperty({ description: '프로젝트 타입', enum: ['OPERATION', 'BUILD'] })
  projectType: string;

  @ApiProperty({
    description: '프로젝트 설명',
    example: '프로젝트 관리 시스템 개발',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: '시작일',
    example: '2024-01-01',
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: '종료일',
    example: '2024-12-31',
    required: false,
  })
  endDate?: string;

  @ApiProperty({
    description: '프로젝트 상태',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'COMPLETED', 'SUSPENDED'],
  })
  status: string;

  @ApiProperty({ description: '생성자 ID', example: '1', required: false })
  creatorId?: string;

  @ApiProperty({ description: '생성일시', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-02T00:00:00Z',
    required: false,
  })
  updatedAt?: Date;
}
