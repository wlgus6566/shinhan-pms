import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
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
    it('프로젝트를 생성해야 함', async () => {
      const createDto = {
        projectName: '테스트 프로젝트',
        description: '설명',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const mockProject = {
        id: 1n,
        projectName: createDto.projectName,
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

      const result = await controller.create({
        name: createDto.projectName,
        projectType: 'OPERATION',
        client: '신한카드',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(result.name).toBe(createDto.projectName);
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-12-31');
    });
  });

  describe('findAll', () => {
    it('프로젝트 목록을 반환해야 함', async () => {
      const mockProjects = [
        {
          id: 1n,
          projectName: '프로젝트1',
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
      ];

      mockProjectsService.findAll.mockResolvedValue(mockProjects);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('findOne', () => {
    it('프로젝트를 찾아 반환해야 함', async () => {
      const mockProject = {
        id: 1n,
        projectName: '프로젝트1',
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
    });
  });

  describe('update', () => {
    it('프로젝트를 수정해야 함', async () => {
      const updateDto = {
        projectName: '수정된 프로젝트명',
        status: 'COMPLETED',
      };
      const mockProject = {
        id: 1n,
        projectName: updateDto.projectName,
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

      const result = await controller.update('1', {
        name: updateDto.projectName,
        status: 'COMPLETED',
      });

      expect(result.name).toBe(updateDto.projectName);
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('remove', () => {
    it('프로젝트를 삭제해야 함', async () => {
      mockProjectsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result.message).toBe('프로젝트가 삭제되었습니다');
      expect(mockProjectsService.remove).toHaveBeenCalledWith(1n);
    });
  });
});
