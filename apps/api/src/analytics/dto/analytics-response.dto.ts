import { ApiProperty } from '@nestjs/swagger';
import type {
  ProductivityStats,
  WorkHoursTrendItem,
  WorkAreaDistributionItem,
  MemberWorkloadItem,
  ProjectProgressItem,
  PartMemberStats,
  PartTaskCount,
  PartMemberWorkHours,
  PartWorkHours,
  WorkArea,
} from '@repo/schema';

export class ProductivityStatsDto implements ProductivityStats {
  @ApiProperty({ description: '총 작업 시간', example: 160.5 })
  totalWorkHours: number;

  @ApiProperty({ description: '완료한 업무 수', example: 12 })
  completedTasks: number;

  @ApiProperty({ description: '평균 진행률', example: 75 })
  averageProgress: number;

  @ApiProperty({ description: '이슈 발생 건수', example: 3 })
  issueCount: number;
}

export class WorkHoursTrendItemDto implements WorkHoursTrendItem {
  @ApiProperty({ description: '날짜 (YYYY-MM-DD)', example: '2026-01-20' })
  date: string;

  @ApiProperty({ description: '작업 시간', example: 8.5 })
  workHours: number;
}

export class WorkAreaDistributionItemDto implements WorkAreaDistributionItem {
  @ApiProperty({ description: '작업 분야', example: 'FRONTEND' })
  workArea: string;

  @ApiProperty({ description: '작업 시간', example: 80 })
  hours: number;

  @ApiProperty({ description: '비율 (%)', example: 50 })
  percentage: number;
}

export class MemberWorkloadItemDto implements MemberWorkloadItem {
  @ApiProperty({ description: '사용자 ID', example: '1' })
  userId: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  userName: string;

  @ApiProperty({ description: '작업 시간', example: 160 })
  workHours: number;

  @ApiProperty({ description: '업무 수', example: 12 })
  taskCount: number;

  @ApiProperty({ description: '평균 진행률', example: 75 })
  averageProgress: number;
}

export class ProjectProgressItemDto implements ProjectProgressItem {
  @ApiProperty({ description: '프로젝트 ID', example: '1' })
  projectId: string;

  @ApiProperty({ description: '프로젝트명', example: '프로젝트 A' })
  projectName: string;

  @ApiProperty({ description: '평균 진행률', example: 62.5 })
  averageProgress: number;

  @ApiProperty({ description: '완료 업무 수', example: 2 })
  completedTasks: number;

  @ApiProperty({ description: '진행 중 업무 수', example: 1 })
  inProgressTasks: number;

  @ApiProperty({ description: '대기 중 업무 수', example: 1 })
  waitingTasks: number;
}

export class PartMemberStatsDto implements PartMemberStats {
  @ApiProperty({ description: '사용자 ID', example: '1' })
  userId: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  userName: string;

  @ApiProperty({ description: '담당 업무 건수', example: 12 })
  taskCount: number;
}

export class PartTaskCountDto implements PartTaskCount {
  @ApiProperty({ description: '작업 분야', example: 'FRONTEND' })
  workArea: WorkArea;

  @ApiProperty({ description: '파트 멤버별 통계', type: [PartMemberStatsDto] })
  members: PartMemberStatsDto[];

  @ApiProperty({ description: '파트 전체 업무 건수', example: 48 })
  totalCount: number;

  @ApiProperty({ description: '인당 평균 업무 건수', example: 12 })
  averageCount: number;
}

export class PartMemberWorkHoursDto implements PartMemberWorkHours {
  @ApiProperty({ description: '사용자 ID', example: '1' })
  userId: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  userName: string;

  @ApiProperty({ description: '일일 평균 근무 시간', example: 7.5 })
  avgHours: number;
}

export class PartWorkHoursDto implements PartWorkHours {
  @ApiProperty({ description: '작업 분야', example: 'FRONTEND' })
  workArea: WorkArea;

  @ApiProperty({ description: '파트 멤버별 근무 시간', type: [PartMemberWorkHoursDto] })
  members: PartMemberWorkHoursDto[];

  @ApiProperty({ description: '파트 평균 근무 시간', example: 7.85 })
  partAvgHours: number;
}
