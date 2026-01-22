import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
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
      const userId = 1n;
      const mockProject = {
        id: 1n,
        projectName: createDto.projectName,
        description: createDto.description,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null,
      };

      mockPrismaService.project.findFirst.mockResolvedValue(null);
      mockPrismaService.project.create.mockResolvedValue(mockProject);

      const result = await service.create(createDto, userId);

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.findFirst).toHaveBeenCalledWith({
        where: { projectName: createDto.projectName },
      });
      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: {
          projectName: createDto.projectName,
          description: createDto.description,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdBy: userId,
        },
      });
    });

    it('중복된 프로젝트명이면 BadRequestException을 발생시켜야 함', async () => {
      const createDto = { projectName: '기존 프로젝트' };
      const userId = 1n;
      
      mockPrismaService.project.findFirst.mockResolvedValue({ id: 1n });

      await expect(service.create(createDto, userId)).rejects.toThrow(
        new BadRequestException('이미 존재하는 프로젝트명입니다'),
      );
    });

    it('종료일이 시작일보다 빠르면 BadRequestException을 발생시켜야 함', async () => {
      const createDto = {
        projectName: '테스트 프로젝트',
        startDate: '2024-12-31',
        endDate: '2024-01-01',
      };
      const userId = 1n;

      await expect(service.create(createDto, userId)).rejects.toThrow(
        new BadRequestException('종료일은 시작일 이후여야 합니다'),
      );
    });
  });

  describe('findAll', () => {
    it('활성 프로젝트 목록을 반환해야 함', async () => {
      const mockProjects = [
        {
          id: 1n,
          projectName: '프로젝트1',
          description: '설명1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
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
          description: '설명2',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'ACTIVE',
          isActive: true,
          createdBy: 1n,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: null,
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll();

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('검색어로 필터링된 프로젝트 목록을 반환해야 함', async () => {
      const search = '카드';
      const mockProjects = [
        {
          id: 1n,
          projectName: '이모션 PMS',
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

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll({ search });

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          projectName: { contains: search },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('상태로 필터링된 프로젝트 목록을 반환해야 함', async () => {
      const status = 'COMPLETED';
      const mockProjects = [
        {
          id: 1n,
          projectName: '완료된 프로젝트',
          description: null,
          startDate: null,
          endDate: null,
          status: 'COMPLETED',
          isActive: true,
          createdBy: 1n,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: null,
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll({ status });

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          status: status,
        },
        orderBy: { createdAt: 'desc' },
      });
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

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne(1n);

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: 1n, isActive: true },
      });
    });

    it('프로젝트가 없으면 NotFoundException을 발생시켜야 함', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999n)).rejects.toThrow(
        new NotFoundException('프로젝트를 찾을 수 없습니다'),
      );
    });
  });

  describe('update', () => {
    it('프로젝트를 수정해야 함', async () => {
      const updateDto = {
        projectName: '수정된 프로젝트명',
        status: 'COMPLETED',
      };
      const userId = 1n;
      const mockProject = {
        id: 1n,
        projectName: '기존 프로젝트명',
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
      const updatedProject = { ...mockProject, ...updateDto, updatedBy: userId };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.project.findFirst.mockResolvedValue(null);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.update(1n, updateDto, userId);

      expect(result).toEqual(updatedProject);
    });

    it('프로젝트가 없으면 NotFoundException을 발생시켜야 함', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.update(999n, {}, 1n)).rejects.toThrow(
        new NotFoundException('프로젝트를 찾을 수 없습니다'),
      );
    });

    it('프로젝트명을 다른 프로젝트와 중복된 이름으로 변경하면 BadRequestException을 발생시켜야 함', async () => {
      const updateDto = { projectName: '다른 프로젝트' };
      const mockProject = {
        id: 1n,
        projectName: '기존 프로젝트명',
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

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.project.findFirst.mockResolvedValue({ id: 2n }); // 다른 프로젝트 존재

      await expect(service.update(1n, updateDto, 1n)).rejects.toThrow(
        new BadRequestException('이미 존재하는 프로젝트명입니다'),
      );
    });
  });

  describe('remove', () => {
    it('프로젝트를 soft delete해야 함', async () => {
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
      const deletedProject = { ...mockProject, isActive: false };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.project.update.mockResolvedValue(deletedProject);

      const result = await service.remove(1n);

      expect(result).toEqual(deletedProject);
      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { isActive: false },
      });
    });

    it('프로젝트가 없으면 NotFoundException을 발생시켜야 함', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.remove(999n)).rejects.toThrow(
        new NotFoundException('프로젝트를 찾을 수 없습니다'),
      );
    });
  });
});
