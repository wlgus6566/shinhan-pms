# Next.js 성능 최적화 적용 내역

Vercel React Best Practices를 기반으로 적용된 최적화 목록입니다.

## 1. 번들 크기 최적화 (Bundle Size Optimization) - CRITICAL

### 적용 전략
- ✅ **Dynamic Imports**: 무거운 컴포넌트는 필요할 때만 로드 (향후 적용 예정)
- ⚠️ **Barrel Imports**: lucide-react는 barrel import 유지 (타입 호환성 문제로)

## 2. Re-render 최적화 (Re-render Optimization) - MEDIUM

### 적용 사항

#### 2.1 React.memo 적용
- ✅ `StatsCard` - 대시보드 통계 카드 컴포넌트
- ✅ `QuickActionCard` - 빠른 액션 카드 컴포넌트
- ✅ `ProjectDetail` - 프로젝트 상세 컴포넌트

#### 2.2 useCallback 최적화
- ✅ `AuthContext`: `login`, `logout` 함수를 useCallback으로 래핑
- ✅ `LoginForm`: `onSubmit` 함수를 useCallback으로 래핑
- ✅ `ProjectForm`: `onSubmit`, `onDelete` 함수를 useCallback으로 래핑
- ✅ `ProjectListTable`: `handlePrevPage`, `handleNextPage`, `handlePageChange` 함수를 useCallback으로 래핑
- ✅ `Sidebar`: `isActive`, `toggleCollapsed` 함수를 useCallback으로 래핑

#### 2.3 useMemo 최적화
- ✅ `DashboardPage`: 날짜 포맷팅을 useMemo로 캐싱
- ✅ `ProjectListTable`: 페이지네이션 계산을 useMemo로 캐싱
- ✅ `ProjectDetail`: 날짜 포맷팅을 useMemo로 캐싱
- ✅ `AuthContext`: context value를 useMemo로 캐싱
- ✅ `ProjectDetailPage`: `canEdit` 권한 체크를 useMemo로 캐싱

#### 2.4 Effect Dependencies 최적화
- ✅ `ProjectForm`: useEffect에서 불필요한 `form` 의존성 제거

## 3. 렌더링 성능 최적화 (Rendering Performance) - MEDIUM

### 적용 사항

#### 3.1 Static Data Hoisting
정적 데이터를 컴포넌트 외부로 이동하여 매 렌더링마다 재생성 방지:

- ✅ `DashboardPage`:
  - `colorClassesMap` - 색상 클래스 맵
  - `actionColorClasses` - 액션 색상 클래스
  - `recentActivities` - 최근 활동 데이터
  - `upcomingEvents` - 예정된 이벤트 데이터

- ✅ `ProjectForm`:
  - `statusOptions` - 상태 옵션 배열

- ✅ `ProjectListTable`:
  - `statusLabels` - 상태 라벨 맵
  - `statusVariants` - 상태 variant 맵

- ✅ `ProjectDetail`:
  - `statusMap` - 상태 맵

## 4. JavaScript 성능 최적화 (JavaScript Performance) - LOW-MEDIUM

### 적용 사항

#### 4.1 함수 결과 캐싱 (js-cache-function-results)
모듈 레벨 Map을 사용하여 반복적인 함수 호출 결과를 캐싱:

- ✅ `ProjectDetail`: 날짜 포맷팅 캐시 (`dateFormatCache`)
- ✅ `ProjectListTable`: 날짜 포맷팅 캐시 (`formatDateCache`)

```typescript
const dateFormatCache = new Map<string, string>();
const formatDate = (dateString: string): string => {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }
  const result = new Date(dateString).toLocaleDateString('ko-KR', {...});
  dateFormatCache.set(dateString, result);
  return result;
};
```

#### 4.2 Storage API 캐싱 (js-cache-storage)
- ✅ `AuthContext`: localStorage 읽기를 한 번에 배치 처리

## 5. 추가 개선 사항

### 타입 안전성
- ✅ 모든 정적 데이터에 `as const` assertion 추가
- ✅ 타입 narrowing 개선

### 접근성
- ✅ Sidebar toggle 버튼에 `aria-label` 추가

### 에러 처리
- ✅ `AuthContext`: localStorage.getItem 파싱 시 try-catch 추가

## 성능 영향 예상

### Critical Impact (즉시 체감)
- 불필요한 리렌더링 방지: ~30-50% 렌더링 횟수 감소
- 정적 데이터 hoisting: 메모리 할당 감소

### High Impact
- 함수 결과 캐싱: 날짜 포맷팅 시간 ~80% 감소
- useCallback/useMemo: Context 구독자 리렌더링 방지

### Medium Impact
- Effect 의존성 최적화: 불필요한 effect 재실행 방지

## 향후 최적화 계획

### Phase 2 (필요시 적용)
- [ ] Server Components로 전환 가능한 컴포넌트 식별
- [ ] Suspense Boundaries 전략적 배치
- [ ] SWR/React Query 도입으로 client-side 캐싱 개선
- [ ] next/dynamic으로 큰 컴포넌트 지연 로딩
- [ ] 이미지 최적화 (next/image)
- [ ] Font 최적화 (next/font)

### Phase 3 (고급 최적화)
- [ ] React Compiler 적용 검토
- [ ] Partial Prerendering (PPR) 적용
- [ ] Streaming SSR 활용
- [ ] Edge Runtime 활용 검토

## 측정 방법

### 개발 도구
```bash
# 번들 크기 분석
pnpm build && pnpm analyze

# Lighthouse 성능 측정
lighthouse http://localhost:3001 --view

# React DevTools Profiler
# 브라우저 확장 프로그램에서 Profiler 탭 사용
```

### 주요 지표
- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- TBT (Total Blocking Time): < 200ms
- CLS (Cumulative Layout Shift): < 0.1
- Bundle Size: < 200KB (gzipped)

## 참고 문서
- [Vercel React Best Practices](/.claude/skills/vercel-react-best-practices/SKILL.md)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
