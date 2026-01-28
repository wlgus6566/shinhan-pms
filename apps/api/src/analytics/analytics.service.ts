import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  ProductivityStats,
  WorkHoursTrendItem,
  WorkAreaDistributionItem,
  MemberWorkloadItem,
  ProjectProgressItem,
  PartTaskCountResponse,
  PartWorkHoursResponse,
  PartTaskCount,
  PartWorkHours,
  TaskStatusCountResponse,
  TaskStatusCountItem,
} from '@repo/schema';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 개인 생산성 통계 조회
   */
  async getMyProductivity(
    userId: bigint,
    startDate: string,
    endDate: string,
    projectId?: string,
  ): Promise<ProductivityStats> {
    const where: Prisma.WorkLogWhereInput = {
      isActive: true,
      userId,
      workDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      ...(projectId && {
        task: {
          projectId: BigInt(projectId),
        },
      }),
    };

    // 총 작업 시간
    const workHoursResult = await this.prisma.workLog.aggregate({
      where,
      _sum: {
        workHours: true,
      },
    });

    // 완료한 업무 수 (최신 work log의 progress = 100인 업무)
    const workLogsWithProgress = await this.prisma.workLog.findMany({
      where,
      select: {
        taskId: true,
        progress: true,
        workDate: true,
      },
      orderBy: {
        workDate: 'desc',
      },
    });

    // 각 task의 최신 progress 가져오기
    const taskProgressMap = new Map<bigint, number>();
    workLogsWithProgress.forEach((log) => {
      if (!taskProgressMap.has(log.taskId) && log.progress !== null) {
        taskProgressMap.set(log.taskId, log.progress);
      }
    });

    const completedTasks = Array.from(taskProgressMap.values()).filter(p => p === 100).length;

    // 평균 진행률
    const totalProgress = Array.from(taskProgressMap.values()).reduce((sum, p) => sum + p, 0);
    const averageProgress = taskProgressMap.size > 0 ? totalProgress / taskProgressMap.size : 0;

    // 이슈 발생 건수 (issues 필드가 비어있지 않은 업무일지)
    const issueCount = await this.prisma.workLog.count({
      where: {
        ...where,
        AND: [
          { issues: { not: null } },
          { issues: { not: '' } },
        ],
      },
    });

    return {
      totalWorkHours: Number(workHoursResult._sum.workHours) || 0,
      completedTasks,
      averageProgress: Math.round(averageProgress),
      issueCount,
    };
  }

  /**
   * 작업 시간 트렌드 조회 (일/주/월별)
   */
  async getWorkHoursTrend(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month',
    projectId?: string,
    userId?: bigint,
  ): Promise<WorkHoursTrendItem[]> {
    const where: Prisma.WorkLogWhereInput = {
      isActive: true,
      workDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      ...(projectId && {
        task: {
          projectId: BigInt(projectId),
        },
      }),
      ...(userId && { userId }),
    };

    const groupedData = await this.prisma.workLog.groupBy({
      by: ['workDate'],
      where,
      _sum: {
        workHours: true,
      },
      orderBy: {
        workDate: 'asc',
      },
    });

    return groupedData.map((item) => ({
      date: item.workDate.toISOString().split('T')[0],
      workHours: Number(item._sum.workHours) || 0,
    }));
  }

  /**
   * 분야별 작업 시간 분포 조회
   */
  async getWorkAreaDistribution(
    startDate: string,
    endDate: string,
    projectId?: string,
    userId?: bigint,
  ): Promise<WorkAreaDistributionItem[]> {
    const projectFilter = projectId
      ? Prisma.sql`AND t.project_id = ${BigInt(projectId)}`
      : Prisma.empty;
    const userFilter = userId ? Prisma.sql`AND wl.user_id = ${userId}` : Prisma.empty;

    const rawData: Array<{
      work_area: string;
      total_hours: number;
      log_count: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        ta.work_area,
        COALESCE(SUM(wl.work_hours), 0) as total_hours,
        COUNT(DISTINCT wl.id) as log_count
      FROM work_logs wl
      JOIN tasks t ON wl.task_id = t.id
      JOIN task_assignees ta ON t.id = ta.task_id AND wl.user_id = ta.user_id
      WHERE wl.is_active = true
        AND wl.work_date BETWEEN ${startDate}::date AND ${endDate}::date
        ${projectFilter}
        ${userFilter}
      GROUP BY ta.work_area
      ORDER BY total_hours DESC
    `;

    const totalHours = rawData.reduce((sum, item) => sum + Number(item.total_hours), 0);

    return rawData.map((item) => ({
      workArea: item.work_area,
      hours: Number(item.total_hours),
      percentage: totalHours > 0 ? (Number(item.total_hours) / totalHours) * 100 : 0,
    }));
  }

  /**
   * 팀원별 업무 부하 조회
   */
  async getMemberWorkload(
    startDate: string,
    endDate: string,
    projectId?: string,
  ): Promise<MemberWorkloadItem[]> {
    const projectFilter = projectId
      ? Prisma.sql`AND t.project_id = ${BigInt(projectId)}`
      : Prisma.empty;

    const rawData: Array<{
      user_id: bigint;
      user_name: string;
      total_hours: number;
      task_count: bigint;
      avg_progress: number;
    }> = await this.prisma.$queryRaw`
      SELECT
        u.id as user_id,
        u.name as user_name,
        COALESCE(SUM(wl.work_hours), 0) as total_hours,
        COUNT(DISTINCT wl.task_id) as task_count,
        COALESCE(AVG(t.progress), 0) as avg_progress
      FROM users u
      LEFT JOIN work_logs wl ON u.id = wl.user_id
        AND wl.is_active = true
        AND wl.work_date BETWEEN ${startDate}::date AND ${endDate}::date
      LEFT JOIN tasks t ON wl.task_id = t.id AND t.is_active = true
      WHERE u.is_active = true
        ${projectFilter}
      GROUP BY u.id, u.name
      HAVING SUM(wl.work_hours) > 0
      ORDER BY total_hours DESC
    `;

    return rawData.map((item) => ({
      userId: item.user_id.toString(),
      userName: item.user_name,
      workHours: Number(item.total_hours),
      taskCount: Number(item.task_count),
      averageProgress: Math.round(Number(item.avg_progress)),
    }));
  }

  /**
   * 프로젝트별 진행률 조회
   */
  async getProjectProgress(projectId?: string): Promise<ProjectProgressItem[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        isActive: true,
        ...(projectId && { id: BigInt(projectId) }),
      },
      include: {
        tasks: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            workLogs: {
              where: {
                isActive: true,
              },
              select: {
                progress: true,
                workDate: true,
              },
              orderBy: {
                workDate: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    return projects.map((project) => {
      const tasks = project.tasks;
      const totalTasks = tasks.length;

      // 각 task의 최신 progress 가져오기
      const taskProgresses = tasks.map(task => {
        const latestLog = task.workLogs[0];
        return latestLog?.progress ?? 0;
      });

      const averageProgress =
        totalTasks > 0
          ? taskProgresses.reduce((sum, progress) => sum + progress, 0) / totalTasks
          : 0;

      const completedTasks = taskProgresses.filter((progress) => progress === 100).length;
      const inProgressTasks = taskProgresses.filter(
        (progress) => progress > 0 && progress < 100,
      ).length;
      const waitingTasks = taskProgresses.filter((progress) => progress === 0).length;

      return {
        projectId: project.id.toString(),
        projectName: project.projectName,
        averageProgress: Math.round(averageProgress * 10) / 10,
        completedTasks,
        inProgressTasks,
        waitingTasks,
      };
    });
  }

  /**
   * 이슈 발생 빈도 조회
   */
  async getIssueFrequency(
    startDate: string,
    endDate: string,
    projectId?: string,
  ): Promise<WorkHoursTrendItem[]> {
    const projectFilter = projectId
      ? Prisma.sql`AND t.project_id = ${BigInt(projectId)}`
      : Prisma.empty;

    const rawData: Array<{
      work_date: Date;
      issue_count: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        wl.work_date,
        COUNT(*) as issue_count
      FROM work_logs wl
      JOIN tasks t ON wl.task_id = t.id
      WHERE wl.is_active = true
        AND wl.work_date BETWEEN ${startDate}::date AND ${endDate}::date
        AND wl.issues IS NOT NULL
        AND wl.issues != ''
        ${projectFilter}
      GROUP BY wl.work_date
      ORDER BY wl.work_date ASC
    `;

    return rawData.map((item) => ({
      date: item.work_date.toISOString().split('T')[0],
      workHours: Number(item.issue_count), // reusing workHours field for count
    }));
  }

  /**
   * 파트별 담당 업무 건수 조회
   */
  async getPartTaskCount(
    projectId: string,
    yearMonth: string,
  ): Promise<PartTaskCountResponse> {
    // yearMonth를 startDate/endDate로 변환 (현재는 필터링에 사용하지 않음)

    // 쿼리: 프로젝트 멤버들의 파트별 업무 건수
    const rawData: Array<{
      work_area: string;
      user_id: bigint;
      user_name: string;
      task_count: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        ta.work_area,
        u.id as user_id,
        u.name as user_name,
        COUNT(DISTINCT ta.task_id) as task_count
      FROM task_assignees ta
      JOIN users u ON ta.user_id = u.id
      JOIN tasks t ON ta.task_id = t.id
      WHERE t.project_id = ${BigInt(projectId)}
        AND t.is_active = true
        AND u.is_active = true
      GROUP BY ta.work_area, u.id, u.name
      ORDER BY ta.work_area, u.name
    `;

    // 파트별로 그룹화 및 평균 계산
    const partMap = new Map<string, PartTaskCount>();

    rawData.forEach((row) => {
      const workArea = row.work_area as any;
      if (!partMap.has(workArea)) {
        partMap.set(workArea, {
          workArea,
          members: [],
          totalCount: 0,
          averageCount: 0,
        });
      }

      const part = partMap.get(workArea)!;
      const taskCount = Number(row.task_count);

      part.members.push({
        userId: row.user_id.toString(),
        userName: row.user_name,
        taskCount,
      });
      part.totalCount += taskCount;
    });

    const parts = Array.from(partMap.values()).map((part) => ({
      ...part,
      averageCount:
        part.members.length > 0
          ? Math.round((part.totalCount / part.members.length) * 10) / 10
          : 0,
    }));

    return { parts };
  }

  /**
   * 파트별 일일 평균 근무 시간 조회
   */
  async getPartWorkHours(
    projectId: string,
    yearMonth: string,
  ): Promise<PartWorkHoursResponse> {
    const [year, month] = yearMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    // 쿼리: 파트별 일일 평균 근무 시간
    const rawData: Array<{
      work_area: string;
      user_id: bigint;
      user_name: string;
      total_hours: number;
      work_days: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        ta.work_area,
        u.id as user_id,
        u.name as user_name,
        COALESCE(SUM(wl.work_hours), 0) as total_hours,
        COUNT(DISTINCT wl.work_date) as work_days
      FROM task_assignees ta
      JOIN users u ON ta.user_id = u.id
      JOIN tasks t ON ta.task_id = t.id
      LEFT JOIN work_logs wl ON wl.task_id = t.id
        AND wl.user_id = u.id
        AND wl.is_active = true
        AND wl.work_date BETWEEN ${startDate}::date AND ${endDate}::date
      WHERE t.project_id = ${BigInt(projectId)}
        AND t.is_active = true
        AND u.is_active = true
      GROUP BY ta.work_area, u.id, u.name
      HAVING COUNT(DISTINCT wl.work_date) > 0
      ORDER BY ta.work_area, u.name
    `;

    // 파트별로 그룹화 및 평균 계산
    const partMap = new Map<string, PartWorkHours>();

    rawData.forEach((row) => {
      const workArea = row.work_area as any;
      if (!partMap.has(workArea)) {
        partMap.set(workArea, {
          workArea,
          members: [],
          partAvgHours: 0,
        });
      }

      const part = partMap.get(workArea)!;
      const avgHours =
        Number(row.work_days) > 0 ? Number(row.total_hours) / Number(row.work_days) : 0;

      part.members.push({
        userId: row.user_id.toString(),
        userName: row.user_name,
        avgHours: Math.round(avgHours * 10) / 10,
      });
    });

    const parts = Array.from(partMap.values()).map((part) => {
      const totalAvg = part.members.reduce((sum: number, m) => sum + m.avgHours, 0);
      return {
        ...part,
        partAvgHours:
          part.members.length > 0
            ? Math.round((totalAvg / part.members.length) * 10) / 10
            : 0,
      };
    });

    return { parts };
  }

  /**
   * 상태별 진행 건수 조회
   */
  async getTaskStatusCount(
    projectId: string,
    _yearMonth: string,
  ): Promise<TaskStatusCountResponse> {
    // 프로젝트의 모든 활성 업무를 상태별로 집계
    const rawData: Array<{
      status: string;
      task_count: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        t.status,
        COUNT(t.id) as task_count
      FROM tasks t
      WHERE t.project_id = ${BigInt(projectId)}
        AND t.is_active = true
      GROUP BY t.status
      ORDER BY task_count DESC
    `;

    const totalCount = rawData.reduce((sum, item) => sum + Number(item.task_count), 0);

    const statusCounts: TaskStatusCountItem[] = rawData.map((item) => ({
      status: item.status,
      count: Number(item.task_count),
      percentage: totalCount > 0 ? (Number(item.task_count) / totalCount) * 100 : 0,
    }));

    return { statusCounts };
  }
}
