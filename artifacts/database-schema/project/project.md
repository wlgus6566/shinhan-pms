# 프로젝트 관리 테이블 명세서

## 1. 개요

### 1.1 목적

이 스키마는 신한카드 PMS의 프로젝트 정보를 저장하고 관리합니다.

### 1.2 테이블 목록

| 테이블명 | 설명 | 비고 |
|----------|------|------|
| projects | 프로젝트 기본 정보 | 프로젝트명, 설명, 기간, 상태 등 |

## 2. 테이블 상세

### 2.1 projects

**설명**: 프로젝트 기본 정보를 저장하는 테이블

**컬럼**

| 컬럼명 | 타입 | 제약 | 기본값 | 설명 |
|--------|------|------|--------|------|
| id | BIGSERIAL | PK, NOT NULL | auto | 프로젝트 ID |
| project_name | VARCHAR(100) | NOT NULL, UNIQUE | | 프로젝트명 (2-100자) |
| description | TEXT | NULL | | 프로젝트 설명 (최대 1000자) |
| start_date | DATE | NULL | | 프로젝트 시작일 |
| end_date | DATE | NULL | | 프로젝트 종료일 |
| status | VARCHAR(20) | NOT NULL | 'ACTIVE' | 프로젝트 상태 (ACTIVE/COMPLETED/SUSPENDED) |
| is_active | BOOLEAN | NOT NULL | TRUE | 활성 여부 (soft delete) |
| created_by | BIGINT | NOT NULL | | 생성자 ID (향후 users 테이블 FK) |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 생성일시 |
| updated_by | BIGINT | NULL | | 수정자 ID (향후 users 테이블 FK) |
| updated_at | TIMESTAMP | NULL | | 수정일시 |

**인덱스**

| 인덱스명 | 컬럼 | 타입 | 목적 |
|----------|------|------|------|
| pk_projects | id | PRIMARY KEY | 기본 키 |
| uq_projects_name | project_name | UNIQUE | 프로젝트명 중복 방지 |
| idx_projects_name | project_name | B-tree | 프로젝트명 검색 최적화 |
| idx_projects_status | status | B-tree | 상태별 필터링 최적화 |
| idx_projects_dates | start_date, end_date | B-tree | 기간별 조회 최적화 |
| idx_projects_created_at | created_at | B-tree | 생성일 정렬 최적화 |
| idx_projects_is_active | is_active | B-tree | 활성 프로젝트 조회 최적화 |

**제약조건**

- **chk_projects_dates**: `end_date IS NULL OR end_date >= start_date`
  - 종료일은 시작일 이후여야 함 (또는 NULL)
  
- **chk_projects_status**: `status IN ('ACTIVE', 'COMPLETED', 'SUSPENDED')`
  - 상태는 정의된 값만 허용

- **chk_projects_name_length**: `LENGTH(project_name) BETWEEN 2 AND 100`
  - 프로젝트명은 2-100자 사이

## 3. 관계도 (ERD)

### 3.1 현재 구조

```
┌─────────────────┐
│    projects     │
│─────────────────│
│ id (PK)         │
│ project_name    │
│ description     │
│ start_date      │
│ end_date        │
│ status          │
│ is_active       │
│ created_by      │
│ created_at      │
│ updated_by      │
│ updated_at      │
└─────────────────┘
```

### 3.2 향후 확장 관계

```
┌─────────────────┐
│    projects     │
│─────────────────│
│ id (PK)         │
└─────────────────┘
        │
        │ 1
        │
        │ N
        ▼
┌─────────────────┐
│ project_members │  (향후 개발)
│─────────────────│
│ id (PK)         │
│ project_id (FK) │
│ user_id (FK)    │
│ role            │
└─────────────────┘

        │
        │ 1
        │
        │ N
        ▼
┌─────────────────┐
│     tasks       │  (향후 개발)
│─────────────────│
│ id (PK)         │
│ project_id (FK) │
│ task_name       │
└─────────────────┘
```

## 4. 초기 데이터

### 4.1 프로젝트 상태 코드

| 코드 | 명칭 | 설명 |
|------|------|------|
| ACTIVE | 진행중 | 진행중인 프로젝트 |
| COMPLETED | 완료 | 완료된 프로젝트 |
| SUSPENDED | 중단 | 중단된 프로젝트 |

> **참고**: 초기에는 ENUM 타입으로 관리, 향후 common_codes 테이블로 전환 가능

### 4.2 샘플 데이터

개발 환경에서 테스트용 샘플 데이터를 제공합니다.

```sql
-- 샘플 프로젝트 1
INSERT INTO projects (project_name, description, start_date, end_date, status, created_by)
VALUES (
    '신한카드 PMS',
    '프로젝트 관리 시스템 개발. AI 에이전트 기반 워크플로우를 적용한 신한카드 운영 및 고도화 업무 관리 시스템입니다.',
    '2024-01-01',
    '2024-12-31',
    'ACTIVE',
    1
);

-- 샘플 프로젝트 2
INSERT INTO projects (project_name, description, start_date, end_date, status, created_by)
VALUES (
    '모바일 앱 리뉴얼',
    '신한카드 모바일 앱 UI/UX 개선 프로젝트. 사용자 경험 향상을 위한 전면 리뉴얼 작업입니다.',
    '2024-03-01',
    '2024-08-31',
    'ACTIVE',
    1
);

-- 샘플 프로젝트 3
INSERT INTO projects (project_name, description, start_date, end_date, status, created_by)
VALUES (
    '레거시 시스템 마이그레이션',
    '구 시스템에서 새로운 플랫폼으로 마이그레이션. 데이터 이관 및 서비스 안정화 작업 완료.',
    '2023-06-01',
    '2023-12-31',
    'COMPLETED',
    1
);
```

## 5. 비즈니스 규칙

### 5.1 프로젝트명

- 2-100자 사이여야 함
- 공백만으로 구성 불가
- 중복 불가 (대소문자 구분)
- 특수문자 허용

### 5.2 날짜

- 시작일과 종료일은 선택 사항
- 종료일이 있는 경우 시작일 이후여야 함
- NULL 허용 (기간이 미정인 프로젝트)

### 5.3 상태

- 생성 시 기본값: ACTIVE
- 허용 값: ACTIVE, COMPLETED, SUSPENDED
- 상태 변경 이력은 향후 별도 테이블로 관리 가능

### 5.4 삭제

- Soft Delete 방식 (is_active = FALSE)
- 물리적 삭제는 관리자만 가능 (DB 레벨)
- 삭제된 프로젝트는 목록에 표시되지 않음

## 6. 성능 고려사항

### 6.1 인덱스 전략

- **project_name**: 검색 빈도가 높으므로 인덱스 추가
- **status**: 필터링에 자주 사용되므로 인덱스 추가
- **(start_date, end_date)**: 복합 인덱스로 기간별 조회 최적화
- **created_at**: 정렬에 자주 사용되므로 인덱스 추가
- **is_active**: WHERE 조건에 항상 포함되므로 인덱스 추가

### 6.2 쿼리 최적화

```sql
-- ✅ 효율적인 쿼리 (인덱스 활용)
SELECT * FROM projects 
WHERE is_active = TRUE 
  AND status = 'ACTIVE'
  AND project_name LIKE '%카드%'
ORDER BY created_at DESC
LIMIT 20;

-- ❌ 비효율적인 쿼리 (풀 테이블 스캔)
SELECT * FROM projects 
WHERE UPPER(project_name) = 'PMS'  -- 함수 사용으로 인덱스 미활용
```

## 7. 마이그레이션 계획

### 7.1 초기 마이그레이션

```bash
# Prisma 마이그레이션 생성
prisma migrate dev --name init-projects

# 마이그레이션 이름: 20240115_init_projects
```

### 7.2 롤백 계획

```sql
-- 테이블 삭제 (롤백 시)
DROP TABLE IF EXISTS projects CASCADE;
```

## 8. 보안 고려사항

- **SQL Injection 방지**: Prisma ORM의 파라미터 바인딩 사용
- **권한 관리**: 향후 created_by를 통한 소유자 확인
- **감사 로그**: created_at, updated_at으로 변경 이력 추적

## 9. 향후 확장

### 9.1 Phase 2 - 프로젝트 멤버

```sql
CREATE TABLE project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,  -- PM, PL, PA, DEVELOPER
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP
);
```

### 9.2 Phase 3 - 프로젝트 히스토리

```sql
CREATE TABLE project_history (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 10. 참고사항

- 모든 TIMESTAMP는 UTC 기준
- 애플리케이션 레벨에서 시간대 변환 처리
- BigInt 타입은 JavaScript에서 BigInt로 처리 필요
- TEXT 타입은 길이 제한 없지만, 애플리케이션 레벨에서 1000자 제한
