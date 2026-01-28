import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { generateRecurrenceInstances } from './utils/recurrence.utils';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 일정 생성
   */
  async create(userId: bigint, createScheduleDto: CreateScheduleDto) {
    const { participantIds, ...scheduleData } = createScheduleDto;

    // 날짜 검증
    const startDate = new Date(createScheduleDto.startDate);
    const endDate = new Date(createScheduleDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
    }

    // 프로젝트 존재 확인 (projectId가 있는 경우)
    if (scheduleData.projectId) {
      const projectId = BigInt(scheduleData.projectId);
      const project = await this.prisma.project.findUnique({
        where: { id: projectId, isActive: true },
      });

      if (!project) {
        throw new NotFoundException('프로젝트를 찾을 수 없습니다');
      }

      // 프로젝트 멤버인지 확인
      const isMember = await this.prisma.projectMember.findFirst({
        where: {
          projectId,
          memberId: userId,
        },
      });

      if (!isMember) {
        throw new ForbiddenException('프로젝트 멤버만 일정을 생성할 수 있습니다');
      }
    }
    console.log('[DEBUG] scheduleData:', scheduleData);

    // 정기 일정 검증
    if (scheduleData.isRecurring) {
      if (!scheduleData.recurrenceType) {
        throw new BadRequestException('반복 유형을 선택해주세요');
      }
      if (!scheduleData.recurrenceEndDate) {
        throw new BadRequestException('반복 종료일을 선택해주세요');
      }
      const recurrenceEnd = new Date(scheduleData.recurrenceEndDate);
      if (recurrenceEnd < startDate) {
        throw new BadRequestException('반복 종료일은 시작 날짜보다 이후여야 합니다');
      }
    }

    // 일정 생성
    const schedule = await this.prisma.schedule.create({
      data: {
        projectId: scheduleData.projectId ? BigInt(scheduleData.projectId) : null,
        title: scheduleData.title,
        description: scheduleData.description,
        scheduleType: scheduleData.scheduleType,
        startDate,
        endDate,
        location: scheduleData.location,
        isAllDay: scheduleData.isAllDay ?? false,
        color: scheduleData.color,
        teamScope: scheduleData.teamScope,
        halfDayType: scheduleData.halfDayType,
        usageDate: scheduleData.usageDate ? new Date(scheduleData.usageDate) : null,
        isRecurring: scheduleData.isRecurring ?? false,
        recurrenceType: scheduleData.recurrenceType,
        recurrenceEndDate: scheduleData.recurrenceEndDate ? new Date(scheduleData.recurrenceEndDate) : null,
        createdBy: userId,
      },
      include: {
        project: { select: { id: true, projectName: true } },
        creator: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // 참가자 추가
    if (participantIds && participantIds.length > 0) {
      await Promise.all(
        participantIds.map(async (participantId) => {
          await this.prisma.scheduleParticipant.create({
            data: {
              scheduleId: schedule.id,
              userId: BigInt(participantId),
              status: 'PENDING',
            },
          });
        })
      );

      // 참가자 정보를 포함하여 다시 조회
      return this.findOne(schedule.id);
    }

    return schedule;
  }

  /**
   * 정기 일정 규칙을 인스턴스로 확장
   * @param schedules 일정 목록
   * @param queryStart 조회 시작 날짜 (선택)
   * @param queryEnd 조회 종료 날짜 (선택)
   * @returns 확장된 일정 인스턴스 목록
   */
  private expandRecurringSchedules(
    schedules: any[],
    queryStart?: string,
    queryEnd?: string,
  ): any[] {
    const expandedSchedules: any[] = [];

    for (const schedule of schedules) {
      if (!schedule.isRecurring) {
        // 일반 일정은 그대로 추가
        expandedSchedules.push(schedule);
        continue;
      }

      // 정기 일정 규칙에 따라 인스턴스 생성
      const instances = generateRecurrenceInstances({
        startDate: new Date(schedule.startDate),
        endDate: new Date(schedule.endDate),
        recurrenceType: schedule.recurrenceType as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
        recurrenceEndDate: new Date(schedule.recurrenceEndDate),
      });

      // 조회 기간 필터링 (기간이 지정된 경우)
      const filteredInstances = queryStart && queryEnd
        ? instances.filter(instance => {
            const instStart = instance.startDate;
            const instEnd = instance.endDate;
            const qStart = new Date(queryStart);
            const qEnd = new Date(queryEnd);

            // 기간 내에 시작하거나 기간을 걸치는 인스턴스
            return (
              (instStart >= qStart && instStart <= qEnd) ||
              (instStart <= qStart && instEnd >= qStart)
            );
          })
        : instances;

      // 각 인스턴스를 일정 객체로 변환
      for (const instance of filteredInstances) {
        expandedSchedules.push({
          ...schedule,
          id: schedule.id, // 원본 규칙 ID 유지
          startDate: instance.startDate,
          endDate: instance.endDate,
          originalScheduleId: schedule.id.toString(),
          instanceDate: instance.instanceDate,
        });
      }
    }

    return expandedSchedules;
  }

  /**
   * 프로젝트의 일정 목록 조회
   */
  async findByProject(projectId: bigint, startDate?: string, endDate?: string) {
    const where: any = {
      projectId,
      isActive: true,
    };

    if (startDate || endDate) {
      where.OR = [];

      // 기간 내에 시작하는 일정
      if (startDate && endDate) {
        where.OR.push({
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        });
        // 기간을 걸치는 일정
        where.OR.push({
          AND: [
            { startDate: { lte: new Date(startDate) } },
            { endDate: { gte: new Date(startDate) } },
          ],
        });
      } else if (startDate) {
        where.startDate = { gte: new Date(startDate) };
      } else if (endDate) {
        where.endDate = { lte: new Date(endDate) };
      }
    }

    const schedules = await this.prisma.schedule.findMany({
      where,
      include: {
        project: { select: { id: true, projectName: true } },
        creator: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // 정기 일정 확장
    return this.expandRecurringSchedules(schedules, startDate, endDate);
  }

  /**
   * 내 일정 목록 조회 (생성한 일정 + 참가 중인 일정)
   */
  async findByUser(userId: bigint, startDate?: string, endDate?: string) {
    const where: any = {
      isActive: true,
      OR: [
        { createdBy: userId },
        {
          participants: {
            some: {
              userId,
            },
          },
        },
      ],
    };

    if (startDate || endDate) {
      if (startDate && endDate) {
        where.AND = [
          {
            OR: [
              {
                startDate: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
              {
                AND: [
                  { startDate: { lte: new Date(startDate) } },
                  { endDate: { gte: new Date(startDate) } },
                ],
              },
            ],
          },
        ];
      } else if (startDate) {
        where.startDate = { gte: new Date(startDate) };
      } else if (endDate) {
        where.endDate = { lte: new Date(endDate) };
      }
    }

    const schedules = await this.prisma.schedule.findMany({
      where,
      include: {
        project: { select: { id: true, projectName: true } },
        creator: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // 정기 일정 확장
    return this.expandRecurringSchedules(schedules, startDate, endDate);
  }

  /**
   * 단일 일정 조회
   */
  async findOne(id: bigint) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, projectName: true } },
        creator: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!schedule || !schedule.isActive) {
      throw new NotFoundException('일정을 찾을 수 없습니다');
    }

    return schedule;
  }

  /**
   * 일정 수정
   */
  async update(id: bigint, userId: bigint, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.findOne(id);

    // 생성자만 수정 가능
    if (schedule.createdBy !== userId) {
      throw new ForbiddenException('본인이 생성한 일정만 수정할 수 있습니다');
    }

    const { participantIds, ...scheduleData } = updateScheduleDto;

    // 날짜 검증
    if (updateScheduleDto.startDate && updateScheduleDto.endDate) {
      const startDate = new Date(updateScheduleDto.startDate);
      const endDate = new Date(updateScheduleDto.endDate);

      if (endDate < startDate) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
      }
    }

    // 참가자 업데이트가 있는 경우
    if (participantIds !== undefined) {
      // 기존 참가자 삭제
      await this.prisma.scheduleParticipant.deleteMany({
        where: { scheduleId: id },
      });

      // 새 참가자 추가
      if (participantIds.length > 0) {
        await Promise.all(
          participantIds.map(async (participantId) => {
            await this.prisma.scheduleParticipant.create({
              data: {
                scheduleId: id,
                userId: BigInt(participantId),
                status: 'PENDING',
              },
            });
          })
        );
      }
    }

    // 일정 업데이트
    const updateData: any = {
      updatedBy: userId,
    };

    if (scheduleData.title !== undefined) updateData.title = scheduleData.title;
    if (scheduleData.description !== undefined) updateData.description = scheduleData.description;
    if (scheduleData.scheduleType !== undefined) updateData.scheduleType = scheduleData.scheduleType;
    if (scheduleData.startDate !== undefined) updateData.startDate = new Date(scheduleData.startDate);
    if (scheduleData.endDate !== undefined) updateData.endDate = new Date(scheduleData.endDate);
    if (scheduleData.location !== undefined) updateData.location = scheduleData.location;
    if (scheduleData.isAllDay !== undefined) updateData.isAllDay = scheduleData.isAllDay;
    if (scheduleData.color !== undefined) updateData.color = scheduleData.color;
    if (scheduleData.teamScope !== undefined) updateData.teamScope = scheduleData.teamScope;
    if (scheduleData.halfDayType !== undefined) updateData.halfDayType = scheduleData.halfDayType;
    if (scheduleData.usageDate !== undefined) updateData.usageDate = scheduleData.usageDate ? new Date(scheduleData.usageDate) : null;
    if (scheduleData.isRecurring !== undefined) updateData.isRecurring = scheduleData.isRecurring;
    if (scheduleData.recurrenceType !== undefined) updateData.recurrenceType = scheduleData.recurrenceType;
    if (scheduleData.recurrenceEndDate !== undefined) updateData.recurrenceEndDate = scheduleData.recurrenceEndDate ? new Date(scheduleData.recurrenceEndDate) : null;

    return await this.prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, projectName: true } },
        creator: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  /**
   * 일정 삭제 (soft delete)
   */
  async remove(id: bigint, userId: bigint) {
    const schedule = await this.findOne(id);

    // 생성자만 삭제 가능
    if (schedule.createdBy !== userId) {
      throw new ForbiddenException('본인이 생성한 일정만 삭제할 수 있습니다');
    }

    await this.prisma.schedule.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * 참가 상태 업데이트
   */
  async updateParticipantStatus(
    scheduleId: bigint,
    userId: bigint,
    status: 'ACCEPTED' | 'DECLINED'
  ) {
    // 일정 존재 확인
    await this.findOne(scheduleId);

    // 참가자 확인
    const participant = await this.prisma.scheduleParticipant.findFirst({
      where: {
        scheduleId,
        userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('일정 참가자가 아닙니다');
    }

    return await this.prisma.scheduleParticipant.update({
      where: { id: participant.id },
      data: { status },
    });
  }
}
