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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseCode } from '../common/decorators/response.decorator';
import { parsePaginationParams, createPaginationMeta } from '../common/helpers/pagination.helper';

@ApiTags('Tasks')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  @ResponseCode('SUC002')
  @ApiOperation({ summary: '업무 생성' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: '업무가 생성되었습니다',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: 'PM 권한이 필요합니다' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: any,
  ) {
    console.log('Controller received DTO:', JSON.stringify(createTaskDto, null, 2));
    const task = await this.tasksService.create(
      BigInt(projectId),
      BigInt(user.id),
      createTaskDto,
    );
    // console.log('Service returned task with assignees:', task.assignees?.length || 0);
    return this.transformTask(task);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: '프로젝트별 업무 목록 조회' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiQuery({ name: 'pageNum', required: false, description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '페이지당 개수', type: Number })
  @ApiQuery({ name: 'search', required: false, description: '업무명 검색', type: String })
  @ApiQuery({ name: 'status', required: false, description: '상태 필터', isArray: true })
  @ApiQuery({ name: 'difficulty', required: false, description: '난이도 필터', isArray: true })
  @ApiResponse({
    status: 200,
    description: '업무 목록',
    type: [TaskResponseDto],
  })
  async findAll(
    @Param('projectId') projectId: string,
    @Query('pageNum') pageNum?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('status') status?: string | string[],
    @Query('difficulty') difficulty?: string | string[],
  ) {
    const pagination = parsePaginationParams({ pageNum, pageSize });

    // Handle array params (can be string or string[])
    const statusArray = status ? (Array.isArray(status) ? status : [status]) : undefined;
    const difficultyArray = difficulty ? (Array.isArray(difficulty) ? difficulty : [difficulty]) : undefined;

    const { list, totalCount } = await this.tasksService.findAllByProject(
      BigInt(projectId),
      {
        ...pagination,
        search,
        status: statusArray,
        difficulty: difficultyArray,
      },
    );

    return {
      ...createPaginationMeta(totalCount, pagination.pageNum, pagination.pageSize),
      list: list.map((task) => this.transformTask(task)),
    };
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: '업무 상세 조회' })
  @ApiParam({ name: 'id', description: '업무 ID' })
  @ApiResponse({
    status: 200,
    description: '업무 상세 정보',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: '업무를 찾을 수 없습니다' })
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(BigInt(id));
    return this.transformTask(task);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: '업무 수정' })
  @ApiParam({ name: 'id', description: '업무 ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: '업무가 수정되었습니다',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: 'PM 권한이 필요합니다' })
  @ApiResponse({ status: 404, description: '업무를 찾을 수 없습니다' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    const task = await this.tasksService.update(
      BigInt(id),
      BigInt(user.id),
      updateTaskDto,
    );
    return this.transformTask(task);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseCode('SUC003')
  @ApiOperation({ summary: '업무 삭제 (소프트 삭제)' })
  @ApiParam({ name: 'id', description: '업무 ID' })
  @ApiResponse({
    status: 200,
    description: '업무가 삭제되었습니다',
  })
  @ApiResponse({ status: 403, description: 'PM 권한이 필요합니다' })
  @ApiResponse({ status: 404, description: '업무를 찾을 수 없습니다' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.tasksService.remove(BigInt(id), BigInt(user.id));
    return null;
  }

  private transformTask(task: any): any {
    const { assignees, ...rest } = task;
    return {
      ...rest,
      id: rest.id.toString(),
      projectId: rest.projectId.toString(),
      createdBy: rest.createdBy?.toString(),
      updatedBy: rest.updatedBy?.toString(),
      startDate: rest.startDate ? rest.startDate.toISOString().split('T')[0] : null,
      endDate: rest.endDate ? rest.endDate.toISOString().split('T')[0] : null,
      openDate: rest.openDate ? rest.openDate.toISOString() : null,
      planningAssignees: assignees
        ?.filter((a: any) => a.workArea === 'PLANNING')
        .map((a: any) => ({
          id: a.user.id.toString(),
          name: a.user.name,
          email: a.user.email,
          department: a.user.department,
          position: a.user.position,
          role: a.user.role,
        })) || [],
      designAssignees: assignees
        ?.filter((a: any) => a.workArea === 'DESIGN')
        .map((a: any) => ({
          id: a.user.id.toString(),
          name: a.user.name,
          email: a.user.email,
          department: a.user.department,
          position: a.user.position,
          role: a.user.role,
        })) || [],
      frontendAssignees: assignees
        ?.filter((a: any) => a.workArea === 'FRONTEND')
        .map((a: any) => ({
          id: a.user.id.toString(),
          name: a.user.name,
          email: a.user.email,
          department: a.user.department,
          position: a.user.position,
          role: a.user.role,
        })) || [],
      backendAssignees: assignees
        ?.filter((a: any) => a.workArea === 'BACKEND')
        .map((a: any) => ({
          id: a.user.id.toString(),
          name: a.user.name,
          email: a.user.email,
          department: a.user.department,
          position: a.user.position,
          role: a.user.role,
        })) || [],
    };
  }
}
