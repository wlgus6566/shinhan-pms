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
import { parsePaginationParams } from '../common/helpers/pagination.helper';

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

    // 중복 검증 (활성 프로젝트만)
    console.log('[DEBUG] 프로젝트 생성 시도:', {
      projectName: createProjectDto.name,
      userId: userId.toString(),
    });

    const existingProject = await this.prisma.project.findFirst({
      where: {
        projectName: createProjectDto.name,
        isActive: true,
      },
    });

    console.log('[DEBUG] 중복 검증 결과:', {
      found: !!existingProject,
      existingProject: existingProject ? {
        id: existingProject.id.toString(),
        projectName: existingProject.projectName,
        isActive: existingProject.isActive,
      } : null,
    });

    if (existingProject) {
      throw new BadRequestException('이미 존재하는 프로젝트명입니다');
    }

    // 생성
    return await this.prisma.project.create({
      data: {
        projectName: createProjectDto.name,
        client: createProjectDto.client,
        projectType: createProjectDto.projectType,
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

  async findAll(filters?: {
    search?: string;
    status?: string;
    pageNum?: number;
    pageSize?: number;
  }) {
    const { pageSize, skip } = parsePaginationParams(filters ?? {});

    const where = {
      isActive: true,
      ...(filters?.search && {
        projectName: { contains: filters.search },
      }),
      ...(filters?.status && {
        status: filters.status,
      }),
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { list: items, totalCount };
  }

  /**
   * 내가 속한 프로젝트 목록 조회
   * (슈퍼관리자는 모든 프로젝트 조회)
   */
  async findMyProjects(
    userId: bigint,
    userRole: string,
    params?: { pageNum?: number; pageSize?: number },
  ) {
    const { pageSize, skip } = parsePaginationParams(params ?? {});

    // 슈퍼관리자는 모든 프로젝트 조회
    if (userRole === 'SUPER_ADMIN') {
      const where = { isActive: true };

      const [projects, totalCount] = await Promise.all([
        this.prisma.project.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { projectName: 'asc' },
        }),
        this.prisma.project.count({ where }),
      ]);

      const list = projects.map((project) => ({
        ...project,
        myRole: 'SUPER_ADMIN',
        myWorkArea: null,
      }));

      return { list, totalCount };
    }

    // 일반 사용자는 자신이 속한 프로젝트만 조회
    const where = {
      memberId: userId,
      project: {
        isActive: true,
      },
    };

    const [projectMembers, totalCount] = await Promise.all([
      this.prisma.projectMember.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          project: true,
        },
        orderBy: {
          project: {
            projectName: 'asc',
          },
        },
      }),
      this.prisma.projectMember.count({ where }),
    ]);

    const list = projectMembers.map((pm) => ({
      ...pm.project,
      myRole: pm.role,
      myWorkArea: pm.workArea,
    }));

    return { list, totalCount };
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

    // 프로젝트명 중복 검증 (현재 프로젝트 제외, 활성 프로젝트만)
    if (updateProjectDto.name) {
      const existingProject = await this.prisma.project.findFirst({
        where: {
          projectName: updateProjectDto.name,
          id: { not: id },
          isActive: true,
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
        ...(updateProjectDto.name && {
          projectName: updateProjectDto.name,
        }),
        ...(updateProjectDto.client !== undefined && {
          client: updateProjectDto.client,
        }),
        ...(updateProjectDto.projectType && {
          projectType: updateProjectDto.projectType,
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
  async getProjectMembers(
    projectId: bigint,
    params?: { pageNum?: number; pageSize?: number },
  ) {
    const { pageNum, pageSize } = parsePaginationParams(params ?? {});

    // 프로젝트 존재 확인
    await this.findOne(projectId);

    const where = { projectId };

    const [members, totalCount] = await Promise.all([
      this.prisma.projectMember.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              position: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.projectMember.count({ where }),
    ]);

    // 정렬 로직
    const workAreaOrder = {
      PROJECT_MANAGEMENT: 0,
      PLANNING: 1,
      DESIGN: 2,
      FRONTEND: 3,
      BACKEND: 4,
    };

    const roleOrder = {
      PM: 0,
      PL: 1,
      PA: 2,
    };

    const sortedMembers = members.sort((a, b) => {
      // 1. PM이 가장 먼저
      if (a.role === 'PM' && b.role !== 'PM') return -1;
      if (a.role !== 'PM' && b.role === 'PM') return 1;

      // 2. 담당 분야 순서 (프로젝트 관리 > 기획 > 디자인 > 프론트엔드 > 백엔드)
      const workAreaDiff =
        (workAreaOrder[a.workArea] ?? 999) - (workAreaOrder[b.workArea] ?? 999);
      if (workAreaDiff !== 0) return workAreaDiff;

      // 3. 각 담당 분야 내에서 PL > PA
      return (roleOrder[a.role] ?? 999) - (roleOrder[b.role] ?? 999);
    });

    // 페이지네이션 적용 (정렬 후)
    const skip = (pageNum - 1) * pageSize;
    const list = sortedMembers.slice(skip, skip + pageSize);

    return { list, totalCount };
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
        notes: addMemberDto.notes,
        createdBy: userId,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
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
        ...(updateRoleDto.notes !== undefined && { notes: updateRoleDto.notes }),
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
