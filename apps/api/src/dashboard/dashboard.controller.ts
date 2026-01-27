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
  @ApiOperation({ summary: '대시보드 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '대시보드 통계 (프로젝트, 업무, 작업 시간)',
  })
  async getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(BigInt(user.id), user.role);
  }

  @Get('activities')
  @ApiOperation({ summary: '최근 활동 조회' })
  @ApiResponse({
    status: 200,
    description: '최근 업무일지 및 업무 생성 활동',
  })
  async getRecentActivities(@CurrentUser() user: any) {
    const activities = await this.dashboardService.getRecentActivities(
      BigInt(user.id),
      user.role,
      10,
    );

    return activities.map((activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
    }));
  }

  @Get('schedules')
  @ApiOperation({ summary: '다가오는 일정 조회' })
  @ApiResponse({
    status: 200,
    description: '다가오는 일정 목록 (최대 5개)',
  })
  async getUpcomingSchedules(@CurrentUser() user: any) {
    return this.dashboardService.getUpcomingSchedules(BigInt(user.id), 5);
  }
}
