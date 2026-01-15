import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: bigint) {
    // 날짜 검증
    if (createProjectDto.startDate && createProjectDto.endDate) {
      const startDate = new Date(createProjectDto.startDate);
      const endDate = new Date(createProjectDto.endDate);
      if (endDate < startDate) {
        throw new BadRequestException('종료일은 시작일 이후여야 합니다');
      }
    }

    // 중복 검증
    const existingProject = await this.prisma.project.findFirst({
      where: { projectName: createProjectDto.projectName },
    });

    if (existingProject) {
      throw new BadRequestException('이미 존재하는 프로젝트명입니다');
    }

    // 생성
    return await this.prisma.project.create({
      data: {
        projectName: createProjectDto.projectName,
        description: createProjectDto.description,
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate)
          : null,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : null,
        createdBy: userId,
      },
    });
  }

  async findAll(filters?: { search?: string; status?: string }) {
    return await this.prisma.project.findMany({
      where: {
        isActive: true,
        ...(filters?.search && {
          projectName: { contains: filters.search },
        }),
        ...(filters?.status && {
          status: filters.status,
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: bigint) {
    const project = await this.prisma.project.findUnique({
      where: { id, isActive: true },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    return project;
  }

  async update(
    id: bigint,
    updateProjectDto: UpdateProjectDto,
    userId: bigint,
  ) {
    // 존재 확인
    await this.findOne(id);

    // 날짜 검증
    if (updateProjectDto.startDate && updateProjectDto.endDate) {
      const startDate = new Date(updateProjectDto.startDate);
      const endDate = new Date(updateProjectDto.endDate);
      if (endDate < startDate) {
        throw new BadRequestException('종료일은 시작일 이후여야 합니다');
      }
    }

    // 프로젝트명 중복 검증 (현재 프로젝트 제외)
    if (updateProjectDto.projectName) {
      const existingProject = await this.prisma.project.findFirst({
        where: {
          projectName: updateProjectDto.projectName,
          id: { not: id },
        },
      });

      if (existingProject) {
        throw new BadRequestException('이미 존재하는 프로젝트명입니다');
      }
    }

    // 수정
    return await this.prisma.project.update({
      where: { id },
      data: {
        ...(updateProjectDto.projectName && {
          projectName: updateProjectDto.projectName,
        }),
        ...(updateProjectDto.description !== undefined && {
          description: updateProjectDto.description,
        }),
        ...(updateProjectDto.startDate !== undefined && {
          startDate: updateProjectDto.startDate
            ? new Date(updateProjectDto.startDate)
            : null,
        }),
        ...(updateProjectDto.endDate !== undefined && {
          endDate: updateProjectDto.endDate
            ? new Date(updateProjectDto.endDate)
            : null,
        }),
        ...(updateProjectDto.status && {
          status: updateProjectDto.status,
        }),
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: bigint) {
    // 존재 확인
    await this.findOne(id);

    // Soft delete
    return await this.prisma.project.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
