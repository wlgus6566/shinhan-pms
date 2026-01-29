import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
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

    // 마지막 로그인 시간 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // JWT 토큰 생성
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
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
      10,
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
}
