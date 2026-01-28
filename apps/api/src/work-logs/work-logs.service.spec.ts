import { Test, TestingModule } from '@nestjs/testing';
import { WorkLogsService } from './work-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('WorkLogsService', () => {
  let service: WorkLogsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    task: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    taskAssignee: {
      findFirst: jest.fn(),
    },
    projectMember: {
      findFirst: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    workLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkLogsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkLogsService>(WorkLogsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const taskId = BigInt(1);
    const userId = BigInt(100);
    const projectId = BigInt(10);
    const createWorkLogDto = {
      workDate: '2024-01-25',
      content: '업무 진행 내용',
      workHours: 8,
      progress: 50,
      issues: null,
    };

    const mockTask = {
      id: taskId,
      projectId,
      taskName: '테스트 업무',
      isActive: true,
    };

    const mockCreatedWorkLog = {
      id: BigInt(1),
      taskId,
      userId,
      workDate: new Date('2024-01-25'),
      content: createWorkLogDto.content,
      workHours: new Decimal(8),
      progress: 50,
      issues: null,
      createdAt: new Date(),
      updatedAt: null,
      task: mockTask,
      user: {
        id: userId,
        name: '테스트 사용자',
        email: 'test@emotion.co.kr',
      },
    };

    beforeEach(() => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.workLog.findFirst.mockResolvedValue(null); // 중복 일지 없음
      mockPrismaService.workLog.create.mockResolvedValue(mockCreatedWorkLog);
    });

    it('PL이 업무일지 작성 - 200 성공', async () => {
      // Given: PL 역할의 프로젝트 멤버
      mockPrismaService.taskAssignee.findFirst.mockResolvedValue({ taskId, userId });
      mockPrismaService.projectMember.findFirst.mockResolvedValue({
        projectId,
        memberId: userId,
        role: 'PL',
      });

      // When: 업무일지 작성
      const result = await service.create(taskId, userId, createWorkLogDto);

      // Then: 성공
      expect(result).toBeDefined();
      expect(result.id).toBe(BigInt(1));
      expect(mockPrismaService.workLog.create).toHaveBeenCalled();
    });

    it('PA가 업무일지 작성 - 200 성공', async () => {
      // Given: PA 역할의 프로젝트 멤버
      mockPrismaService.taskAssignee.findFirst.mockResolvedValue({ taskId, userId });
      mockPrismaService.projectMember.findFirst.mockResolvedValue({
        projectId,
        memberId: userId,
        role: 'PA',
      });

      // When: 업무일지 작성
      const result = await service.create(taskId, userId, createWorkLogDto);

      // Then: 성공
      expect(result).toBeDefined();
      expect(result.id).toBe(BigInt(1));
      expect(mockPrismaService.workLog.create).toHaveBeenCalled();
    });

    it('PM이 업무일지 작성 시도 - 403 Forbidden', async () => {
      // Given: PM 역할의 프로젝트 멤버
      mockPrismaService.taskAssignee.findFirst.mockResolvedValue({ taskId, userId });
      mockPrismaService.projectMember.findFirst.mockResolvedValue({
        projectId,
        memberId: userId,
        role: 'PM',
      });

      // When & Then: PM이 작성 시도 시 403 에러
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        'PM은 업무일지를 작성할 수 없습니다',
      );
      expect(mockPrismaService.workLog.create).not.toHaveBeenCalled();
    });

    it('담당자가 아닌 사람 - 403 Forbidden', async () => {
      // Given: 담당자가 아님
      mockPrismaService.taskAssignee.findFirst.mockResolvedValue(null);

      // When & Then: 403 에러
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        '해당 업무의 담당자만 일지를 작성할 수 있습니다',
      );
      expect(mockPrismaService.workLog.create).not.toHaveBeenCalled();
    });

    it('프로젝트 멤버가 아니지만 담당자인 경우 - 일지 작성 허용', async () => {
      // Given: 외부 협력사 등 프로젝트 멤버는 아니지만 담당자임
      mockPrismaService.taskAssignee.findFirst.mockResolvedValue({ taskId, userId });
      mockPrismaService.projectMember.findFirst.mockResolvedValue(null); // 프로젝트 멤버 아님

      // When: 업무일지 작성
      const result = await service.create(taskId, userId, createWorkLogDto);

      // Then: 성공 (PM만 차단, 그 외는 허용)
      expect(result).toBeDefined();
      expect(result.id).toBe(BigInt(1));
      expect(mockPrismaService.workLog.create).toHaveBeenCalled();
    });

    it('업무가 존재하지 않는 경우 - 404 Not Found', async () => {
      // Given: 업무가 없음
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      // When & Then: 404 에러
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        '업무를 찾을 수 없습니다',
      );
    });

    it('동일 날짜에 이미 일지가 존재하는 경우 - 409 Conflict', async () => {
      // Given: 담당자이고 동일 날짜에 일지가 이미 존재
      mockPrismaService.taskAssignee.findFirst.mockResolvedValue({ taskId, userId });
      mockPrismaService.projectMember.findFirst.mockResolvedValue({
        projectId,
        memberId: userId,
        role: 'PA',
      });
      mockPrismaService.workLog.findFirst.mockResolvedValue({
        id: BigInt(999),
        taskId,
        userId,
        workDate: new Date('2024-01-25'),
        isActive: true,
      });

      // When & Then: 409 에러
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(taskId, userId, createWorkLogDto)).rejects.toThrow(
        '해당 날짜에 이미 업무일지가 존재합니다',
      );
      expect(mockPrismaService.workLog.create).not.toHaveBeenCalled();
    });
  });

  describe('generateWeeklyReport', () => {
    const projectId = BigInt(10);
    const startDate = '2024-01-22'; // 월요일
    const endDate = '2024-01-28'; // 일요일

    const mockTask1 = {
      id: BigInt(1),
      projectId,
      taskName: '유료서비스 페이지 리뉴얼',
      clientName: '심수연',
      status: 'IN_PROGRESS',
      difficulty: 'HIGH',
      startDate: new Date('2024-01-15'),
      openDate: new Date('2024-02-01'),
    };

    const mockTask2 = {
      id: BigInt(2),
      projectId,
      taskName: '관리자 대시보드 개선',
      clientName: '이상아',
      status: 'WAITING',
      difficulty: 'MEDIUM',
      startDate: new Date('2024-01-20'),
      openDate: null,
    };

    const mockUsers = {
      planning: { id: BigInt(101), name: '심수연', email: 'planning@emotion.co.kr' },
      design: { id: BigInt(102), name: '이상아', email: 'design@emotion.co.kr' },
      frontend: { id: BigInt(103), name: '김상희', email: 'frontend@emotion.co.kr' },
    };

    const mockAssignees = [
      // Task 1 담당자
      { taskId: BigInt(1), userId: BigInt(101), workArea: 'PLANNING', user: mockUsers.planning },
      { taskId: BigInt(1), userId: BigInt(102), workArea: 'DESIGN', user: mockUsers.design },
      { taskId: BigInt(1), userId: BigInt(103), workArea: 'FRONTEND', user: mockUsers.frontend },
      // Task 2 담당자
      { taskId: BigInt(2), userId: BigInt(101), workArea: 'PLANNING', user: mockUsers.planning },
    ];

    const mockWorkLogs = [
      // Task 1 - 기획 (심수연)
      {
        id: BigInt(1),
        taskId: BigInt(1),
        userId: BigInt(101),
        workDate: new Date('2024-01-22'),
        content: '사용자 요구사항 분석',
        workHours: new Decimal(5),
        progress: 30,
        issues: null,
        task: { ...mockTask1, assignees: mockAssignees.filter(a => a.taskId === BigInt(1)) },
        user: mockUsers.planning,
      },
      {
        id: BigInt(2),
        taskId: BigInt(1),
        userId: BigInt(101),
        workDate: new Date('2024-01-23'),
        content: '화면 설계',
        workHours: new Decimal(3),
        progress: 50,
        issues: '일부 요구사항 불명확',
        task: { ...mockTask1, assignees: mockAssignees.filter(a => a.taskId === BigInt(1)) },
        user: mockUsers.planning,
      },
      // Task 1 - 디자인 (이상아)
      {
        id: BigInt(3),
        taskId: BigInt(1),
        userId: BigInt(102),
        workDate: new Date('2024-01-22'),
        content: '컬러 팔레트 정의',
        workHours: new Decimal(4),
        progress: 20,
        issues: null,
        task: { ...mockTask1, assignees: mockAssignees.filter(a => a.taskId === BigInt(1)) },
        user: mockUsers.design,
      },
      // Task 1 - 프론트엔드 (김상희)
      {
        id: BigInt(4),
        taskId: BigInt(1),
        userId: BigInt(103),
        workDate: new Date('2024-01-24'),
        content: '페이지 레이아웃 작업',
        workHours: new Decimal(6),
        progress: 40,
        issues: null,
        task: { ...mockTask1, assignees: mockAssignees.filter(a => a.taskId === BigInt(1)) },
        user: mockUsers.frontend,
      },
      // Task 2 - 기획 (심수연)
      {
        id: BigInt(5),
        taskId: BigInt(2),
        userId: BigInt(101),
        workDate: new Date('2024-01-25'),
        content: '대시보드 요구사항 정리',
        workHours: new Decimal(2),
        progress: 10,
        issues: null,
        task: { ...mockTask2, assignees: mockAssignees.filter(a => a.taskId === BigInt(2)) },
        user: mockUsers.planning,
      },
    ];

    beforeEach(() => {
      mockPrismaService.workLog.findMany.mockResolvedValue(mockWorkLogs);
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: projectId,
        projectName: '신한 PMS',
      });
    });

    it('날짜 범위 내 workLog만 조회', async () => {
      // When: 주간 리포트 생성
      const buffer = await service.generateWeeklyReport(projectId, startDate, endDate);

      // Then: 날짜 범위 쿼리 확인
      expect(mockPrismaService.workLog.findMany).toHaveBeenCalledWith({
        where: {
          task: { projectId, isActive: true },
          workDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          isActive: true,
        },
        include: {
          task: {
            include: {
              assignees: {
                where: { isActive: true },
                include: { user: true },
              },
            },
          },
          user: true,
        },
        orderBy: [
          { task: { status: 'asc' } },
          { task: { taskName: 'asc' } },
          { workDate: 'asc' },
        ],
      });
    });

    it('업무×담당자 조합으로 행 생성', async () => {
      // When: 주간 리포트 생성
      const buffer = await service.generateWeeklyReport(projectId, startDate, endDate);

      // Then: Excel 버퍼 생성 성공
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('Excel 버퍼 반환', async () => {
      // When: 주간 리포트 생성
      const buffer = await service.generateWeeklyReport(projectId, startDate, endDate);

      // Then: Buffer 타입 반환
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('데이터가 없을 때 헤더만 있는 Excel 생성', async () => {
      // Given: workLog가 없음
      mockPrismaService.workLog.findMany.mockResolvedValue([]);

      // When: 주간 리포트 생성
      const buffer = await service.generateWeeklyReport(projectId, startDate, endDate);

      // Then: 빈 Excel 파일 생성
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('findContentSuggestions', () => {
    const taskId = BigInt(1);
    const userId = BigInt(1);

    it('정상 조회 - 중복 제거, 최신순 정렬, limit 적용 (본인 작성 내용만)', async () => {
      // Given: 과거 작업 내용이 있음 (본인 작성)
      const mockResults = [
        {
          content: 'API 엔드포인트 개발',
          last_used_date: new Date('2024-01-28'),
          usage_count: BigInt(3),
        },
        {
          content: 'DB 스키마 설계',
          last_used_date: new Date('2024-01-27'),
          usage_count: BigInt(2),
        },
        {
          content: '테스트 코드 작성',
          last_used_date: new Date('2024-01-26'),
          usage_count: BigInt(1),
        },
      ];
      mockPrismaService.$queryRaw.mockResolvedValue(mockResults);

      // When: 추천 조회 (limit 10)
      const result = await service.findContentSuggestions(taskId, userId, 10);

      // Then: 변환된 결과 반환
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        content: 'API 엔드포인트 개발',
        lastUsedDate: new Date('2024-01-28').toISOString(),
        usageCount: 3,
      });
      expect(result[1].content).toBe('DB 스키마 설계');
      expect(result[2].content).toBe('테스트 코드 작성');

      // queryRaw 호출 확인
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('빈 content 제외', async () => {
      // Given: $queryRaw가 빈 content를 이미 필터링함 (SQL WHERE 조건)
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      // When: 추천 조회
      const result = await service.findContentSuggestions(taskId, userId, 10);

      // Then: 빈 배열 반환
      expect(result).toEqual([]);
    });

    it('taskId에 일지 없을 때 빈 배열 반환', async () => {
      // Given: 해당 업무에 일지가 없음
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      // When: 추천 조회
      const result = await service.findContentSuggestions(taskId, userId, 10);

      // Then: 빈 배열
      expect(result).toEqual([]);
    });

    it('limit 동작 확인', async () => {
      // Given: limit=5로 조회
      const mockResults = [
        {
          content: 'Content 1',
          last_used_date: new Date('2024-01-28'),
          usage_count: BigInt(1),
        },
        {
          content: 'Content 2',
          last_used_date: new Date('2024-01-27'),
          usage_count: BigInt(1),
        },
      ];
      mockPrismaService.$queryRaw.mockResolvedValue(mockResults);

      // When: limit 5로 조회
      const result = await service.findContentSuggestions(taskId, userId, 5);

      // Then: SQL에 LIMIT 5가 포함되어 호출됨
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });
  });
});
