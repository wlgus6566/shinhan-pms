import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseCode } from '../common/decorators/response.decorator';

@ApiTags('Schedules')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('schedules')
  @ResponseCode('SUC002')
  @ApiOperation({ summary: '개인 일정 생성' })
  @ApiBody({ type: CreateScheduleDto })
  @ApiResponse({
    status: 201,
    description: '일정이 생성되었습니다',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async createPersonalSchedule(
    @Body() createScheduleDto: CreateScheduleDto,
    @CurrentUser() user: any,
  ) {
    const schedule = await this.schedulesService.create(
      BigInt(user.id),
      createScheduleDto,
    );
    return this.transformSchedule(schedule);
  }

  @Get('schedules/my')
  @ApiOperation({ summary: '내 일정 목록 조회' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작일 (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료일 (ISO 8601)' })
  @ApiResponse({
    status: 200,
    description: '내 일정 목록',
    type: [ScheduleResponseDto],
  })
  async findMySchedules(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    const schedules = await this.schedulesService.findByUser(
      BigInt(user.id),
      startDate,
      endDate,
    );
    return schedules.map((schedule) => this.transformSchedule(schedule));
  }

  @Get('schedules/:id')
  @ApiOperation({ summary: '일정 상세 조회' })
  @ApiParam({ name: 'id', description: '일정 ID' })
  @ApiResponse({
    status: 200,
    description: '일정 상세 정보',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없습니다' })
  async findOne(@Param('id') id: string) {
    const schedule = await this.schedulesService.findOne(BigInt(id));
    return this.transformSchedule(schedule);
  }

  @Patch('schedules/:id')
  @ApiOperation({ summary: '일정 수정' })
  @ApiParam({ name: 'id', description: '일정 ID' })
  @ApiBody({ type: UpdateScheduleDto })
  @ApiResponse({
    status: 200,
    description: '일정이 수정되었습니다',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 403, description: '본인만 수정 가능합니다' })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없습니다' })
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @CurrentUser() user: any,
  ) {
    const schedule = await this.schedulesService.update(
      BigInt(id),
      BigInt(user.id),
      updateScheduleDto,
    );
    return this.transformSchedule(schedule);
  }

  @Delete('schedules/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseCode('SUC003')
  @ApiOperation({ summary: '일정 삭제' })
  @ApiParam({ name: 'id', description: '일정 ID' })
  @ApiResponse({ status: 200, description: '일정이 삭제되었습니다' })
  @ApiResponse({ status: 403, description: '본인만 삭제 가능합니다' })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없습니다' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.schedulesService.remove(BigInt(id), BigInt(user.id));
    return null;
  }

  @Patch('schedules/:id/participate')
  @ApiOperation({ summary: '일정 참가 상태 업데이트' })
  @ApiParam({ name: 'id', description: '일정 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ACCEPTED', 'DECLINED'],
          description: '참가 상태',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '참가 상태가 업데이트되었습니다',
  })
  @ApiResponse({ status: 404, description: '일정 또는 참가자를 찾을 수 없습니다' })
  async updateParticipationStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACCEPTED' | 'DECLINED',
    @CurrentUser() user: any,
  ) {
    await this.schedulesService.updateParticipantStatus(
      BigInt(id),
      BigInt(user.id),
      status,
    );
    return { message: '참가 상태가 업데이트되었습니다' };
  }

  private transformSchedule(schedule: any): any {
    // 🔍 디버깅: Prisma 결과 확인
    console.log('🔍 [SchedulesController] transformSchedule Schedule raw data:', {
      id: schedule.id,
      title: schedule.title,
      teamScope: schedule.teamScope,
      hasTeamScope: 'teamScope' in schedule,
      allKeys: Object.keys(schedule),
    });

    const result = {
      id: schedule.id.toString(),
      projectId: schedule.projectId?.toString(),
      title: schedule.title,
      description: schedule.description,
      scheduleType: schedule.scheduleType,
      startDate: schedule.startDate.toISOString(),
      endDate: schedule.endDate.toISOString(),
      location: schedule.location,
      isAllDay: schedule.isAllDay,
      color: schedule.color,
      teamScope: schedule.teamScope,
      halfDayType: schedule.halfDayType,
      usageDate: schedule.usageDate?.toISOString().split('T')[0],
      participants: schedule.participants?.map((p: any) => ({
        id: p.user.id.toString(),
        name: p.user.name,
        email: p.user.email,
        status: p.status,
      })) || [],
      createdBy: schedule.createdBy.toString(),
      creatorName: schedule.creator?.name || '',
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt?.toISOString(),
    };

    console.log('🔍 [transformSchedule] Transformed result:', {
      id: result.id,
      teamScope: result.teamScope,
      hasTeamScope: 'teamScope' in result,
    });

    return result;
  }
}
