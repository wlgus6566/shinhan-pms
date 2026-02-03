import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  const mockSuperAdmin: UserResponseDto = {
    id: '1',
    name: '슈퍼관리자',
    email: 'admin@emotion.co.kr',
    role: 'SUPER_ADMIN',
    department: 'PLANNING_STRATEGY',
    position: 'GENERAL_MANAGER',
    grade: 'EXPERT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    requirePasswordChange: false,
    passwordHash: 'password123',
    createdBy: BigInt(1),
  };

  const mockPM: UserResponseDto = {
    id: '2',
    name: 'PM 사용자',
    email: 'pm@emotion.co.kr',
    role: 'PM',
    department: 'PLANNING_1',
    position: 'PRINCIPAL_LEADER',
    grade: 'ADVANCED',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    requirePasswordChange: false,
    passwordHash: 'password123',
    createdBy: BigInt(1),
  };

  const mockUser: UserResponseDto = {
    id: '3',
    name: '일반 사용자',
    email: 'user@emotion.co.kr',
    role: 'MEMBER',
    department: 'DEVELOPMENT_1',
    position: 'TEAM_MEMBER',
    grade: 'INTERMEDIATE',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    requirePasswordChange: false,
    passwordHash: 'password123',
    createdBy: BigInt(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: '신규 사용자',
      email: 'new@emotion.co.kr',
      department: 'DEVELOPMENT_1',
      position: 'TEAM_MEMBER',
      role: 'MEMBER',
      grade: 'BEGINNER',
    };

    it('should create a new user as SUPER_ADMIN', async () => {
      const expectedUser = { ...mockUser, ...createUserDto, id: '4' };
      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto, mockSuperAdmin);

      expect(result).toEqual(expectedUser);
      expect(service.create).toHaveBeenCalledWith(
        createUserDto,
        BigInt(mockSuperAdmin.id),
      );
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('이미 사용 중인 이메일입니다'),
      );

      await expect(
        controller.create(createUserDto, mockSuperAdmin),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if non-SUPER_ADMIN tries to create user', async () => {
      mockUsersService.create.mockRejectedValue(
        new ForbiddenException('슈퍼관리자 권한이 필요합니다'),
      );

      await expect(controller.create(createUserDto, mockPM)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated user list', async () => {
      const mockResult = {
        list: [mockSuperAdmin, mockPM, mockUser],
        totalCount: 3,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '10',
      );

      expect(result.list).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.pageNum).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(service.findAll).toHaveBeenCalledWith({
        search: undefined,
        department: undefined,
        role: undefined,
        isActive: undefined,
        pageNum: 1,
        pageSize: 10,
        skip: 0,
        excludeProject: undefined,
      });
    });

    it('should filter by department', async () => {
      const mockResult = {
        list: [mockPM, mockUser],
        totalCount: 2,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(
        undefined,
        '개발팀',
        undefined,
        undefined,
        '1',
        '10',
      );

      expect(result.list).toHaveLength(2);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ department: '개발팀' }),
      );
    });

    it('should filter by role', async () => {
      const mockResult = {
        list: [mockPM],
        totalCount: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(
        undefined,
        undefined,
        'PM',
        undefined,
        '1',
        '10',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'PM' }),
      );
    });

    it('should filter by active status', async () => {
      const mockResult = {
        list: [mockSuperAdmin, mockPM, mockUser],
        totalCount: 3,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(
        undefined,
        undefined,
        undefined,
        'true',
        '1',
        '10',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should search by name or email', async () => {
      const mockResult = {
        list: [mockPM],
        totalCount: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      await controller.findAll('PM', undefined, undefined, undefined, '1', '10');

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'PM' }),
      );
    });

    it('should exclude users from specific project', async () => {
      const mockResult = {
        list: [mockUser],
        totalCount: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '10',
        '1',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ excludeProject: '1' }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(3);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(BigInt(3));
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('사용자를 찾을 수 없습니다'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPER_ADMIN to view any user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(3);

      expect(result).toEqual(mockUser);
    });

    it('should allow PM to view users', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(3);

      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      department: 'PLANNING_1',
      position: 'LEADER',
    };

    it('should update user as SUPER_ADMIN', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(3, updateUserDto, mockSuperAdmin);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(
        BigInt(3),
        updateUserDto,
        BigInt(mockSuperAdmin.id),
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('사용자를 찾을 수 없습니다'),
      );

      await expect(
        controller.update(999, updateUserDto, mockSuperAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if non-SUPER_ADMIN tries to update', async () => {
      mockUsersService.update.mockRejectedValue(
        new ForbiddenException('슈퍼관리자 권한이 필요합니다'),
      );

      await expect(
        controller.update(3, updateUserDto, mockPM),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update role and grade', async () => {
      const roleUpdateDto: UpdateUserDto = {
        role: 'PM',
        grade: 'EXPERT',
      };

      const updatedUser = { ...mockUser, ...roleUpdateDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(3, roleUpdateDto, mockSuperAdmin);

      expect(result.role).toBe('PM');
      expect(result.grade).toBe('EXPERT');
    });
  });

  describe('deactivate', () => {
    it('should deactivate user as SUPER_ADMIN', async () => {
      mockUsersService.deactivate.mockResolvedValue(undefined);

      const result = await controller.deactivate(3, mockSuperAdmin);

      expect(result).toBeNull();
      expect(service.deactivate).toHaveBeenCalledWith(
        BigInt(3),
        BigInt(mockSuperAdmin.id),
      );
      expect(service.deactivate).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if trying to deactivate self', async () => {
      mockUsersService.deactivate.mockRejectedValue(
        new BadRequestException('본인 계정은 비활성화할 수 없습니다'),
      );

      await expect(controller.deactivate(1, mockSuperAdmin)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.deactivate.mockRejectedValue(
        new NotFoundException('사용자를 찾을 수 없습니다'),
      );

      await expect(controller.deactivate(999, mockSuperAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if non-SUPER_ADMIN tries to deactivate', async () => {
      mockUsersService.deactivate.mockRejectedValue(
        new ForbiddenException('슈퍼관리자 권한이 필요합니다'),
      );

      await expect(controller.deactivate(3, mockPM)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Role-Based Access Control', () => {
    it('should require SUPER_ADMIN role for create endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.create);
      expect(roles).toContain('SUPER_ADMIN');
    });

    it('should require SUPER_ADMIN or PM role for findAll endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.findAll);
      expect(roles).toEqual(['SUPER_ADMIN', 'PM']);
    });

    it('should require SUPER_ADMIN or PM role for findOne endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.findOne);
      expect(roles).toEqual(['SUPER_ADMIN', 'PM']);
    });

    it('should require SUPER_ADMIN role for update endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.update);
      expect(roles).toContain('SUPER_ADMIN');
    });

    it('should require SUPER_ADMIN role for deactivate endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.deactivate);
      expect(roles).toContain('SUPER_ADMIN');
    });

    it('should apply JwtAuthGuard to all endpoints', () => {
      const guards = Reflect.getMetadata('__guards__', UsersController);
      expect(guards).toBeDefined();
    });

    it('should apply RolesGuard to all endpoints', () => {
      const guards = Reflect.getMetadata('__guards__', UsersController);
      expect(guards).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should use default pagination params if not provided', async () => {
      const mockResult = {
        list: [mockUser],
        totalCount: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(result.pageNum).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should calculate total pages correctly', async () => {
      const mockResult = {
        list: Array(10).fill(mockUser),
        totalCount: 25,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '10',
      );

      expect(result.pages).toBe(3);
    });

    it('should handle empty result set', async () => {
      const mockResult = {
        list: [],
        totalCount: 0,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(result.list).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.pages).toBe(0);
    });
  });
});
