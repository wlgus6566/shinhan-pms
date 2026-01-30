import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockUser: UserResponseDto = {
    id: '1',
    name: '김철수',
    email: 'kim@emotion.co.kr',
    role: 'PM',
    department: '개발팀',
    position: '과장',
    grade: 'ADVANCED',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return JWT token and user data on valid login', async () => {
      const loginDto: LoginDto = {
        email: 'kim@emotion.co.kr',
        password: 'Password123!',
      };

      const expectedResult = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'kim@emotion.co.kr',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException on non-existent user', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@emotion.co.kr',
        password: 'Password123!',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto: LoginDto = {
        email: 'inactive@emotion.co.kr',
        password: 'Password123!',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('비활성화된 계정입니다'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile for authenticated user', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
      expect(service.getProfile).toHaveBeenCalledWith(BigInt(1));
      expect(service.getProfile).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockAuthService.getProfile.mockRejectedValue(
        new UnauthorizedException('사용자를 찾을 수 없습니다'),
      );

      await expect(controller.getProfile(mockUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateDto: UpdateProfileDto = {
        department: 'PLANNING',
        position: '차장',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result).toEqual(updatedUser);
      expect(service.updateProfile).toHaveBeenCalledWith(BigInt(1), updateDto);
      expect(service.updateProfile).toHaveBeenCalledTimes(1);
    });

    it('should update only provided fields', async () => {
      const updateDto: UpdateProfileDto = {
        department: 'DESIGN',
      };

      const updatedUser = { ...mockUser, department: 'DESIGN' };
      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result).toEqual(updatedUser);
      expect(result.position).toBe(mockUser.position); // position should remain unchanged
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      mockAuthService.changePassword.mockResolvedValue(undefined);

      await controller.changePassword(mockUser, changePasswordDto);

      expect(service.changePassword).toHaveBeenCalledWith(
        BigInt(1),
        changePasswordDto,
      );
      expect(service.changePassword).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
      };

      mockAuthService.changePassword.mockRejectedValue(
        new BadRequestException('현재 비밀번호가 일치하지 않습니다'),
      );

      await expect(
        controller.changePassword(mockUser, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new password is weak', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak',
      };

      mockAuthService.changePassword.mockRejectedValue(
        new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다'),
      );

      await expect(
        controller.changePassword(mockUser, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new password is same as current', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'Password123!',
        newPassword: 'Password123!',
      };

      mockAuthService.changePassword.mockRejectedValue(
        new BadRequestException('새 비밀번호는 현재 비밀번호와 달라야 합니다'),
      );

      await expect(
        controller.changePassword(mockUser, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('JWT Guard Integration', () => {
    it('should require authentication for getProfile endpoint', async () => {
      // This test verifies that the @UseGuards(JwtAuthGuard) decorator is applied
      const guards = Reflect.getMetadata('__guards__', controller.getProfile);
      expect(guards).toBeDefined();
    });

    it('should require authentication for updateProfile endpoint', async () => {
      const guards = Reflect.getMetadata('__guards__', controller.updateProfile);
      expect(guards).toBeDefined();
    });

    it('should require authentication for changePassword endpoint', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        controller.changePassword,
      );
      expect(guards).toBeDefined();
    });

    it('should NOT require authentication for login endpoint', async () => {
      const guards = Reflect.getMetadata('__guards__', controller.login);
      expect(guards).toBeUndefined();
    });
  });
});
