# 이모션 PMS - Claude AI 에이전트 협업 가이드

## 프로젝트 개요

**프로젝트명**: 이모션 PMS (Project Management System)
**회사**: 이모션 (Emotion)
**목적**: 범용 프로젝트 및 업무 관리 시스템

### 기술 스택

**Frontend**:
- Next.js (CSR 전용)
- SWR (Data Fetching & Caching)
- shadcn/ui + Radix UI
- React Hook Form + Zod
- Tailwind CSS

**Backend**:
- NestJS (Fastify)
- Prisma ORM
- PostgreSQL
- JWT Authentication

**DevOps**:
- Docker & Docker Compose
- Turborepo (모노레포)
- pnpm

### 프로젝트 구조

```
emotion-pms/
├── apps/
│   ├── api/                       # NestJS 백엔드
│   │   ├── src/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── test/
│   └── web/                       # Next.js 프론트엔드
│       ├── app/
│       ├── components/
│       └── lib/
├── packages/
│   ├── @repo/schema/              # 공유 Zod 스키마 및 타입 (단일 소스)
│   ├── @repo/eslint-config/       # ESLint 설정
│   ├── @repo/jest-config/         # Jest 설정
│   └── @repo/typescript-config/   # TypeScript 설정
├── artifacts/                     # AI 에이전트 산출물
│   ├── planning-user-story/      # 기획서
│   ├── planning-wireframe/       # 와이어프레임 (HTML)
│   └── database-schema/          # DB 스키마 명세
└── .claude/
    └── agents/                   # AI 에이전트 정의
        ├── pm.md
        ├── planner.md
        ├── wireframe.md
        ├── modeler.md
        └── developer.md
```

## AI 에이전트 팀

### 역할별 책임

| 에이전트 | 역할 | 주요 산출물 | 사용 도구 |
|---------|------|-----------|----------|
| **PM** | 프로젝트 관리자 | todo.md, 검수 승인 | Read, Write, Edit, Grep, Glob |
| **Planner** | 기획자 | 기획서 (user-story) | Read, Write, Edit, Grep, Glob |
| **Wireframe** | 와이어프레임 제작자 | HTML 와이어프레임 | Read, Write, Edit, Grep, Glob |
| **Modeler** | DB 모델러 | 스키마 명세, DDL, Prisma | Read, Write, Edit, Grep, Glob |
| **Developer** | 풀스택 개발자 | API, UI, 테스트 코드 | Read, Write, Edit, Grep, Glob, Terminal |

### 워크플로우

```
사용자 요구사항
    ↓
PM (요구사항 분석, 우선순위 결정)
    ↓
Planner (기획서 작성)
    ↓
PM 검수 → 승인
    ↓
Wireframe (HTML 와이어프레임 작성)
    ↓
PM 검수 → 승인
    ↓
Modeler (DB 스키마 설계)
    ↓
PM 검수 → 승인 → 마이그레이션
    ↓
Developer (백엔드 개발 - TDD)
    ↓
PM 검수 → 승인
    ↓
Developer (프론트엔드 개발)
    ↓
PM 검수 → 최종 승인
    ↓
기능 완료
```

## 브랜딩 가이드

### 색상 팔레트

```typescript
emotion: {
  primary: '#6366F1',      // 인디고 (주색상)
  secondary: '#8B5CF6',    // 보라 (보조색상)
  accent: '#EC4899',       // 핑크 (강조색)
  lightgray: '#F9FAFB',    // 연한 회색 (배경)
}
```

### 디자인 원칙

- **Border Radius**: `rounded-lg` (8px), `rounded-xl` (12px)
- **Shadow**: `shadow-sm`, `shadow-md`, `shadow-lg`
- **Typography**: font-bold (제목), font-normal (본문), font-semibold (강조)
- **Spacing**: space-y-4, gap-4
- **Animation**: transition-all, duration-300

자세한 내용은 [BRANDING.md](./BRANDING.md) 참조.

## 명명 규칙

### 데이터베이스

- **테이블**: `snake_case`, 복수형 (예: `projects`, `task_assignments`)
- **컬럼**: `snake_case`, 단수형 (예: `project_name`, `created_at`)
- **인덱스**: `idx_{table}_{columns}` (예: `idx_projects_name`)
- **외래 키**: `fk_{table}_{ref_table}` (예: `fk_tasks_projects`)

### 코드

- **파일명**:
  - Backend: `kebab-case` (예: `project.service.ts`)
  - Frontend: `kebab-case` (예: `project-list.tsx`)
- **클래스**: `PascalCase` (예: `ProjectService`, `ProjectController`)
- **함수/메서드**: `camelCase` (예: `createProject`, `findAll`)
- **상수**: `UPPER_SNAKE_CASE` (예: `MAX_PROJECT_NAME_LENGTH`)
- **타입/인터페이스**: `PascalCase` (예: `CreateProjectDto`, `ProjectEntity`)

### API 경로

RESTful 컨벤션 준수:

```
GET    /api/projects           # 목록 조회
GET    /api/projects/:id       # 상세 조회
POST   /api/projects           # 생성
PATCH  /api/projects/:id       # 수정
DELETE /api/projects/:id       # 삭제
```

## 공통 규칙

### 1. TDD (Test-Driven Development)

백엔드 개발 시 필수:

```
테스트 작성 → 구현 → 리팩토링
```

- Service 단위 테스트 먼저 작성
- Controller 통합 테스트 작성
- `pnpm test` 또는 `pnpm test:watch` 실행

### 2. CSR (Client-Side Rendering) 전용

프론트엔드는 CSR만 사용:

```typescript
'use client'; // 모든 페이지/컴포�넌트 상단에 필수

export default function ProjectList() {
  // ...
}
```

### 3. 공통 컬럼 (DB)

모든 테이블에 필수:

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 고유 식별자 |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE | 활성 여부 (soft delete) |
| created_by | BIGINT | NOT NULL | 생성자 ID |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW | 생성일시 |
| updated_by | BIGINT | NULL | 수정자 ID |
| updated_at | TIMESTAMP | NULL | 수정일시 |

### 4. 폼 검증 패턴

React Hook Form + Zod 사용:

```typescript
const formSchema = z.object({
  name: z.string().min(2, '최소 2자 이상'),
  type: z.enum(['A', 'B']),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
});
```

### 5. 타입 시스템 및 검증 규칙

**핵심 원칙**: `@repo/schema` 패키지를 단일 소스로 사용하여 모든 검증 로직과 타입을 통합 관리합니다.

#### Backend (NestJS)

```typescript
// DTO는 Zod 스키마에서 생성
import { createZodDto } from 'nestjs-zod';
import { CreateProjectSchema } from '@repo/schema';

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}

// Request 타입도 @repo/schema에서 가져옴
import type { CreateProjectRequest } from '@repo/schema';
```

**규칙**:
- DTO 클래스는 `createZodDto()` 사용하여 Zod 스키마에서 생성
- 검증 로직을 DTO 내부에 직접 작성 금지
- Request 타입은 @repo/schema에서 import
- 중복 타입 정의 절대 금지

#### Frontend (Next.js)

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

**규칙**:
- 폼 검증은 반드시 @repo/schema의 Zod 스키마 사용
- Request 타입은 @repo/schema에서 import (중복 정의 금지)
- 로컬 타입은 UI 전용 목적(string ↔ number 변환 등)으로만 정의
- 검증 로직을 컴포넌트 내부에 inline으로 작성 금지

#### @repo/schema 패키지 구조

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

**타입 export 패턴**:

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

#### 날짜 검증 패턴

HTML5 date input은 `YYYY-MM-DD` 형식을 자동 제공하므로 regex 검증 불필요:

```typescript
// ❌ 불필요한 regex
startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()

// ✅ 간결한 검증
startDate: z.string().optional()

// 날짜 범위 검증은 .refine() 사용
export const CreateProjectSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  { message: '종료일은 시작일 이후여야 합니다', path: ['endDate'] }
);
```

#### Null vs Undefined 처리

Prisma는 nullable 필드에 `null`을 반환하지만, Zod `.optional()`은 `undefined`를 기대:

```typescript
// ❌ 타입 에러
workHours: workLog.workHours  // number | null | undefined

// ✅ null → undefined 변환
workHours: workLog.workHours ?? undefined  // number | undefined
```

#### 체크리스트

**새 기능 개발 시**:
- [ ] @repo/schema에 Zod 스키마 먼저 정의
- [ ] Request 타입은 `z.infer<>`로 생성하여 export
- [ ] Backend DTO는 `createZodDto()` 사용
- [ ] Frontend는 `zodResolver()` 사용
- [ ] 로컬 검증 로직 없는지 확인 (inline z.object() 금지)
- [ ] 중복 타입 정의 없는지 확인

**마이그레이션 시 제거 대상**:
- 컴포넌트 내부의 inline Zod 스키마 (`z.object({...})`)
- `apps/web/types/` 내의 중복 Request 타입 정의
- Backend DTO 클래스 내부의 검증 데코레이터 (`@IsString()`, `@MinLength()` 등)

### 6. 산출물 저장 경로

| 산출물 | 경로 |
|-------|------|
| 기획서 | `artifacts/planning-user-story/{feature}.md` |
| 와이어프레임 | `artifacts/planning-wireframe/{feature}/` |
| DB 스키마 명세 | `artifacts/database-schema/{domain}/{domain}.md` |
| DDL/DML | `artifacts/database-schema/{domain}/{domain}.sql` |

### 7. SWR 기반 API 호출 패턴

**핵심 원칙**: 모든 API 호출 로직은 `lib/api/` 디렉토리에 통합 관리합니다.

#### 패턴 정의

```typescript
// lib/api/{domain}.ts 구조

// 1. GET 요청 → SWR 훅
export function useDomain(params) {
  const { data, error, isLoading, mutate } = useSWR(url);
  return { data, isLoading, error, mutate };
}

// 2. POST/PATCH/DELETE → async 함수
export async function createDomain(data) {
  return fetcher('/api/domain', { method: 'POST', body: data });
}
```

#### 조건부 Fetching 규칙

SWR에 `null`을 전달하면 요청하지 않습니다:

```typescript
// 단일 항목 조회 - ID 없으면 요청 안 함
export function useProject(id: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null
  );
  return { project: data, isLoading, error, mutate };
}

// 날짜 범위 필수 - 파라미터 없으면 요청 안 함
export function useMyWorkLogs(startDate: string, endDate: string) {
  const url = startDate && endDate
    ? `/api/work-logs/my?startDate=${startDate}&endDate=${endDate}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<WorkLog[]>(url);
  return { workLogs: data, isLoading, error, mutate };
}
```

#### 캐시 Revalidation

Mutation 후 관련 캐시를 갱신합니다:

```typescript
// 패턴 1: 부모에서 mutate 전달
const { tasks, mutate } = useTasks(projectId);
<AddTaskDialog onSuccess={() => mutate()} />

// 패턴 2: 전역 mutate 사용
import { useSWRConfig } from 'swr';
const { mutate: globalMutate } = useSWRConfig();
await createTask(projectId, data);
globalMutate(`/api/projects/${projectId}/tasks`);
```

#### 금지 사항

```typescript
// ❌ 컴포넌트에서 직접 useSWR 호출 금지
const { data } = useSWR('/api/projects', fetcher);

// ✅ lib/api/의 훅 사용
const { projects } = useProjects();

// ❌ useState + useEffect 패턴 금지
const [data, setData] = useState(null);
useEffect(() => {
  fetchData().then(setData);
}, []);

// ✅ SWR 훅 사용
const { data, isLoading } = useData();
```

#### 체크리스트

**새 API 개발 시**:
- [ ] GET 요청은 `lib/api/`에 SWR 훅으로 작성
- [ ] POST/PATCH/DELETE는 async 함수로 작성
- [ ] 조건부 fetching 필요시 `null` 전달 구현
- [ ] Mutation 함수 호출 후 `mutate()` 호출하여 캐시 갱신
- [ ] 컴포넌트에서 직접 `useSWR` 호출하지 않기

**기존 코드 발견 시**:
- useState + useEffect → SWR 훅으로 마이그레이션
- 직접 useSWR 호출 → lib/api/ 훅으로 마이그레이션
- Promise.all → 개별 SWR 훅으로 분리 (SWR이 자동 병렬 처리)

## 주요 명령어

### 개발

```bash
# 전체 개발 서버 실행
pnpm dev

# API만 실행
pnpm --filter api dev

# 웹만 실행
pnpm --filter web dev
```

### 테스트

```bash
# 전체 테스트
pnpm test

# API 테스트 (watch 모드)
pnpm --filter api test:watch

# E2E 테스트
pnpm test:e2e
```

### 데이터베이스

```bash
# Prisma Client 생성
pnpm --filter api prisma generate

# 마이그레이션 (PM 승인 후에만!)
cd apps/api && pnpm prisma migrate dev

# Prisma Studio (GUI)
pnpm --filter api prisma studio
```

### Docker

```bash
# PostgreSQL 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose stop
```

### Lint & Format

```bash
# Lint
pnpm lint

# Format
pnpm format
```

## 체크리스트

### 기획서 (Planner)

- [ ] 목적/배경/범위 명확
- [ ] 기능 요구사항 (FR) 우선순위 정의
- [ ] 비기능 요구사항 (NFR) 수치 기준 정의
- [ ] 사용자 스토리 + 인수 조건
- [ ] 화면 목록 및 흐름
- [ ] API 경로 (RESTful)
- [ ] 초기 데이터 (도메인 코드)
- [ ] 예외 처리 케이스

### 와이어프레임 (Wireframe)

- [ ] 기획서의 모든 화면 구현
- [ ] 화면 간 링크 연결
- [ ] 사이드바 직접 임베드 (CORS 방지)
- [ ] 필수 입력 필드 `*` 표시
- [ ] 에러 메시지 영역 포함
- [ ] 다크모드 스타일 적용

### DB 스키마 (Modeler)

- [ ] 공통 컬럼 포함
- [ ] 명명 규칙 (snake_case) 준수
- [ ] 적절한 인덱스 설계
- [ ] 외래 키 관계 정의
- [ ] 컬럼 코멘트 작성
- [ ] Prisma 스키마와 DDL 동기화
- [ ] 초기 데이터 (DML) 작성

### 백엔드 개발 (Developer)

- [ ] 단위 테스트 작성 및 통과
- [ ] Swagger 문서 노출 (http://localhost:3000/docs)
- [ ] DTO validation 규칙 적용
- [ ] 에러 처리 적절
- [ ] 코드 컨벤션 준수

### 프론트엔드 개발 (Developer)

- [ ] 모든 페이지 `'use client'` 포함
- [ ] 와이어프레임과 UI 일치
- [ ] CRUD 기능 정상 동작
- [ ] 에러 메시지 표시
- [ ] 로딩 상태 표시
- [ ] 브랜드 가이드 준수
- [ ] **범용 플러그인 우선 검토**: 새로운 UI 컴포넌트나 기능 개발 전 관련 플러그인/라이브러리 먼저 검토 (예: 캘린더 → FullCalendar, 차트 → Recharts, 테이블 → TanStack Table 등)

## Best Practices

### 1. 규칙 기반 개선

> "마음에 안 드는 결과가 나오면 결과물을 고치기보다 규칙을 고친다"

- 문제 발생 → 원인 분석
- 에이전트 규칙 누락/모호/오류 확인
- `.claude/agents/{agent}.md` 파일 수정
- 다음 작업에서 개선 효과 확인

### 2. 순차 진행 원칙

- Planner → Wireframe → Modeler → Developer 순서 엄수
- 이전 단계 미승인 시 다음 단계 진행 금지
- PM 승인 없이 마이그레이션 금지

### 3. 역할 범위 준수

- **Planner**: DB 테이블 상세 설계 금지, API 상세 JSON 작성 금지, HTML 작성 금지
- **Wireframe**: 디자인 완성도보다 기능 표현에 집중, JavaScript는 시뮬레이션 수준만
- **Modeler**: 공통 컬럼 누락 시 작업 중단 후 재작성
- **Developer**: 와이어프레임 임의 수정 금지

## 문서 참조

- [환경 설정 가이드](./SETUP.md)
- [브랜딩 가이드](./BRANDING.md)
- [README](./README.md)
- [PRD](./artifacts/prd.md)

## 테스트 계정

모든 계정의 비밀번호는 `password123`입니다.

- PM: kim@emotion.co.kr
- PL: lee@emotion.co.kr
- PA: park@emotion.co.kr, jung@emotion.co.kr, choi@emotion.co.kr, kang@emotion.co.kr, yoon@emotion.co.kr, lim@emotion.co.kr

## 주의사항

1. **타입 안전성**: `@repo/schema` 패키지를 통해 백엔드-프론트엔드 간 Zod 스키마 및 타입 공유
2. **모노레포**: 공통 의존성은 루트 `package.json`에, 앱별 의존성은 각 앱의 `package.json`에
3. **환경 변수**: `.env` 파일은 각 앱 디렉토리에 위치 (`apps/api/.env`, `apps/web/.env.local`)
4. **포트**: API (3000), Web (3001), Adminer (8081), PostgreSQL (5432)

---

## 에이전트 호출 방법

각 에이전트는 `.claude/agents/` 디렉토리의 마크다운 파일로 정의되어 있습니다. 에이전트를 호출할 때는 역할과 작업 내용을 명확히 지시하세요.

### 예시

```
@planner [프로젝트 관리] 기능을 기획해주세요.
프로젝트 생성, 수정, 삭제, 목록 조회 기능이 필요합니다.
```

```
@wireframe [프로젝트 관리] 기획서를 바탕으로 와이어프레임을 작성해주세요.
```

```
@modeler [프로젝트 관리] 기획서를 바탕으로 DB 스키마를 설계해주세요.
```

```
@developer [프로젝트 관리] 백엔드 API를 TDD 방식으로 개발해주세요.
```

```
@developer [프로젝트 관리] 프론트엔드 UI를 개발해주세요.
```

---

**마지막 업데이트**: 2026-01-23 (SWR 패턴 추가)
