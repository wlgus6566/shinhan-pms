import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, patchNestJsSwagger } from 'nestjs-zod';

import { AppModule } from './app.module';

// Swagger 호환성을 위한 패치
patchNestJsSwagger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // BigInt 직렬화 해결
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // 전역 API 접두사 설정
  app.setGlobalPrefix('api');

  // 전역 Interceptor 설정 (Exclude 등 반영)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // CORS 설정
  app.enableCors();

  // 전역 Validation 설정 (Zod만 사용)
  // ZodValidationPipe만 사용하여 Zod 스키마로 검증
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('신한카드 PMS API')
    .setDescription('신한카드 운영&고도화 업무 관리 시스템 API')
    .setVersion('1.0')
    .addTag('Projects', '프로젝트 관리')
    .addTag('Tasks', '작업 관리')
    .addTag('Issues', '이슈 관리')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}

void bootstrap();
