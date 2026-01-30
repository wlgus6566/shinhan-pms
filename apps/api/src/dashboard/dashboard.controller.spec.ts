import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getStats: jest.fn(),
    getTimeline: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return consolidated stats with today data', async () => {
      const mockStats = {
        projects: { total: 10, active: 5, completed: 3, suspended: 2 },
        myTasks: { total: 20, waiting: 5, inProgress: 10, completed: 3, high: 2 },
        thisWeekWorkHours: 25.5,
        today: { tasksDue: 3, schedules: 2 },
      };
      const mockUser = { id: '1', role: 'MEMBER' };

      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockUser);

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalledWith(BigInt(1), 'MEMBER');
    });
  });

  describe('getTimeline', () => {
    it('should return recent activities and upcoming schedules', async () => {
      const mockTimeline = {
        recentActivities: [
          {
            type: 'worklog',
            id: '1',
            title: '업무일지: 테스트 업무',
            description: '테스트 내용',
            user: { id: '1', name: '홍길동' },
            project: { id: '1', name: '프로젝트A' },
            createdAt: new Date('2026-01-30T10:00:00Z'),
          },
        ],
        upcomingSchedules: [
          {
            id: '1',
            title: '테스트 일정',
            description: '일정 설명',
            scheduleType: 'MEETING',
            startDate: '2026-01-31T09:00:00Z',
            endDate: '2026-01-31T10:00:00Z',
            location: '회의실',
            isAllDay: false,
            color: null,
            teamScope: null,
            participants: [],
            createdBy: '1',
            creatorName: '홍길동',
            createdAt: '2026-01-30T08:00:00Z',
          },
        ],
      };
      const mockUser = { id: '1', role: 'MEMBER' };

      mockDashboardService.getTimeline.mockResolvedValue(mockTimeline);

      const result = await controller.getTimeline(mockUser);

      expect(result).toEqual({
        recentActivities: [
          {
            ...mockTimeline.recentActivities[0],
            createdAt: '2026-01-30T10:00:00.000Z',
          },
        ],
        upcomingSchedules: mockTimeline.upcomingSchedules,
      });
      expect(service.getTimeline).toHaveBeenCalledWith(BigInt(1), 'MEMBER');
    });
  });
});
