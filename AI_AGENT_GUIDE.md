# AI 에이전트 활용 가이드

신한카드 PMS 프로젝트를 AI 에이전트 기반으로 개발하는 실제 프롬프트 순서 및 가이드입니다.

## 실행 완료 상태

✅ Phase 0: 초기 환경 설정  
✅ Feature 1 - 기획 (Planner)  
✅ Feature 1 - 와이어프레임 (Wireframe)  
✅ Feature 1 - DB 설계 (Modeler)  
✅ Feature 1 - 백엔드 개발 (Developer)  
⏳ Feature 1 - 프론트엔드 개발 (Developer) - 진행 중  
⏭️ Feature 2-6: 다음 기능 반복

---

## Phase 0: 초기 환경 설정 (1회성)

### 1. AI 에이전트 정의 파일 작성

**실행한 프롬프트:**

```
.claude/agents/ 디렉토리를 생성하고 다음 에이전트 정의 파일을 작성해주세요:
- pm.md: PM 역할, 검수 체크리스트
- planner.md: 기획자 역할, 기획서 형식, 역할 범위
- wireframe.md: 와이어프레임 작성 규칙, HTML 직접 임베드 방식
- modeler.md: DB 설계 규칙, 공통 컬럼, Prisma 스키마 작성법
- developer.md: TDD 개발 규칙, NestJS/Next.js 코드 컨벤션
```

**산출물:**

- `.claude/agents/pm.md`
- `.claude/agents/planner.md`
- `.claude/agents/wireframe.md`
- `.claude/agents/modeler.md`
- `.claude/agents/developer.md`

### 2. Prisma 설정

**실행한 프롬프트:**

```
Prisma를 설정하고 PostgreSQL에 연결해주세요:
- apps/api/prisma/schema.prisma 초기 설정
- apps/api/.env.example에 DATABASE_URL 템플릿
- PrismaService, PrismaModule 작성
- AppModule에 PrismaModule 등록
- package.json에 Prisma 관련 패키지 추가
- main.ts에 Swagger 및 ValidationPipe 설정
```

**산출물:**

- `apps/api/prisma/schema.prisma`
- `apps/api/src/prisma/prisma.service.ts`
- `apps/api/src/prisma/prisma.module.ts`
- `apps/api/.env.example`
- 업데이트된 `apps/api/package.json`
- 업데이트된 `apps/api/src/main.ts`

### 3. 산출물 디렉토리 구조 생성

**실행한 프롬프트:**

```
다음 디렉토리를 생성해주세요:
- artifacts/planning-user-story/
- artifacts/planning-wireframe/
- artifacts/database-schema/
- artifacts/todo.md (프로젝트 진행 상황 관리)
```

**산출물:**

- 디렉토리 구조 생성 완료
- `artifacts/todo.md`
- `SETUP.md` (환경 설정 가이드)

### 4. shadcn/ui 설정 (웹 앱용)

**실행한 프롬프트:**

```
apps/web에 shadcn/ui를 설정해주세요:
- package.json에 필요한 의존성 추가 (Tailwind, react-hook-form, zod 등)
- Tailwind CSS 설정
```

**산출물:**

- 업데이트된 `apps/web/package.json`
- 필요한 의존성: tailwindcss, @hookform/resolvers, zod, class-variance-authority, clsx, tailwind-merge

**실제 shadcn/ui 초기화는 프론트엔드 개발 시작 시 수행:**

```bash
cd apps/web
npx shadcn@latest init
```

---

## Phase 1: 프로젝트 관리 기능 개발

### Step 1: 기획 (Planner)

**실행한 프롬프트:**

```
프로젝트 관리 기능을 기획해주세요.

다음 내용을 포함해야 합니다:
- 목적/배경/범위
- 기능 요구사항 (FR) - CRUD 기능
- 비기능 요구사항 (NFR) - 응답시간, 동시사용자 등
- 사용자 스토리 (As a, I want, So that) + 인수 조건
- 화면 목록 및 흐름 (목록, 생성, 상세, 수정)
- API 경로 정의 (RESTful)
- 데이터 모델 (개념적)
- 초기 데이터 (프로젝트 상태 코드)
- 예외 처리 케이스
```

**산출물:**

- `artifacts/planning-user-story/project-management.md`

**검수 체크리스트:**

- ✅ 목적/범위가 명확한가?
- ✅ 사용자 스토리에 인수 조건이 있는가?
- ✅ 화면 흐름이 논리적인가?
- ✅ API 경로가 RESTful인가?

### Step 2: 와이어프레임 (Wireframe)

**실행한 프롬프트:**

```
artifacts/planning-user-story/project-management.md를 참고하여
HTML 와이어프레임을 작성해주세요.

요구사항:
- 각 화면을 독립적인 HTML 파일로 작성 (index, create, detail, edit)
- 사이드바는 직접 임베드 (fetch 사용 금지 - CORS 오류 방지)
- 화면 간 링크 연결
- 필수 입력 필드에 * 표시
- 다크모드 스타일 적용
- artifacts/planning-wireframe/project-management/ 디렉토리에 저장
- README.md 작성 (로컬에서 확인하는 방법 포함)
```

**산출물:**

- `artifacts/planning-wireframe/project-management/index.html` (목록)
- `artifacts/planning-wireframe/project-management/create.html` (생성)
- `artifacts/planning-wireframe/project-management/detail.html` (상세)
- `artifacts/planning-wireframe/project-management/edit.html` (수정)
- `artifacts/planning-wireframe/project-management/README.md`

**검수 체크리스트:**

- ✅ 기획서의 모든 화면이 구현되었는가?
- ✅ 화면 간 링크가 동작하는가?
- ✅ 필수 필드에 \* 표시가 있는가?
- ✅ 다크모드 스타일이 적용되었는가?

**로컬 확인 방법:**

```bash
cd artifacts/planning-wireframe/project-management
python3 -m http.server 8000
open http://localhost:8000
```

### Step 3: DB 설계 (Modeler)

**실행한 프롬프트:**

```
artifacts/planning-user-story/project-management.md와
artifacts/planning-wireframe/project-management/를 참고하여
DB 스키마를 설계해주세요.

산출물:
1. 테이블 명세서 (artifacts/database-schema/project/project.md)
   - 테이블 목록
   - 컬럼 정의 (타입, NULL 여부, 기본값, 코멘트)
   - 인덱스 설계
   - 관계 정의
   - 초기 데이터 정의

2. DDL/DML (artifacts/database-schema/project/project.sql)
   - CREATE TABLE (제약조건 포함)
   - CREATE INDEX
   - COMMENT
   - INSERT (샘플 데이터)

3. Prisma 스키마 (apps/api/prisma/schema.prisma)
   - model Project 정의
   - @map으로 snake_case 매핑
   - @@index 정의

필수 규칙:
- 모든 테이블에 공통 컬럼 포함 (id, is_active, created_by, created_at, updated_by, updated_at)
- snake_case 명명 규칙
- 컬럼 코멘트 필수
```

**산출물:**

- `artifacts/database-schema/project/project.md`
- `artifacts/database-schema/project/project.sql`
- 업데이트된 `apps/api/prisma/schema.prisma`

**검수 체크리스트:**

- ✅ 공통 컬럼이 포함되었는가?
- ✅ 명명 규칙(snake_case)을 따르는가?
- ✅ 인덱스가 적절한가?
- ✅ Prisma 스키마와 DDL이 동기화되었는가?

**마이그레이션 실행 (검수 통과 후):**

```bash
cd apps/api
pnpm install  # @prisma/client, prisma 패키지 설치
pnpm prisma:generate
pnpm prisma:migrate  # 마이그레이션 이름 입력: init-projects
```

### Step 4: 백엔드 개발 (Developer - TDD)

**실행한 프롬프트:**

```
artifacts/planning-user-story/project-management.md를 참고하여
NestJS API를 TDD로 개발해주세요.

개발 순서:
1. DTO 작성 (apps/api/src/projects/dto/)
   - CreateProjectDto (validation 포함)
   - UpdateProjectDto
   - ProjectResponseDto

2. 테스트 먼저 작성 (projects.service.spec.ts)
   - create, findAll, findOne, update, remove 테스트
   - 에러 케이스 테스트 (중복 프로젝트명, 날짜 오류, 404 등)

3. 서비스 구현 (projects.service.ts)
   - CRUD 메서드
   - 비즈니스 로직 (중복 검증, 날짜 검증 등)
   - 에러 처리

4. 컨트롤러 구현 (projects.controller.ts)
   - RESTful 엔드포인트
   - @ApiTags, @ApiOperation으로 Swagger 문서화
   - BigInt → string 변환

5. 모듈 등록 (projects.module.ts)
   - PrismaModule import
   - ProjectsService, ProjectsController 등록

6. AppModule에 ProjectsModule 추가
```

**산출물:**

- `apps/api/src/projects/dto/create-project.dto.ts`
- `apps/api/src/projects/dto/update-project.dto.ts`
- `apps/api/src/projects/dto/project-response.dto.ts`
- `apps/api/src/projects/projects.service.spec.ts`
- `apps/api/src/projects/projects.service.ts`
- `apps/api/src/projects/projects.controller.spec.ts`
- `apps/api/src/projects/projects.controller.ts`
- `apps/api/src/projects/projects.module.ts`
- 업데이트된 `apps/api/src/app.module.ts`

**검수 체크리스트:**

- ✅ 테스트가 통과하는가? (`pnpm test`)
- ✅ Swagger 문서에 API가 표시되는가? (`http://localhost:3000/docs`)
- ✅ 기획서의 모든 API가 구현되었는가?

**테스트 실행:**

```bash
cd apps/api
pnpm test
```

**API 서버 실행:**

```bash
cd apps/api
pnpm dev
# http://localhost:3000
# http://localhost:3000/docs (Swagger)
```

### Step 5: 프론트엔드 개발 (Developer - shadcn/ui)

**실행할 프롬프트:**

```
artifacts/planning-wireframe/project-management/를 참고하여
Next.js + shadcn/ui로 UI를 개발해주세요.
**중요: SSR 없이 CSR(Client-Side Rendering) 방식으로 개발해주세요.** (모든 페이지에 'use client' 적용 및 useEffect를 이용한 데이터 페칭)

사전 작업 (최초 1회만):
- shadcn/ui 초기화: npx shadcn@latest init
- 필요한 컴포넌트 설치: button, card, form, input, label, select, badge, alert, dialog

개발 순서:
1. API 클라이언트 작성 (apps/web/lib/api/projects.ts)
   - getProjects, getProject, createProject, updateProject, deleteProject
   - 타입 정의 (백엔드 DTO와 동기화)
   - 에러 처리

2. shadcn/ui 컴포넌트 구현 (apps/web/components/projects/)
   - ProjectList.tsx (Card, Badge 사용)
   - ProjectForm.tsx (react-hook-form + zod + shadcn Form 사용)
   - ProjectDetail.tsx (Card, Dialog 사용)

3. 페이지 구현 (apps/web/app/projects/)
   - page.tsx (목록)
   - [id]/page.tsx (상세)
   - new/page.tsx (생성)
   - [id]/edit/page.tsx (수정)

4. 스타일링
   - Tailwind CSS 사용
   - shadcn/ui 컴포넌트로 일관된 디자인 시스템 구축
```

**검수 체크리스트:**

- [ ] shadcn/ui 초기화 완료
- [ ] 필요한 컴포넌트 설치 완료
- [ ] react-hook-form + zod로 폼 validation 구현
- [ ] 와이어프레임과 기능이 일치하는가?
- [ ] CRUD 기능이 정상 동작하는가?
- [ ] 에러 처리가 적절한가? (Alert 컴포넌트 사용)
- [ ] 로딩 상태가 표시되는가? (Button disabled 상태)

---

## 규칙 개선 (지속적)

개발 과정에서 문제 발생 시 **결과물을 고치기보다 규칙을 개선**합니다.

### 사례 1: Modeler가 공통 컬럼을 누락한 경우

**프롬프트:**

```
.claude/agents/modeler.md의 "공통 컬럼 (필수)" 섹션에 다음 경고문을 추가해주세요:

> ⚠️ **중요**: 이 컬럼들을 하나라도 누락하면 작업을 중단하고 다시 작성해야 합니다.
```

### 사례 2: Planner가 역할 범위를 초과한 경우

**프롬프트:**

```
.claude/agents/planner.md의 "기획서 범위 제외" 섹션을 강화해주세요:

DDL/테이블 설계, API Request/Response 상세 JSON, 화면 상세 레이아웃 HTML은
절대 작성하지 말고, 해당 에이전트에게 맡겨야 한다는 것을 명확히 해주세요.
```

---

## 다음 기능 개발 (Phase 2)

Step 1-5를 반복하여 다음 기능을 개발합니다.

**권장 순서:**

1. ✅ 프로젝트 관리 (완료)
2. ⏭️ 작업 관리 (Task Management)
3. ⏭️ 이슈 관리 (Issue Management)
4. ⏭️ 일정 관리 (Schedule Management)
5. ⏭️ 리소스 관리 (Resource Management)
6. ⏭️ 리포트 (Report)

**프롬프트:**

```
@planner 작업 관리 기능을 기획해주세요.
프로젝트와 연결되는 작업(Task) CRUD 기능이 필요합니다.
```

---

## 핵심 원칙

1. **순차 진행**: Planner → Wireframe → Modeler → Developer 순서 반드시 지킴
2. **PM 검수**: 각 단계마다 PM이 체크리스트 기반으로 검수
3. **규칙 우선**: 결과물 직접 수정보다 에이전트 규칙 개선
4. **TDD**: 백엔드 개발 시 테스트를 먼저 작성
5. **문서화**: 모든 산출물은 artifacts/ 디렉토리에 저장

---

## 참고 자료

- [에이전트 정의 파일](.claude/agents/)
- [기획서](artifacts/planning-user-story/)
- [와이어프레임](artifacts/planning-wireframe/)
- [DB 스키마](artifacts/database-schema/)
- [환경 설정 가이드](SETUP.md)
- [PRD](artifacts/prd.md)
- [AI-Driven Workflow](artifacts/ai-driven-workflow.md)
