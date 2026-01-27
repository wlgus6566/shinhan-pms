# 체크리스트

## 기획서 (Planner)

- [ ] 목적/배경/범위 명확
- [ ] 기능 요구사항 (FR) 우선순위 정의
- [ ] 비기능 요구사항 (NFR) 수치 기준 정의
- [ ] 사용자 스토리 + 인수 조건
- [ ] 화면 목록 및 흐름
- [ ] API 경로 (RESTful)
- [ ] 초기 데이터 (도메인 코드)
- [ ] 예외 처리 케이스

## 와이어프레임 (Wireframe)

- [ ] 기획서의 모든 화면 구현
- [ ] 화면 간 링크 연결
- [ ] 사이드바 직접 임베드 (CORS 방지)
- [ ] 필수 입력 필드 `*` 표시
- [ ] 에러 메시지 영역 포함
- [ ] 다크모드 스타일 적용

## DB 스키마 (Modeler)

- [ ] 공통 컬럼 포함
- [ ] 명명 규칙 (snake_case) 준수
- [ ] 적절한 인덱스 설계
- [ ] 외래 키 관계 정의
- [ ] 컬럼 코멘트 작성
- [ ] Prisma 스키마와 DDL 동기화
- [ ] 초기 데이터 (DML) 작성

## 백엔드 개발 (Developer)

- [ ] 단위 테스트 작성 및 통과
- [ ] Swagger 문서 노출 (http://localhost:3000/docs)
- [ ] DTO validation 규칙 적용
- [ ] 에러 처리 적절
- [ ] 코드 컨벤션 준수

## 프론트엔드 개발 (Developer)

- [ ] 모든 페이지 `'use client'` 포함
- [ ] 와이어프레임과 UI 일치
- [ ] CRUD 기능 정상 동작
- [ ] 에러 메시지 표시
- [ ] 로딩 상태 표시
- [ ] 브랜드 가이드 준수
- [ ] **범용 플러그인 우선 검토**: 새로운 UI 컴포넌트나 기능 개발 전 관련 플러그인/라이브러리 먼저 검토 (예: 캘린더 → FullCalendar, 차트 → Recharts, 테이블 → TanStack Table 등)

## SWR 훅 개발

- [ ] GET 요청은 `lib/api/`에 SWR 훅으로 작성
- [ ] POST/PATCH/DELETE는 async 함수로 작성
- [ ] 조건부 fetching 필요시 `null` 전달 구현
- [ ] Mutation 함수 호출 후 `mutate()` 호출하여 캐시 갱신
- [ ] 컴포넌트에서 직접 `useSWR` 호출하지 않기
- [ ] 목록 조회 API인 경우 `PaginatedData<T>` 타입 사용
- [ ] `data?.list`로 실제 배열 추출

## 타입 시스템 (Schema)

- [ ] @repo/schema에 Zod 스키마 먼저 정의
- [ ] Request 타입은 `z.infer<>`로 생성하여 export
- [ ] Backend DTO는 `createZodDto()` 사용
- [ ] Frontend는 `zodResolver()` 사용
- [ ] 로컬 검증 로직 없는지 확인 (inline z.object() 금지)
- [ ] 중복 타입 정의 없는지 확인
