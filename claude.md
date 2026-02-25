# 이모션 PMS - Claude AI 협업 가이드

## 프로젝트 개요

**프로젝트명**: 이모션 PMS (Project Management System)
**목적**: 범용 프로젝트 및 업무 관리 시스템

### 기술 스택
- **Frontend**: Next.js (CSR), SWR, shadcn/ui, React Hook Form + Zod
- **Backend**: NestJS (Fastify), Prisma ORM, PostgreSQL, JWT
- **DevOps**: Docker, Turborepo, pnpm

### 프로젝트 구조
```
emotion-pms/
├── apps/
│   ├── api/              # NestJS 백엔드
│   └── web/              # Next.js 프론트엔드
├── packages/
│   └── @repo/schema/     # 공유 Zod 스키마 및 타입 (단일 소스)
├── artifacts/            # AI 에이전트 산출물
└── docs/                 # 상세 문서
```

## AI 에이전트 팀

| 에이전트 | 역할 | 주요 산출물 |
|---------|------|-----------|
| **PM** | 프로젝트 관리자 | todo.md, 검수 승인 |
| **Planner** | 기획자 | 기획서 (user-story) |
| **Wireframe** | 와이어프레임 제작자 | HTML 와이어프레임 |
| **Modeler** | DB 모델러 | 스키마 명세, DDL, Prisma |
| **Developer** | 풀스택 개발자 | API, UI, 테스트 코드 |

**워크플로우**: PM → Planner → PM 승인 → Wireframe → PM 승인 → Modeler → PM 승인 → Developer (Backend) → PM 승인 → Developer (Frontend) → PM 최종 승인

## 핵심 규칙

### 1. 명명 규칙
- **DB**: `snake_case` (테이블: 복수형, 컬럼: 단수형)
- **코드**: `kebab-case` (파일), `PascalCase` (클래스/타입), `camelCase` (함수)
- **API**: RESTful 컨벤션 (`GET /api/projects`, `POST /api/projects/:id`)

상세: [명명 규칙 문서](./docs/development/naming-conventions.md)

### 2. TDD (Backend 필수)
테스트 작성 → 구현 → 리팩토링

### 3. CSR 전용 (Frontend)
모든 페이지/컴포넌트 상단에 `'use client'` 필수

### 4. 공통 컬럼 (DB 필수)
모든 테이블: `id`, `is_active`, `created_by`, `created_at`, `updated_by`, `updated_at`

### 5. 타입 시스템
- **단일 소스**: `@repo/schema` 패키지
- **Backend**: `createZodDto(Schema)` 사용
- **Frontend**: `zodResolver(Schema)` 사용
- **금지**: 중복 타입 정의, inline 검증 로직

상세: [타입 시스템 문서](./docs/development/type-system.md)

### 6. 폼 컴포넌트
- **사용**: `@/components/form`의 재사용 컴포넌트 (FormInput, FormSelect 등)
- **금지**: FormField 직접 사용 (예외: 특수한 커스텀 UI)

상세: [패턴 문서](./docs/development/patterns.md)

### 7. Dialog 컴포넌트
- **사용**: `BaseDialog` 필수
- **금지**: `Dialog` 직접 사용

상세: [패턴 문서](./docs/development/patterns.md)

### 8. API 호출
- **위치**: `lib/api/` 디렉토리 통합 관리
- **GET**: SWR 훅 (`useDomain`)
- **POST/PATCH/DELETE**: async 함수
- **금지**: 컴포넌트에서 직접 `useSWR` 호출, `useState + useEffect` 패턴

상세: [패턴 문서](./docs/development/patterns.md)

### 9. API 응답
- **목록 조회**: `PaginatedData<T>` 타입 사용, `data?.list`로 배열 추출
- **Interceptor**: axios interceptor가 `data` 필드 자동 추출

상세: [패턴 문서](./docs/development/patterns.md)

### 10. 산출물 저장 경로

| 산출물 | 경로 |
|-------|------|
| 기획서 | `artifacts/planning-user-story/{feature}.md` |
| 와이어프레임 | `artifacts/planning-wireframe/{feature}/` |
| DB 스키마 | `artifacts/database-schema/{domain}/` |

## 금지 사항

### Planner
- ❌ DB 테이블 상세 설계
- ❌ API 상세 JSON 작성
- ❌ HTML 작성

### Wireframe
- ❌ 와이어프레임 임의 수정

### Modeler
- ❌ 공통 컬럼 누락

### Developer
- ❌ 와이어프레임 임의 수정
- ❌ FormField 직접 사용
- ❌ Dialog 직접 사용
- ❌ 컴포넌트에서 직접 useSWR 호출
- ❌ useState + useEffect 패턴
- ❌ @repo/schema 외부에 검증 로직 작성

### 공통
- ❌ 이전 단계 미승인 시 다음 단계 진행
- ❌ PM 승인 없이 마이그레이션

## Best Practices

1. **규칙 기반 개선**: 결과물보다 규칙을 먼저 고친다
2. **순차 진행**: Planner → Wireframe → Modeler → Developer
3. **역할 범위 준수**: 각 에이전트는 자신의 역할 범위 내에서만 작업
4. **범용 플러그인 우선**: 새 기능 개발 전 관련 라이브러리 검토

상세: [Best Practices 문서](./docs/setup/best-practices.md)

## 문서 참조

### 개발 가이드
- [명명 규칙](./docs/development/naming-conventions.md)
- [개발 패턴](./docs/development/patterns.md)
- [타입 시스템](./docs/development/type-system.md)
- [권한 체계](./docs/development/permissions.md)
- [주요 명령어](./docs/development/commands.md)

### 에이전트
- [워크플로우](./docs/agents/workflow.md)
- [역할별 책임](./docs/agents/roles.md)

### 설정
- [체크리스트](./docs/setup/checklist.md)
- [Best Practices](./docs/setup/best-practices.md)

### 기타
- [환경 설정](./SETUP.md)
- [브랜딩](./BRANDING.md)
- [README](./README.md)
- [PRD](./artifacts/prd.md)

## 주의사항

1. **타입 안전성**: `@repo/schema` 단일 소스 사용
2. **모노레포**: 공통 의존성은 루트, 앱별 의존성은 각 앱
3. **환경 변수**: `apps/api/.env`, `apps/web/.env.local`
4. **포트**: API (3000), Web (3001), Adminer (8081), PostgreSQL (5432)

---

**마지막 업데이트**: 2026-01-27 (docs 분리 구조화)
