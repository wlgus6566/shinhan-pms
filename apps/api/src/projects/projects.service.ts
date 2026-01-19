import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-member-role.dto';

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

  // =============================================
  // 프로젝트 멤버 관리
  // =============================================

  /**
   * 프로젝트 멤버 목록 조회
   */
  async getProjectMembers(projectId: bigint) {
    // 프로젝트 존재 확인
    await this.findOne(projectId);

    return await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 프로젝트에 멤버 추가
   */
  async addProjectMember(
    projectId: bigint,
    addMemberDto: AddProjectMemberDto,
    userId: bigint,
  ) {
    // 프로젝트 존재 확인
    await this.findOne(projectId);

    // 멤버 존재 확인
    const member = await this.prisma.user.findUnique({
      where: { id: BigInt(addMemberDto.memberId), isActive: true },
    });

    if (!member) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 이미 프로젝트 멤버인지 확인
    const existingMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        memberId: BigInt(addMemberDto.memberId),
      },
    });

    if (existingMember) {
      throw new ConflictException('이미 프로젝트 멤버입니다');
    }

    // 멤버 추가
    return await this.prisma.projectMember.create({
      data: {
        projectId,
        memberId: BigInt(addMemberDto.memberId),
        role: addMemberDto.role,
        workArea: addMemberDto.workArea,
        createdBy: userId,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 프로젝트 멤버 역할 수정
   */
  async updateProjectMemberRole(
    projectId: bigint,
    memberId: bigint,
    updateRoleDto: UpdateProjectMemberRoleDto,
    userId: bigint,
  ) {
    // 프로젝트 존재 확인
    await this.findOne(projectId);

    // 프로젝트 멤버 존재 확인
    const projectMember = await this.prisma.projectMember.findFirst({
      where: { projectId, memberId },
    });

    if (!projectMember) {
      throw new NotFoundException('프로젝트 멤버를 찾을 수 없습니다');
    }

    // 역할 수정
    return await this.prisma.projectMember.update({
      where: { id: projectMember.id },
      data: {
        role: updateRoleDto.role,
        ...(updateRoleDto.workArea && { workArea: updateRoleDto.workArea }),
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 프로젝트에서 멤버 제거
   */
  async removeProjectMember(projectId: bigint, memberId: bigint) {
    // 프로젝트 존재 확인
    await this.findOne(projectId);

    // 프로젝트 멤버 존재 확인
    const projectMember = await this.prisma.projectMember.findFirst({
      where: { projectId, memberId },
    });

    if (!projectMember) {
      throw new NotFoundException('프로젝트 멤버를 찾을 수 없습니다');
    }

    // 멤버 제거
    await this.prisma.projectMember.delete({
      where: { id: projectMember.id },
    });
  }
}
