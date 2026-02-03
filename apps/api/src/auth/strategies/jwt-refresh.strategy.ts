import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body?.refreshToken;
    const userId = BigInt(payload.sub);
    const version = payload.version;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token이 필요합니다');
    }

    const isValid = await this.authService.validateRefreshToken(
      userId,
      refreshToken,
      version,
    );

    if (!isValid) {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
    }

    return {
      userId,
      email: payload.email,
      version,
    };
  }
}
