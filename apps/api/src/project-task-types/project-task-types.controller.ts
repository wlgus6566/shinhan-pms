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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectTaskTypesService } from './project-task-types.service';
import { CreateProjectTaskTypeDto } from './dto/create-project-task-type.dto';
import { UpdateProjectTaskTypeDto } from './dto/update-project-task-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseCode } from '../common/decorators/response.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Project Task Types')
@Controller('projects/:projectId/task-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectTaskTypesController {
  constructor(
    private readonly projectTaskTypesService: ProjectTaskTypesService,
  ) {}

  @Post()
  @ResponseCode('SUC002')
  @ApiOperation({ summary: '프로젝트 업무 구분 생성 (PM only)' })
  async create(
    @Param('projectId') projectId: string,
    @Body() createDto: CreateProjectTaskTypeDto,
    @CurrentUser() user: any,
  ) {
    return await this.projectTaskTypesService.create(
      BigInt(projectId),
      BigInt(user.id),
      createDto,
    );
  }

  @Get()
  @ApiOperation({ summary: '프로젝트 업무 구분 목록 조회' })
  async findAll(
    @Param('projectId') projectId: string,
    @Query('pageNum') pageNum?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return await this.projectTaskTypesService.findAllByProject(
      BigInt(projectId),
      { pageNum, pageSize },
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: '프로젝트 업무 구분 수정 (PM only)' })
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateProjectTaskTypeDto,
    @CurrentUser() user: any,
  ) {
    return await this.projectTaskTypesService.update(
      BigInt(id),
      BigInt(projectId),
      BigInt(user.id),
      updateDto,
    );
  }

  @Delete(':id')
  @ResponseCode('SUC003')
  @ApiOperation({ summary: '프로젝트 업무 구분 삭제 (PM only)' })
  async remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.projectTaskTypesService.remove(
      BigInt(id),
      BigInt(projectId),
      BigInt(user.id),
    );
  }
}
