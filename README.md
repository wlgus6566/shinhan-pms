# 이모션 PMS (Project Management System)

이모션의 프로젝트 및 업무 관리를 위한 통합 프로젝트 관리 시스템

## 빠른 시작

### 1. Docker로 PostgreSQL 실행 (권장)

```bash
# PostgreSQL 시작
docker-compose up -d

# 데이터베이스 마이그레이션
cd apps/api
pnpm prisma migrate dev
```

### 2. 개발 서버 실행

```bash
# 전체 서버 실행 (API + Web)
pnpm dev

# 또는 개별 실행
pnpm --filter api dev    # API 서버
pnpm --filter web dev    # 웹 앱
```

**서비스 접속**:

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Web: http://localhost:3001
- Adminer (DB 관리): http://localhost:8081

## What's inside?

This Turborepo includes the following packages & apps:

### Apps and Packages

```shell
.
├── apps
│   ├── api                       # NestJS app (https://nestjs.com).
│   └── web                       # Next.js app (https://nextjs.org).
└── packages
    ├── @repo/api                 # Shared `NestJS` resources.
    ├── @repo/eslint-config       # `eslint` configurations (includes `prettier`)
    ├── @repo/jest-config         # `jest` configurations
    ├── @repo/typescript-config   # `tsconfig.json`s used throughout the monorepo
    └── @repo/ui                  # Shareable stub React component library.
```

Each package and application are mostly written in [TypeScript](https://www.typescriptlang.org/).

### Utilities

This `Turborepo` has some additional tools already set for you:

- [TypeScript](https://www.typescriptlang.org/) for static type-safety
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Jest](https://prettier.io) & [Playwright](https://playwright.dev/) for testing

### 기술 스택

**Frontend**:

- Next.js (CSR)
- shadcn/ui + Radix UI
- React Hook Form + Zod
- Tailwind CSS

**Backend**:

- NestJS (Fastify)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt

**DevOps**:

- Docker & Docker Compose
- Turborepo
- GitHub Actions

### 주요 명령어

#### 개발

```bash
# 전체 개발 서버 실행
pnpm dev

# API 서버만 실행
pnpm --filter api dev

# 웹 앱만 실행
pnpm --filter web dev
```

#### 빌드

```bash
# 전체 빌드
pnpm build

# 개별 빌드
pnpm --filter api build
pnpm --filter web build
```

#### 테스트

```bash
# 전체 테스트
pnpm test

# E2E 테스트
pnpm test:e2e

# API 테스트만
pnpm --filter api test
```

#### 데이터베이스

```bash
# Prisma Client 생성
pnpm --filter api prisma generate

# 마이그레이션
pnpm --filter api prisma migrate dev

# Prisma Studio (GUI)
pnpm --filter api prisma studio
```

#### Docker

```bash
# PostgreSQL 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose stop

# 제거 (데이터 유지)
docker-compose down

# 제거 (데이터 삭제)
docker-compose down -v
```

#### Lint & Format

```bash
# Lint
pnpm lint

# Format
pnpm format
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```bash
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```bash
npx turbo link
```

## 문서

- [환경 설정 가이드](./SETUP.md) - 상세한 설정 방법
- [AI 에이전트 가이드](./AI_AGENT_GUIDE.md) - AI 기반 개발 워크플로우
- [PRD](./artifacts/prd.md) - 프로젝트 요구사항 문서

## 주요 기능

- ✅ 회원 관리 (인증/권한)
- ✅ 프로젝트 관리
- ⏳ 업무 관리
- ⏳ 일정 관리
- ⏳ 현황 관리
- ⏳ 보고서

## 프로젝트 구조

```
emotion-pms/
├── apps/
│   ├── api/              # NestJS 백엔드
│   └── web/              # Next.js 프론트엔드
├── packages/
│   ├── api/              # 공유 타입 (DTO, Entity)
│   ├── ui/               # 공유 UI 컴포넌트
│   └── ...
├── artifacts/            # AI 에이전트 산출물
│   ├── planning-user-story/     # 기획서
│   ├── planning-wireframe/      # 와이어프레임
│   └── database-schema/         # DB 스키마
└── .claude/agents/       # AI 에이전트 정의
```

## 참고 자료

- [NestJS](https://docs.nestjs.com)
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Turborepo](https://turbo.build/repo/docs)
