# Best Practices

## 1. 규칙 기반 개선

> "마음에 안 드는 결과가 나오면 결과물을 고치기보다 규칙을 고친다"

### 프로세스
1. 문제 발생 시 원인 분석
2. 에이전트 규칙 누락/모호/오류 확인
3. `.claude/agents/{agent}.md` 파일 수정
4. 다음 작업에서 개선 효과 확인

### 예시
- **문제**: Planner가 DB 테이블 상세까지 작성
- **해결**: `.claude/agents/planner.md`에 "DB 테이블 상세 설계 금지" 명시
- **결과**: 다음 기획서부터 적절한 수준의 기획서 산출

## 2. 순차 진행 원칙

### 순서 엄수
Planner → Wireframe → Modeler → Developer

### 규칙
- 이전 단계 미승인 시 다음 단계 진행 금지
- PM 승인 없이 마이그레이션 금지
- 각 단계의 산출물은 다음 단계의 입력

### 예외 처리
- 긴급 버그 수정: Developer가 직접 작업 가능 (사후 PM 보고)
- 기획 변경: Planner부터 다시 시작

## 3. 역할 범위 준수

### Planner
- **허용**: 기능 요구사항, 사용자 스토리, API 경로, 화면 목록
- **금지**: DB 테이블 상세, API JSON 예시, HTML 코드

### Wireframe
- **허용**: HTML/CSS 와이어프레임, 화면 흐름, 기능 표현
- **금지**: 디자인 완성도, 복잡한 JavaScript

### Modeler
- **허용**: Prisma 스키마, DDL, DML, 인덱스 설계
- **필수**: 공통 컬럼 포함
- **금지**: 비즈니스 로직

### Developer
- **허용**: API 구현, UI 구현, 테스트 작성
- **금지**: 와이어프레임 임의 수정, 기획 변경

## 4. 코드 품질

### TDD (Backend)
```
1. 테스트 작성 (Red)
2. 구현 (Green)
3. 리팩토링 (Refactor)
```

### CSR (Frontend)
- 모든 컴포넌트 `'use client'` 필수
- SSR/SSG 사용 금지

### 타입 안전성
- `@repo/schema` 패키지를 단일 소스로 사용
- Backend-Frontend 간 타입 공유
- 중복 타입 정의 금지

## 5. 개발 효율성

### 범용 플러그인 우선
새로운 기능 개발 전 관련 라이브러리 검토:
- 캘린더 → FullCalendar
- 차트 → Recharts
- 테이블 → TanStack Table
- 날짜 선택 → react-day-picker

### 재사용 컴포넌트
- 폼: `@/components/form` 사용
- Dialog: `BaseDialog` 사용
- 공통 UI: `@/components/ui` 사용

### API 호출
- `lib/api/` 디렉토리에 통합 관리
- SWR 훅 패턴 준수
- 캐시 무효화 전략 적용

## 6. 문서화

### 산출물 저장
| 산출물 | 경로 |
|-------|------|
| 기획서 | `artifacts/planning-user-story/{feature}.md` |
| 와이어프레임 | `artifacts/planning-wireframe/{feature}/` |
| DB 스키마 명세 | `artifacts/database-schema/{domain}/{domain}.md` |
| DDL/DML | `artifacts/database-schema/{domain}/{domain}.sql` |

### 코멘트
- 컬럼: Prisma 스키마에 `/// @description` 사용
- 함수: 복잡한 로직만 JSDoc 작성
- 일반 코드: 자명한 경우 생략

## 7. 품질 관리

### 코드 리뷰 체크
- 명명 규칙 준수
- 타입 안전성
- 에러 처리
- 테스트 커버리지
- 성능 고려

### 테스트 전략
- Backend: 단위 테스트 + 통합 테스트
- Frontend: 필요시 컴포넌트 테스트
- E2E: 주요 시나리오 테스트
