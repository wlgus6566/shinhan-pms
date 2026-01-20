import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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

    // 3. 날짜 유효성 검증
    if (createTaskDto.startDate && createTaskDto.endDate) {
      const startDate = new Date(createTaskDto.startDate);
      const endDate = new Date(createTaskDto.endDate);
      if (endDate < startDate) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
      }
    }

    // 4. 담당자 유효성 검증
    await this.validateAssignees(
      projectId,
      createTaskDto.planningAssigneeId,
      createTaskDto.designAssigneeId,
      createTaskDto.frontendAssigneeId,
      createTaskDto.backendAssigneeId,
    );

    // 5. 업무 생성
    return await this.prisma.task.create({
      data: {
        projectId,
        taskName: createTaskDto.taskName,
        description: createTaskDto.description,
        difficulty: createTaskDto.difficulty,
        clientName: createTaskDto.clientName,
        planningAssigneeId: createTaskDto.planningAssigneeId ? BigInt(createTaskDto.planningAssigneeId) : null,
        designAssigneeId: createTaskDto.designAssigneeId ? BigInt(createTaskDto.designAssigneeId) : null,
        frontendAssigneeId: createTaskDto.frontendAssigneeId ? BigInt(createTaskDto.frontendAssigneeId) : null,
        backendAssigneeId: createTaskDto.backendAssigneeId ? BigInt(createTaskDto.backendAssigneeId) : null,
        startDate: createTaskDto.startDate ? new Date(createTaskDto.startDate) : null,
        endDate: createTaskDto.endDate ? new Date(createTaskDto.endDate) : null,
        notes: createTaskDto.notes,
        createdBy: userId,
      },
      include: {
        planningAssignee: { select: { id: true, name: true, email: true } },
        designAssignee: { select: { id: true, name: true, email: true } },
        frontendAssignee: { select: { id: true, name: true, email: true } },
        backendAssignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAllByProject(projectId: bigint) {
    return await this.prisma.task.findMany({
      where: {
        projectId,
        isActive: true,
      },
      include: {
        planningAssignee: { select: { id: true, name: true, email: true } },
        designAssignee: { select: { id: true, name: true, email: true } },
        frontendAssignee: { select: { id: true, name: true, email: true } },
        backendAssignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(taskId: bigint) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        planningAssignee: { select: { id: true, name: true, email: true } },
        designAssignee: { select: { id: true, name: true, email: true } },
        frontendAssignee: { select: { id: true, name: true, email: true } },
        backendAssignee: { select: { id: true, name: true, email: true } },
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
      updateTaskDto.planningAssigneeId,
      updateTaskDto.designAssigneeId,
      updateTaskDto.frontendAssigneeId,
      updateTaskDto.backendAssigneeId,
    );

    // 업무 수정
    return await this.prisma.task.update({
      where: { id: taskId },
      data: {
        taskName: updateTaskDto.taskName,
        description: updateTaskDto.description,
        difficulty: updateTaskDto.difficulty,
        clientName: updateTaskDto.clientName,
        planningAssigneeId: updateTaskDto.planningAssigneeId !== undefined
          ? (updateTaskDto.planningAssigneeId ? BigInt(updateTaskDto.planningAssigneeId) : null)
          : undefined,
        designAssigneeId: updateTaskDto.designAssigneeId !== undefined
          ? (updateTaskDto.designAssigneeId ? BigInt(updateTaskDto.designAssigneeId) : null)
          : undefined,
        frontendAssigneeId: updateTaskDto.frontendAssigneeId !== undefined
          ? (updateTaskDto.frontendAssigneeId ? BigInt(updateTaskDto.frontendAssigneeId) : null)
          : undefined,
        backendAssigneeId: updateTaskDto.backendAssigneeId !== undefined
          ? (updateTaskDto.backendAssigneeId ? BigInt(updateTaskDto.backendAssigneeId) : null)
          : undefined,
        startDate: updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : undefined,
        endDate: updateTaskDto.endDate ? new Date(updateTaskDto.endDate) : undefined,
        notes: updateTaskDto.notes,
        status: updateTaskDto.status,
        updatedBy: userId,
      },
      include: {
        planningAssignee: { select: { id: true, name: true, email: true } },
        designAssignee: { select: { id: true, name: true, email: true } },
        frontendAssignee: { select: { id: true, name: true, email: true } },
        backendAssignee: { select: { id: true, name: true, email: true } },
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
    planningAssigneeId?: number,
    designAssigneeId?: number,
    frontendAssigneeId?: number,
    backendAssigneeId?: number,
  ): Promise<void> {
    const assignees = [
      { id: planningAssigneeId, workArea: 'PLANNING', name: '기획' },
      { id: designAssigneeId, workArea: 'DESIGN', name: '디자인' },
      { id: frontendAssigneeId, workArea: 'FRONTEND', name: '프론트엔드' },
      { id: backendAssigneeId, workArea: 'BACKEND', name: '백엔드' },
    ];

    for (const assignee of assignees) {
      if (assignee.id) {
        const member = await this.prisma.projectMember.findFirst({
          where: {
            projectId,
            memberId: BigInt(assignee.id),
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
