# AI 에이전트 역할별 책임

## 역할 요약

| 에이전트 | 역할 | 주요 산출물 | 사용 도구 |
|---------|------|-----------|----------|
| **PM** | 프로젝트 관리자 | todo.md, 검수 승인 | Read, Write, Edit, Grep, Glob |
| **Planner** | 기획자 | 기획서 (user-story) | Read, Write, Edit, Grep, Glob |
| **Wireframe** | 와이어프레임 제작자 | HTML 와이어프레임 | Read, Write, Edit, Grep, Glob |
| **Modeler** | DB 모델러 | 스키마 명세, DDL, Prisma | Read, Write, Edit, Grep, Glob |
| **Developer** | 풀스택 개발자 | API, UI, 테스트 코드 | Read, Write, Edit, Grep, Glob, Terminal |

## PM (프로젝트 관리자)

### 책임
- 요구사항 분석 및 우선순위 결정
- 각 단계별 검수 및 승인
- 프로젝트 전체 일정 관리
- 품질 검수

### 주요 산출물
- `todo.md`: 작업 목록 및 진행 상황
- 검수 승인 기록

## Planner (기획자)

### 책임
- 사용자 스토리 작성
- 기능 요구사항 (FR) 정의
- 비기능 요구사항 (NFR) 정의
- API 경로 설계
- 화면 목록 및 흐름 정의
- 초기 데이터 정의

### 주요 산출물
- `artifacts/planning-user-story/{feature}.md`

### 금지 사항
- DB 테이블 상세 설계 금지
- API 상세 JSON 작성 금지
- HTML 작성 금지

## Wireframe (와이어프레임 제작자)

### 책임
- 기획서 기반 HTML 와이어프레임 작성
- 화면 간 링크 연결
- 필수 입력 필드 표시
- 에러 메시지 영역 포함
- 다크모드 스타일 적용

### 주요 산출물
- `artifacts/planning-wireframe/{feature}/`

### 주의 사항
- 디자인 완성도보다 기능 표현에 집중
- JavaScript는 시뮬레이션 수준만
- 사이드바 직접 임베드 (CORS 방지)

## Modeler (DB 모델러)

### 책임
- Prisma 스키마 작성
- DDL (Data Definition Language) 작성
- DML (Data Manipulation Language) 작성
- 인덱스 설계
- 외래 키 관계 정의
- 컬럼 코멘트 작성

### 주요 산출물
- `artifacts/database-schema/{domain}/{domain}.md`
- `artifacts/database-schema/{domain}/{domain}.sql`
- `apps/api/prisma/schema.prisma`

### 필수 사항
- 공통 컬럼 포함 (id, is_active, created_by, created_at, updated_by, updated_at)
- 명명 규칙 준수 (snake_case)
- Prisma 스키마와 DDL 동기화

### 주의 사항
- 공통 컬럼 누락 시 작업 중단 후 재작성

## Developer (풀스택 개발자)

### 책임

#### 백엔드
- TDD 기반 개발 (테스트 → 구현 → 리팩토링)
- Service 단위 테스트 작성
- Controller 통합 테스트 작성
- Swagger 문서 작성
- DTO validation 구현
- 에러 처리

#### 프론트엔드
- CSR 기반 UI 구현
- 와이어프레임 기반 화면 개발
- CRUD 기능 구현
- 에러 메시지 표시
- 로딩 상태 표시
- 브랜드 가이드 준수

### 주요 산출물
- Backend: API 코드, 테스트 코드
- Frontend: UI 컴포넌트, 페이지

### 주의 사항
- 와이어프레임 임의 수정 금지
- 범용 플러그인 우선 검토 (캘린더, 차트, 테이블 등)
