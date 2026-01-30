import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '대시보드 통합 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '대시보드 통계 (프로젝트, 업무, 작업 시간, 오늘 통계)',
  })
  async getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(BigInt(user.id), user.role);
  }

  @Get('timeline')
  @ApiOperation({ summary: '대시보드 타임라인 조회' })
  @ApiResponse({
    status: 200,
    description: '최근 활동 및 예정 일정',
  })
  async getTimeline(@CurrentUser() user: any) {
    const timeline = await this.dashboardService.getTimeline(
      BigInt(user.id),
      user.role,
    );

    // 날짜 직렬화
    return {
      recentActivities: timeline.recentActivities.map((activity) => ({
        ...activity,
        createdAt: activity.createdAt.toISOString(),
      })),
      upcomingSchedules: timeline.upcomingSchedules,
    };
  }
}
