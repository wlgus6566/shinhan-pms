import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    project: {
      findUnique: jest.fn(),
    },
    projectMember: {
      findFirst: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    taskAssignee: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task with multiple assignees', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const createTaskDto = {
        taskName: 'Test Task',
        description: 'Test Description',
        difficulty: 'MEDIUM',
        planningAssigneeIds: [1, 2],
        designAssigneeIds: [3],
        frontendAssigneeIds: [],
        backendAssigneeIds: [4, 5],
      };

      const mockProject = { id: projectId };
      const mockMember = { projectId, memberId: userId, role: 'PM' };
      const mockTask = {
        id: BigInt(1),
        projectId,
        taskName: createTaskDto.taskName,
        description: createTaskDto.description,
        difficulty: createTaskDto.difficulty,
        assignees: [
          { id: BigInt(1), taskId: BigInt(1), userId: BigInt(1), workArea: 'PLANNING', user: { id: BigInt(1), name: 'User 1', email: 'user1@test.com' } },
          { id: BigInt(2), taskId: BigInt(1), userId: BigInt(2), workArea: 'PLANNING', user: { id: BigInt(2), name: 'User 2', email: 'user2@test.com' } },
          { id: BigInt(3), taskId: BigInt(1), userId: BigInt(3), workArea: 'DESIGN', user: { id: BigInt(3), name: 'User 3', email: 'user3@test.com' } },
          { id: BigInt(4), taskId: BigInt(1), userId: BigInt(4), workArea: 'BACKEND', user: { id: BigInt(4), name: 'User 4', email: 'user4@test.com' } },
          { id: BigInt(5), taskId: BigInt(1), userId: BigInt(5), workArea: 'BACKEND', user: { id: BigInt(5), name: 'User 5', email: 'user5@test.com' } },
        ],
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectMember.findFirst
        .mockResolvedValueOnce(mockMember) // PM check
        .mockResolvedValueOnce({ projectId, memberId: BigInt(1), workArea: 'PLANNING' }) // planning assignee 1
        .mockResolvedValueOnce({ projectId, memberId: BigInt(2), workArea: 'PLANNING' }) // planning assignee 2
        .mockResolvedValueOnce({ projectId, memberId: BigInt(3), workArea: 'DESIGN' }) // design assignee
        .mockResolvedValueOnce({ projectId, memberId: BigInt(4), workArea: 'BACKEND' }) // backend assignee 1
        .mockResolvedValueOnce({ projectId, memberId: BigInt(5), workArea: 'BACKEND' }); // backend assignee 2
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await service.create(projectId, userId, createTaskDto as any);

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskName: createTaskDto.taskName,
            assignees: {
              create: expect.arrayContaining([
                { userId: BigInt(1), workArea: 'PLANNING' },
                { userId: BigInt(2), workArea: 'PLANNING' },
                { userId: BigInt(3), workArea: 'DESIGN' },
                { userId: BigInt(4), workArea: 'BACKEND' },
                { userId: BigInt(5), workArea: 'BACKEND' },
              ]),
            },
          }),
        }),
      );
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(
        service.create(BigInt(1), BigInt(1), {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not PM', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrismaService.projectMember.findFirst.mockResolvedValue(null);

      await expect(
        service.create(BigInt(1), BigInt(1), { taskName: 'Test' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create a task with openDate', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const createTaskDto = {
        taskName: 'Test Task',
        difficulty: 'MEDIUM',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        openDate: '2026-02-01',
      };

      const mockProject = { id: projectId };
      const mockMember = { projectId, memberId: userId, role: 'PM' };
      const mockTask = {
        id: BigInt(1),
        projectId,
        taskName: 'Test Task',
        difficulty: 'MEDIUM',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        openDate: new Date('2026-02-01'),
        assignees: [],
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      await service.create(projectId, userId, createTaskDto as any);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            openDate: new Date('2026-02-01'),
          }),
        }),
      );
    });

    it('should create a task with null openDate when not provided', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const createTaskDto = {
        taskName: 'Test Task',
        difficulty: 'MEDIUM',
      };

      const mockProject = { id: projectId };
      const mockMember = { projectId, memberId: userId, role: 'PM' };
      const mockTask = {
        id: BigInt(1),
        openDate: null,
        assignees: [],
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      await service.create(projectId, userId, createTaskDto as any);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            openDate: null,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update task assignees', async () => {
      const taskId = BigInt(1);
      const userId = BigInt(1);
      const updateTaskDto = {
        taskName: 'Updated Task',
        planningAssigneeIds: [1, 2, 3],
        designAssigneeIds: [],
      };

      const mockTask = {
        id: taskId,
        projectId: BigInt(1),
        taskName: 'Old Task',
        isActive: true,
        assignees: [],
      };

      const mockMember = { projectId: BigInt(1), memberId: userId, role: 'PM' };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.projectMember.findFirst
        .mockResolvedValueOnce(mockMember)
        .mockResolvedValue({ projectId: BigInt(1), memberId: BigInt(1), workArea: 'PLANNING' });
      mockPrismaService.taskAssignee.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.task.update.mockResolvedValue({
        ...mockTask,
        taskName: updateTaskDto.taskName,
      });

      await service.update(taskId, userId, updateTaskDto as any);

      expect(mockPrismaService.taskAssignee.deleteMany).toHaveBeenCalledWith({
        where: { taskId },
      });
      expect(mockPrismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignees: {
              create: expect.arrayContaining([
                { userId: BigInt(1), workArea: 'PLANNING' },
                { userId: BigInt(2), workArea: 'PLANNING' },
                { userId: BigInt(3), workArea: 'PLANNING' },
              ]),
            },
          }),
        }),
      );
    });

    it('should update task with new openDate', async () => {
      const taskId = BigInt(1);
      const userId = BigInt(1);
      const updateTaskDto = {
        openDate: '2026-03-01',
      };

      const mockTask = {
        id: taskId,
        projectId: BigInt(1),
        isActive: true,
      };

      const mockMember = { projectId: BigInt(1), memberId: userId, role: 'PM' };
      const mockUpdatedTask = {
        id: taskId,
        openDate: new Date('2026-03-01'),
        assignees: [],
      };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.task.update.mockResolvedValue(mockUpdatedTask);

      await service.update(taskId, userId, updateTaskDto as any);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            openDate: new Date('2026-03-01'),
          }),
        }),
      );
    });
  });

  describe('findAllByProject', () => {
    it('should filter tasks by search query', async () => {
      const projectId = BigInt(1);
      const mockTasks = [
        {
          id: BigInt(1),
          taskName: 'API Development',
          projectId,
          isActive: true,
          assignees: [],
        },
        {
          id: BigInt(2),
          taskName: 'API Testing',
          projectId,
          isActive: true,
          assignees: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      await service.findAllByProject(projectId, { search: 'API' });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId,
            isActive: true,
            taskName: {
              contains: 'API',
              mode: 'insensitive',
            },
          }),
        }),
      );
      expect(mockPrismaService.task.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          taskName: {
            contains: 'API',
            mode: 'insensitive',
          },
        }),
      });
    });

    it('should filter tasks by multiple statuses', async () => {
      const projectId = BigInt(1);
      const mockTasks = [
        {
          id: BigInt(1),
          taskName: 'Task 1',
          status: 'IN_PROGRESS',
          projectId,
          isActive: true,
          assignees: [],
        },
        {
          id: BigInt(2),
          taskName: 'Task 2',
          status: 'COMPLETED',
          projectId,
          isActive: true,
          assignees: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      await service.findAllByProject(projectId, {
        status: ['IN_PROGRESS', 'COMPLETED'],
      });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId,
            isActive: true,
            status: {
              in: ['IN_PROGRESS', 'COMPLETED'],
            },
          }),
        }),
      );
    });

    it('should filter tasks by difficulty levels', async () => {
      const projectId = BigInt(1);
      const mockTasks = [
        {
          id: BigInt(1),
          taskName: 'Hard Task',
          difficulty: 'HIGH',
          projectId,
          isActive: true,
          assignees: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.findAllByProject(projectId, {
        difficulty: ['HIGH'],
      });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId,
            isActive: true,
            difficulty: {
              in: ['HIGH'],
            },
          }),
        }),
      );
    });

    it('should apply multiple filters simultaneously', async () => {
      const projectId = BigInt(1);
      const mockTasks = [
        {
          id: BigInt(1),
          taskName: 'API Development',
          status: 'IN_PROGRESS',
          difficulty: 'HIGH',
          projectId,
          isActive: true,
          assignees: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.findAllByProject(projectId, {
        search: 'API',
        status: ['IN_PROGRESS', 'COMPLETED'],
        difficulty: ['HIGH'],
      });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId,
            isActive: true,
            taskName: {
              contains: 'API',
              mode: 'insensitive',
            },
            status: {
              in: ['IN_PROGRESS', 'COMPLETED'],
            },
            difficulty: {
              in: ['HIGH'],
            },
          }),
        }),
      );
    });
  });
});
