import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { AddProjectMemberDto } from './dto/add-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-member-role.dto';
import { ProjectMemberResponseDto } from './dto/project-member-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SchedulesService } from '../schedules/schedules.service';
import { CreateScheduleDto } from '../schedules/dto/create-schedule.dto';
import { ResponseCode } from '../common/decorators/response.decorator';
import { parsePaginationParams, createPaginationMeta } from '../common/helpers/pagination.helper';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly schedulesService: SchedulesService,
  ) {}

  @Post()
  @ResponseCode('SUC002')
  @ApiOperation({ summary: '프로젝트 생성' })
  @ApiResponse({
    status: 201,
    description: '프로젝트가 생성되었습니다',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (중복된 프로젝트명, 날짜 오류 등)',
  })
  async create(@Body() createProjectDto: CreateProjectDto) {
    console.log(
      '[DEBUG Controller] Raw DTO received:',
      JSON.stringify(createProjectDto, null, 2),
    );
    console.log('[DEBUG Controller] DTO type:', typeof createProjectDto);
    console.log('[DEBUG Controller] DTO keys:', Object.keys(createProjectDto));

    // TODO: 실제로는 JWT에서 userId 추출
    const userId = 1n;
    const project = await this.projectsService.create(createProjectDto, userId);

    return this.transformProject(project);
  }

  @Get()
  @ApiOperation({ summary: '프로젝트 목록 조회' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '프로젝트명 검색 (부분 일치)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '상태 필터',
    enum: ['ACTIVE', 'COMPLETED', 'SUSPENDED'],
  })
  @ApiQuery({ name: 'pageNum', required: false, description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '페이지당 개수', type: Number })
  @ApiResponse({
    status: 200,
    description: '프로젝트 목록',
    type: [ProjectResponseDto],
  })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('pageNum') pageNum?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pagination = parsePaginationParams({ pageNum, pageSize });

    const { list, totalCount } = await this.projectsService.findAll({
      search,
      status,
      ...pagination,
    });

    return {
      ...createPaginationMeta(totalCount, pagination.pageNum, pagination.pageSize),
      list: list.map((project) => this.transformProject(project)),
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내가 속한 프로젝트 목록 조회 (슈퍼관리자는 모든 프로젝트)' })
  @ApiQuery({ name: 'pageNum', required: false, description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '페이지당 개수', type: Number })
  @ApiResponse({
    status: 200,
    description: '내가 멤버로 속한 프로젝트 목록 (슈퍼관리자는 모든 프로젝트)',
    type: [ProjectResponseDto],
  })
  async findMyProjects(
    @CurrentUser() user: any,
    @Query('pageNum') pageNum?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pagination = parsePaginationParams({ pageNum, pageSize });

    const { list, totalCount } = await this.projectsService.findMyProjects(
      BigInt(user.id),
      user.role,
      pagination,
    );

    return {
      ...createPaginationMeta(totalCount, pagination.pageNum, pagination.pageSize),
      list: list.map((project) => this.transformMyProject(project)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '프로젝트 상세 조회' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiResponse({
    status: 200,
    description: '프로젝트 정보',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(BigInt(id));
    return this.transformProject(project);
  }

  @Patch(':id')
  @ApiOperation({ summary: '프로젝트 수정' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiResponse({
    status: 200,
    description: '프로젝트가 수정되었습니다',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (중복된 프로젝트명, 날짜 오류 등)',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const userId = 1n;
    const project = await this.projectsService.update(
      BigInt(id),
      updateProjectDto,
      userId,
    );
    return this.transformProject(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseCode('SUC003')
  @ApiOperation({ summary: '프로젝트 삭제' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiResponse({
    status: 200,
    description: '프로젝트가 삭제되었습니다',
  })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(BigInt(id));
    return null;
  }

  /**
   * Prisma Project 모델을 API Response DTO로 변환
   */
  private transformProject(project: any): ProjectResponseDto {
    return {
      id: project.id.toString(),
      name: project.projectName, // Map projectName to name for frontend
      client: project.client,
      projectType: project.projectType,
      description: project.description,
      startDate: project.startDate
        ? project.startDate.toISOString().split('T')[0]
        : undefined,
      endDate: project.endDate
        ? project.endDate.toISOString().split('T')[0]
        : undefined,
      status: project.status,
      creatorId: project.createdBy?.toString(),
      creator: project.creator
        ? {
            id: project.creator.id.toString(),
            name: project.creator.name,
            email: project.creator.email,
          }
        : undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt?.toISOString(),
    };
  }

  /**
   * 내 프로젝트 목록용 변환 (역할 정보 포함)
   */
  private transformMyProject(project: any): any {
    return {
      id: project.id.toString(),
      name: project.projectName,
      client: project.client,
      projectType: project.projectType,
      description: project.description,
      startDate: project.startDate
        ? project.startDate.toISOString().split('T')[0]
        : undefined,
      endDate: project.endDate
        ? project.endDate.toISOString().split('T')[0]
        : undefined,
      status: project.status,
      myRole: project.myRole,
      myWorkArea: project.myWorkArea,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  // =============================================
  // 프로젝트 멤버 관리 API
  // =============================================

  @Get(':id/members')
  @ApiOperation({ summary: '프로젝트 멤버 목록 조회' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiQuery({ name: 'pageNum', required: false, description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '페이지당 개수', type: Number })
  @ApiResponse({
    status: 200,
    description: '프로젝트 멤버 목록',
    type: [ProjectMemberResponseDto],
  })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async getProjectMembers(
    @Param('id') id: string,
    @Query('pageNum') pageNum?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pagination = parsePaginationParams({ pageNum, pageSize });

    const { list, totalCount } = await this.projectsService.getProjectMembers(
      BigInt(id),
      pagination,
    );

    return {
      ...createPaginationMeta(totalCount, pagination.pageNum, pagination.pageSize),
      list: list.map((member) => this.transformProjectMember(member)),
    };
  }

  @Post(':id/members')
  @ResponseCode('SUC002')
  @ApiOperation({ summary: '프로젝트 멤버 추가' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiResponse({
    status: 201,
    description: '멤버가 추가되었습니다',
    type: ProjectMemberResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트 또는 사용자를 찾을 수 없습니다',
  })
  @ApiResponse({ status: 409, description: '이미 프로젝트 멤버입니다' })
  async addProjectMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddProjectMemberDto,
  ) {
    const userId = 1n; // TODO: JWT에서 추출
    const member = await this.projectsService.addProjectMember(
      BigInt(id),
      addMemberDto,
      userId,
    );
    return this.transformProjectMember(member);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: '프로젝트 멤버 역할 수정' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiParam({ name: 'memberId', description: '멤버 ID' })
  @ApiResponse({
    status: 200,
    description: '역할이 수정되었습니다',
    type: ProjectMemberResponseDto,
  })
  @ApiResponse({ status: 404, description: '프로젝트 멤버를 찾을 수 없습니다' })
  async updateProjectMemberRole(
    @Param('id') id: string,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() updateRoleDto: UpdateProjectMemberRoleDto,
  ) {
    const userId = 1n; // TODO: JWT에서 추출
    const member = await this.projectsService.updateProjectMemberRole(
      BigInt(id),
      BigInt(memberId),
      updateRoleDto,
      userId,
    );
    return this.transformProjectMember(member);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ResponseCode('SUC003')
  @ApiOperation({ summary: '프로젝트 멤버 제거' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiParam({ name: 'memberId', description: '멤버 ID' })
  @ApiResponse({ status: 200, description: '멤버가 제거되었습니다' })
  @ApiResponse({ status: 404, description: '프로젝트 멤버를 찾을 수 없습니다' })
  async removeProjectMember(
    @Param('id') id: string,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    await this.projectsService.removeProjectMember(
      BigInt(id),
      BigInt(memberId),
    );
    return null;
  }

  /**
   * Prisma ProjectMember 모델을 API Response DTO로 변환
   */
  private transformProjectMember(projectMember: any): ProjectMemberResponseDto {
    return {
      id: projectMember.id.toString(),
      projectId: projectMember.projectId.toString(),
      memberId: projectMember.memberId.toString(),
      role: projectMember.role,
      workArea: projectMember.workArea,
      notes: projectMember.notes,
      member: projectMember.member
        ? {
            id: projectMember.member.id.toString(),
            name: projectMember.member.name,
            email: projectMember.member.email,
            department: projectMember.member.department,
            position: projectMember.member.position,
            role: projectMember.member.role,
          }
        : undefined,
      createdAt: projectMember.createdAt.toISOString(),
      updatedAt: projectMember.updatedAt?.toISOString(),
    };
  }

  // =============================================
  // 프로젝트 일정 관리 API
  // =============================================

  @Get(':id/schedules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로젝트 일정 목록 조회' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '시작일 (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '종료일 (ISO 8601)',
  })
  @ApiResponse({ status: 200, description: '프로젝트 일정 목록' })
  async getProjectSchedules(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const schedules = await this.schedulesService.findByProject(
      BigInt(id),
      startDate,
      endDate,
    );
    return schedules.map((schedule) => this.transformSchedule(schedule));
  }

  @Post(':id/schedules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로젝트 일정 생성' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiResponse({ status: 201, description: '일정이 생성되었습니다' })
  async createProjectSchedule(
    @Param('id') id: string,
    @Body() createScheduleDto: CreateScheduleDto,
    @CurrentUser() user: any,
  ) {
    const dtoWithProject = { ...createScheduleDto, projectId: id };
    const schedule = await this.schedulesService.create(
      BigInt(user.id),
      dtoWithProject,
    );
    return this.transformSchedule(schedule);
  }

  /**
   * Schedule 변환 헬퍼
   */
  private transformSchedule(schedule: any): any {
    // 🔍 디버깅: Prisma 결과 확인
    console.log(
      '🔍 [ProjectsController] transformSchedule Schedule raw data:',
      {
        id: schedule.id,
        title: schedule.title,
        teamScope: schedule.teamScope,
        hasTeamScope: 'teamScope' in schedule,
        allKeys: Object.keys(schedule),
      },
    );
    return {
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
      isRecurring: schedule.isRecurring,
      recurrenceType: schedule.recurrenceType,
      recurrenceEndDate: schedule.recurrenceEndDate?.toISOString().split('T')[0],
      originalScheduleId: schedule.originalScheduleId,
      instanceDate: schedule.instanceDate,
      participants:
        schedule.participants?.map((p: any) => ({
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
  }
}
