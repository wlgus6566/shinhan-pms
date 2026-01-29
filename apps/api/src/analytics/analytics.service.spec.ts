import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            workLog: {
              groupBy: jest.fn(),
              findMany: jest.fn(),
              aggregate: jest.fn(),
              count: jest.fn(),
            },
            task: {
              findMany: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
            project: {
              findMany: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyProductivity', () => {
    it('개인 생산성 통계를 정상 조회해야 함', async () => {
      const userId = BigInt(1);
      const startDate = '2026-01-01';
      const endDate = '2026-01-31';

      // Mock work hours aggregate
      jest.spyOn(prisma.workLog, 'aggregate').mockResolvedValueOnce({
        _sum: { workHours: 160.5 },
        _count: 1,
        _avg: {},
        _min: {},
        _max: {},
      } as any);

      // Mock completed tasks count
      jest.spyOn(prisma.task, 'count').mockResolvedValueOnce(12);

      // Mock average progress
      jest.spyOn(prisma.task, 'aggregate').mockResolvedValueOnce({
        _avg: { progress: 75 },
        _sum: {},
        _count: 1,
        _min: {},
        _max: {},
      } as any);

      // Mock issue count
      jest.spyOn(prisma.workLog, 'count').mockResolvedValueOnce(3);

      const result = await service.getMyProductivity(userId, startDate, endDate);

      expect(result).toEqual({
        totalWorkHours: 160.5,
        completedTasks: 12,
        averageProgress: 75,
        issueCount: 3,
      });
    });

    it('프로젝트 필터를 적용해야 함', async () => {
      const userId = BigInt(1);
      const startDate = '2026-01-01';
      const endDate = '2026-01-31';
      const projectId = '10';

      jest.spyOn(prisma.workLog, 'aggregate').mockResolvedValue({
        _sum: { workHours: 80 },
        _count: 1,
        _avg: {},
        _min: {},
        _max: {},
      } as any);

      jest.spyOn(prisma.task, 'count').mockResolvedValue(5);
      jest.spyOn(prisma.task, 'aggregate').mockResolvedValue({
        _avg: { progress: 60 },
        _sum: {},
        _count: 1,
        _min: {},
        _max: {},
      } as any);
      jest.spyOn(prisma.workLog, 'count').mockResolvedValue(1);

      await service.getMyProductivity(userId, startDate, endDate, projectId);

      expect(prisma.workLog.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            task: expect.objectContaining({
              projectId: BigInt(10),
            }),
          }),
        }),
      );
    });
  });

  describe('getWorkHoursTrend', () => {
    it('일별 작업 시간 트렌드를 조회해야 함', async () => {
      const startDate = '2026-01-01';
      const endDate = '2026-01-07';

      const mockData = [
        { workDate: new Date('2026-01-01'), _sum: { workHours: 8 } },
        { workDate: new Date('2026-01-02'), _sum: { workHours: 7.5 } },
        { workDate: new Date('2026-01-03'), _sum: { workHours: 9 } },
      ] as any;

      jest.spyOn(prisma.workLog as any, 'groupBy').mockResolvedValueOnce(mockData);

      const result = await service.getWorkHoursTrend(startDate, endDate, 'day');

      expect(result).toEqual([
        { date: '2026-01-01', workHours: 8 },
        { date: '2026-01-02', workHours: 7.5 },
        { date: '2026-01-03', workHours: 9 },
      ]);
    });

    it('사용자 필터를 적용해야 함', async () => {
      const startDate = '2026-01-01';
      const endDate = '2026-01-07';
      const userId = BigInt(1);

      jest.spyOn(prisma.workLog as any, 'groupBy').mockResolvedValueOnce([]);

      await service.getWorkHoursTrend(startDate, endDate, 'day', undefined, userId);

      expect(prisma.workLog.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: BigInt(1),
          }),
        }),
      );
    });
  });

  describe('getWorkAreaDistribution', () => {
    it('분야별 작업 시간 분포를 조회해야 함', async () => {
      const startDate = '2026-01-01';
      const endDate = '2026-01-31';

      const mockData = [
        { work_area: 'FRONTEND', total_hours: 80, log_count: 10 },
        { work_area: 'BACKEND', total_hours: 60, log_count: 8 },
        { work_area: 'PLANNING', total_hours: 20, log_count: 3 },
      ];

      jest.spyOn(prisma, '$queryRaw').mockResolvedValue(mockData as any);

      const result = await service.getWorkAreaDistribution(startDate, endDate);

      expect(result).toEqual([
        { workArea: 'FRONTEND', hours: 80, percentage: 50 },
        { workArea: 'BACKEND', hours: 60, percentage: 37.5 },
        { workArea: 'PLANNING', hours: 20, percentage: 12.5 },
      ]);
    });
  });

  describe('getMemberWorkload', () => {
    it('팀원별 업무 부하를 조회해야 함', async () => {
      const startDate = '2026-01-01';
      const endDate = '2026-01-31';

      const mockData = [
        {
          user_id: BigInt(1),
          user_name: '홍길동',
          total_hours: 160,
          task_count: BigInt(12),
          avg_progress: 75,
        },
        {
          user_id: BigInt(2),
          user_name: '김철수',
          total_hours: 140,
          task_count: BigInt(10),
          avg_progress: 80,
        },
      ];

      jest.spyOn(prisma, '$queryRaw').mockResolvedValue(mockData as any);

      const result = await service.getMemberWorkload(startDate, endDate);

      expect(result).toEqual([
        {
          userId: '1',
          userName: '홍길동',
          workHours: 160,
          taskCount: 12,
          averageProgress: 75,
        },
        {
          userId: '2',
          userName: '김철수',
          workHours: 140,
          taskCount: 10,
          averageProgress: 80,
        },
      ]);
    });
  });

  describe('getProjectProgress', () => {
    it('프로젝트별 진행률을 조회해야 함', async () => {
      const mockProjects = [
        {
          id: BigInt(1),
          name: '프로젝트 A',
          tasks: [
            { progress: 100 },
            { progress: 100 },
            { progress: 50 },
            { progress: 0 },
          ],
        },
      ];

      jest.spyOn(prisma.project, 'findMany').mockResolvedValue(mockProjects as any);

      const result = await service.getProjectProgress();

      expect(result).toEqual([
        {
          projectId: '1',
          projectName: '프로젝트 A',
          averageProgress: 62.5,
          completedTasks: 2,
          inProgressTasks: 1,
          waitingTasks: 1,
        },
      ]);
    });
  });
});
