import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    findOne: jest.fn(),
    findAllByProject: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transformTask method', () => {
    it('should include position, department, and role in assignee transformation', () => {
      const mockRawTask = {
        id: BigInt(1),
        projectId: BigInt(1),
        taskName: 'Test Task',
        description: 'Test Description',
        difficulty: 'MEDIUM',
        status: 'TODO',
        isActive: true,
        createdAt: new Date('2026-01-29'),
        assignees: [
          {
            id: BigInt(1),
            taskId: BigInt(1),
            userId: BigInt(1),
            workArea: 'PLANNING',
            user: {
              id: BigInt(1),
              name: 'PM User',
              email: 'pm@test.com',
              department: '기획본부',
              position: 'GENERAL_MANAGER',
              role: 'PM',
            },
          },
          {
            id: BigInt(2),
            taskId: BigInt(1),
            userId: BigInt(2),
            workArea: 'FRONTEND',
            user: {
              id: BigInt(2),
              name: 'Frontend Dev',
              email: 'fe@test.com',
              department: '개발본부1',
              position: 'LEADER',
              role: 'DEVELOPER',
            },
          },
        ],
      };

      // Access private method via bracket notation for testing
      const result = controller['transformTask'](mockRawTask);

      expect(result.planningAssignees).toHaveLength(1);
      expect(result.planningAssignees[0]).toEqual({
        id: '1',
        name: 'PM User',
        email: 'pm@test.com',
        department: '기획본부',
        position: 'GENERAL_MANAGER',
        role: 'PM',
      });

      expect(result.frontendAssignees).toHaveLength(1);
      expect(result.frontendAssignees[0]).toEqual({
        id: '2',
        name: 'Frontend Dev',
        email: 'fe@test.com',
        department: '개발본부1',
        position: 'LEADER',
        role: 'DEVELOPER',
      });
    });

    it('should handle assignees without position gracefully', () => {
      const mockRawTask = {
        id: BigInt(2),
        projectId: BigInt(1),
        taskName: 'Test Task 2',
        difficulty: 'LOW',
        status: 'DONE',
        isActive: true,
        createdAt: new Date('2026-01-29'),
        assignees: [
          {
            id: BigInt(3),
            taskId: BigInt(2),
            userId: BigInt(3),
            workArea: 'BACKEND',
            user: {
              id: BigInt(3),
              name: 'Backend Dev',
              email: 'be@test.com',
              department: '개발본부2',
              position: null, // No position assigned
              role: 'DEVELOPER',
            },
          },
        ],
      };

      const result = controller['transformTask'](mockRawTask);

      expect(result.backendAssignees).toHaveLength(1);
      expect(result.backendAssignees[0]).toEqual({
        id: '3',
        name: 'Backend Dev',
        email: 'be@test.com',
        department: '개발본부2',
        position: null,
        role: 'DEVELOPER',
      });
    });

    it('should handle all work areas with position data', () => {
      const mockRawTask = {
        id: BigInt(3),
        projectId: BigInt(1),
        taskName: 'Full Stack Task',
        difficulty: 'HIGH',
        status: 'IN_PROGRESS',
        isActive: true,
        createdAt: new Date('2026-01-29'),
        assignees: [
          {
            id: BigInt(1),
            taskId: BigInt(3),
            userId: BigInt(1),
            workArea: 'PLANNING',
            user: { id: BigInt(1), name: 'Planner', email: 'p@test.com', department: '기획', position: 'DIVISION_HEAD', role: 'PM' },
          },
          {
            id: BigInt(2),
            taskId: BigInt(3),
            userId: BigInt(2),
            workArea: 'DESIGN',
            user: { id: BigInt(2), name: 'Designer', email: 'd@test.com', department: '디자인', position: 'PRINCIPAL_LEADER', role: 'DESIGNER' },
          },
          {
            id: BigInt(3),
            taskId: BigInt(3),
            userId: BigInt(3),
            workArea: 'FRONTEND',
            user: { id: BigInt(3), name: 'FE Dev', email: 'f@test.com', department: '개발', position: 'SENIOR_LEADER', role: 'DEVELOPER' },
          },
          {
            id: BigInt(4),
            taskId: BigInt(3),
            userId: BigInt(4),
            workArea: 'BACKEND',
            user: { id: BigInt(4), name: 'BE Dev', email: 'b@test.com', department: '개발', position: 'TEAM_MEMBER', role: 'DEVELOPER' },
          },
        ],
      };

      const result = controller['transformTask'](mockRawTask);

      expect(result.planningAssignees[0].position).toBe('DIVISION_HEAD');
      expect(result.designAssignees[0].position).toBe('PRINCIPAL_LEADER');
      expect(result.frontendAssignees[0].position).toBe('SENIOR_LEADER');
      expect(result.backendAssignees[0].position).toBe('TEAM_MEMBER');
    });
  });
});
