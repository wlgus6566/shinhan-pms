# 프로젝트 관리 데이터베이스 스키마

## 개요

프로젝트 관리 도메인의 데이터베이스 설계 문서입니다.

- **도메인**: 프로젝트 관리 (Project Management)
- **작성일**: 2026-01-12
- **작성자**: modeler

---

## 1. 테이블 목록

| 테이블명        | 설명          | 비고            |
| --------------- | ------------- | --------------- |
| projects        | 프로젝트 정보 | 메인 테이블     |
| project_members | 프로젝트 팀원 | M:N 관계 테이블 |

---

## 2. 테이블: projects

### 2.1 설명

프로젝트 정보를 관리하는 메인 테이블입니다. 프로젝트의 기본 정보, 기간, 상태, 진행률 등을 저장합니다.

### 2.2 컬럼 정의

| 컬럼명      | 타입         | 필수 | 기본값            | 설명                                         |
| ----------- | ------------ | :--: | ----------------- | -------------------------------------------- |
| id          | UUID         |  Y   | gen_random_uuid() | 프로젝트 고유 식별자 (PK)                    |
| name        | VARCHAR(100) |  Y   | -                 | 프로젝트명, UNIQUE                           |
| description | TEXT         |  N   | NULL              | 프로젝트 설명 (최대 500자)                   |
| status      | VARCHAR(20)  |  Y   | 'PENDING'         | 상태 (PENDING/IN_PROGRESS/COMPLETED/ON_HOLD) |
| start_date  | DATE         |  Y   | -                 | 시작일                                       |
| end_date    | DATE         |  Y   | -                 | 종료일                                       |
| progress    | INTEGER      |  Y   | 0                 | 진행률 (0~100)                               |
| is_active   | BOOLEAN      |  Y   | TRUE              | 활성 여부                                    |
| created_by  | UUID         |  Y   | -                 | 등록자 ID (FK -> members.id)                 |
| created_at  | TIMESTAMP    |  Y   | CURRENT_TIMESTAMP | 생성일시                                     |
| updated_by  | UUID         |  N   | NULL              | 수정자 ID                                    |
| updated_at  | TIMESTAMP    |  Y   | CURRENT_TIMESTAMP | 수정일시                                     |
| is_deleted  | BOOLEAN      |  Y   | FALSE             | 삭제 여부 (소프트 삭제)                      |
| deleted_by  | UUID         |  N   | NULL              | 삭제자 ID                                    |
| deleted_at  | TIMESTAMP    |  N   | NULL              | 삭제일시                                     |

### 2.3 인덱스

| 인덱스명                | 컬럼       | 유형        | 설명                        |
| ----------------------- | ---------- | ----------- | --------------------------- |
| projects_pkey           | id         | PRIMARY KEY | 기본키                      |
| uk_projects_name        | name       | UNIQUE      | 프로젝트명 중복 방지        |
| idx_projects_status     | status     | INDEX       | 상태별 조회                 |
| idx_projects_start_date | start_date | INDEX       | 시작일 기준 조회            |
| idx_projects_end_date   | end_date   | INDEX       | 종료일 기준 조회            |
| idx_projects_is_active  | is_active  | INDEX       | 활성 프로젝트 조회          |
| idx_projects_is_deleted | is_deleted | INDEX       | 삭제되지 않은 프로젝트 조회 |
| idx_projects_created_by | created_by | INDEX       | 등록자별 조회               |

### 2.4 제약조건

| 제약조건명              | 유형        | 설명                                                         |
| ----------------------- | ----------- | ------------------------------------------------------------ |
| projects_pkey           | PRIMARY KEY | id 컬럼                                                      |
| uk_projects_name        | UNIQUE      | name 컬럼                                                    |
| chk_projects_status     | CHECK       | status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD') |
| chk_projects_progress   | CHECK       | progress >= 0 AND progress <= 100                            |
| chk_projects_date_range | CHECK       | end_date >= start_date                                       |
| fk_projects_created_by  | FOREIGN KEY | created_by -> members.id                                     |

---

## 3. 테이블: project_members

### 3.1 설명

프로젝트와 회원 간의 M:N 관계를 관리하는 테이블입니다. 프로젝트에 배정된 팀원과 해당 프로젝트 내 역할을 저장합니다.

### 3.2 컬럼 정의

| 컬럼명     | 타입        | 필수 | 기본값            | 설명                            |
| ---------- | ----------- | :--: | ----------------- | ------------------------------- |
| id         | UUID        |  Y   | gen_random_uuid() | 고유 식별자 (PK)                |
| project_id | UUID        |  Y   | -                 | 프로젝트 ID (FK -> projects.id) |
| member_id  | UUID        |  Y   | -                 | 회원 ID (FK -> members.id)      |
| role       | VARCHAR(10) |  Y   | 'PA'              | 프로젝트 내 역할 (PM/PL/PA)     |
| is_active  | BOOLEAN     |  Y   | TRUE              | 활성 여부                       |
| created_by | UUID        |  N   | NULL              | 생성자 ID                       |
| created_at | TIMESTAMP   |  Y   | CURRENT_TIMESTAMP | 생성일시                        |
| updated_by | UUID        |  N   | NULL              | 수정자 ID                       |
| updated_at | TIMESTAMP   |  Y   | CURRENT_TIMESTAMP | 수정일시                        |

### 3.3 인덱스

| 인덱스명                          | 컬럼                  | 유형        | 설명                 |
| --------------------------------- | --------------------- | ----------- | -------------------- |
| project_members_pkey              | id                    | PRIMARY KEY | 기본키               |
| uk_project_members_project_member | project_id, member_id | UNIQUE      | 중복 배정 방지       |
| idx_project_members_project_id    | project_id            | INDEX       | 프로젝트별 팀원 조회 |
| idx_project_members_member_id     | member_id             | INDEX       | 회원별 프로젝트 조회 |
| idx_project_members_role          | role                  | INDEX       | 역할별 조회          |
| idx_project_members_is_active     | is_active             | INDEX       | 활성 팀원 조회       |

### 3.4 제약조건

| 제약조건명                        | 유형        | 설명                                        |
| --------------------------------- | ----------- | ------------------------------------------- |
| project_members_pkey              | PRIMARY KEY | id 컬럼                                     |
| uk_project_members_project_member | UNIQUE      | (project_id, member_id) 복합 유니크         |
| chk_project_members_role          | CHECK       | role IN ('PM', 'PL', 'PA')                  |
| fk_project_members_project        | FOREIGN KEY | project_id -> projects.id ON DELETE CASCADE |
| fk_project_members_member         | FOREIGN KEY | member_id -> members.id ON DELETE CASCADE   |

---

## 4. 관계도 (ERD)

```
┌─────────────────────────────────────┐
│              members                │
├─────────────────────────────────────┤
│ PK  id              UUID            │
│     email           VARCHAR(255)    │
│     name            VARCHAR(100)    │
│     part            VARCHAR(20)     │
│     grade           VARCHAR(10)     │
│     ...                             │
└─────────────────────────────────────┘
          │                    │
          │ 1:N               │ 1:N
          │ (created_by)      │ (project_members)
          ▼                    ▼
┌─────────────────────────────────────┐
│              projects               │
├─────────────────────────────────────┤
│ PK  id              UUID            │
│     name            VARCHAR(100)    │◄── UNIQUE
│     description     TEXT            │
│     status          VARCHAR(20)     │
│     start_date      DATE            │
│     end_date        DATE            │
│     progress        INTEGER         │    [0-100]
│     is_active       BOOLEAN         │
│ FK  created_by      UUID            │──► members.id
│     created_at      TIMESTAMP       │
│     updated_by      UUID            │
│     updated_at      TIMESTAMP       │
│     is_deleted      BOOLEAN         │
│     deleted_by      UUID            │
│     deleted_at      TIMESTAMP       │
└─────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────┐
│          project_members            │
├─────────────────────────────────────┤
│ PK  id              UUID            │
│ FK  project_id      UUID            │──► projects.id (CASCADE)
│ FK  member_id       UUID            │──► members.id (CASCADE)
│     role            VARCHAR(10)     │    [PM/PL/PA]
│     is_active       BOOLEAN         │
│     created_by      UUID            │
│     created_at      TIMESTAMP       │
│     updated_by      UUID            │
│     updated_at      TIMESTAMP       │
└─────────────────────────────────────┘
          │
          │ UNIQUE (project_id, member_id)
          └── 동일 프로젝트에 동일 회원 중복 배정 방지
```

### 관계 설명

| 관계                        | 테이블 | 설명                                                  |
| --------------------------- | ------ | ----------------------------------------------------- |
| members -> projects         | 1:N    | 한 회원이 여러 프로젝트를 생성할 수 있음 (created_by) |
| projects -> project_members | 1:N    | 한 프로젝트에 여러 팀원이 배정됨                      |
| members -> project_members  | 1:N    | 한 회원이 여러 프로젝트에 배정됨                      |
| members <-> projects        | M:N    | project_members 테이블을 통한 다대다 관계             |

---

## 5. 도메인 코드

### 5.1 프로젝트 상태 (ProjectStatus)

| 코드        | 코드명 | 설명              | 색상   | 정렬순서 |
| ----------- | ------ | ----------------- | ------ | -------- |
| PENDING     | 대기   | 시작 전 대기 상태 | Gray   | 1        |
| IN_PROGRESS | 진행중 | 현재 진행 중      | Blue   | 2        |
| COMPLETED   | 완료   | 완료된 프로젝트   | Green  | 3        |

### 5.2 프로젝트 역할 (ProjectRole)

| 코드 | 코드명 | 설명              | 권한 수준                            | 정렬순서 |
| ---- | ------ | ----------------- | ------------------------------------ | -------- |
| PM   | PM     | Project Manager   | 최고 권한 (프로젝트 삭제, 팀원 관리) | 1        |
| PL   | PL     | Project Leader    | 중간 권한 (프로젝트 수정, 팀원 관리) | 2        |
| PA   | PA     | Project Assistant | 기본 권한 (조회만)                   | 3        |

---

## 6. 비즈니스 규칙

### 6.1 프로젝트 등록

- PM 등급 회원만 프로젝트 등록 가능
- 프로젝트명은 2~100자 사이여야 함
- 프로젝트명은 시스템 내에서 유일해야 함
- 종료일은 시작일 이후여야 함
- 등록 시 등록자가 자동으로 PM 역할로 팀원 배정됨
- 기본 상태는 'PENDING' (대기)
- 기본 진행률은 0%

### 6.2 프로젝트 수정

- PM/PL 역할만 프로젝트 수정 가능
- 프로젝트명 변경 시 중복 확인 필요
- 종료일은 시작일 이후여야 함

### 6.3 프로젝트 삭제

- PM 역할만 프로젝트 삭제 가능
- 소프트 삭제 방식 (is_deleted = TRUE, deleted_at 기록)
- 삭제된 프로젝트는 목록에서 미표시

### 6.4 팀원 배정

- PM/PL 역할만 팀원 관리 가능
- 동일 프로젝트에 동일 회원 중복 배정 불가
- 프로젝트 생성자(PM)는 제거 불가
- 본인은 프로젝트에서 제거 불가

### 6.5 접근 권한

- PA 등급은 본인이 배정된 프로젝트만 조회 가능
- PM/PL 등급은 전체 프로젝트 조회 가능

### 6.6 진행률 계산

- 진행률은 0~100 범위 (0% ~ 100%)
- Phase 2에서 업무 완료 기준 자동 계산 예정

---

## 7. 초기 데이터

### 7.1 샘플 프로젝트

| 프로젝트명           | 상태        | 시작일     | 종료일     | 진행률 |
| -------------------- | ----------- | ---------- | ---------- | ------ |
| 이모션 운영 고도화 | IN_PROGRESS | 2026-01-01 | 2026-06-30 | 30     |
| PMS 시스템 개발      | PENDING     | 2026-02-01 | 2026-12-31 | 0      |

---

## 8. 참고

### 8.1 관련 문서

- 기획서: `artifacts/planning-user-story/project-management.md`
- 와이어프레임: `artifacts/planning-wireframe/project-management/`
- 회원 스키마: `artifacts/database-schema/member/member.md`

### 8.2 변경 이력

| 버전 | 일자       | 작성자  | 변경 내용 |
| ---- | ---------- | ------- | --------- |
| 1.0  | 2026-01-12 | modeler | 최초 작성 |
