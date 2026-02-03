import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return null;
    });
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

    it('should return access token, refresh token and user info on successful login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedRefreshToken');
      // 첫 번째 sign: refreshToken, 두 번째 sign: accessToken
      mockJwtService.sign.mockReturnValueOnce('mock_refresh_token').mockReturnValueOnce('mock_access_token');

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
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

  describe('refresh', () => {
    const mockUser = {
      id: BigInt(1),
      email: 'test@emotion.co.kr',
      name: '테스트',
      department: 'DEVELOPMENT',
      role: 'MEMBER',
      refreshTokenHash: '$2b$10$hashedRefreshToken',
      refreshTokenVersion: 1,
    };

    const mockRefreshTokenPayload = {
      sub: '1',
      email: 'test@emotion.co.kr',
      version: 1,
    };

    it('should successfully refresh tokens with valid refresh token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedNewRefreshToken');
      // 첫 번째 sign: refreshToken, 두 번째 sign: accessToken
      mockJwtService.sign.mockReturnValueOnce('new_refresh_token').mockReturnValueOnce('new_access_token');

      const result = await service.refresh(mockUser.id, mockRefreshTokenPayload);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new_access_token');
      expect(result.refreshToken).toBe('new_refresh_token');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.refreshTokenHash).toBeDefined();
      expect(updateCall.data.refreshTokenVersion).toBe(2);
    });

    it('should throw UnauthorizedException if refresh token hash not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: null,
      });

      await expect(
        service.refresh(mockUser.id, mockRefreshTokenPayload),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refresh(mockUser.id, mockRefreshTokenPayload),
      ).rejects.toThrow('유효하지 않은 Refresh Token입니다');
    });

    it('should detect token rotation attack and revoke all tokens on version mismatch', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        refreshTokenVersion: 5,
      });

      await expect(
        service.refresh(mockUser.id, { ...mockRefreshTokenPayload, version: 1 }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refresh(mockUser.id, { ...mockRefreshTokenPayload, version: 1 }),
      ).rejects.toThrow('Token rotation 공격 감지. 모든 토큰이 무효화되었습니다');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshTokenHash: null,
          refreshTokenVersion: 0,
          updatedBy: mockUser.id,
        },
      });
    });

  });

  describe('validateRefreshToken', () => {
    const userId = BigInt(1);
    const mockUser = {
      id: userId,
      refreshTokenHash: '$2b$10$hashedRefreshToken',
      refreshTokenVersion: 1,
    };

    it('should return true for valid refresh token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateRefreshToken(userId, 'valid_token', 1);

      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateRefreshToken(userId, 'any_token', 1);

      expect(result).toBe(false);
    });

    it('should return false if refresh token hash not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: null,
      });

      const result = await service.validateRefreshToken(userId, 'any_token', 1);

      expect(result).toBe(false);
    });

    it('should return false if version mismatch', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateRefreshToken(userId, 'any_token', 99);

      expect(result).toBe(false);
    });

    it('should return false if hash does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateRefreshToken(userId, 'wrong_token', 1);

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    const userId = BigInt(1);

    it('should clear refresh token on logout', async () => {
      mockPrismaService.user.update.mockResolvedValue({});

      await service.logout(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          refreshTokenHash: null,
          updatedBy: userId,
        },
      });
    });
  });

  describe('revokeAllRefreshTokens', () => {
    const userId = BigInt(1);

    it('should revoke all refresh tokens', async () => {
      mockPrismaService.user.update.mockResolvedValue({});

      await service.revokeAllRefreshTokens(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          refreshTokenHash: null,
          refreshTokenVersion: 0,
          updatedBy: userId,
        },
      });
    });
  });
});
