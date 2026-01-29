import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { parsePaginationParams } from '../common/helpers/pagination.helper';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: bigint, userId: bigint, createTaskDto: CreateTaskDto) {
    // 1. 프로젝트 존재 확인
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    // 2. PM 권한 확인
    await this.checkPMPermission(projectId, userId);

    // 3. 업무 구분 유효성 검증
    await this.validateTaskType(projectId, createTaskDto.taskTypeId);

    // 4. 날짜 유효성 검증
    if (createTaskDto.startDate && createTaskDto.endDate) {
      const startDate = new Date(createTaskDto.startDate);
      const endDate = new Date(createTaskDto.endDate);
      if (endDate < startDate) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
      }
    }

    // 5. 담당자 유효성 검증
    console.log('Service received assignee IDs:', {
      planning: createTaskDto.planningAssigneeIds,
      design: createTaskDto.designAssigneeIds,
      frontend: createTaskDto.frontendAssigneeIds,
      backend: createTaskDto.backendAssigneeIds,
    });
    await this.validateAssignees(
      projectId,
      createTaskDto.planningAssigneeIds,
      createTaskDto.designAssigneeIds,
      createTaskDto.frontendAssigneeIds,
      createTaskDto.backendAssigneeIds,
    );
    console.log('Assignee validation passed');

    // 6. 업무 생성
    const assigneesToCreate = [
      ...(createTaskDto.planningAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'PLANNING',
      })) || []),
      ...(createTaskDto.designAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'DESIGN',
      })) || []),
      ...(createTaskDto.frontendAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'FRONTEND',
      })) || []),
      ...(createTaskDto.backendAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'BACKEND',
      })) || []),
    ];
    console.log('Assignees to create:', assigneesToCreate.length, assigneesToCreate);

    return await this.prisma.task.create({
      data: {
        projectId,
        taskName: createTaskDto.taskName,
        description: createTaskDto.description,
        difficulty: createTaskDto.difficulty,
        clientName: createTaskDto.clientName,
        taskTypeId: BigInt(createTaskDto.taskTypeId),
        startDate: createTaskDto.startDate ? new Date(createTaskDto.startDate) : null,
        endDate: createTaskDto.endDate ? new Date(createTaskDto.endDate) : null,
        openDate: createTaskDto.openDate ? new Date(createTaskDto.openDate) : null,
        notes: createTaskDto.notes,
        createdBy: userId,
        assignees: {
          create: assigneesToCreate,
        },
      },
      include: {
        assignees: {
          include: {
            user: {
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
        },
        taskType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAllByProject(
    projectId: bigint,
    params?: {
      pageNum?: number;
      pageSize?: number;
      search?: string;
      status?: string[];
      difficulty?: string[];
    },
  ) {
    const { pageSize, skip } = parsePaginationParams(params ?? {});

    const where: any = {
      projectId,
      isActive: true,
    };

    // Add search filter (case-insensitive)
    if (params?.search) {
      where.taskName = {
        contains: params.search,
        mode: 'insensitive',
      };
    }

    // Add status filter
    if (params?.status && params.status.length > 0) {
      where.status = { in: params.status };
    }

    // Add difficulty filter
    if (params?.difficulty && params.difficulty.length > 0) {
      where.difficulty = { in: params.difficulty };
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          assignees: {
            include: {
              user: {
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
          },
          taskType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { list: items, totalCount };
  }

  async findOne(taskId: bigint) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          include: {
            user: {
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
        },
        taskType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task || !task.isActive) {
      throw new NotFoundException('업무를 찾을 수 없습니다');
    }

    return task;
  }

  async update(taskId: bigint, userId: bigint, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(taskId);

    // PM 권한 확인
    await this.checkPMPermission(task.projectId, userId);

    // 업무 구분 유효성 검증
    if (updateTaskDto.taskTypeId) {
      await this.validateTaskType(task.projectId, updateTaskDto.taskTypeId);
    }

    // 날짜 유효성 검증
    if (updateTaskDto.startDate || updateTaskDto.endDate) {
      const startDate = updateTaskDto.startDate
        ? new Date(updateTaskDto.startDate)
        : task.startDate;
      const endDate = updateTaskDto.endDate
        ? new Date(updateTaskDto.endDate)
        : task.endDate;

      if (startDate && endDate && endDate < startDate) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
      }
    }

    // 담당자 유효성 검증
    await this.validateAssignees(
      task.projectId,
      updateTaskDto.planningAssigneeIds,
      updateTaskDto.designAssigneeIds,
      updateTaskDto.frontendAssigneeIds,
      updateTaskDto.backendAssigneeIds,
    );

    // 업무 수정
    const updateData: any = {
      taskName: updateTaskDto.taskName,
      description: updateTaskDto.description,
      difficulty: updateTaskDto.difficulty,
      clientName: updateTaskDto.clientName,
      taskTypeId: updateTaskDto.taskTypeId ? BigInt(updateTaskDto.taskTypeId) : undefined,
      startDate: updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : undefined,
      endDate: updateTaskDto.endDate ? new Date(updateTaskDto.endDate) : undefined,
      openDate: updateTaskDto.openDate ? new Date(updateTaskDto.openDate) : undefined,
      notes: updateTaskDto.notes,
      status: updateTaskDto.status,
      updatedBy: userId,
    };

    // 담당자가 제공된 경우에만 업데이트
    if (updateTaskDto.planningAssigneeIds !== undefined ||
        updateTaskDto.designAssigneeIds !== undefined ||
        updateTaskDto.frontendAssigneeIds !== undefined ||
        updateTaskDto.backendAssigneeIds !== undefined) {

      // 기존 할당 삭제
      await this.prisma.taskAssignee.deleteMany({
        where: { taskId },
      });

      // 새 할당 생성
      updateData.assignees = {
        create: [
          ...(updateTaskDto.planningAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'PLANNING',
          })) || []),
          ...(updateTaskDto.designAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'DESIGN',
          })) || []),
          ...(updateTaskDto.frontendAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'FRONTEND',
          })) || []),
          ...(updateTaskDto.backendAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'BACKEND',
          })) || []),
        ],
      };
    }

    return await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignees: {
          include: {
            user: {
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
        },
      },
    });
  }

  async remove(taskId: bigint, userId: bigint) {
    const task = await this.findOne(taskId);

    // PM 권한 확인
    await this.checkPMPermission(task.projectId, userId);

    // Soft delete
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        isActive: false,
        updatedBy: userId,
      },
    });
  }

  // 권한 체크: PM인지 확인
  private async checkPMPermission(projectId: bigint, userId: bigint) {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        memberId: userId,
        role: 'PM',
      },
    });

    if (!member) {
      throw new ForbiddenException('프로젝트 PM만 업무를 생성/수정/삭제할 수 있습니다');
    }
  }

  // 담당자 유효성 검증
  private async validateAssignees(
    projectId: bigint,
    planningAssigneeIds?: number[],
    designAssigneeIds?: number[],
    frontendAssigneeIds?: number[],
    backendAssigneeIds?: number[],
  ): Promise<void> {
    const assignees = [
      { ids: planningAssigneeIds, workArea: 'PLANNING', name: '기획' },
      { ids: designAssigneeIds, workArea: 'DESIGN', name: '디자인' },
      { ids: frontendAssigneeIds, workArea: 'FRONTEND', name: '프론트엔드' },
      { ids: backendAssigneeIds, workArea: 'BACKEND', name: '백엔드' },
    ];

    for (const assignee of assignees) {
      if (assignee.ids && assignee.ids.length > 0) {
        for (const id of assignee.ids) {
          const member = await this.prisma.projectMember.findFirst({
            where: {
              projectId,
              memberId: BigInt(id),
            },
          });

          if (!member) {
            throw new BadRequestException(
              `${assignee.name} 담당자가 프로젝트 멤버가 아닙니다`,
            );
          }

          if (member.workArea !== assignee.workArea) {
            throw new BadRequestException(
              `${assignee.name} 담당자의 작업 영역이 일치하지 않습니다`,
            );
          }
        }
      }
    }
  }

  // 업무 구분 유효성 검증
  private async validateTaskType(projectId: bigint, taskTypeId?: number): Promise<void> {
    if (!taskTypeId) {
      throw new BadRequestException('업무 구분을 선택해주세요');
    }

    const taskType = await this.prisma.projectTaskType.findFirst({
      where: {
        id: BigInt(taskTypeId),
        projectId,
        isActive: true,
      },
    });

    if (!taskType) {
      throw new BadRequestException('유효하지 않은 업무 구분입니다');
    }
  }
}
