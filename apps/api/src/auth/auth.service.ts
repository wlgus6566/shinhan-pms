import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
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

  async signup(signupDto: SignupDto): Promise<UserResponseDto> {
    // 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(signupDto.password, 10);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email: signupDto.email,
        passwordHash,
        name: signupDto.name,
        department: signupDto.department,
        role: 'MEMBER',
        createdBy: BigInt(1), // 임시: 자가 가입 시 시스템 계정
      },
    });

    return new UserResponseDto(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: UserResponseDto }> {
    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 활성 상태 확인
    if (!user.isActive) {
      throw new UnauthorizedException('계정이 비활성화되었습니다');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 마지막 로그인 시간 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // JWT 토큰 생성
    const payload = { sub: user.id.toString(), email: user.email, role: user.role };
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

  async updateProfile(userId: bigint, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
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

  async changePassword(userId: bigint, changePasswordDto: ChangePasswordDto): Promise<void> {
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
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // 비밀번호 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
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
