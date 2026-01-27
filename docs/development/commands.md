# 주요 명령어

## 개발

```bash
# 전체 개발 서버 실행
pnpm dev

# API만 실행
pnpm --filter api dev

# 웹만 실행
pnpm --filter web dev
```

## 테스트

```bash
# 전체 테스트
pnpm test

# API 테스트 (watch 모드)
pnpm --filter api test:watch

# E2E 테스트
pnpm test:e2e
```

## 데이터베이스

```bash
# Prisma Client 생성
pnpm --filter api prisma generate

# 마이그레이션 (PM 승인 후에만!)
cd apps/api && pnpm prisma migrate dev

# Prisma Studio (GUI)
pnpm --filter api prisma studio
```

## Docker

```bash
# PostgreSQL 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose stop
```

## Lint & Format

```bash
# Lint
pnpm lint

# Format
pnpm format
```
