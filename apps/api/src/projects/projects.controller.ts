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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
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
  @ApiResponse({
    status: 200,
    description: '프로젝트 목록',
    type: [ProjectResponseDto],
  })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const projects = await this.projectsService.findAll({ search, status });
    return projects.map((project) => this.transformProject(project));
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
  @ApiOperation({ summary: '프로젝트 삭제' })
  @ApiParam({ name: 'id', description: '프로젝트 ID' })
  @ApiResponse({
    status: 200,
    description: '프로젝트가 삭제되었습니다',
  })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없습니다' })
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(BigInt(id));
    return { message: '프로젝트가 삭제되었습니다' };
  }

  /**
   * Prisma Project 모델을 API Response DTO로 변환
   */
  private transformProject(project: any): ProjectResponseDto {
    return {
      id: project.id.toString(),
      projectName: project.projectName,
      description: project.description,
      startDate: project.startDate
        ? project.startDate.toISOString().split('T')[0]
        : undefined,
      endDate: project.endDate
        ? project.endDate.toISOString().split('T')[0]
        : undefined,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
