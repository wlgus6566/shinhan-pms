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
import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import { UpdateWorkLogDto } from './dto/update-work-log.dto';
import { WorkLogResponseDto } from './dto/work-log-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('WorkLogs')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkLogsController {
  constructor(private readonly workLogsService: WorkLogsService) {}

  @Post('tasks/:taskId/work-logs')
  @ApiOperation({ summary: '업무일지 작성' })
  @ApiParam({ name: 'taskId', description: '업무 ID' })
  @ApiBody({ type: CreateWorkLogDto })
  @ApiResponse({
    status: 201,
    description: '업무일지가 작성되었습니다',
    type: WorkLogResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '담당자만 작성 가능합니다' })
  @ApiResponse({ status: 404, description: '업무를 찾을 수 없습니다' })
  @ApiResponse({ status: 409, description: '해당 날짜에 이미 일지가 존재합니다' })
  async create(
    @Param('taskId') taskId: string,
    @Body() createWorkLogDto: CreateWorkLogDto,
    @CurrentUser() user: any,
  ) {
    const workLog = await this.workLogsService.create(
      BigInt(taskId),
      BigInt(user.id),
      createWorkLogDto,
    );
    return this.transformWorkLog(workLog);
  }

  @Get('tasks/:taskId/work-logs')
  @ApiOperation({ summary: '업무별 일지 목록 조회' })
  @ApiParam({ name: 'taskId', description: '업무 ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작일 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료일 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '업무일지 목록',
    type: [WorkLogResponseDto],
  })
  async findByTask(
    @Param('taskId') taskId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const workLogs = await this.workLogsService.findByTask(
      BigInt(taskId),
      startDate,
      endDate,
    );
    return workLogs.map((log) => this.transformWorkLog(log));
  }

  @Get('work-logs/my')
  @ApiOperation({ summary: '내 업무일지 목록 조회' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작일 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료일 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '내 업무일지 목록',
    type: [WorkLogResponseDto],
  })
  async findMyWorkLogs(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
  ) {
    const workLogs = await this.workLogsService.findByUser(
      BigInt(user.id),
      startDate,
      endDate,
    );
    return workLogs.map((log) => this.transformWorkLog(log));
  }

  @Get('work-logs/my-tasks')
  @ApiOperation({ summary: '내가 담당하는 업무 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 담당 업무 목록',
  })
  async findMyTasks(@CurrentUser() user: any) {
    const tasks = await this.workLogsService.findMyTasks(BigInt(user.id));
    return tasks.map((task) => this.transformTask(task));
  }

  @Get('projects/:projectId/work-logs')
  @ApiOperation({ summary: '프로젝트 팀 업무일지 조회' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작일 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료일 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '프로젝트 팀 업무일지 목록',
    type: [WorkLogResponseDto],
  })
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const workLogs = await this.workLogsService.findByProject(
      BigInt(projectId),
      startDate,
      endDate,
    );
    return workLogs.map((log) => this.transformWorkLog(log));
  }

  @Get('work-logs/:id')
  @ApiOperation({ summary: '업무일지 상세 조회' })
  @ApiParam({ name: 'id', description: '업무일지 ID' })
  @ApiResponse({
    status: 200,
    description: '업무일지 상세 정보',
    type: WorkLogResponseDto,
  })
  @ApiResponse({ status: 404, description: '업무일지를 찾을 수 없습니다' })
  async findOne(@Param('id') id: string) {
    const workLog = await this.workLogsService.findOne(BigInt(id));
    return this.transformWorkLog(workLog);
  }

  @Patch('work-logs/:id')
  @ApiOperation({ summary: '업무일지 수정' })
  @ApiParam({ name: 'id', description: '업무일지 ID' })
  @ApiBody({ type: UpdateWorkLogDto })
  @ApiResponse({
    status: 200,
    description: '업무일지가 수정되었습니다',
    type: WorkLogResponseDto,
  })
  @ApiResponse({ status: 403, description: '본인만 수정 가능합니다' })
  @ApiResponse({ status: 404, description: '업무일지를 찾을 수 없습니다' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkLogDto: UpdateWorkLogDto,
    @CurrentUser() user: any,
  ) {
    const workLog = await this.workLogsService.update(
      BigInt(id),
      BigInt(user.id),
      updateWorkLogDto,
    );
    return this.transformWorkLog(workLog);
  }

  @Delete('work-logs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '업무일지 삭제' })
  @ApiParam({ name: 'id', description: '업무일지 ID' })
  @ApiResponse({ status: 204, description: '업무일지가 삭제되었습니다' })
  @ApiResponse({ status: 403, description: '본인만 삭제 가능합니다' })
  @ApiResponse({ status: 404, description: '업무일지를 찾을 수 없습니다' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.workLogsService.remove(BigInt(id), BigInt(user.id));
  }

  private transformWorkLog(workLog: any): any {
    return {
      id: workLog.id.toString(),
      taskId: workLog.taskId.toString(),
      userId: workLog.userId.toString(),
      workDate: workLog.workDate.toISOString().split('T')[0],
      content: workLog.content,
      workHours: workLog.workHours ? Number(workLog.workHours) : null,
      progress: workLog.progress,
      issues: workLog.issues,
      task: workLog.task
        ? {
            id: workLog.task.id.toString(),
            taskName: workLog.task.taskName,
            projectId: workLog.task.projectId.toString(),
          }
        : undefined,
      user: workLog.user
        ? {
            id: workLog.user.id.toString(),
            name: workLog.user.name,
            email: workLog.user.email,
          }
        : undefined,
      createdAt: workLog.createdAt.toISOString(),
      updatedAt: workLog.updatedAt?.toISOString(),
    };
  }

  private transformTask(task: any): any {
    return {
      id: task.id.toString(),
      projectId: task.projectId.toString(),
      taskName: task.taskName,
      description: task.description,
      difficulty: task.difficulty,
      status: task.status,
      startDate: task.startDate?.toISOString().split('T')[0],
      endDate: task.endDate?.toISOString().split('T')[0],
      project: task.project
        ? {
            id: task.project.id.toString(),
            projectName: task.project.projectName,
          }
        : undefined,
    };
  }
}
