# Plan: WorkArea에 "퍼블리싱(PUBLISHING)" 옵션 추가

## Context

### Original Request
멤버 관리에서 멤버 추가할 때 담당 분야(WorkArea)에 "퍼블리싱(Publishing)" 옵션을 추가한다.

### Research Findings
- `WorkArea`는 `@repo/schema`의 Zod enum으로 정의되며, 웹/API 양쪽에서 참조
- DB의 `workArea` 컬럼은 `VARCHAR(30)`이므로 DB 마이그레이션 불필요
- 프론트엔드 상수(`WORK_AREA_LABELS_STRICT`, `WORK_AREA_OPTIONS`, `WORK_AREA_COLORS`)는 `Record<WorkArea, string>` 타입이므로 PUBLISHING 추가 시 타입 시스템이 누락을 잡아줌
- `AddMemberDialog.tsx` (line 38)에 **하드코딩된 로컬 Zod schema**가 있어 `@repo/schema`의 `WorkAreaEnum`을 사용하도록 리팩토링 필요
- API Swagger 문서의 DTO에 enum 값이 하드코딩되어 있어 업데이트 필요
- `work-logs.service.ts` (line 568)에는 이미 PUBLISHING이 roleMap에 포함되어 있음 -- 별도 수정 불필요
- 업무(Task) 담당자 할당 아키텍처는 per-WorkArea 필드 패턴 사용 (`planningAssigneeIds`, `designAssigneeIds` 등) -- 이번 스코프에서는 제외 (아래 "Scope Decision" 참조)

### Scope Decision: Task Assignment Architecture (Out of Scope)

업무(Task) 담당자 할당은 per-WorkArea 필드 패턴을 사용한다:
- `create-task.schema.ts` / `update-task.schema.ts`: `planningAssigneeIds`, `designAssigneeIds`, `frontendAssigneeIds`, `backendAssigneeIds`
- `tasks.service.ts`: 각 필드를 workArea 값으로 매핑
- `tasks.controller.ts`: workArea별 응답 필드 분리
- `packages/schema/src/tasks/types.ts`: `planningAssignees`, `designAssignees` 등 응답 타입
- `AddTaskDialog.tsx`, `EditTaskDialog.tsx`, `TaskDetailSheet.tsx`, `TaskTable.tsx`, `TaskCard.tsx`: per-area UI 그룹

**이번 스코프에서 제외하는 이유:**
1. 원래 요청은 **"멤버 추가 시 담당 분야 옵션 추가"**이며, 업무 담당자 할당 UI 확장은 별개 작업
2. `publishingAssigneeIds` 추가는 schema, service, controller, 5개 이상의 UI 컴포넌트 변경을 수반하는 중규모 작업
3. PUBLISHING workArea를 가진 멤버는 즉시 프로젝트에 배정 가능하며, 업무 담당자로서의 할당은 후속 작업으로 분리하는 것이 안전
4. 이 패턴 자체가 확장성 문제가 있으므로 (새 WorkArea 추가마다 N개 파일 수정 필요), 후속으로 동적 패턴 리팩토링을 검토하는 것이 바람직

**후속 작업 권장:** Task 담당자 할당에 `publishingAssigneeIds` 추가 또는 per-WorkArea 필드 패턴을 동적 배열 패턴으로 리팩토링

## Work Objectives

### Core Objective
WorkArea enum에 `PUBLISHING` 값을 추가하여 멤버의 담당 분야로 "퍼블리싱"을 선택할 수 있도록 한다.

### Deliverables
1. `@repo/schema`의 WorkAreaEnum에 PUBLISHING 추가
2. 프론트엔드 상수(라벨, 옵션, 색상)에 PUBLISHING 추가
3. `AddMemberDialog.tsx`의 하드코딩된 로컬 schema를 `@repo/schema`의 `WorkAreaEnum` 사용으로 리팩토링
4. API Swagger DTO의 enum 목록 업데이트

### Definition of Done
- 멤버 추가/수정 시 "퍼블리싱" 옵션이 드롭다운에 표시됨
- 멤버 추가 다이얼로그에서 "퍼블리싱" 선택 후 폼 제출 시 validation 에러 없이 저장 성공
- 멤버 목록에서 "퍼블리싱" 라벨이 정상 표시됨
- 타입 에러 없이 빌드 성공

## Must Have
- PUBLISHING 값은 BACKEND 다음 위치에 추가 (순서 일관성)
- 한국어 라벨: "퍼블리싱"
- 차트 색상 지정
- `AddMemberDialog.tsx`의 로컬 Zod enum을 `@repo/schema`에서 import하도록 리팩토링

## Must NOT Have
- DB 마이그레이션 (VARCHAR 컬럼이므로 불필요)
- Task 담당자 할당 관련 변경 (`publishingAssigneeIds` 등) -- 별도 후속 작업
- `work-logs.service.ts` 수정 (이미 PUBLISHING 포함)

## Tasks

### Task 1: @repo/schema WorkAreaEnum 업데이트
**File**: `packages/schema/src/common/enums.ts`
**Changes**:

1. **Line 111** - enum 배열에 `PUBLISHING` 추가:
   ```typescript
   ['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND', 'PUBLISHING'],
   ```

2. **Lines 114-115** - 에러 메시지 업데이트:
   ```typescript
   message:
     '담당 분야는 PROJECT_MANAGEMENT, PLANNING, DESIGN, FRONTEND, BACKEND, PUBLISHING 중 하나여야 합니다',
   ```

3. **Lines 122-128** - WORK_AREA_LABELS에 추가:
   ```typescript
   export const WORK_AREA_LABELS: Record<WorkArea, string> = {
     PROJECT_MANAGEMENT: '총괄',
     PLANNING: '기획',
     DESIGN: '디자인',
     FRONTEND: '프론트엔드',
     BACKEND: '백엔드',
     PUBLISHING: '퍼블리싱',
   };
   ```

**Acceptance Criteria**: `WorkArea` 타입에 `'PUBLISHING'`이 포함됨

### Task 2: 프론트엔드 상수 업데이트
**File**: `apps/web/lib/constants/project.ts`
**Changes**:

1. **Lines 77-83** - `WORK_AREA_LABELS_STRICT`에 추가:
   ```typescript
   PUBLISHING: '퍼블리싱',
   ```

2. **Lines 97-104** - `WORK_AREA_LABELS` (필터링용)에 추가:
   ```typescript
   PUBLISHING: '퍼블리싱',
   ```

3. **Lines 107-113** - `WORK_AREA_COLORS`에 추가:
   ```typescript
   PUBLISHING: '#F59E0B',  // 앰버/오렌지 계열
   ```

**Acceptance Criteria**: 드롭다운에 "퍼블리싱" 옵션 표시, 차트에 색상 반영

### Task 3: AddMemberDialog 로컬 Zod schema 리팩토링
**File**: `apps/web/components/project/AddMemberDialog.tsx`
**Changes**:

1. **Import 추가** - `WorkAreaEnum`과 `MemberRoleEnum`을 `@repo/schema`에서 import:
   ```typescript
   import { WorkAreaEnum, MemberRoleEnum } from '@repo/schema';
   ```

2. **Lines 35-40** - 하드코딩된 로컬 schema를 `@repo/schema` enum으로 교체:
   ```typescript
   // Before (하드코딩 -- @repo/schema와 드리프트 위험):
   const addMemberSchema = z.object({
     memberId: z.string().min(1, '멤버를 선택하세요'),
     role: z.enum(['PM', 'PL', 'PA'] as const),
     workArea: z.enum(['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'] as const),
     notes: z.string().optional(),
   });

   // After (@repo/schema 단일 소스 원칙 준수):
   const addMemberSchema = z.object({
     memberId: z.string().min(1, '멤버를 선택하세요'),
     role: MemberRoleEnum,
     workArea: WorkAreaEnum,
     notes: z.string().optional(),
   });
   ```

**Rationale**: 이 변경이 없으면 WORK_AREA_OPTIONS 드롭다운에는 "퍼블리싱"이 표시되지만, 폼 제출 시 로컬 Zod validation에서 실패한다. 또한 CLAUDE.md의 "@repo/schema 외부에 검증 로직 작성 금지" 규칙을 준수하게 된다.

**Acceptance Criteria**: 멤버 추가 다이얼로그에서 "퍼블리싱" 선택 후 폼 제출 시 validation 에러 없이 저장 성공

### Task 4: API Swagger DTO 업데이트
**File**: `apps/api/src/projects/dto/project-member-response.dto.ts`
**Changes**:

1. **Line 39** - enum 배열에 `PUBLISHING` 추가:
   ```typescript
   enum: ['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND', 'PUBLISHING'],
   ```

**Acceptance Criteria**: Swagger 문서에 PUBLISHING이 유효 값으로 표시

## Task Dependencies

```
Task 1 (@repo/schema)
  ├── Task 2 (frontend constants) - Task 1의 타입에 의존
  ├── Task 3 (AddMemberDialog refactor) - Task 1의 WorkAreaEnum에 의존
  └── Task 4 (API DTO) - 독립적이나 일관성을 위해 함께 수행
```

Task 1을 먼저 수행해야 Task 2의 `Record<WorkArea, string>` 타입이 PUBLISHING을 요구하고, Task 3의 `WorkAreaEnum`에 PUBLISHING이 포함됨.

## Commit Strategy

단일 커밋: `feat: WorkArea에 퍼블리싱(PUBLISHING) 옵션 추가`

변경 파일 4개로 범위가 작으므로 단일 커밋이 적절.

## Success Criteria
1. `pnpm build` 타입 에러 없이 성공
2. 멤버 추가 다이얼로그에서 "퍼블리싱" 옵션 선택 가능
3. 멤버 추가 다이얼로그에서 "퍼블리싱" 선택 후 폼 제출 시 validation 에러 없이 저장 성공
4. 멤버 목록 테이블에서 "퍼블리싱" 라벨 정상 표시
5. 분석 차트에서 퍼블리싱 영역이 지정 색상으로 표시

## Notes
- `apps/api/src/work-logs/work-logs.service.ts` (line 568)에는 이미 PUBLISHING이 roleMap에 포함되어 있어 별도 수정 불필요
- Task 담당자 할당(`publishingAssigneeIds`) 추가는 별도 후속 작업으로 권장 (영향 파일: `create-task.schema.ts`, `update-task.schema.ts`, `tasks.service.ts`, `tasks.controller.ts`, `types.ts`, `AddTaskDialog.tsx`, `EditTaskDialog.tsx`, `TaskDetailSheet.tsx`, `TaskTable.tsx`, `TaskCard.tsx`)
