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
  StreamableFile,
  Header,
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
import { WorkLogSuggestionsResponseDto } from './dto/work-log-suggestions-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ResponseCode,
  SkipResponseWrapper,
} from '../common/decorators/response.decorator';
import {
  parsePaginationParams,
  createPaginationMeta,
} from '../common/helpers/pagination.helper';

@ApiTags('WorkLogs')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkLogsController {
  constructor(private readonly workLogsService: WorkLogsService) {}

  @Post('tasks/:taskId/work-logs')
  @ResponseCode('SUC002')
  @ApiOperation({ summary: '업무일지 작성' })
  @ApiParam({ name: 'taskId', description: '업무 ID' })
  @ApiBody({ type: CreateWorkLogDto })
  @ApiResponse({
    status: 201,
    description: '업무일지가 작성되었습니다',
    type: WorkLogResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '담당자만 작성 가능 (PM 제외)' })
  @ApiResponse({ status: 404, description: '업무를 찾을 수 없습니다' })
  @ApiResponse({
    status: 409,
    description: '해당 날짜에 이미 일지가 존재합니다',
  })
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

  @Get('tasks/:taskId/work-logs/suggestions')
  @ApiOperation({ summary: '업무별 작업 내용 추천 조회 (본인 작성 내용만)' })
  @ApiParam({ name: 'taskId', description: '업무 ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '최대 개수 (기본값: 10)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '작업 내용 추천 목록',
    type: WorkLogSuggestionsResponseDto,
  })
  async getSuggestions(
    @Param('taskId') taskId: string,
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const suggestions = await this.workLogsService.findContentSuggestions(
      BigInt(taskId),
      BigInt(user.id),
      limitNum,
    );
    return { suggestions };
  }

  @Get('tasks/:taskId/work-logs')
  @ApiOperation({ summary: '업무별 일지 목록 조회' })
  @ApiParam({ name: 'taskId', description: '업무 ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '시작일 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '종료일 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'pageNum',
    required: false,
    description: '페이지 번호',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '페이지당 개수',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '업무일지 목록',
    type: [WorkLogResponseDto],
  })
  async findByTask(
    @Param('taskId') taskId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('pageNum') pageNum?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pagination = parsePaginationParams({ pageNum, pageSize });

    const { list, totalCount } = await this.workLogsService.findByTask(
      BigInt(taskId),
      { startDate, endDate, ...pagination },
    );

    return {
      ...createPaginationMeta(
        totalCount,
        pagination.pageNum,
        pagination.pageSize,
      ),
      list: list.map((log) => this.transformWorkLog(log)),
    };
  }

  @Get('work-logs/my')
  @ApiOperation({ summary: '내 업무일지 목록 조회' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '시작일 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '종료일 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'pageNum',
    required: false,
    description: '페이지 번호',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '페이지당 개수',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '내 업무일지 목록',
    type: [WorkLogResponseDto],
  })
  async findMyWorkLogs(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageNum') pageNum: string,
    @Query('pageSize') pageSize: string,
    @CurrentUser() user: any,
  ) {
    const pagination = parsePaginationParams({ pageNum, pageSize });

    const { list, totalCount } = await this.workLogsService.findByUser(
      BigInt(user.id),
      { startDate, endDate, ...pagination },
    );

    return {
      ...createPaginationMeta(
        totalCount,
        pagination.pageNum,
        pagination.pageSize,
      ),
      list: list.map((log) => this.transformWorkLog(log)),
    };
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
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '시작일 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '종료일 (YYYY-MM-DD)',
  })
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
  @HttpCode(HttpStatus.OK)
  @ResponseCode('SUC003')
  @ApiOperation({ summary: '업무일지 삭제' })
  @ApiParam({ name: 'id', description: '업무일지 ID' })
  @ApiResponse({ status: 200, description: '업무일지가 삭제되었습니다' })
  @ApiResponse({ status: 403, description: '본인만 삭제 가능합니다' })
  @ApiResponse({ status: 404, description: '업무일지를 찾을 수 없습니다' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.workLogsService.remove(BigInt(id), BigInt(user.id));
    return null;
  }

  @Get('projects/:projectId/work-logs/export')
  @SkipResponseWrapper()
  @ApiOperation({ summary: '주간 업무일지 엑셀 다운로드' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiQuery({
    name: 'startDate',
    description: '시작일 (YYYY-MM-DD)',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: '종료일 (YYYY-MM-DD)',
    required: true,
  })
  @ApiQuery({ name: 'year', description: '연도', required: true, type: Number })
  @ApiQuery({ name: 'month', description: '월', required: true, type: Number })
  @ApiQuery({
    name: 'weekNumber',
    description: '주차',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '주간 업무일지 엑셀 파일',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async exportWeeklyReport(
    @Param('projectId') projectId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('weekNumber') weekNumber: string,
  ): Promise<StreamableFile> {
    const weekInfo = {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      weekNumber: parseInt(weekNumber, 10),
    };

    const buffer = await this.workLogsService.generateWeeklyReport(
      BigInt(projectId),
      startDate,
      endDate,
    );

    // 파일명: Weekly_Report_2026_01_Week2.xlsx
    const filename = `Weekly_Report_${weekInfo.year}_${String(weekInfo.month).padStart(2, '0')}_Week${weekInfo.weekNumber}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
    });
  }

  @Get('projects/:projectId/work-logs/export-monthly')
  @SkipResponseWrapper()
  @ApiOperation({ summary: '월간 투입인력별 상세업무현황 엑셀 다운로드' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiQuery({ name: 'year', description: '연도', required: true, type: Number })
  @ApiQuery({ name: 'month', description: '월', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: '월간 투입인력별 상세업무현황 엑셀 파일',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async exportMonthlyStaffReport(
    @Param('projectId') projectId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<StreamableFile> {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    const buffer = await this.workLogsService.generateMonthlyStaffReport(
      BigInt(projectId),
      yearNum,
      monthNum,
    );

    // 파일명: 1월_투입인력별상세업무현황.xlsx
    // HTTP 헤더에 한글 직접 사용 불가 - ASCII 폴백 필요
    const filename = `${monthNum}월_투입인력별상세업무현황.xlsx`;
    const asciiFilename = `monthly_staff_report_${yearNum}_${String(monthNum).padStart(2, '0')}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    const streamableFile = new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
    });

    return streamableFile;
  }

  @Get('projects/:projectId/work-logs/export-monthly-task')
  @SkipResponseWrapper()
  @ApiOperation({ summary: '월간 업무별 공수투입현황 엑셀 다운로드' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiQuery({ name: 'year', description: '연도', required: true, type: Number })
  @ApiQuery({ name: 'month', description: '월', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: '월간 업무별 공수투입현황 엑셀 파일',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async exportMonthlyTaskReport(
    @Param('projectId') projectId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<StreamableFile> {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    const buffer = await this.workLogsService.generateMonthlyTaskReport(
      BigInt(projectId),
      yearNum,
      monthNum,
    );

    // 파일명: 1월_업무별공수투입현황.xlsx
    const filename = `${monthNum}월_업무별공수투입현황.xlsx`;
    const asciiFilename = `monthly_task_report_${yearNum}_${String(monthNum).padStart(2, '0')}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
    });
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
            status: workLog.task.status,
            difficulty: workLog.task.difficulty,
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
