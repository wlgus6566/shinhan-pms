업무일지(Work Log) 기능 구현 계획
개요
업무 담당자들이 매일 업무일지를 작성하고 달력 형태로 시각화하는 기능을 구현합니다.

A. 핵심 요구사항

PM이 업무(Task)를 등록하고 담당자 배정

배정받은 담당자만 해당 업무의 일지 작성 가능

일지 정보
- 작업 내용(필수)

- 작업 시간(선택)

- 진행률

- 이슈/블로커(선택)

캘린더 뷰


월간(dayGridMonth) ↔ 목록(listWeek/listMonth) 토글

작성자만 수정/삭제 가능

하루에 업무당 하나의 일지만 작성 가능
데이터베이스 설계
WorkLog 모델 추가
apps/api/prisma/schema.prisma에 새 모델 추가:

model WorkLog {
  id         BigInt    @id @default(autoincrement())
  taskId     BigInt    @map("task_id")
  userId     BigInt    @map("user_id")
  workDate   DateTime  @map("work_date") @db.Date
  content    String    @db.Text
  workHours  Decimal?  @map("work_hours") @db.Decimal(4,1)
  progress   Int?      @db.SmallInt
  issues     String?   @db.Text
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt  DateTime? @updatedAt @map("updated_at") @db.Timestamp(6)
  
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation("WorkLogAuthor", fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([taskId, userId, workDate], map: "unique_task_user_date")
  @@index([taskId, workDate])
  @@index([userId, workDate])
  @@map("work_logs")
}
Task/User 모델 관계 업데이트
Task 모델에 workLogs WorkLog[] 추가
User 모델에 workLogs WorkLog[] @relation("WorkLogAuthor") 추가
백엔드 구현
1. DTO 파일 생성
**apps/api/src/work-logs/dto/create-work-log.dto.ts**:

taskId, workDate, content(필수), workHours, progress, issues
**apps/api/src/work-logs/dto/update-work-log.dto.ts**:

PartialType(CreateWorkLogDto)
**apps/api/src/work-logs/dto/work-log-response.dto.ts**:

모든 필드 + task/user 기본 정보
2. Service 구현
**apps/api/src/work-logs/work-logs.service.ts**:

주요 메서드:

create(): 담당자 검증 후 일지 생성
findByTask(): 특정 업무의 일지 목록
findByUser(): 특정 사용자의 일지 목록 (날짜 범위 필터)
findByProject(): 프로젝트 전체 팀원의 일지 (날짜 범위 필터)
update(): 작성자 본인만 수정 가능
remove(): 작성자 본인만 삭제 가능 (soft delete)
권한 검증 로직:

// 담당자인지 확인
const isAssignee = 
  task.planningAssigneeId?.toString() === userId.toString() ||
  task.designAssigneeId?.toString() === userId.toString() ||
  task.frontendAssigneeId?.toString() === userId.toString() ||
  task.backendAssigneeId?.toString() === userId.toString();
3. Controller 구현
**apps/api/src/work-logs/work-logs.controller.ts**:

엔드포인트:

POST /api/tasks/:taskId/work-logs - 일지 작성
GET /api/tasks/:taskId/work-logs?startDate&endDate - 업무별 일지 목록
GET /api/work-logs/my?startDate&endDate - 내 일지 목록
GET /api/projects/:projectId/work-logs?startDate&endDate - 프로젝트 팀 일지
PATCH /api/work-logs/:id - 일지 수정
DELETE /api/work-logs/:id - 일지 삭제
4. Module 등록
apps/api/src/app.module.ts에 WorkLogsModule 추가

프론트엔드 구현
1. 타입 정의
**apps/web/types/work-log.ts**:

export interface WorkLog {
  id: string;
  taskId: string;
  userId: string;
  workDate: string;
  content: string;
  workHours?: number;
  progress?: number;
  issues?: string;
  task?: { id: string; taskName: string; };
  user?: { id: string; name: string; };
  createdAt: string;
  updatedAt?: string;
}
2. API Client
**apps/web/lib/api/workLogs.ts**:

getTaskWorkLogs(), getMyWorkLogs(), getProjectWorkLogs()
createWorkLog(), updateWorkLog(), deleteWorkLog()
**apps/web/lib/hooks/useWorkLogs.ts**:

SWR hook으로 자동 캐싱 및 리패칭
3. UI 컴포넌트
달력 컴포넌트 apps/web/components/work-log/WorkLogCalendar.tsx:

date-fns 기반 월간 달력
일지가 있는 날짜: 파란색 Badge/Dot
날짜 클릭 → 일지 다이얼로그 오픈
월/주간 뷰 토글
일지 작성/수정 다이얼로그 apps/web/components/work-log/WorkLogDialog.tsx:

FormInput: 작업 날짜 (date picker)
FormTextarea: 작업 내용 (필수, 최대 2000자)
FormInput: 작업 시간 (number, 0.5~24.0, 0.5 단위)
FormSlider 또는 버튼 그룹: 진행률 (0%, 25%, 50%, 75%, 100%)
FormTextarea: 이슈/블로커 (선택)
"어제 일지 복사" 버튼 (편의 기능)
일지 카드 apps/web/components/work-log/WorkLogCard.tsx:

업무명, 작업 날짜
작업 내용 미리보기
작업 시간, 진행률 표시
수정/삭제 버튼 (작성자만)
일지 목록 apps/web/components/work-log/WorkLogList.tsx:

날짜별 그룹핑
무한 스크롤 또는 페이지네이션
필터: 업무별, 날짜 범위
4. 페이지 구현
개인별 업무일지 페이지 apps/web/app/(app)/work-logs/page.tsx/work-logs/page.tsx):

레이아웃:

┌────────────────────────────────────────────────┐
│  내 업무일지                    [월간 ▼]        │
├──────────────────┬─────────────────────────────┤
│ 내 업무 목록      │  달력 (월간/주간)             │
│ ┌─────────────┐ │  ┌───┬───┬───┬───┬───┐      │
│ │ 업무1        │ │  │Mon│Tue│Wed│Thu│Fri│      │
│ │ 진행률: 60%  │ │  ├───┼───┼───┼───┼───┤      │
│ └─────────────┘ │  │ 1 │ 2●│ 3●│ 4 │ 5 │      │
│                 │  │   │   │   │   │   │      │
│ ┌─────────────┐ │  └───┴───┴───┴───┴───┘      │
│ │ 업무2        │ │                             │
│ │ 진행률: 30%  │ │  선택된 날짜: 2024-01-02    │
│ └─────────────┘ │  [+ 일지 작성]               │
└──────────────────┴─────────────────────────────┘

apps/web/components/layout/Sidebar.tsx에 "업무일지" 메뉴 추가:

아이콘: Calendar 또는 FileText
경로: /work-logs
모든 로그인 사용자 표시
마이그레이션 및 시드 데이터
마이그레이션 실행하여 work_logs 테이블 생성
시드 데이터에 샘플 업무일지 몇 개 추가 (선택사항)
기술 스택
백엔드: NestJS, Prisma, PostgreSQL
프론트엔드: Next.js, React Hook Form, Zod, SWR
날짜 처리: date-fns
UI: shadcn/ui 컴포넌트 (Button, Dialog, Calendar, Slider 등)
구현 순서
백엔드 데이터베이스 및 API 구현
프론트엔드 타입 및 API 클라이언트
달력 및 일지 작성 UI 컴포넌트
개인별 업무일지 페이지
프로젝트별 업무일지 탭
UX 개선 요소
빠른 입력: 작업 시간 버튼(0.5h, 1h, 2h, 4h, 8h)
진행률 빠른 선택 버튼(0%, 25%, 50%, 75%, 100%)
어제 일지 복사 기능
일지 작성 여부 시각적 표시 (작성완료: 파란 dot, 미작성: 회색)
오늘 날짜 강조
주말 색상 구분
