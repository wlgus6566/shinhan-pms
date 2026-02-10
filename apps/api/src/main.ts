import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, patchNestJsSwagger } from 'nestjs-zod';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';

// Swagger 호환성을 위한 패치
patchNestJsSwagger();

async function bootstrap() {
  // 프로덕션 환경에서 JWT 시크릿 플레이스홀더 사용 차단
  if (process.env.NODE_ENV === 'production') {
    const placeholderPatterns = ['your-super-secret', 'change-in-production', 'your-secret-key'];
    const secrets = [
      { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
      { name: 'JWT_REFRESH_SECRET', value: process.env.JWT_REFRESH_SECRET },
    ];

    for (const secret of secrets) {
      if (!secret.value || placeholderPatterns.some((p) => secret.value!.includes(p))) {
        console.error(`❌ [SECURITY] ${secret.name}이 설정되지 않았거나 플레이스홀더 값입니다. 프로덕션 환경에서는 안전한 시크릿을 사용하세요.`);
        process.exit(1);
      }
    }
  }

  const app = await NestFactory.create(AppModule);

  // BigInt 직렬화 해결
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // 보안 헤더 설정 (X-Content-Type-Options, X-Frame-Options 등)
  app.use(helmet());

  // Cookie Parser (MUST be before other middleware)
  app.use(cookieParser.default());

  // 전역 API 접두사 설정
  app.setGlobalPrefix('api');

  // 전역 Interceptor 설정 (Exclude 등 반영)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // CORS 설정 - credentials 지원
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true, // HttpOnly 쿠키 전송 허용
  });

  // 전역 Validation 설정 (Zod만 사용)
  // ZodValidationPipe만 사용하여 Zod 스키마로 검증
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('이모션 PMS API')
    .setDescription(
      '이모션의 프로젝트 및 업무 관리를 위한 통합 프로젝트 관리 시스템 API',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token (data.accessToken 필드에서 추출)',
      },
      'Bearer',
    )
    .addTag('Projects', '프로젝트 관리')
    .addTag('Tasks', '작업 관리')
    .build();
  // JSON 객체를 생성하는 함수
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}

void bootstrap();
