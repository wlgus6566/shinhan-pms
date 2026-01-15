# PMS 아키텍처

## 1. 개요

### 1.1 프로젝트명

신한카드 운영&고도화 업무 관리용 PMS (Project Management System)

### 1.2 목적

웹에이전시 프로젝트 운영 및 고도화 업무의 효율적인 관리를 위한 시스템 구축

### 1.3 대상 사용자

- PM (Project Manager)
- PL (Project Leader)
- PA (Project Assistant)
- 기획자, 디자이너, 퍼블리셔, 개발자

### 1.3 핵심 원칙

| 원칙          | 설명                                                      |
| ------------- | --------------------------------------------------------- |
| **모노레포**  | FE/BE 타입 공유, 공통 유틸/SDK 공유, CI 파이프라인 표준화 |
| **TDD**       | 도메인 로직 중심 테스트 우선 개발, ROI 높은 영역 집중     |
| **AI-Driven** | 에이전트 기반 워크플로우, 규칙 문서화를 통한 조직 학습    |

---

## 2. 기술 스택

### 2.1 전체 구성

| 영역         | 기술                     | 비고                                      |
| ------------ | ------------------------ | ----------------------------------------- |
| 모노레포     | turborepo + pnpm         | Affected 빌드/테스트 지원                 |
| 프론트엔드   | Next.js + shadcn/ui      | CSR (Client-Side Rendering), Tailwind CSS |
| UI 컴포넌트  | shadcn/ui + Radix UI     | 재사용 가능한 컴포넌트, 접근성            |
| 폼 관리      | react-hook-form + zod    | 타입 안전 validation                      |
| 백엔드       | NestJS (Fastify adapter) | 구조화/DI/모듈화, 팀 표준화               |
| 데이터베이스 | PostgreSQL               | JSONB, Full-text, 확장성                  |
| ORM          | Prisma                   | 타입 안전, 마이그레이션                   |
| 검증         | Zod                      | 런타임 타입 검증 (FE/BE 공통)             |
| API 문서화   | @nestjs/swagger          | http://localhost:3000/docs                |
| 테스트       | Vitest + Playwright      | Unit/Integration + E2E                    |
| CI/CD        | GitHub Actions           | Affected 빌드                             |

## 6. 배포 전략

### 6.1 FE/BE 독립 배포

**원칙:**

- web(Next) / api(NestJS) 독립 배포
- 타입은 공유하되 런타임은 분리

**이유:**

- 인증/권한/트랜잭션/배치 확장 시 유지보수성
- BE/FE 팀 릴리즈 독립성 → 병목 감소

---

## 7. AI-Driven 워크플로우

### 7.1 에이전트 체계

```
PM (프로젝트 관리)
├── Planner (기획자)
│   └── 요구사항 정의, 유저 스토리
├── Modeler (데이터베이스)
│   └── 스키마 설계
└── Developer
    └── API 개발 / UI 개발 (full stack)
```

### 7.3 운영 원칙

- 각 에이전트가 전문 영역 담당
- 완료 후 검수 → 다음 단계 진행
- **"마음에 안 드는 결과"가 나오면 결과물을 고치기보다 규칙을 고친다** → 조직 학습
