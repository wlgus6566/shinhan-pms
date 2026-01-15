# PMS 개발 환경 설정 가이드

## 1. 사전 요구사항

### 필수

- Node.js >= 18
- pnpm >= 8.15.5

### 데이터베이스 (선택 중 하나)

- **옵션 1 (권장)**: Docker & Docker Compose
- **옵션 2**: PostgreSQL >= 14 (로컬 설치)

## 2. 데이터베이스 설정

### 옵션 1: Docker 사용 (권장)

**장점**: 설정이 간단하고 환경 일관성 보장

```bash
# Docker Compose로 PostgreSQL 시작
docker-compose up -d

# 또는 개발 환경 전용 설정 사용
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose logs -f postgres

# 상태 확인
docker-compose ps
```

**서비스**:

- PostgreSQL: `localhost:5433`
- Adminer (DB 관리 UI): http://localhost:8081
  - 시스템: PostgreSQL
  - 서버: postgres
  - 사용자: postgres
  - 비밀번호: postgres
  - 데이터베이스: pms_dev

**컨테이너 중지 및 제거**:

```bash
# 컨테이너 중지
docker-compose stop

# 컨테이너 및 볼륨 제거 (데이터 삭제 주의!)
docker-compose down -v
```

### 옵션 2: PostgreSQL 로컬 설치

```bash
# macOS (Homebrew)
brew install postgresql@14
brew services start postgresql@14

# 데이터베이스 생성
createdb pms_dev

# 또는 psql로
psql postgres
CREATE DATABASE pms_dev;
\q
```

## 3. 프로젝트 설정

### 의존성 설치

```bash
# 루트 디렉토리에서
pnpm install
```

### 환경 변수 설정

```bash
# apps/api 디렉토리에서
cd apps/api

# .env 파일 생성
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/pms_dev?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development
EOF
```

**주의**: 운영 환경에서는 `JWT_SECRET`과 `JWT_REFRESH_SECRET`을 반드시 변경하세요.

### Prisma 마이그레이션

```bash
# apps/api 디렉토리에서
cd apps/api

# Prisma Client 생성
pnpm prisma generate

# 마이그레이션 실행
pnpm prisma migrate dev

# (선택) Prisma Studio로 데이터 확인
pnpm prisma studio
```

### shadcn/ui 설정 (프론트엔드용)

```bash
# apps/web 디렉토리에서
cd apps/web

# Tailwind CSS 설정 파일 생성
npx tailwindcss init -p

# shadcn/ui 초기화
npx shadcn@latest init

# 초기화 시 선택할 옵션:
# - Style: New York
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: tailwind.config.ts
# - Components: @/components
# - Utils: @/lib/utils

# 기본 컴포넌트 설치
npx shadcn@latest add button card input label form select badge alert dialog
```

**필수 의존성 (이미 package.json에 포함됨):**

- `tailwindcss` - CSS 프레임워크
- `@hookform/resolvers` - React Hook Form + Zod 통합
- `zod` - 스키마 validation
- `react-hook-form` - 폼 상태 관리
- `lucide-react` - 아이콘
- `@radix-ui/*` - headless UI 컴포넌트 (shadcn/ui 기반)

## 4. 개발 서버 실행

### API 서버 (NestJS)

```bash
# 루트 디렉토리에서
pnpm --filter api dev

# 또는 apps/api 디렉토리에서
cd apps/api
pnpm dev
```

서버가 실행되면:

- API: http://localhost:3000
- Swagger 문서: http://localhost:3000/docs

### 웹 앱 (Next.js)

```bash
# 루트 디렉토리에서
pnpm --filter web dev

# 또는 apps/web 디렉토리에서
cd apps/web
pnpm dev
```

웹 앱: http://localhost:3001

### 전체 실행

```bash
# 루트 디렉토리에서
pnpm dev
```

## 5. 테스트

### 단위 테스트

```bash
pnpm test
```

### E2E 테스트

```bash
pnpm test:e2e
```

## 6. Prisma 관련 명령어

```bash
# Prisma Client 생성
pnpm --filter api prisma:generate

# 마이그레이션 생성 및 실행
pnpm --filter api prisma:migrate

# Prisma Studio 실행 (GUI)
pnpm --filter api prisma:studio
```

## 7. AI 에이전트 사용법

### 에이전트 목록

- **PM**: 프로젝트 관리, 검수
- **Planner**: 기획서 작성
- **Wireframe**: HTML 와이어프레임 작성
- **Modeler**: DB 스키마 설계
- **Developer**: 백엔드/프론트엔드 개발

### 에이전트 활용 예시

```
# 기획 시작
@planner 프로젝트 관리 기능을 기획해주세요.

# 와이어프레임 작성
@wireframe artifacts/planning-user-story/project-management.md를 참고하여
HTML 와이어프레임을 작성해주세요.

# DB 스키마 설계
@modeler artifacts/planning-user-story/project-management.md와
artifacts/planning-wireframe/project-management/를 참고하여
DB 스키마를 설계해주세요.

# 백엔드 개발
@developer artifacts/planning-user-story/project-management.md를 참고하여
NestJS API를 TDD로 개발해주세요.

# 프론트엔드 개발 (shadcn/ui)
@developer artifacts/planning-wireframe/project-management/를 참고하여
Next.js + shadcn/ui로 UI를 개발해주세요.
react-hook-form과 zod를 사용하여 폼 validation을 구현하세요.
```

## 8. 프로젝트 구조

```
shinhan-pms/
├── .claude/
│   └── agents/          # AI 에이전트 정의 파일
├── apps/
│   ├── api/            # NestJS 백엔드
│   │   ├── prisma/     # Prisma 스키마
│   │   └── src/
│   └── web/            # Next.js 프론트엔드
├── artifacts/
│   ├── planning-user-story/    # 기획서
│   ├── planning-wireframe/     # 와이어프레임
│   ├── database-schema/        # DB 스키마
│   └── todo.md                 # 진행 상황
└── packages/
    ├── api/            # 공유 타입 (DTO, Entity)
    ├── ui/             # 공유 UI 컴포넌트
    └── ...
```

## 9. 개발 워크플로우

1. **기획 (Planner)**: 기획서 작성 → PM 검수
2. **와이어프레임 (Wireframe)**: HTML 작성 → PM 검수
3. **DB 설계 (Modeler)**: 스키마 작성 → PM 검수 → 마이그레이션
4. **백엔드 개발 (Developer)**: TDD로 API 개발 → PM 검수
5. **프론트엔드 개발 (Developer)**: UI 개발 → PM 검수

## 10. 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 프로세스 확인
lsof -i :3000
lsof -i :3001

# 프로세스 종료
kill -9 <PID>
```

### Prisma Client 에러

```bash
# Prisma Client 재생성
cd apps/api
pnpm prisma:generate
```

### 데이터베이스 연결 에러

- `.env` 파일의 `DATABASE_URL` 확인
- PostgreSQL 서버 실행 여부 확인
- 데이터베이스 존재 여부 확인

## 11. Docker 관련 명령어

### 개발 환경

```bash
# PostgreSQL 시작
docker-compose up -d

# PostgreSQL + Adminer 시작
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose logs -f postgres

# 컨테이너 중지
docker-compose stop

# 컨테이너 및 네트워크 제거
docker-compose down

# 컨테이너, 네트워크, 볼륨 모두 제거 (데이터 삭제!)
docker-compose down -v
```

### Docker 내부 PostgreSQL 접속

```bash
# psql로 접속
docker exec -it pms-postgres psql -U postgres -d pms_dev

# 또는 bash 접속
docker exec -it pms-postgres bash
```

### 데이터베이스 백업 및 복원

```bash
# 백업
docker exec -t pms-postgres pg_dump -U postgres pms_dev > backup.sql

# 복원
docker exec -i pms-postgres psql -U postgres -d pms_dev < backup.sql
```

### API 서버 Docker 빌드 (선택)

```bash
# Dockerfile로 API 서버 이미지 빌드
docker build -t pms-api -f apps/api/Dockerfile .

# 빌드한 이미지 실행
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5433/pms_dev" \
  pms-api
```

## 12. 추가 리소스

- [NestJS 공식 문서](https://docs.nestjs.com)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Turborepo 공식 문서](https://turbo.build/repo/docs)
- [Docker 공식 문서](https://docs.docker.com)
- [shadcn/ui 공식 문서](https://ui.shadcn.com)
