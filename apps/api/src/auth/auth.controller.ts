import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'kim@emotion.co.kr',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공 (Refresh Token은 HttpOnly 쿠키로 설정됨)',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'SUC001' },
        message: { type: 'string', example: '처리가 완료되었습니다.' },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJraW1AZW1vdGlvbi5jby5rciIsInJvbGUiOiJQTSIsImlhdCI6MTcwNjI4MDAwMCwiZXhwIjoxNzA2MzY2NDAwfQ.signature',
              description: '이 값을 복사하여 Authorize 버튼에 입력',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                position: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return only accessToken and user (NO refreshToken in body)
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '조회 성공', type: UserResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getProfile(
    @CurrentUser() user: UserResponseDto,
  ): Promise<UserResponseDto> {
    return this.authService.getProfile(BigInt(user.id));
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiResponse({ status: 200, description: '수정 성공', type: UserResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async updateProfile(
    @CurrentUser() user: UserResponseDto,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateProfile(BigInt(user.id), updateProfileDto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 204, description: '변경 성공' })
  @ApiResponse({ status: 400, description: '현재 비밀번호 불일치' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async changePassword(
    @CurrentUser() user: UserResponseDto,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(BigInt(user.id), changePasswordDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Access Token 갱신' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {},
    },
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token' })
  async refresh(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(req.user.userId, req.user);

    // Set new refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async logout(
    @CurrentUser() user: UserResponseDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(BigInt(user.id));

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh',
    });

    return { message: '로그아웃되었습니다' };
  }
}
