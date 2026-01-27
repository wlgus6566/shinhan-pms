# 명명 규칙 (Naming Conventions)

## 데이터베이스

### 테이블
- **형식**: `snake_case`, 복수형
- **예시**: `projects`, `task_assignments`, `work_logs`

### 컬럼
- **형식**: `snake_case`, 단수형
- **예시**: `project_name`, `created_at`, `user_id`

### 인덱스
- **형식**: `idx_{table}_{columns}`
- **예시**:
  - `idx_projects_name`
  - `idx_tasks_project_id`
  - `idx_users_email`

### 외래 키
- **형식**: `fk_{table}_{ref_table}`
- **예시**:
  - `fk_tasks_projects`
  - `fk_project_members_users`

## 코드

### 파일명
- **Backend**: `kebab-case`
  - 예시: `project.service.ts`, `task.controller.ts`, `user.entity.ts`
- **Frontend**: `kebab-case`
  - 예시: `project-list.tsx`, `add-task-dialog.tsx`, `task-card.tsx`

### 클래스
- **형식**: `PascalCase`
- **예시**: `ProjectService`, `TaskController`, `UserEntity`

### 함수/메서드
- **형식**: `camelCase`
- **예시**: `createProject`, `findAll`, `updateStatus`

### 상수
- **형식**: `UPPER_SNAKE_CASE`
- **예시**: `MAX_PROJECT_NAME_LENGTH`, `DEFAULT_PAGE_SIZE`, `API_BASE_URL`

### 타입/인터페이스
- **형식**: `PascalCase`
- **예시**: `CreateProjectDto`, `ProjectEntity`, `UserResponse`

## API 경로

RESTful 컨벤션 준수:

```
GET    /api/projects           # 목록 조회
GET    /api/projects/:id       # 상세 조회
POST   /api/projects           # 생성
PATCH  /api/projects/:id       # 수정
DELETE /api/projects/:id       # 삭제
```

### 중첩 리소스
```
GET    /api/projects/:id/tasks           # 프로젝트의 태스크 목록
POST   /api/projects/:id/tasks           # 프로젝트에 태스크 생성
GET    /api/projects/:id/members         # 프로젝트 멤버 목록
```

### 커스텀 액션
```
GET    /api/work-logs/my                 # 내 업무일지
POST   /api/projects/:id/archive         # 프로젝트 아카이브
```
