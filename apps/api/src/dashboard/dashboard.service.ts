import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay } from 'date-fns';
import type {
  DashboardStats,
  DashboardTimeline,
  RecentActivity,
  UpcomingSchedule,
} from '@repo/schema';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 프로젝트 필터 조건 생성 헬퍼
   * @param userId - 사용자 ID
   * @param userRole - 사용자 역할
   */
  private getProjectWhereClause(userId: bigint, userRole: string) {
    const projectWhere: any = { isActive: true };

    if (userRole !== 'SUPER_ADMIN') {
      projectWhere.members = {
        some: {
          memberId: userId,
        },
      };
    }

    return projectWhere;
  }

  /**
   * 사용자가 속한 프로젝트 ID 목록 조회 헬퍼
   * @param userId - 사용자 ID
   * @param userRole - 사용자 역할
   */
  private async getUserProjectIds(
    userId: bigint,
    userRole: string,
  ): Promise<bigint[]> {
    if (userRole === 'SUPER_ADMIN') {
      return [];
    }

    const myProjects = await this.prisma.projectMember.findMany({
      where: { memberId: userId },
      select: { projectId: true },
    });

    return myProjects.map((pm) => pm.projectId);
  }

  /**
   * 오늘 날짜 범위 헬퍼
   */
  private getTodayDateRange() {
    return {
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    };
  }

  /**
   * 이번 주 날짜 범위 헬퍼 (월요일 ~ 일요일)
   */
  private getThisWeekDateRange() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0(일) ~ 6(토)
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일까지의 차이
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  }

  /**
   * 대시보드 통합 통계 조회 (프로젝트, 업무, 작업시간, 오늘 통계)
   * @param userId - 사용자 ID
   * @param userRole - 사용자 역할 ('SUPER_ADMIN', 'PM', 'MEMBER' 등)
   */
  async getStats(userId: bigint, userRole: string): Promise<DashboardStats> {
    // 1. 프로젝트 통계 (SUPER_ADMIN은 전체, 일반 사용자는 자신이 속한 프로젝트만)
    const projectWhere = this.getProjectWhereClause(userId, userRole);

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      suspendedProjects,
    ] = await Promise.all([
      this.prisma.project.count({ where: projectWhere }),
      this.prisma.project.count({
        where: { ...projectWhere, status: 'ACTIVE' },
      }),
      this.prisma.project.count({
        where: { ...projectWhere, status: 'COMPLETED' },
      }),
      this.prisma.project.count({
        where: { ...projectWhere, status: 'SUSPENDED' },
      }),
    ]);

    // 2. 내 업무 통계
    const myTaskWhere = {
      isActive: true,
      assignees: {
        some: {
          userId,
        },
      },
    };

    // 오늘 날짜 범위
    const { start: todayStart, end: todayEnd } = this.getTodayDateRange();

    const [
      totalTasks,
      waitingTasks,
      inProgressTasks,
      completedTasks,
      highPriorityTasks,
      todayTasksDue,
    ] = await Promise.all([
      this.prisma.task.count({ where: myTaskWhere }),
      this.prisma.task.count({
        where: { ...myTaskWhere, status: 'WAITING' },
      }),
      this.prisma.task.count({
        where: { ...myTaskWhere, status: 'IN_PROGRESS' },
      }),
      this.prisma.task.count({
        where: { ...myTaskWhere, status: 'COMPLETED' },
      }),
      this.prisma.task.count({
        where: { ...myTaskWhere, difficulty: 'HIGH' },
      }),
      // 오늘 마감 업무 (통합)
      this.prisma.taskAssignee.count({
        where: {
          userId,
          task: {
            isActive: true,
            endDate: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
      }),
    ]);

    // 3. 이번 주 작업 시간 (월요일 ~ 일요일)
    const { monday, sunday } = this.getThisWeekDateRange();

    const workLogs = await this.prisma.workLog.aggregate({
      where: {
        userId,
        isActive: true,
        workDate: {
          gte: monday,
          lte: sunday,
        },
      },
      _sum: {
        workHours: true,
      },
    });

    const thisWeekWorkHours = workLogs._sum.workHours
      ? Number(workLogs._sum.workHours)
      : 0;

    // 4. 오늘의 일정
    const todaySchedules = await this.prisma.scheduleParticipant.count({
      where: {
        userId,
        schedule: {
          isActive: true,
          startDate: {
            lte: todayEnd,
          },
          endDate: {
            gte: todayStart,
          },
        },
      },
    });

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        suspended: suspendedProjects,
      },
      myTasks: {
        total: totalTasks,
        waiting: waitingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        high: highPriorityTasks,
      },
      thisWeekWorkHours,
      today: {
        tasksDue: todayTasksDue,
        schedules: todaySchedules,
      },
    };
  }

  /**
   * 최근 활동 조회
   * @param userId - 사용자 ID (SUPER_ADMIN은 전체, 일반 사용자는 자신이 속한 프로젝트의 활동만)
   * @param userRole - 사용자 역할
   * @param limit - 조회 개수
   */
  async getRecentActivities(
    userId: bigint,
    userRole: string,
    limit: number = 10,
  ): Promise<RecentActivity[]> {
    // 프로젝트 필터 (SUPER_ADMIN이 아닌 경우 내가 속한 프로젝트만)
    const projectIds = await this.getUserProjectIds(userId, userRole);

    // 최근 업무일지 (내 프로젝트의 팀원 활동)
    const workLogWhere = {
      isActive: true,
      ...(projectIds.length > 0 && {
        task: {
          projectId: {
            in: projectIds,
          },
        },
      }),
    };

    const recentWorkLogs = await this.prisma.workLog.findMany({
      where: workLogWhere,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            taskName: true,
            projectId: true,
            project: {
              select: {
                id: true,
                projectName: true,
              },
            },
          },
        },
      },
    });

    // 최근 생성된 업무 (내 프로젝트의 업무)
    const taskWhere = {
      isActive: true,
      ...(projectIds.length > 0 && {
        projectId: {
          in: projectIds,
        },
      }),
    };

    const recentTasks = await this.prisma.task.findMany({
      where: taskWhere,
      take: Math.floor(limit / 2),
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });

    // 활동 통합 및 정렬
    const activities: RecentActivity[] = [
      ...recentWorkLogs.map((log) => ({
        type: 'worklog' as const,
        id: log.id.toString(),
        title: `업무일지: ${log.task.taskName}`,
        description:
          log.content.substring(0, 100) +
          (log.content.length > 100 ? '...' : ''),
        user: {
          id: log.user.id.toString(),
          name: log.user.name,
        },
        project: {
          id: log.task.project.id.toString(),
          name: log.task.project.projectName,
        },
        createdAt: log.createdAt,
      })),
      ...recentTasks.map((task) => ({
        type: 'task' as const,
        id: task.id.toString(),
        title: `새 업무: ${task.taskName}`,
        description: task.description || '설명 없음',
        user: {
          id: task.creator.id.toString(),
          name: task.creator.name,
        },
        project: {
          id: task.project.id.toString(),
          name: task.project.projectName,
        },
        createdAt: task.createdAt,
      })),
    ];

    // 최신순 정렬 후 limit 적용
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * 다가오는 일정 조회
   * @param userId - 사용자 ID
   * @param limit - 조회 개수
   */
  async getUpcomingSchedules(userId: bigint, limit: number = 5) {
    const now = new Date();

    const schedules = await this.prisma.schedule.findMany({
      where: {
        isActive: true,
        startDate: {
          gte: now,
        },
        OR: [
          // 내가 생성한 일정
          { createdBy: userId },
          // 내가 참여자인 일정
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return schedules.map((schedule) => ({
      id: schedule.id.toString(),
      projectId: schedule.projectId?.toString(),
      title: schedule.title,
      description: schedule.description,
      scheduleType: schedule.scheduleType,
      startDate: schedule.startDate.toISOString(),
      endDate: schedule.endDate.toISOString(),
      location: schedule.location,
      isAllDay: schedule.isAllDay,
      color: schedule.color,
      teamScope: schedule.teamScope,
      project: schedule.project
        ? {
            id: schedule.project.id.toString(),
            name: schedule.project.projectName,
          }
        : undefined,
      participants: schedule.participants.map((p) => ({
        id: p.user.id.toString(),
        name: p.user.name,
        email: p.user.email,
        status: p.status,
      })),
      createdBy: schedule.createdBy.toString(),
      creatorName: schedule.creator.name,
      createdAt: schedule.createdAt.toISOString(),
    }));
  }

  /**
   * 대시보드 타임라인 조회 (최근 활동 + 예정 일정)
   * @param userId - 사용자 ID
   * @param userRole - 사용자 역할
   */
  async getTimeline(
    userId: bigint,
    userRole: string,
  ): Promise<DashboardTimeline> {
    const [recentActivities, upcomingSchedules] = await Promise.all([
      this.getRecentActivities(userId, userRole, 10),
      this.getUpcomingSchedules(userId, 5),
    ]);

    return {
      recentActivities,
      upcomingSchedules,
    };
  }

  /**
   * @deprecated 이 메서드는 getStats()로 통합되었습니다.
   * 사용자 위젯 통계 조회
   * @param userId - 사용자 ID
   */
  async getUserWidgetStats(userId: bigint) {
    const today = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());

    // Query tasks assigned to user that are due today
    const todayTasksDue = await this.prisma.taskAssignee.count({
      where: {
        userId,
        task: {
          isActive: true,
          endDate: {
            gte: today,
            lte: endOfToday,
          },
        },
      },
    });

    // Query schedules for today where user is a participant
    const todaySchedules = await this.prisma.scheduleParticipant.count({
      where: {
        userId,
        schedule: {
          isActive: true,
          startDate: {
            lte: endOfToday,
          },
          endDate: {
            gte: today,
          },
        },
      },
    });

    return {
      todayTasksDue,
      todaySchedules,
    };
  }
}
