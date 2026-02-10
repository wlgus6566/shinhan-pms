# 백엔드 개발 가이드 (NestJS + Prisma)

## 기술 스택

| 기술 | 용도 |
|------|------|
| NestJS 11 | 백엔드 프레임워크 |
| Fastify | HTTP 어댑터 (Express 대신) |
| Prisma 6 | ORM |
| PostgreSQL | 데이터베이스 |
| Zod + nestjs-zod | 요청 검증 (class-validator 대체) |
| JWT | 인증 (Access Token + HttpOnly Refresh Token) |
| Swagger | API 문서 자동화 |
| Jest | 테스트 프레임워크 |

---

## 1. 프로젝트 구조

```
apps/api/
├── src/
│   ├── main.ts                    # 애플리케이션 부트스트랩
│   ├── app.module.ts              # 루트 모듈
│   ├── common/                    # 공통 모듈
│   │   ├── decorators/            # 커스텀 데코레이터
│   │   ├── filters/               # 예외 필터
│   │   ├── guards/                # 인증/인가 가드
│   │   ├── interceptors/          # 응답 인터셉터
│   │   └── helpers/               # 유틸리티
│   ├── prisma/                    # Prisma 서비스 모듈
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── auth/                      # 인증 모듈
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts
│   │   ├── strategies/            # JWT 전략
│   │   ├── guards/                # Auth 가드
│   │   ├── decorators/            # @CurrentUser, @Roles
│   │   └── dto/                   # Zod 기반 DTO
│   └── {feature}/                 # 기능별 모듈 (동일 구조)
│       ├── {feature}.module.ts
│       ├── {feature}.controller.ts
│       ├── {feature}.service.ts
│       ├── {feature}.service.spec.ts
│       └── dto/
├── prisma/
│   ├── schema.prisma              # DB 스키마
│   ├── migrations/                # 마이그레이션 파일
│   └── seed.ts                    # 시드 데이터
└── test/                          # E2E 테스트
```

---

## 2. 모듈 생성 패턴

### 2.1 기본 모듈 구조

```typescript
// {feature}.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [PrismaModule],  // PrismaModule은 모든 기능 모듈에서 import
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],  // 다른 모듈에서 사용 시
})
export class FeatureModule {}
```

### 2.2 루트 모듈 등록

```typescript
// app.module.ts
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FeatureModule,  // 새 모듈 추가
    // ...
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
```

---

## 3. DTO 및 타입 시스템

### 3.1 @repo/schema에서 스키마 정의 (필수 선행)

```typescript
// packages/schema/src/{feature}/create-{feature}.schema.ts
import { z } from 'zod';

export const CreateFeatureSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(100),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type CreateFeatureRequest = z.infer<typeof CreateFeatureSchema>;
```

### 3.2 DTO 생성 (createZodDto)

```typescript
// apps/api/src/{feature}/dto/create-{feature}.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateFeatureSchema } from '@repo/schema';

export class CreateFeatureDto extends createZodDto(CreateFeatureSchema) {}
```

### 3.3 금지 사항

```typescript
// ❌ class-validator 데코레이터 사용 금지
import { IsString, MinLength } from 'class-validator';
export class CreateFeatureDto {
  @IsString()
  @MinLength(1)
  name: string;
}

// ❌ 중복 타입 정의 금지
interface CreateFeatureRequest {
  name: string;
  description?: string;
}

// ❌ 인라인 Zod 스키마 정의 금지
const schema = z.object({ name: z.string() }); // apps/api 내부에서

// ✅ 항상 @repo/schema에서 import
import { CreateFeatureSchema, type CreateFeatureRequest } from '@repo/schema';
```

---

## 4. Controller 패턴

### 4.1 기본 CRUD Controller

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseCode } from '../common/decorators/response.decorator';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@ApiTags('Features')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: '목록 조회' })
  findAll(
    @Query('pageNum') pageNum?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.featureService.findAll({
      pageNum: pageNum ? parseInt(pageNum) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '상세 조회' })
  findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  @Post()
  @ResponseCode('SUC002')  // 생성 성공 코드
  @ApiOperation({ summary: '생성' })
  create(
    @Body() dto: CreateFeatureDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.featureService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '수정' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFeatureDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.featureService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ResponseCode('SUC003')  // 삭제 성공 코드
  @ApiOperation({ summary: '삭제 (비활성화)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.featureService.remove(id, user.id);
  }
}
```

---

## 5. Service 패턴

### 5.1 기본 CRUD Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateFeatureRequest, UpdateFeatureRequest } from '@repo/schema';

@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  // 목록 조회 (페이지네이션)
  async findAll(params: { pageNum: number; pageSize: number }) {
    const { pageNum, pageSize } = params;
    const skip = (pageNum - 1) * pageSize;

    const [list, totalCount] = await Promise.all([
      this.prisma.feature.findMany({
        where: { isActive: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feature.count({
        where: { isActive: true },
      }),
    ]);

    const pages = Math.ceil(totalCount / pageSize);

    return {
      list,
      totalCount,
      pageNum,
      pageSize,
      pages,
      nextPage: pageNum < pages ? pageNum + 1 : null,
      isFirstPage: pageNum === 1,
      isLastPage: pageNum >= pages,
      hasNextPage: pageNum < pages,
    };
  }

  // 상세 조회
  async findOne(id: string) {
    const feature = await this.prisma.feature.findFirst({
      where: { id: BigInt(id), isActive: true },
    });

    if (!feature) {
      throw new NotFoundException('리소스를 찾을 수 없습니다');
    }

    return feature;
  }

  // 생성
  async create(dto: CreateFeatureRequest, userId: string) {
    return this.prisma.feature.create({
      data: {
        ...dto,
        createdBy: BigInt(userId),
        updatedBy: BigInt(userId),
      },
    });
  }

  // 수정
  async update(id: string, dto: UpdateFeatureRequest, userId: string) {
    await this.findOne(id); // 존재 확인

    return this.prisma.feature.update({
      where: { id: BigInt(id) },
      data: {
        ...dto,
        updatedBy: BigInt(userId),
      },
    });
  }

  // 삭제 (Soft Delete)
  async remove(id: string, userId: string) {
    await this.findOne(id); // 존재 확인

    return this.prisma.feature.update({
      where: { id: BigInt(id) },
      data: {
        isActive: false,
        updatedBy: BigInt(userId),
      },
    });
  }
}
```

### 5.2 BigInt 처리

```typescript
// Prisma BigInt ID는 항상 BigInt()로 변환하여 쿼리
where: { id: BigInt(id) }

// 응답에서는 main.ts의 toJSON 패치로 자동 문자열 변환
// (BigInt.prototype as any).toJSON = function() { return this.toString(); };
```

---

## 6. 응답 표준화

### 6.1 응답 래퍼 (ResponseInterceptor)

모든 API 응답은 자동으로 다음 형식으로 래핑됩니다:

```json
{
  "code": "SUC001",
  "message": "처리가 완료되었습니다.",
  "data": { ... }
}
```

### 6.2 성공 코드

| 코드 | 의미 | 사용 시점 |
|------|------|---------|
| `SUC001` | 기본 성공 | GET, PATCH (기본값) |
| `SUC002` | 생성 성공 | POST |
| `SUC003` | 삭제 성공 | DELETE |

```typescript
// Controller에서 코드 지정
@ResponseCode('SUC002')
@Post()
create() { ... }
```

### 6.3 페이지네이션 응답 구조

```typescript
interface PaginatedData<T> {
  list: T[];
  totalCount: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  nextPage: number | null;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasNextPage: boolean;
}
```

---

## 7. 인증/인가

### 7.1 JWT 전략

- **Access Token**: 클라이언트 localStorage에 저장, 요청마다 Authorization 헤더로 전송
- **Refresh Token**: HttpOnly Cookie로 관리, 자동 갱신

### 7.2 Guard 사용

```typescript
// JWT 인증 필수
@UseGuards(JwtAuthGuard)

// 역할 기반 접근 제어
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PM')

// 현재 사용자 정보 접근
@CurrentUser() user: { id: string; role: string }
```

---

## 8. 데이터베이스 설계 규칙

### 8.1 공통 컬럼 (모든 테이블 필수)

```prisma
model Feature {
  id        BigInt   @id @default(autoincrement())
  // ... 도메인 컬럼

  isActive  Boolean  @default(true) @map("is_active")
  createdBy BigInt   @map("created_by")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(6)
  updatedBy BigInt   @map("updated_by")
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp(6)

  @@map("features")  // 테이블명: 복수형 snake_case
}
```

### 8.2 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 테이블 | snake_case, 복수형 | `projects`, `task_assignments` |
| 컬럼 | snake_case, 단수형 | `project_name`, `user_id` |
| 인덱스 | `idx_{table}_{columns}` | `idx_projects_name` |
| 외래 키 | `fk_{table}_{ref_table}` | `fk_tasks_projects` |

### 8.3 Soft Delete 패턴

```typescript
// 조회 시 항상 isActive 필터
where: { isActive: true }

// 삭제 시 isActive = false로 변경
data: { isActive: false }
```

---

## 9. TDD 패턴

### 9.1 Service 테스트

```typescript
// feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureService } from './feature.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FeatureService', () => {
  let service: FeatureService;
  let prisma: PrismaService;

  // Mock PrismaService
  const mockPrisma = {
    feature: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('페이지네이션된 목록을 반환해야 한다', async () => {
      const mockList = [{ id: BigInt(1), name: 'Test' }];
      mockPrisma.feature.findMany.mockResolvedValue(mockList);
      mockPrisma.feature.count.mockResolvedValue(1);

      const result = await service.findAll({ pageNum: 1, pageSize: 10 });

      expect(result.list).toEqual(mockList);
      expect(result.totalCount).toBe(1);
      expect(result.pageNum).toBe(1);
    });
  });

  describe('findOne', () => {
    it('존재하지 않는 ID로 조회 시 NotFoundException을 던져야 한다', async () => {
      mockPrisma.feature.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('새 리소스를 생성하고 반환해야 한다', async () => {
      const dto = { name: 'New Feature' };
      const mockResult = { id: BigInt(1), ...dto };
      mockPrisma.feature.create.mockResolvedValue(mockResult);

      const result = await service.create(dto, '1');

      expect(mockPrisma.feature.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'New Feature' }),
      });
      expect(result).toEqual(mockResult);
    });
  });
});
```

---

## 10. Swagger 문서

### 10.1 접근
개발 서버 실행 후 `http://localhost:3000/docs` 에서 확인

### 10.2 데코레이터

```typescript
@ApiTags('Features')           // 그룹 태그
@ApiBearerAuth('Bearer')      // JWT 인증 표시
@ApiOperation({ summary: '목록 조회' })  // 엔드포인트 설명
```

### 10.3 Zod 스키마 자동 연동
`patchNestJsSwagger()`를 main.ts에서 호출하면 Zod DTO가 Swagger에 자동 반영됩니다.

---

## 11. 에러 처리

### 11.1 NestJS 내장 예외

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

// 사용
throw new NotFoundException('프로젝트를 찾을 수 없습니다');
throw new ConflictException('이미 존재하는 이름입니다');
throw new BadRequestException('잘못된 요청입니다');
```

### 11.2 Zod 검증 에러
`ZodValidationPipe`가 전역으로 설정되어 있어 DTO 검증 실패 시 자동으로 400 응답을 반환합니다.

---

## 12. 체크리스트 (새 기능 개발 시)

- [ ] @repo/schema에 Zod 스키마 먼저 정의
- [ ] Request 타입은 `z.infer<>`로 생성하여 export
- [ ] DTO는 `createZodDto()` 사용
- [ ] Service 단위 테스트 작성 (TDD)
- [ ] Controller에 Swagger 데코레이터 추가
- [ ] 공통 컬럼 포함 확인 (id, isActive, createdBy, createdAt, updatedBy, updatedAt)
- [ ] Soft Delete 패턴 적용 (isActive)
- [ ] BigInt ID 처리 확인
- [ ] ResponseCode 데코레이터 적용 (POST: SUC002, DELETE: SUC003)
- [ ] 에러 처리 (NotFoundException 등)
