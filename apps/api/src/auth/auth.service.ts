import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다',
      );
    }

    // 활성 상태 확인
    if (!user.isActive) {
      throw new UnauthorizedException('계정이 비활성화되었습니다');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다',
      );
    }

    const newVersion = (user.refreshTokenVersion || 0) + 1;

    // JWT Refresh Token 먼저 생성 (version 포함)
    const refreshTokenPayload = {
      sub: user.id.toString(),
      email: user.email,
      version: newVersion,
    };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
    });

    // JWT Refresh Token의 해시를 DB에 저장
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    // 마지막 로그인 시간 및 Refresh Token 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshTokenHash,
        refreshTokenVersion: newVersion,
      },
    });

    // JWT Access Token 생성
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
      user: new UserResponseDto(user),
    };
  }

  async getProfile(userId: bigint): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }

    return new UserResponseDto(user);
  }

  async updateProfile(
    userId: bigint,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return new UserResponseDto(user);
  }

  async changePassword(
    userId: bigint,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다');
    }

    // 새 비밀번호 해시
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      12,
    );

    // 비밀번호 업데이트 및 requirePasswordChange를 false로 변경
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        requirePasswordChange: false,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async validateUser(userId: bigint): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다');
    }

    return new UserResponseDto(user);
  }

  async refresh(
    userId: bigint,
    refreshTokenPayload: { sub: string; email: string; version: number },
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
    }

    // Token rotation 공격 감지 (version 불일치)
    if (user.refreshTokenVersion !== refreshTokenPayload.version) {
      // 모든 토큰 무효화
      await this.revokeAllRefreshTokens(userId);
      throw new UnauthorizedException(
        'Token rotation 공격 감지. 모든 토큰이 무효화되었습니다',
      );
    }

    const newVersion = user.refreshTokenVersion + 1;

    // 새로운 Refresh Token JWT 먼저 생성
    const newRefreshTokenPayload = {
      sub: user.id.toString(),
      email: user.email,
      version: newVersion,
    };
    const refreshToken = this.jwtService.sign(newRefreshTokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
    });

    // JWT Refresh Token의 해시를 DB에 저장
    const newRefreshTokenHash = await bcrypt.hash(refreshToken, 12);

    // Refresh Token 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        refreshTokenVersion: newVersion,
        updatedBy: userId,
      },
    });

    // 새로운 Access Token 생성
    const accessTokenPayload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(accessTokenPayload);

    return {
      accessToken,
      refreshToken,
      user: new UserResponseDto(user),
    };
  }

  async validateRefreshToken(
    userId: bigint,
    refreshToken: string,
    version: number,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { refreshTokenHash: true, refreshTokenVersion: true },
    });

    if (!user || !user.refreshTokenHash) {
      return false;
    }

    // Version 검증
    if (user.refreshTokenVersion !== version) {
      return false;
    }

    // Hash 검증
    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    return isValid;
  }

  async logout(userId: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        updatedBy: userId,
      },
    });
  }

  async revokeAllRefreshTokens(userId: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenVersion: 0,
        updatedBy: userId,
      },
    });
  }
}
