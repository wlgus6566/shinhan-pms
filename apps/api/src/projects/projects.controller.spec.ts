import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { SchedulesService } from '../schedules/schedules.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findMyProjects: jest.fn(),
    getProjectMembers: jest.fn(),
    addProjectMember: jest.fn(),
    updateProjectMemberRole: jest.fn(),
    removeProjectMember: jest.fn(),
  };

  const mockSchedulesService = {
    findByProject: jest.fn(),
    create: jest.fn(),
  };

  const mockUser = {
    id: '1',
    name: '김철수',
    email: 'kim@emotion.co.kr',
    role: 'PM',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: SchedulesService,
          useValue: mockSchedulesService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a project with authenticated user', async () => {
      const createDto = {
        name: '테스트 프로젝트',
        projectType: 'OPERATION' as const,
        client: '신한카드',
        description: '설명',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const mockProject = {
        id: 1n,
        projectName: createDto.name,
        projectType: createDto.projectType,
        client: createDto.client,
        description: createDto.description,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        isActive: true,
        createdBy: 1n,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null,
      };

      mockProjectsService.create.mockResolvedValue(mockProject);

      const result = await controller.create(mockUser, createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-12-31');
      expect(service.create).toHaveBeenCalledWith(createDto, BigInt(1));
    });
  });

  describe('findAll', () => {
    it('should return paginated project list', async () => {
      const mockProjects = {
        list: [
          {
            id: 1n,
            projectName: '프로젝트1',
            projectType: 'OPERATION',
            client: '신한카드',
            description: null,
            startDate: null,
            endDate: null,
            status: 'ACTIVE',
            isActive: true,
            createdBy: 1n,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: null,
          },
          {
            id: 2n,
            projectName: '프로젝트2',
            projectType: 'PROJECT',
            client: '신한은행',
            description: null,
            startDate: null,
            endDate: null,
            status: 'ACTIVE',
            isActive: true,
            createdBy: 1n,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: null,
          },
        ],
        totalCount: 2,
      };

      mockProjectsService.findAll.mockResolvedValue(mockProjects);

      const result = await controller.findAll();

      expect(result.list).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.list[0].id).toBe('1');
      expect(result.list[1].id).toBe('2');
    });
  });

  describe('findOne', () => {
    it('should find and return a project', async () => {
      const mockProject = {
        id: 1n,
        projectName: '프로젝트1',
        projectType: 'OPERATION',
        client: '신한카드',
        description: null,
        startDate: null,
        endDate: null,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 1n,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null,
      };

      mockProjectsService.findOne.mockResolvedValue(mockProject);

      const result = await controller.findOne('1');

      expect(result.id).toBe('1');
      expect(result.name).toBe('프로젝트1');
      expect(service.findOne).toHaveBeenCalledWith(BigInt(1));
    });
  });

  describe('update', () => {
    it('should update a project with authenticated user', async () => {
      const updateDto = {
        name: '수정된 프로젝트명',
        status: 'COMPLETED' as const,
      };
      const mockProject = {
        id: 1n,
        projectName: updateDto.name,
        projectType: 'OPERATION',
        client: '신한카드',
        description: null,
        startDate: null,
        endDate: null,
        status: 'COMPLETED',
        isActive: true,
        createdBy: 1n,
        createdAt: new Date(),
        updatedBy: 1n,
        updatedAt: new Date(),
      };

      mockProjectsService.update.mockResolvedValue(mockProject);

      const result = await controller.update(mockUser, '1', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.status).toBe('COMPLETED');
      expect(service.update).toHaveBeenCalledWith(BigInt(1), updateDto, BigInt(1));
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      mockProjectsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeNull();
      expect(mockProjectsService.remove).toHaveBeenCalledWith(BigInt(1));
    });
  });

  describe('addProjectMember', () => {
    it('should add a member to project with authenticated user', async () => {
      const addMemberDto = {
        memberId: '2',
        role: 'PA' as const,
        workArea: 'BACKEND' as const,
      };
      const mockMember = {
        id: 1n,
        projectId: 1n,
        memberId: 2n,
        role: 'PA',
        workArea: 'BACKEND',
        createdAt: new Date(),
      };

      mockProjectsService.addProjectMember.mockResolvedValue(mockMember);

      const result = await controller.addProjectMember(mockUser, '1', addMemberDto);

      expect(result.memberId).toBe('2');
      expect(service.addProjectMember).toHaveBeenCalledWith(
        BigInt(1),
        addMemberDto,
        BigInt(1),
      );
    });
  });

  describe('updateProjectMemberRole', () => {
    it('should update member role with authenticated user', async () => {
      const updateRoleDto = {
        role: 'PM' as const,
      };
      const mockMember = {
        id: 1n,
        projectId: 1n,
        memberId: 2n,
        role: 'PM',
        workArea: 'BACKEND',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProjectsService.updateProjectMemberRole.mockResolvedValue(mockMember);

      const result = await controller.updateProjectMemberRole(
        mockUser,
        '1',
        2,
        updateRoleDto,
      );

      expect(result.role).toBe('PM');
      expect(service.updateProjectMemberRole).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(2),
        updateRoleDto,
        BigInt(1),
      );
    });
  });
});
