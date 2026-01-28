import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ProductivityStatsDto,
  WorkHoursTrendItemDto,
  WorkAreaDistributionItemDto,
  MemberWorkloadItemDto,
  ProjectProgressItemDto,
} from './dto/analytics-response.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * 개인 생산성 통계 조회
   * GET /analytics/my-productivity?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&projectId=optional
   */
  @Get('my-productivity')
  async getMyProductivity(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('projectId') projectId?: string,
  ) {
    const userId = req.user.userId;
    const stats = await this.analyticsService.getMyProductivity(
      userId,
      startDate,
      endDate,
      projectId,
    );
    return stats;
  }

  /**
   * 프로젝트 리포트 통계 조회 (PM/SUPER_ADMIN)
   * GET /analytics/team-productivity?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&projectId=optional
   */
  @Get('team-productivity')
  @Roles('PM', 'SUPER_ADMIN')
  async getTeamProductivity(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('projectId') projectId?: string,
  ) {
    const memberWorkload = await this.analyticsService.getMemberWorkload(
      startDate,
      endDate,
      projectId,
    );
    const totalWorkHours = memberWorkload.reduce(
      (sum, item) => sum + item.workHours,
      0,
    );

    return {
      totalWorkHours,
      memberWorkload,
    };
  }

  /**
   * 작업 시간 트렌드 조회
   * GET /analytics/work-hours-trend?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&groupBy=day|week|month&projectId=optional&userId=optional
   */
  @Get('work-hours-trend')
  async getWorkHoursTrend(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
  ) {
    // 일반 사용자는 자신의 데이터만, PM/SUPER_ADMIN은 특정 사용자 지정 가능
    const targetUserId =
      req.user.role === 'PM' || req.user.role === 'SUPER_ADMIN'
        ? userId
          ? BigInt(userId)
          : undefined
        : req.user.userId;

    const trend = await this.analyticsService.getWorkHoursTrend(
      startDate,
      endDate,
      groupBy,
      projectId,
      targetUserId,
    );
    return trend;
  }

  /**
   * 업무 완료율 추이 조회
   * GET /analytics/completion-trend?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&groupBy=day|week|month&projectId=optional
   */
  @Get('completion-trend')
  async getCompletionTrend(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
    @Query('projectId') projectId?: string,
  ) {
    // TODO: Implement completion trend logic
    return [];
  }

  /**
   * 분야별 작업 시간 분포 조회
   * GET /analytics/work-area-distribution?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&projectId=optional&userId=optional
   */
  @Get('work-area-distribution')
  async getWorkAreaDistribution(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
  ) {
    const targetUserId =
      req.user.role === 'PM' || req.user.role === 'SUPER_ADMIN'
        ? userId
          ? BigInt(userId)
          : undefined
        : req.user.userId;

    const distribution = await this.analyticsService.getWorkAreaDistribution(
      startDate,
      endDate,
      projectId,
      targetUserId,
    );
    return { distribution };
  }

  /**
   * 팀원별 업무 부하 조회 (PM/SUPER_ADMIN)
   * GET /analytics/member-workload?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&projectId=optional
   */
  @Get('member-workload')
  @Roles('PM', 'SUPER_ADMIN')
  async getMemberWorkload(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('projectId') projectId?: string,
  ) {
    const workload = await this.analyticsService.getMemberWorkload(
      startDate,
      endDate,
      projectId,
    );
    return workload;
  }

  /**
   * 프로젝트 진행률 조회
   * GET /analytics/project-progress?projectId=optional
   */
  @Get('project-progress')
  async getProjectProgress(@Query('projectId') projectId?: string) {
    const progress = await this.analyticsService.getProjectProgress(projectId);
    return progress;
  }

  /**
   * 이슈 발생 빈도 조회
   * GET /analytics/issue-frequency?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&projectId=optional
   */
  @Get('issue-frequency')
  async getIssueFrequency(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('projectId') projectId?: string,
  ) {
    const frequency = await this.analyticsService.getIssueFrequency(
      startDate,
      endDate,
      projectId,
    );
    return frequency;
  }

  /**
   * 파트별 담당 업무 건수 조회
   * GET /analytics/part-task-count?projectId=X&yearMonth=YYYY-MM
   */
  @Get('part-task-count')
  async getPartTaskCount(
    @Query('projectId') projectId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    if (!projectId || !yearMonth) {
      throw new BadRequestException('projectId와 yearMonth는 필수입니다');
    }

    const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!yearMonthRegex.test(yearMonth)) {
      throw new BadRequestException('yearMonth는 YYYY-MM 형식이어야 합니다');
    }

    const result = await this.analyticsService.getPartTaskCount(
      projectId,
      yearMonth,
    );
    return result;
  }

  /**
   * 파트별 일일 평균 근무 시간 조회
   * GET /analytics/part-work-hours?projectId=X&yearMonth=YYYY-MM
   */
  @Get('part-work-hours')
  async getPartWorkHours(
    @Query('projectId') projectId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    if (!projectId || !yearMonth) {
      throw new BadRequestException('projectId와 yearMonth는 필수입니다');
    }

    const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!yearMonthRegex.test(yearMonth)) {
      throw new BadRequestException('yearMonth는 YYYY-MM 형식이어야 합니다');
    }

    const result = await this.analyticsService.getPartWorkHours(
      projectId,
      yearMonth,
    );
    return result;
  }

  /**
   * 상태별 진행 건수 조회
   * GET /analytics/task-status-count?projectId=X&yearMonth=YYYY-MM
   */
  @Get('task-status-count')
  async getTaskStatusCount(
    @Query('projectId') projectId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    if (!projectId || !yearMonth) {
      throw new BadRequestException('projectId와 yearMonth는 필수입니다');
    }

    const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!yearMonthRegex.test(yearMonth)) {
      throw new BadRequestException('yearMonth는 YYYY-MM 형식이어야 합니다');
    }

    const result = await this.analyticsService.getTaskStatusCount(
      projectId,
      yearMonth,
    );
    return result;
  }
}
