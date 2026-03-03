import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-member-role.dto';
import { parsePaginationParams } from '../common/helpers/pagination.helper';

const DEFAULT_TASK_TYPES = [
  { name: '프로젝트성 업무', description: '' },
  { name: '신규 / 단건 제작', description: '' },
  { name: '운영 / 수정 작업', description: '' },
  { name: '관리 업무', description: '' },
];

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: bigint) {
    // 1. 프로젝트명 중복 체크 (활성 프로젝트만)
    const existingProject = await this.prisma.project.findFirst({
      where: {
        projectName: createProjectDto.name,
        isActive: true,
      },
    });

    if (existingProject) {
      throw new BadRequestException('이미 존재하는 프로젝트명입니다');
    }

    // 2. 날짜 검증
    if (createProjectDto.startDate && createProjectDto.endDate) {
      if (new Date(createProjectDto.endDate) < new Date(createProjectDto.startDate)) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
      }
    }

    // 3. 업무 구분 준비 (제공되지 않으면 기본값 사용)
    const taskTypesToCreate = createProjectDto.taskTypes && createProjectDto.taskTypes.length > 0
      ? createProjectDto.taskTypes
      : DEFAULT_TASK_TYPES;

    // 4. 트랜잭션으로 프로젝트 + 업무 구분 생성
    const project = await this.prisma.$transaction(async (tx) => {
      // 소프트 삭제된 동명 프로젝트가 있으면 이름 변경 (unique 제약조건 충돌 방지)
      await tx.project.updateMany({
        where: {
          projectName: createProjectDto.name,
          isActive: false,
        },
        data: {
          projectName: `${createProjectDto.name}_deleted_${Date.now()}`,
        },
      });

      // 프로젝트 생성
      const newProject = await tx.project.create({
        data: {
          projectName: createProjectDto.name,
          client: createProjectDto.client,
          projectType: createProjectDto.projectType,
          description: createProjectDto.description,
          startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : null,
          endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : null,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      // 업무 구분 생성
      await tx.projectTaskType.createMany({
        data: taskTypesToCreate.map((tt) => ({
          projectId: newProject.id,
          name: tt.name,
          createdBy: userId,
          updatedBy: userId,
        })),
      });

      return newProject;
    });

    // 5. 업무 구분 포함하여 조회
    return this.findOne(project.id);
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
      include: {
        taskTypes: {
          where: { isActive: true },
          orderBy: { id: 'asc' },
        },
      },
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
    // 1. 프로젝트 존재 확인
    const existingProject = await this.prisma.project.findUnique({
      where: { id, isActive: true },
      include: { taskTypes: { where: { isActive: true } } },
    });

    if (!existingProject) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    // 2. 프로젝트명 중복 체크 (변경하는 경우)
    if (updateProjectDto.name && updateProjectDto.name !== existingProject.projectName) {
      const duplicate = await this.prisma.project.findFirst({
        where: {
          projectName: updateProjectDto.name,
          isActive: true,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('이미 존재하는 프로젝트명입니다');
      }
    }

    // 3. 날짜 검증
    const startDate = updateProjectDto.startDate
      ? new Date(updateProjectDto.startDate)
      : existingProject.startDate;
    const endDate = updateProjectDto.endDate
      ? new Date(updateProjectDto.endDate)
      : existingProject.endDate;

    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
    }

    // 4. 트랜잭션으로 프로젝트 + 업무 구분 업데이트
    await this.prisma.$transaction(async (tx) => {
      // 소프트 삭제된 동명 프로젝트가 있으면 이름 변경 (unique 제약조건 충돌 방지)
      if (updateProjectDto.name && updateProjectDto.name !== existingProject.projectName) {
        await tx.project.updateMany({
          where: {
            projectName: updateProjectDto.name,
            isActive: false,
          },
          data: {
            projectName: `${updateProjectDto.name}_deleted_${Date.now()}`,
          },
        });
      }

      // 프로젝트 업데이트
      await tx.project.update({
        where: { id },
        data: {
          projectName: updateProjectDto.name,
          client: updateProjectDto.client,
          projectType: updateProjectDto.projectType,
          description: updateProjectDto.description,
          startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : undefined,
          endDate: updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : undefined,
          status: updateProjectDto.status,
          updatedBy: userId,
        },
      });

      // 업무 구분 업데이트 (제공된 경우만)
      if (updateProjectDto.taskTypes) {
        const providedIds = updateProjectDto.taskTypes
          .filter((tt) => tt.id)
          .map((tt) => BigInt(tt.id!));

        // 요청에 없는 기존 업무 구분은 soft delete
        const existingIds = existingProject.taskTypes.map((tt) => tt.id);
        const idsToDelete = existingIds.filter((id) => !providedIds.includes(id));

        if (idsToDelete.length > 0) {
          await tx.projectTaskType.updateMany({
            where: { id: { in: idsToDelete } },
            data: { isActive: false, updatedBy: userId },
          });
        }

        // 업무 구분 업데이트 및 생성
        for (const tt of updateProjectDto.taskTypes) {
          if (tt.id) {
            // 기존 업무 구분 업데이트
            await tx.projectTaskType.update({
              where: { id: BigInt(tt.id) },
              data: {
                name: tt.name,
                updatedBy: userId,
              },
            });
          } else {
            // 신규 업무 구분 생성
            await tx.projectTaskType.create({
              data: {
                projectId: id,
                name: tt.name,
                createdBy: userId,
                updatedBy: userId,
              },
            });
          }
        }
      }
    });

    // 5. 업무 구분 포함하여 조회
    return this.findOne(id);
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
  // 프로젝트 단가 관리
  // =============================================

  /**
   * 프로젝트 단가 조회 (년월 기준)
   */
  async getUnitPrices(projectId: bigint, yearMonth: string) {
    await this.findOne(projectId);

    const unitPrices = await this.prisma.projectUnitPrice.findMany({
      where: {
        projectId,
        yearMonth,
        isActive: true,
      },
    });

    return unitPrices;
  }

  /**
   * 프로젝트 단가 일괄 저장 (soft-delete 후 새로 생성하여 이력 보존)
   */
  async saveUnitPrices(
    projectId: bigint,
    yearMonth: string,
    items: Array<{ grade: string; unitPrice: number; notes?: string | null }>,
    userId: bigint,
    userRole: string,
  ) {
    await this.findOne(projectId);
    await this.checkMemberManagePermission(projectId, userId, userRole);

    const result = await this.prisma.$transaction(async (tx) => {
      // 기존 활성 레코드 비활성화 (이력 보존)
      await tx.projectUnitPrice.updateMany({
        where: { projectId, yearMonth, isActive: true },
        data: { isActive: false, updatedBy: userId },
      });

      // 새 레코드 생성
      await tx.projectUnitPrice.createMany({
        data: items.map((item) => ({
          projectId,
          grade: item.grade,
          yearMonth,
          unitPrice: item.unitPrice,
          notes: item.notes ?? null,
          createdBy: userId,
          updatedBy: userId,
        })),
      });

      // 새로 생성된 활성 레코드 반환
      return tx.projectUnitPrice.findMany({
        where: { projectId, yearMonth, isActive: true },
      });
    });

    return result;
  }

  /**
   * 프로젝트 단가 변경 이력 (모든 수정 이력 포함)
   * - 매 저장마다 이전 레코드를 soft-delete하므로 비활성 레코드 = 과거 이력
   * - createdAt 기준으로 그룹핑하여 저장 단위별로 표시
   */
  async getUnitPriceHistory(projectId: bigint) {
    await this.findOne(projectId);

    // 모든 레코드 조회 (비활성 포함 = 과거 이력)
    const allPrices = await this.prisma.projectUnitPrice.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    if (allPrices.length === 0) return [];

    // 사용자 이름 조회
    const userIds = [...new Set(allPrices.map((up) => up.createdBy).filter(Boolean))];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds as bigint[] } },
          select: { id: true, name: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id.toString(), u.name]));

    // createdAt + yearMonth 기준 그룹핑 (동일 트랜잭션에서 생성된 레코드는 같은 createdAt)
    type RowData = {
      yearMonth: string;
      EXPERT: number | null;
      ADVANCED: number | null;
      INTERMEDIATE: number | null;
      BEGINNER: number | null;
      updatedByName: string | null;
      createdAt: string;
    };

    const batchMap = new Map<string, RowData>();

    for (const up of allPrices) {
      // 같은 트랜잭션의 레코드를 묶기 위해 createdAt을 초 단위로 키 사용
      const batchKey = `${up.yearMonth}_${up.createdAt.toISOString()}`;

      if (!batchMap.has(batchKey)) {
        batchMap.set(batchKey, {
          yearMonth: up.yearMonth,
          EXPERT: null,
          ADVANCED: null,
          INTERMEDIATE: null,
          BEGINNER: null,
          updatedByName: null,
          createdAt: up.createdAt.toISOString(),
        });
      }

      const row = batchMap.get(batchKey)!;
      if (up.grade === 'EXPERT' || up.grade === 'ADVANCED' || up.grade === 'INTERMEDIATE' || up.grade === 'BEGINNER') {
        row[up.grade] = up.unitPrice;
      }
      if (!row.updatedByName) {
        row.updatedByName = userMap.get(up.createdBy.toString()) ?? null;
      }
    }

    // createdAt 내림차순 정렬, 최근 20건 제한
    return Array.from(batchMap.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);
  }

  // =============================================
  // 프로젝트 멤버 관리
  // =============================================

  /**
   * 멤버 관리 권한 확인 (SUPER_ADMIN, 시스템 PM, 프로젝트 PM만 허용)
   */
  private async checkMemberManagePermission(
    projectId: bigint,
    userId: bigint,
    userRole: string,
  ): Promise<void> {
    // 시스템 관리자 또는 시스템 PM은 허용
    if (userRole === 'SUPER_ADMIN' || userRole === 'PM') {
      return;
    }

    // 프로젝트 내 PM 역할인지 확인
    const projectMember = await this.prisma.projectMember.findFirst({
      where: { projectId, memberId: userId },
    });

    if (projectMember?.role === 'PM') {
      return;
    }

    throw new ForbiddenException('멤버 관리 권한이 없습니다');
  }

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
    userRole: string,
  ) {
    // 프로젝트 존재 확인
    await this.findOne(projectId);

    // 권한 확인
    await this.checkMemberManagePermission(projectId, userId, userRole);

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
        grade: addMemberDto.grade,
        joinDate: addMemberDto.joinDate ? new Date(addMemberDto.joinDate) : undefined,
        leaveDate: addMemberDto.leaveDate ? new Date(addMemberDto.leaveDate) : undefined,
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
    userRole: string,
  ) {
    // 프로젝트 존재 확인
    await this.findOne(projectId);

    // 권한 확인
    await this.checkMemberManagePermission(projectId, userId, userRole);

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
  async removeProjectMember(
    projectId: bigint,
    memberId: bigint,
    userId: bigint,
    userRole: string,
  ) {
    // 프로젝트 존재 확인
    await this.findOne(projectId);

    // 권한 확인
    await this.checkMemberManagePermission(projectId, userId, userRole);

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
