# Task (업무) 테이블 스키마

## 개요
프로젝트의 업무(작업)를 관리하는 테이블입니다. 프로젝트 PM이 업무를 등록하고 파트별 담당자를 지정할 수 있습니다.

## 테이블 정의

```sql
CREATE TABLE tasks (
  id                    BIGSERIAL PRIMARY KEY,
  project_id            BIGINT NOT NULL,
  task_name             VARCHAR(100) NOT NULL,
  description           TEXT,
  difficulty            VARCHAR(10) NOT NULL,
  client_name           VARCHAR(100),

  -- 파트별 담당자
  planning_assignee_id  BIGINT,
  design_assignee_id    BIGINT,
  frontend_assignee_id  BIGINT,
  backend_assignee_id   BIGINT,

  start_date            DATE,
  end_date              DATE,
  notes                 TEXT,

  status                VARCHAR(20) NOT NULL DEFAULT 'TODO',
  is_active             BOOLEAN NOT NULL DEFAULT true,
  created_by            BIGINT NOT NULL,
  created_at            TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by            BIGINT,
  updated_at            TIMESTAMP(6),

  -- 외래 키
  CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_planning_assignee FOREIGN KEY (planning_assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_task_design_assignee FOREIGN KEY (design_assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_task_frontend_assignee FOREIGN KEY (frontend_assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_task_backend_assignee FOREIGN KEY (backend_assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- 인덱스
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_difficulty ON tasks(difficulty);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_is_active ON tasks(is_active);
```

## 컬럼 상세

### 기본 정보
| 컬럼명 | 타입 | Null | 기본값 | 설명 |
|--------|------|------|--------|------|
| id | BIGINT | NO | auto_increment | 업무 ID (Primary Key) |
| project_id | BIGINT | NO | - | 프로젝트 ID (Foreign Key: projects.id) |
| task_name | VARCHAR(100) | NO | - | 작업명 (2-100자) |
| description | TEXT | YES | NULL | 작업 상세 내용 (최대 1000자) |
| difficulty | VARCHAR(10) | NO | - | 중요도: HIGH(상), MEDIUM(중), LOW(하) |
| client_name | VARCHAR(100) | YES | NULL | 담당 RM (고객사 이름) |

### 파트별 담당자
| 컬럼명 | 타입 | Null | 기본값 | 설명 |
|--------|------|------|--------|------|
| planning_assignee_id | BIGINT | YES | NULL | 기획 담당자 ID (Foreign Key: users.id) |
| design_assignee_id | BIGINT | YES | NULL | 디자인 담당자 ID (Foreign Key: users.id) |
| frontend_assignee_id | BIGINT | YES | NULL | 프론트엔드 담당자 ID (Foreign Key: users.id) |
| backend_assignee_id | BIGINT | YES | NULL | 백엔드 담당자 ID (Foreign Key: users.id) |

### 일정 정보
| 컬럼명 | 타입 | Null | 기본값 | 설명 |
|--------|------|------|--------|------|
| start_date | DATE | YES | NULL | 시작일 (YYYY-MM-DD) |
| end_date | DATE | YES | NULL | 종료일 (YYYY-MM-DD) |
| notes | TEXT | YES | NULL | 비고 (추가 메모) |

### 상태 및 메타데이터
| 컬럼명 | 타입 | Null | 기본값 | 설명 |
|--------|------|------|--------|------|
| status | VARCHAR(20) | NO | 'TODO' | 업무 상태: TODO, IN_PROGRESS, DONE, HOLD |
| is_active | BOOLEAN | NO | true | 활성화 상태 (soft delete) |
| created_by | BIGINT | NO | - | 생성자 ID (Foreign Key: users.id) |
| created_at | TIMESTAMP(6) | NO | now() | 생성일시 |
| updated_by | BIGINT | YES | NULL | 수정자 ID |
| updated_at | TIMESTAMP(6) | YES | NULL | 수정일시 (자동 업데이트) |

## 인덱스 전략

| 인덱스명 | 컬럼 | 목적 |
|----------|------|------|
| idx_tasks_project_id | project_id | 프로젝트별 업무 목록 조회 최적화 |
| idx_tasks_difficulty | difficulty | 중요도별 필터링 |
| idx_tasks_status | status | 상태별 필터링 |
| idx_tasks_is_active | is_active | 활성/비활성 필터링 (soft delete) |

## 제약 조건

### 외래 키
- **project_id**: projects(id) - ON DELETE CASCADE
  - 프로젝트 삭제 시 해당 업무도 함께 삭제
- **planning_assignee_id**: users(id) - ON DELETE SET NULL
  - 담당자 삭제 시 NULL로 설정
- **design_assignee_id**: users(id) - ON DELETE SET NULL
- **frontend_assignee_id**: users(id) - ON DELETE SET NULL
- **backend_assignee_id**: users(id) - ON DELETE SET NULL
- **created_by**: users(id) - ON DELETE RESTRICT
  - 생성자는 삭제 불가 (데이터 무결성 보호)

### 비즈니스 규칙
1. **작업명**: 2자 이상, 100자 이하 필수
2. **중요도**: HIGH, MEDIUM, LOW 중 하나 필수
3. **날짜 유효성**: endDate >= startDate
4. **담당자 검증**:
   - 담당자는 프로젝트 멤버여야 함
   - 각 파트 담당자의 workArea가 해당 파트와 일치해야 함
     - planning_assignee_id → workArea = 'PLANNING'
     - design_assignee_id → workArea = 'DESIGN'
     - frontend_assignee_id → workArea = 'FRONTEND'
     - backend_assignee_id → workArea = 'BACKEND'

## 상태 값 정의

### difficulty (중요도)
- `HIGH`: 상 - 복잡하거나 시간이 많이 소요되는 작업
- `MEDIUM`: 중 - 일반적인 작업
- `LOW`: 하 - 간단하거나 빠르게 처리 가능한 작업

### status (상태)
- `TODO`: 할 일 - 아직 시작하지 않은 업무
- `IN_PROGRESS`: 진행 중 - 현재 작업 중인 업무
- `DONE`: 완료 - 완료된 업무
- `HOLD`: 보류 - 일시적으로 중단된 업무

## 권한 관리

### 업무 생성
- **권한**: 프로젝트 PM만 가능
- **검증**:
  1. 사용자가 해당 프로젝트의 멤버인지 확인
  2. 멤버의 role이 'PM'인지 확인

### 업무 수정
- **권한**: 프로젝트 PM만 가능
- **검증**: 생성과 동일

### 업무 삭제
- **권한**: 프로젝트 PM만 가능
- **방식**: Soft Delete (is_active = false)

### 업무 조회
- **권한**: 프로젝트 멤버라면 누구나 조회 가능

## ERD 다이어그램

```
┌─────────────────┐       ┌─────────────────┐
│    projects     │       │      users      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │◄──┐
│ project_name    │   │   │ email           │   │
│ ...             │   │   │ name            │   │
└─────────────────┘   │   │ ...             │   │
                      │   └─────────────────┘   │
                      │            ▲             │
                      │            │             │
                      │            │             │
                      │   ┌────────┴─────────┬───┼────┬────┬────┐
                      │   │                  │   │    │    │    │
                  ┌───┴───┴────────────────┐ │   │    │    │    │
                  │       tasks            │ │   │    │    │    │
                  ├────────────────────────┤ │   │    │    │    │
                  │ id (PK)                │ │   │    │    │    │
                  │ project_id (FK)────────┘ │   │    │    │    │
                  │ task_name              │   │   │    │    │    │
                  │ description            │   │   │    │    │    │
                  │ difficulty             │   │   │    │    │    │
                  │ planning_assignee_id───┴───┘    │    │    │
                  │ design_assignee_id──────────────┘    │    │
                  │ frontend_assignee_id─────────────────┘    │
                  │ backend_assignee_id────────────────────────┘
                  │ start_date             │
                  │ end_date               │
                  │ status                 │
                  │ is_active              │
                  │ created_by             │
                  │ created_at             │
                  └────────────────────────┘
```

## API 엔드포인트

### 업무 생성
```
POST /api/projects/:id/tasks
Authorization: Bearer {token}
Body: {
  taskName: string,
  description?: string,
  difficulty: 'HIGH' | 'MEDIUM' | 'LOW',
  clientName?: string,
  planningAssigneeId?: number,
  designAssigneeId?: number,
  frontendAssigneeId?: number,
  backendAssigneeId?: number,
  startDate?: string,
  endDate?: string,
  notes?: string
}
```

### 업무 목록 조회
```
GET /api/projects/:id/tasks
Authorization: Bearer {token}
```

### 업무 상세 조회
```
GET /api/tasks/:id
Authorization: Bearer {token}
```

### 업무 수정
```
PATCH /api/tasks/:id
Authorization: Bearer {token}
Body: {
  taskName?: string,
  description?: string,
  difficulty?: 'HIGH' | 'MEDIUM' | 'LOW',
  clientName?: string,
  planningAssigneeId?: number,
  designAssigneeId?: number,
  frontendAssigneeId?: number,
  backendAssigneeId?: number,
  startDate?: string,
  endDate?: string,
  notes?: string,
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HOLD'
}
```

### 업무 삭제
```
DELETE /api/tasks/:id
Authorization: Bearer {token}
```

## 주의사항

1. **BigInt 처리**
   - 데이터베이스에서는 BIGINT를 사용하지만, 프론트엔드에서는 string으로 처리
   - JavaScript의 Number.MAX_SAFE_INTEGER 제한으로 인한 정밀도 손실 방지

2. **날짜 형식**
   - 데이터베이스: DATE 타입
   - API: YYYY-MM-DD 문자열 형식
   - 프론트엔드: Date input (type="date")

3. **Soft Delete**
   - 업무 삭제 시 실제로 레코드를 삭제하지 않고 is_active를 false로 설정
   - 데이터 복구 및 히스토리 추적 가능

4. **담당자 유효성 검증**
   - 백엔드에서 반드시 담당자가 프로젝트 멤버이고 workArea가 일치하는지 검증
   - 프론트엔드에서도 선택 가능한 옵션을 미리 필터링하여 UX 개선

5. **권한 체크**
   - 모든 생성/수정/삭제 API에서 PM 권한 확인 필수
   - 조회는 프로젝트 멤버라면 가능 (향후 요구사항에 따라 조정 가능)

## 마이그레이션 이력

| 날짜 | 마이그레이션명 | 설명 |
|------|----------------|------|
| 2026-01-20 | add_tasks_table | tasks 테이블 초기 생성 |
