# 타입 시스템 및 검증 규칙

## 핵심 원칙

`@repo/schema` 패키지를 단일 소스로 사용하여 모든 검증 로직과 타입을 통합 관리합니다.

## Backend (NestJS)

### DTO 정의

```typescript
// DTO는 Zod 스키마에서 생성
import { createZodDto } from 'nestjs-zod';
import { CreateProjectSchema } from '@repo/schema';

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}

// Request 타입도 @repo/schema에서 가져옴
import type { CreateProjectRequest } from '@repo/schema';
```

### 규칙
- DTO 클래스는 `createZodDto()` 사용하여 Zod 스키마에서 생성
- 검증 로직을 DTO 내부에 직접 작성 금지
- Request 타입은 @repo/schema에서 import
- 중복 타입 정의 절대 금지

## Frontend (Next.js)

### 스키마와 타입 사용

```typescript
// 1. 스키마와 타입을 @repo/schema에서 가져옴
import { CreateProjectSchema } from '@repo/schema';
import type { CreateProjectRequest } from '@repo/schema';

// 2. React Hook Form에 타입 적용
type FormValues = CreateProjectRequest;

const form = useForm<FormValues>({
  resolver: zodResolver(CreateProjectSchema),
});

// 3. 필요시 로컬 타입 재정의 (예: select의 string ID 변환)
import type { ProjectType, MemberRole } from '@repo/schema';

export type ProjectRole = MemberRole; // 도메인 맥락에 맞게 alias
```

### 규칙
- 폼 검증은 반드시 @repo/schema의 Zod 스키마 사용
- Request 타입은 @repo/schema에서 import (중복 정의 금지)
- 로컬 타입은 UI 전용 목적(string ↔ number 변환 등)으로만 정의
- 검증 로직을 컴포넌트 내부에 inline으로 작성 금지

## @repo/schema 패키지 구조

```
packages/schema/src/
├── common/
│   ├── enums.ts           # 공통 enum 정의
│   └── types.ts           # 공통 타입
├── projects/
│   ├── create-project.schema.ts
│   ├── update-project.schema.ts
│   └── index.ts           # Request 타입 export
├── tasks/
├── work-logs/
└── index.ts
```

## 타입 Export 패턴

```typescript
// packages/schema/src/projects/index.ts
import { z } from 'zod';
import { CreateProjectSchema, UpdateProjectSchema } from './schemas';

// Request 타입 생성
export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectSchema>;

// 스키마와 enum도 함께 export
export { CreateProjectSchema, UpdateProjectSchema };
export { ProjectTypeEnum } from '../common/enums';
```

## Null vs Undefined 처리

Prisma는 nullable 필드에 `null`을 반환하지만, Zod `.optional()`은 `undefined`를 기대:

```typescript
// ❌ 타입 에러
workHours: workLog.workHours  // number | null | undefined

// ✅ null → undefined 변환
workHours: workLog.workHours ?? undefined  // number | undefined
```

## 체크리스트

### 새 기능 개발 시
- [ ] @repo/schema에 Zod 스키마 먼저 정의
- [ ] Request 타입은 `z.infer<>`로 생성하여 export
- [ ] Backend DTO는 `createZodDto()` 사용
- [ ] Frontend는 `zodResolver()` 사용
- [ ] 로컬 검증 로직 없는지 확인 (inline z.object() 금지)
- [ ] 중복 타입 정의 없는지 확인

### 마이그레이션 시 제거 대상
- 컴포넌트 내부의 inline Zod 스키마 (`z.object({...})`)
- `apps/web/types/` 내의 중복 Request 타입 정의
- Backend DTO 클래스 내부의 검증 데코레이터 (`@IsString()`, `@MinLength()` 등)
