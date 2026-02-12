import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectTaskTypeDto } from './dto/create-project-task-type.dto';
import { UpdateProjectTaskTypeDto } from './dto/update-project-task-type.dto';
import { parsePaginationParams } from '../common/helpers/pagination.helper';

@Injectable()
export class ProjectTaskTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: bigint,
    userId: bigint,
    createDto: CreateProjectTaskTypeDto,
  ) {
    // 1. 프로젝트 존재 확인
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, isActive: true },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    // 2. 프로젝트 멤버 권한 확인
    await this.checkMemberPermission(projectId, userId);

    // 3. 업무 구분명 중복 체크
    const existing = await this.prisma.projectTaskType.findFirst({
      where: {
        projectId,
        name: createDto.name,
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException('이미 존재하는 업무 구분명입니다');
    }

    // 4. 생성
    return await this.prisma.projectTaskType.create({
      data: {
        projectId,
        name: createDto.name,
        createdBy: userId,
      },
    });
  }

  async findAllByProject(
    projectId: bigint,
    filters?: {
      pageNum?: number;
      pageSize?: number;
    },
  ) {
    const { pageSize, skip } = parsePaginationParams(filters ?? {});

    const where = {
      projectId,
      isActive: true,
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.projectTaskType.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.projectTaskType.count({ where }),
    ]);

    return { list: items, totalCount };
  }

  async findOne(id: bigint, projectId: bigint) {
    const taskType = await this.prisma.projectTaskType.findFirst({
      where: {
        id,
        projectId,
        isActive: true,
      },
    });

    if (!taskType) {
      throw new NotFoundException('업무 구분을 찾을 수 없습니다');
    }

    return taskType;
  }

  async update(
    id: bigint,
    projectId: bigint,
    userId: bigint,
    updateDto: UpdateProjectTaskTypeDto,
  ) {
    // 1. 업무 구분 존재 확인
    await this.findOne(id, projectId);

    // 2. 프로젝트 멤버 권한 확인
    await this.checkMemberPermission(projectId, userId);

    // 3. 업무 구분명 중복 체크 (변경하려는 경우)
    if (updateDto.name) {
      const existing = await this.prisma.projectTaskType.findFirst({
        where: {
          projectId,
          name: updateDto.name,
          isActive: true,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException('이미 존재하는 업무 구분명입니다');
      }
    }

    // 4. 업데이트
    return await this.prisma.projectTaskType.update({
      where: { id },
      data: {
        ...updateDto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: bigint, projectId: bigint, userId: bigint) {
    // 1. 업무 구분 존재 확인
    await this.findOne(id, projectId);

    // 2. 프로젝트 멤버 권한 확인
    await this.checkMemberPermission(projectId, userId);

    // 3. 관련 업무들의 taskTypeId를 null로 변경 (이미 DB에서 onDelete: SetNull 처리됨)
    // 4. Soft delete
    await this.prisma.projectTaskType.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: userId,
      },
    });
  }

  // 프로젝트 멤버 권한 확인
  private async checkMemberPermission(projectId: bigint, userId: bigint) {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        memberId: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('프로젝트 멤버만 업무 구분을 관리할 수 있습니다');
    }
  }
}
