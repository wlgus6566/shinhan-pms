import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@emotion.co.kr',
      password: 'Test1234!',
    };

    const mockUser = {
      id: BigInt(1),
      email: loginDto.email,
      passwordHash: '$2b$10$hashedPassword',
      name: '테스트',
      department: 'DEVELOPMENT',
      role: 'MEMBER',
      isActive: true,
    };

    it('should return access token and user info on successful login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock_token');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '이메일 또는 비밀번호가 일치하지 않습니다',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '이메일 또는 비밀번호가 일치하지 않습니다',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '계정이 비활성화되었습니다',
      );
    });
  });

  describe('changePassword', () => {
    const userId = BigInt(1);
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    };

    const mockUser = {
      id: userId,
      passwordHash: '$2b$10$hashedOldPassword',
    };

    it('should change password successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedNewPassword');
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        passwordHash: '$2b$10$hashedNewPassword',
      });

      await service.changePassword(userId, changePasswordDto);

      expect(mockPrismaService.user.update).toHaveBeenCalled();
      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.passwordHash).toBeDefined();
      expect(updateCall.data.passwordHash).not.toBe(
        changePasswordDto.newPassword,
      );
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow('현재 비밀번호가 일치하지 않습니다');
    });
  });
});
