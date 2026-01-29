import { Test, TestingModule } from '@nestjs/testing';
import { ProjectTaskTypesService } from './project-task-types.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('ProjectTaskTypesService', () => {
  let service: ProjectTaskTypesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    project: {
      findUnique: jest.fn(),
    },
    projectMember: {
      findFirst: jest.fn(),
    },
    projectTaskType: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectTaskTypesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectTaskTypesService>(ProjectTaskTypesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task type successfully', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const createDto = {
        name: '프로젝트성 업무',
      };

      const mockProject = { id: projectId, isActive: true };
      const mockMember = { projectId, memberId: userId, role: 'PM' };
      const mockTaskType = {
        id: BigInt(1),
        projectId,
        ...createDto,
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.projectTaskType.findFirst.mockResolvedValue(null);
      mockPrismaService.projectTaskType.create.mockResolvedValue(mockTaskType);

      const result = await service.create(projectId, userId, createDto);

      expect(result).toEqual(mockTaskType);
      expect(mockPrismaService.projectTaskType.create).toHaveBeenCalledWith({
        data: {
          projectId,
          name: createDto.name,
          createdBy: userId,
        },
      });
    });

    it('should throw NotFoundException if project does not exist', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const createDto = {
        name: '프로젝트성 업무',
      };

      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(projectId, userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not PM', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const createDto = {
        name: '프로젝트성 업무',
      };

      const mockProject = { id: projectId, isActive: true };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectMember.findFirst.mockResolvedValue(null);

      await expect(service.create(projectId, userId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if task type name already exists', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const createDto = {
        name: '프로젝트성 업무',
      };

      const mockProject = { id: projectId, isActive: true };
      const mockMember = { projectId, memberId: userId, role: 'PM' };
      const existingTaskType = {
        id: BigInt(2),
        projectId,
        name: '프로젝트성 업무',
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.projectTaskType.findFirst.mockResolvedValue(
        existingTaskType,
      );

      await expect(service.create(projectId, userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

  });

  describe('findAllByProject', () => {
    it('should return paginated task types ordered by createdAt', async () => {
      const projectId = BigInt(1);
      const mockTaskTypes = [
        {
          id: BigInt(1),
          projectId,
          name: '프로젝트성 업무',
        },
        {
          id: BigInt(2),
          projectId,
          name: '신규 / 단건 제작',
        },
      ];

      mockPrismaService.projectTaskType.findMany.mockResolvedValue(
        mockTaskTypes,
      );
      mockPrismaService.projectTaskType.count.mockResolvedValue(2);

      const result = await service.findAllByProject(projectId);

      expect(result.list).toEqual(mockTaskTypes);
      expect(result.totalCount).toBe(2);
      expect(mockPrismaService.projectTaskType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId, isActive: true },
          orderBy: { createdAt: 'asc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a task type', async () => {
      const projectId = BigInt(1);
      const id = BigInt(1);
      const mockTaskType = {
        id,
        projectId,
        name: '프로젝트성 업무',
        isActive: true,
      };

      mockPrismaService.projectTaskType.findFirst.mockResolvedValue(
        mockTaskType,
      );

      const result = await service.findOne(id, projectId);

      expect(result).toEqual(mockTaskType);
    });

    it('should throw NotFoundException if task type does not exist', async () => {
      const projectId = BigInt(1);
      const id = BigInt(999);

      mockPrismaService.projectTaskType.findFirst.mockResolvedValue(null);

      await expect(service.findOne(id, projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task type successfully', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const id = BigInt(1);
      const updateDto = {
        name: '업데이트된 이름',
      };

      const mockTaskType = {
        id,
        projectId,
        name: '원래 이름',
        isActive: true,
      };
      const mockMember = { projectId, memberId: userId, role: 'PM' };
      const mockUpdated = {
        ...mockTaskType,
        ...updateDto,
        updatedBy: userId,
      };

      mockPrismaService.projectTaskType.findFirst
        .mockResolvedValueOnce(mockTaskType) // findOne check
        .mockResolvedValueOnce(null); // duplicate name check
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.projectTaskType.update.mockResolvedValue(mockUpdated);

      const result = await service.update(id, projectId, userId, updateDto);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.projectTaskType.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          ...updateDto,
          updatedBy: userId,
        },
      });
    });

    it('should throw BadRequestException if updated name already exists', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const id = BigInt(1);
      const updateDto = {
        name: '중복된 이름',
      };

      const mockTaskType = {
        id,
        projectId,
        name: '원래 이름',
        isActive: true,
      };
      const mockMember = { projectId, memberId: userId, role: 'PM' };
      const existingTaskType = {
        id: BigInt(2),
        projectId,
        name: '중복된 이름',
      };

      mockPrismaService.projectTaskType.findFirst
        .mockResolvedValueOnce(mockTaskType) // findOne check
        .mockResolvedValueOnce(existingTaskType); // duplicate name check
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);

      await expect(
        service.update(id, projectId, userId, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a task type', async () => {
      const projectId = BigInt(1);
      const userId = BigInt(1);
      const id = BigInt(1);

      const mockTaskType = {
        id,
        projectId,
        name: '프로젝트성 업무',
        isActive: true,
      };
      const mockMember = { projectId, memberId: userId, role: 'PM' };

      mockPrismaService.projectTaskType.findFirst.mockResolvedValue(
        mockTaskType,
      );
      mockPrismaService.projectMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.projectTaskType.update.mockResolvedValue({
        ...mockTaskType,
        isActive: false,
      });

      await service.remove(id, projectId, userId);

      expect(mockPrismaService.projectTaskType.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          isActive: false,
          updatedBy: userId,
        },
      });
    });
  });
});
