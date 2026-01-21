import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import { UpdateWorkLogDto } from './dto/update-work-log.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WorkLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 업무일지 생성
   */
  async create(taskId: bigint, userId: bigint, createWorkLogDto: CreateWorkLogDto) {
    // 1. 업무 존재 확인
    const task = await this.prisma.task.findUnique({
      where: { id: taskId, isActive: true },
    });

    if (!task) {
      throw new NotFoundException('업무를 찾을 수 없습니다');
    }

    // 2. 담당자인지 확인
    const isAssignee = this.checkIsAssignee(task, userId);
    if (!isAssignee) {
      throw new ForbiddenException('해당 업무의 담당자만 일지를 작성할 수 있습니다');
    }

    // 3. 동일 날짜에 이미 일지가 있는지 확인
    const workDate = new Date(createWorkLogDto.workDate);
    const existingLog = await this.prisma.workLog.findFirst({
      where: {
        taskId,
        userId,
        workDate,
        isActive: true,
      },
    });

    if (existingLog) {
      throw new ConflictException('해당 날짜에 이미 업무일지가 존재합니다');
    }

    // 4. 업무일지 생성
    return await this.prisma.workLog.create({
      data: {
        taskId,
        userId,
        workDate,
        content: createWorkLogDto.content,
        workHours: createWorkLogDto.workHours ? new Decimal(createWorkLogDto.workHours) : null,
        progress: createWorkLogDto.progress,
        issues: createWorkLogDto.issues,
      },
      include: {
        task: { select: { id: true, taskName: true, projectId: true, status: true, difficulty: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * 특정 업무의 일지 목록 조회
   */
  async findByTask(taskId: bigint, startDate?: string, endDate?: string) {
    const where: any = {
      taskId,
      isActive: true,
    };

    if (startDate || endDate) {
      where.workDate = {};
      if (startDate) where.workDate.gte = new Date(startDate);
      if (endDate) where.workDate.lte = new Date(endDate);
    }

    return await this.prisma.workLog.findMany({
      where,
      include: {
        task: { select: { id: true, taskName: true, projectId: true, status: true, difficulty: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { workDate: 'desc' },
    });
  }

  /**
   * 내 일지 목록 조회
   */
  async findByUser(userId: bigint, startDate?: string, endDate?: string) {
    const where: any = {
      userId,
      isActive: true,
    };

    if (startDate || endDate) {
      where.workDate = {};
      if (startDate) where.workDate.gte = new Date(startDate);
      if (endDate) where.workDate.lte = new Date(endDate);
    }

    return await this.prisma.workLog.findMany({
      where,
      include: {
        task: { select: { id: true, taskName: true, projectId: true, status: true, difficulty: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { workDate: 'desc' },
    });
  }

  /**
   * 프로젝트 전체 팀원의 일지 조회
   */
  async findByProject(projectId: bigint, startDate?: string, endDate?: string) {
    const where: any = {
      task: {
        projectId,
        isActive: true,
      },
      isActive: true,
    };

    if (startDate || endDate) {
      where.workDate = {};
      if (startDate) where.workDate.gte = new Date(startDate);
      if (endDate) where.workDate.lte = new Date(endDate);
    }

    return await this.prisma.workLog.findMany({
      where,
      include: {
        task: { select: { id: true, taskName: true, projectId: true, status: true, difficulty: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { workDate: 'desc' },
    });
  }

  /**
   * 단일 일지 조회
   */
  async findOne(id: bigint) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
      include: {
        task: { select: { id: true, taskName: true, projectId: true, status: true, difficulty: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!workLog || !workLog.isActive) {
      throw new NotFoundException('업무일지를 찾을 수 없습니다');
    }

    return workLog;
  }

  /**
   * 업무일지 수정
   */
  async update(id: bigint, userId: bigint, updateWorkLogDto: UpdateWorkLogDto) {
    const workLog = await this.findOne(id);

    // 작성자 본인만 수정 가능
    if (workLog.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 일지만 수정할 수 있습니다');
    }

    // 날짜 변경 시 중복 체크
    if (updateWorkLogDto.workDate) {
      const newDate = new Date(updateWorkLogDto.workDate);
      const existingLog = await this.prisma.workLog.findFirst({
        where: {
          taskId: workLog.taskId,
          userId,
          workDate: newDate,
          isActive: true,
          id: { not: id },
        },
      });

      if (existingLog) {
        throw new ConflictException('해당 날짜에 이미 업무일지가 존재합니다');
      }
    }

    return await this.prisma.workLog.update({
      where: { id },
      data: {
        workDate: updateWorkLogDto.workDate ? new Date(updateWorkLogDto.workDate) : undefined,
        content: updateWorkLogDto.content,
        workHours: updateWorkLogDto.workHours !== undefined
          ? (updateWorkLogDto.workHours ? new Decimal(updateWorkLogDto.workHours) : null)
          : undefined,
        progress: updateWorkLogDto.progress,
        issues: updateWorkLogDto.issues,
      },
      include: {
        task: { select: { id: true, taskName: true, projectId: true, status: true, difficulty: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * 업무일지 삭제 (soft delete)
   */
  async remove(id: bigint, userId: bigint) {
    const workLog = await this.findOne(id);

    // 작성자 본인만 삭제 가능
    if (workLog.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 일지만 삭제할 수 있습니다');
    }

    await this.prisma.workLog.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * 내가 담당하는 업무 목록 조회
   */
  async findMyTasks(userId: bigint) {
    return await this.prisma.task.findMany({
      where: {
        isActive: true,
        OR: [
          { planningAssigneeId: userId },
          { designAssigneeId: userId },
          { frontendAssigneeId: userId },
          { backendAssigneeId: userId },
        ],
      },
      include: {
        project: { select: { id: true, projectName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 담당자 여부 확인
   */
  private checkIsAssignee(task: any, userId: bigint): boolean {
    return (
      task.planningAssigneeId === userId ||
      task.designAssigneeId === userId ||
      task.frontendAssigneeId === userId ||
      task.backendAssigneeId === userId
    );
  }
}
