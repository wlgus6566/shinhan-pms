import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '-';

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // 민감한 엔드포인트 (로그인, 비밀번호 변경 등)는 별도 표시
      const sensitiveEndpoints = ['/api/auth/login', '/api/auth/me/password'];
      const isSensitive = sensitiveEndpoints.some((ep) => originalUrl.startsWith(ep));

      const logEntry = `[AUDIT] ${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip} - ${userAgent}${isSensitive ? ' [SENSITIVE]' : ''}`;

      if (statusCode >= 400) {
        console.warn(logEntry);
      } else {
        console.log(logEntry);
      }
    });

    next();
  }
}
