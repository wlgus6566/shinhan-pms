import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, CreateTaskSchema } from './dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskSchema } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Tasks')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: '업무 생성' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
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
    @Body(new ZodValidationPipe(CreateTaskSchema))
    createTaskDto: CreateTaskDto,
    @CurrentUser() user: any,
  ) {
    const task = await this.tasksService.create(
      BigInt(projectId),
      BigInt(user.id),
      createTaskDto,
    );
    return this.transformTask(task);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: '프로젝트별 업무 목록 조회' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiResponse({
    status: 200,
    description: '업무 목록',
    type: [TaskResponseDto],
  })
  async findAll(@Param('projectId') projectId: string) {
    const tasks = await this.tasksService.findAllByProject(BigInt(projectId));
    return tasks.map((task) => this.transformTask(task));
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
    @Body(new ZodValidationPipe(UpdateTaskSchema))
    updateTaskDto: UpdateTaskDto,
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '업무 삭제 (소프트 삭제)' })
  @ApiParam({ name: 'id', description: '업무 ID' })
  @ApiResponse({
    status: 204,
    description: '업무가 삭제되었습니다',
  })
  @ApiResponse({ status: 403, description: 'PM 권한이 필요합니다' })
  @ApiResponse({ status: 404, description: '업무를 찾을 수 없습니다' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.tasksService.remove(BigInt(id), BigInt(user.id));
  }

  private transformTask(task: any): any {
    return {
      ...task,
      id: task.id.toString(),
      projectId: task.projectId.toString(),
      planningAssigneeId: task.planningAssigneeId?.toString(),
      designAssigneeId: task.designAssigneeId?.toString(),
      frontendAssigneeId: task.frontendAssigneeId?.toString(),
      backendAssigneeId: task.backendAssigneeId?.toString(),
      createdBy: task.createdBy?.toString(),
      updatedBy: task.updatedBy?.toString(),
      startDate: task.startDate ? task.startDate.toISOString().split('T')[0] : null,
      endDate: task.endDate ? task.endDate.toISOString().split('T')[0] : null,
      planningAssignee: task.planningAssignee ? {
        id: task.planningAssignee.id.toString(),
        name: task.planningAssignee.name,
        email: task.planningAssignee.email,
      } : undefined,
      designAssignee: task.designAssignee ? {
        id: task.designAssignee.id.toString(),
        name: task.designAssignee.name,
        email: task.designAssignee.email,
      } : undefined,
      frontendAssignee: task.frontendAssignee ? {
        id: task.frontendAssignee.id.toString(),
        name: task.frontendAssignee.name,
        email: task.frontendAssignee.email,
      } : undefined,
      backendAssignee: task.backendAssignee ? {
        id: task.backendAssignee.id.toString(),
        name: task.backendAssignee.name,
        email: task.backendAssignee.email,
      } : undefined,
    };
  }
}
