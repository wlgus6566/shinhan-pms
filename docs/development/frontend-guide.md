# 프론트엔드 개발 가이드 (Next.js + SWR + shadcn/ui)

## 기술 스택

| 기술 | 용도 |
|------|------|
| Next.js (App Router) | 프론트엔드 프레임워크 (SSR + CSR) |
| React 19 | UI 라이브러리 |
| SWR | 데이터 페칭 및 캐싱 |
| shadcn/ui | UI 컴포넌트 |
| Tailwind CSS | 스타일링 |
| React Hook Form | 폼 상태 관리 |
| Zod | 폼 검증 (@repo/schema 경유) |
| Axios | HTTP 클라이언트 |
| Lucide React | 아이콘 |

---

## 1. 프로젝트 구조

```
apps/web/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── globals.css                # 전역 스타일
│   ├── page.tsx                   # 로그인 페이지 (/)
│   └── (app)/                     # 인증 필요 라우트 그룹
│       ├── layout.tsx             # 사이드바 + 헤더 레이아웃
│       ├── dashboard/page.tsx
│       ├── {feature}/page.tsx     # 기능별 페이지
│       └── {feature}/[id]/page.tsx
├── components/
│   ├── ui/                        # shadcn/ui 기본 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── base-dialog.tsx        # BaseDialog (Dialog 래퍼 - 필수 사용)
│   │   └── ...
│   ├── form/                      # 재사용 폼 컴포넌트 (필수 사용)
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormTextarea.tsx
│   │   ├── FormCheckbox.tsx
│   │   ├── FormCheckboxGroup.tsx
│   │   ├── FormRadioGroup.tsx
│   │   └── FormSwitch.tsx
│   ├── layout/                    # 레이아웃 컴포넌트
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── {feature}/                 # 기능별 컴포넌트
│       ├── FeatureList.tsx
│       ├── FeatureForm.tsx
│       └── FeatureDialog.tsx
├── lib/
│   ├── api/                       # API 호출 통합 관리 (필수)
│   │   ├── fetcher.ts             # Axios 클라이언트 + 인터셉터
│   │   ├── {feature}.ts           # 기능별 SWR 훅 + 비동기 함수
│   │   └── ...
│   ├── utils.ts                   # 유틸리티 (cn 함수 등)
│   └── constants/                 # 상수 정의
├── hooks/                         # 커스텀 훅
├── context/                       # React Context (인증 등)
└── types/                         # UI 전용 로컬 타입
```

---

## 2. 렌더링 전략 (Server / Client Components)

Next.js App Router는 기본적으로 Server Component입니다. 필요에 따라 CSR과 SSR을 적절히 혼합합니다.

### 2.1 Server Component (기본값)

`'use client'` 선언이 없는 컴포넌트는 서버에서 렌더링됩니다.

```typescript
// app/(app)/features/page.tsx — Server Component
import { FeatureList } from '@/components/feature/FeatureList';

// 서버에서 직접 데이터 페칭
async function getFeatures() {
  const res = await fetch(`${process.env.API_URL}/api/features`, {
    cache: 'no-store', // 항상 최신 데이터
  });
  const json = await res.json();
  return json.data;
}

export default async function FeaturesPage() {
  const features = await getFeatures();

  return (
    <div className="page-animate">
      <h1 className="text-3xl font-bold">기능 관리</h1>
      <FeatureList initialData={features} />
    </div>
  );
}
```

**Server Component 사용 시점:**
- SEO가 중요한 페이지 (공개 페이지, 랜딩, 상세 페이지 등)
- 초기 로딩 성능이 중요한 페이지
- 정적 UI (상태 변경 없음)
- 민감한 데이터 접근 (API 키, DB 직접 쿼리 등)

### 2.2 Client Component (`'use client'`)

상태 관리, 이벤트 핸들러, 브라우저 API가 필요한 컴포넌트에 선언합니다.

```typescript
'use client';

import { useState } from 'react';
import { useFeatures } from '@/lib/api/features';

export function FeatureList({ initialData }: { initialData?: Feature[] }) {
  const { features, isLoading, mutate } = useFeatures();
  // 인터랙션 로직...
}
```

**Client Component 사용 시점:**
- `useState`, `useEffect`, `useRef` 등 React 훅 사용
- 이벤트 핸들러 (`onClick`, `onChange` 등)
- 브라우저 전용 API (`localStorage`, `window` 등)
- 폼 (React Hook Form)
- SWR 훅으로 실시간 데이터 갱신
- 타이머, 인터벌

### 2.3 혼합 패턴 (권장)

Server Component 페이지 안에 Client Component를 임베드합니다:

```typescript
// app/(app)/features/page.tsx — Server Component (페이지)
import { FeatureHeader } from './FeatureHeader';  // Server
import { FeatureTable } from '@/components/feature/FeatureTable';  // Client

export default async function FeaturesPage() {
  return (
    <div className="page-animate">
      <FeatureHeader />           {/* 서버에서 렌더 (정적 UI) */}
      <FeatureTable />            {/* 클라이언트 (인터랙션, SWR) */}
    </div>
  );
}
```

### 2.4 판단 기준 요약

| 구분 | Server Component | Client Component |
|------|-----------------|-----------------|
| `'use client'` | 불필요 | 필수 |
| 데이터 페칭 | `async/await` + `fetch` | SWR 훅 |
| 상태 관리 | 불가 | `useState`, Context |
| 이벤트 핸들러 | 불가 | `onClick` 등 |
| SEO | 우수 | 불리 |
| 초기 로딩 | 빠름 (HTML 스트리밍) | 느림 (JS 번들 필요) |
| 번들 크기 | 포함 안 됨 | JS 번들에 포함 |

---

## 3. API 호출 패턴

### 3.0 Server Component에서의 데이터 페칭

Server Component에서는 `fetch`를 직접 사용합니다.

```typescript
// lib/api/server/{feature}.ts — 서버 전용 페칭 함수
const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function getFeatures(pageNum = 1, pageSize = 10) {
  const res = await fetch(
    `${API_URL}/api/features?pageNum=${pageNum}&pageSize=${pageSize}`,
    { cache: 'no-store' }  // 동적 데이터
  );

  if (!res.ok) throw new Error('Failed to fetch features');

  const json = await res.json();
  return json.data;  // { code, message, data } 에서 data 추출
}

export async function getFeature(id: string) {
  const res = await fetch(`${API_URL}/api/features/${id}`, {
    next: { revalidate: 60 },  // 60초마다 재검증 (ISR)
  });

  if (!res.ok) throw new Error('Feature not found');

  const json = await res.json();
  return json.data;
}
```

```typescript
// app/(app)/features/page.tsx — Server Component 페이지
import { getFeatures } from '@/lib/api/server/features';

export default async function FeaturesPage() {
  const data = await getFeatures();
  return <FeatureTable initialData={data.list} />;
}
```

**캐시 전략:**
| 옵션 | 용도 |
|------|------|
| `cache: 'no-store'` | 항상 최신 데이터 (동적 페이지) |
| `cache: 'force-cache'` | 빌드 시 캐시 (정적 데이터) |
| `next: { revalidate: N }` | N초마다 재검증 (ISR) |
| `next: { tags: ['features'] }` | 태그 기반 온디맨드 재검증 |

### 3.1 Client Component에서의 API 파일 구조 (SWR)

Client Component의 모든 API 호출은 `lib/api/{feature}.ts`에 통합 관리합니다.

```typescript
// lib/api/features.ts
import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { PaginatedData } from '@repo/schema';

// --- 타입 정의 (또는 @repo/schema에서 import) ---
interface Feature {
  id: string;
  name: string;
  status: string;
}

// --- GET 요청: SWR 훅 ---

// 목록 조회 (페이지네이션)
export function useFeatures(pageNum = 1, pageSize = 10) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedData<Feature>>(
    `/api/features?pageNum=${pageNum}&pageSize=${pageSize}`
  );

  return {
    features: data?.list,          // 실제 배열 추출
    totalCount: data?.totalCount,
    isLoading,
    error,
    mutate,
  };
}

// 상세 조회 (조건부 fetching)
export function useFeature(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Feature>(
    id ? `/api/features/${id}` : null  // id 없으면 요청 안 함
  );

  return { feature: data, isLoading, error, mutate };
}

// --- POST/PATCH/DELETE: async 함수 ---

export async function createFeature(data: CreateFeatureRequest) {
  return fetcher('/api/features', { method: 'POST', body: data });
}

export async function updateFeature(id: string, data: UpdateFeatureRequest) {
  return fetcher(`/api/features/${id}`, { method: 'PATCH', body: data });
}

export async function deleteFeature(id: string) {
  return fetcher(`/api/features/${id}`, { method: 'DELETE' });
}
```

### 3.2 컴포넌트에서 사용

```typescript
'use client';

import { useFeatures, deleteFeature } from '@/lib/api/features';

export function FeatureList() {
  const { features, isLoading, mutate } = useFeatures();

  const handleDelete = async (id: string) => {
    await deleteFeature(id);
    mutate();  // 캐시 갱신
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      {features?.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} onDelete={handleDelete} />
      ))}
    </div>
  );
}
```

### 3.3 금지 패턴

```typescript
// ❌ Client Component에서 직접 useSWR 호출 금지
import useSWR from 'swr';
const { data } = useSWR('/api/features', fetcher);

// ❌ useState + useEffect 패턴 금지
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/features').then(res => res.json()).then(setData);
}, []);

// ✅ Client Component: lib/api/의 SWR 훅 사용
import { useFeatures } from '@/lib/api/features';
const { features, isLoading } = useFeatures();

// ✅ Server Component: lib/api/server/의 함수 사용
import { getFeatures } from '@/lib/api/server/features';
const data = await getFeatures();
```

### 3.4 Axios Interceptor 동작

`lib/api/fetcher.ts`의 응답 인터셉터가 자동으로 처리합니다:

```
API 원본 응답: { code: 'SUC001', message: '...', data: [...] }
                                                    ↓ interceptor
SWR가 받는 데이터: [...]  (data 필드만 자동 추출)
```

따라서 SWR 훅에서 별도의 래핑 해제 없이 바로 데이터 타입을 지정합니다.

### 3.5 페이지네이션 응답 처리

```typescript
// ❌ 배열을 직접 기대 (오류)
const { data } = useSWR<Feature[]>(url);

// ✅ PaginatedData에서 list 추출
const { data } = useSWR<PaginatedData<Feature>>(url);
const features = data?.list;  // Feature[]
```

런타임 에러 진단:
- `TypeError: xxx.some is not a function` → 배열 대신 객체를 받고 있음
- `TypeError: Cannot read property 'length' of undefined` → `data?.list` 확인

---

## 4. 폼 패턴 (React Hook Form + Zod)

### 4.1 기본 폼 구조

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateFeatureSchema, type CreateFeatureRequest } from '@repo/schema';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/button';

export function FeatureForm() {
  const form = useForm<CreateFeatureRequest>({
    resolver: zodResolver(CreateFeatureSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  const onSubmit = async (data: CreateFeatureRequest) => {
    await createFeature(data);
    // 성공 처리
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={form.control}
          name="name"
          label="이름 *"
          placeholder="이름을 입력하세요"
        />

        <FormSelect
          control={form.control}
          name="status"
          label="상태"
          options={[
            { label: '활성', value: 'ACTIVE' },
            { label: '비활성', value: 'INACTIVE' },
          ]}
        />

        <FormTextarea
          control={form.control}
          name="description"
          label="설명"
          rows={3}
        />

        <Button type="submit">저장</Button>
      </form>
    </Form>
  );
}
```

### 4.2 사용 가능한 폼 컴포넌트

| 컴포넌트 | 용도 | 사용 예시 |
|---------|------|----------|
| `FormInput` | 텍스트/숫자/날짜 입력 | `<FormInput control={form.control} name="title" label="제목" type="text" />` |
| `FormTextarea` | 여러 줄 텍스트 | `<FormTextarea control={form.control} name="description" label="설명" rows={3} />` |
| `FormSelect` | 단일 선택 드롭다운 | `<FormSelect control={form.control} name="type" options={options} />` |
| `FormCheckbox` | 단일 체크박스 (boolean) | `<FormCheckbox control={form.control} name="isActive" label="활성화" />` |
| `FormCheckboxGroup` | 다중 체크박스 (string[]) | `<FormCheckboxGroup control={form.control} name="ids" options={members} />` |
| `FormRadioGroup` | 라디오 버튼 그룹 | `<FormRadioGroup control={form.control} name="priority" options={priorities} />` |
| `FormSwitch` | 토글 스위치 | `<FormSwitch control={form.control} name="enabled" label="활성화" />` |

### 4.3 금지 패턴

```typescript
// ❌ FormField 직접 사용 금지
<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>제목</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// ✅ 재사용 컴포넌트 사용
<FormInput control={form.control} name="title" label="제목" />
```

**예외**: 기존 폼 컴포넌트로 구현 불가능한 특수 커스텀 UI만 FormField 직접 사용 허용.

### 4.4 Null vs Undefined 처리 (수정 폼)

Prisma는 nullable 필드에 `null`을 반환하지만, Zod `.optional()`은 `undefined`를 기대합니다:

```typescript
// 수정 폼에서 defaultValues 설정 시
const form = useForm<UpdateFeatureRequest>({
  resolver: zodResolver(UpdateFeatureSchema),
  defaultValues: {
    name: feature.name,
    description: feature.description ?? undefined,  // null → undefined
    endDate: feature.endDate ?? undefined,
  },
});
```

---

## 5. Dialog 패턴

### 5.1 BaseDialog 사용 (필수)

```typescript
import { BaseDialog } from '@/components/ui/base-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function FeatureDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: CreateFeatureRequest) => {
    setSubmitting(true);
    try {
      await createFeature(data);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="새 항목 등록"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            등록
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput control={form.control} name="name" label="이름 *" />
          {/* footer 버튼은 BaseDialog의 footer prop으로 분리 */}
        </form>
      </Form>
    </BaseDialog>
  );
}
```

### 5.2 주의사항
- `<form>`의 `onSubmit`은 유지 (Enter 키 지원)
- footer 버튼은 `onClick={form.handleSubmit(onSubmit)}` 사용
- 에러는 BaseDialog의 `error` prop으로 전달

### 5.3 금지 패턴

```typescript
// ❌ Dialog 직접 사용 금지
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

// ✅ BaseDialog 사용
import { BaseDialog } from '@/components/ui/base-dialog';
```

---

## 6. 페이지 패턴

### 6.1 SSR 목록 페이지 (Server Component + Client 인터랙션)

```typescript
// app/(app)/features/page.tsx — Server Component
import { getFeatures } from '@/lib/api/server/features';
import { FeatureListTable } from '@/components/feature/FeatureListTable';
import { CreateFeatureButton } from '@/components/feature/CreateFeatureButton';

export default async function FeaturesPage() {
  const data = await getFeatures();

  return (
    <div className="page-animate">
      {/* 서버에서 렌더링 (정적 UI) */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            기능 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            기능을 관리하고 설정할 수 있습니다
          </p>
        </div>
        <CreateFeatureButton />  {/* Client Component (이벤트) */}
      </div>

      {/* Client Component (인터랙션, 페이지네이션, 정렬) */}
      <FeatureListTable initialData={data} />
    </div>
  );
}
```

### 6.2 CSR 목록 페이지 (Client Component 전체)

인증이 필요하거나 실시간 갱신이 빈번한 페이지:

```typescript
'use client';

import { useFeatures } from '@/lib/api/features';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FeaturesPage() {
  const { features, isLoading, mutate } = useFeatures();

  return (
    <div className="page-animate">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            기능 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            기능을 관리하고 설정할 수 있습니다
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />새 항목 등록
        </Button>
      </div>

      <FeatureListTable />
    </div>
  );
}
```

### 6.3 SSR 상세 페이지

SEO가 중요한 공개 상세 페이지:

```typescript
// app/(app)/features/[id]/page.tsx — Server Component
import { getFeature } from '@/lib/api/server/features';
import { FeatureDetail } from '@/components/feature/FeatureDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 메타데이터 동적 생성 (SEO)
export async function generateMetadata({ params }: { params: { id: string } }) {
  const feature = await getFeature(params.id);
  return { title: feature?.name || '상세' };
}

export default async function FeatureDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const feature = await getFeature(params.id);
  if (!feature) notFound();

  return (
    <div className="page-animate">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/features">
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Link>
      </Button>
      <FeatureDetail feature={feature} />  {/* 서버에서 렌더 */}
    </div>
  );
}
```

### 6.4 CSR 상세 페이지

인증 필요, 실시간 데이터:

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useFeature } from '@/lib/api/features';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'next-view-transitions';

export default function FeatureDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { feature, isLoading } = useFeature(id);

  if (isLoading) return <Skeleton />;

  return (
    <div className="page-animate">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/features">
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Link>
      </Button>
      {/* 상세 컨텐츠 */}
    </div>
  );
}
```

---

## 7. 인증 컨텍스트

```typescript
// context/AuthContext.tsx 패턴
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, loading, logout } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Redirect to="/" />;

  return <div>안녕하세요, {user.name}님</div>;
}
```

---

## 8. 토큰 관리

### 8.1 구조
- **Access Token**: localStorage 저장, axios 요청 인터셉터에서 자동 첨부
- **Refresh Token**: HttpOnly Cookie (서버에서 관리)

### 8.2 자동 갱신 흐름
1. API 요청 시 401 응답 수신
2. Refresh 엔드포인트로 새 Access Token 발급 요청 (쿠키 자동 전송)
3. 새 Access Token 저장
4. 실패한 요청 + 대기 중인 요청 재시도
5. Refresh Token도 만료 시 → 로그아웃 + 로그인 페이지 이동

---

## 9. 스타일링 컨벤션

### 9.1 Tailwind CSS 유틸리티
```typescript
import { cn } from '@/lib/utils';

// 조건부 클래스
<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'text-blue-500' : 'text-slate-500'
)} />
```

### 9.2 페이지 진입 애니메이션

모든 페이지의 최상위 컨테이너에 `page-animate` 클래스를 추가하면 자식 요소가 순차적으로 나타나는 애니메이션이 적용됩니다:

```typescript
return (
  <div className="space-y-8 page-animate">
    <section>헤더</section>      {/* 0ms 후 나타남 */}
    <section>콘텐츠1</section>   {/* 80ms 후 */}
    <section>콘텐츠2</section>   {/* 160ms 후 */}
  </div>
);
```

### 9.3 View Transitions (페이지 전환)

`next-view-transitions` 라이브러리를 사용하여 페이지 간 부드러운 전환 효과를 제공합니다.
- 사이드바/헤더는 고정, 페이지 콘텐츠 영역만 트랜지션
- 네비게이션 Link는 `next-view-transitions`에서 import

```typescript
import { Link } from 'next-view-transitions';  // 사이드바 등 네비게이션 링크

<Link href="/features">기능 관리</Link>
```

---

## 10. 범용 플러그인 가이드

새로운 UI 컴포넌트 개발 전 기존 라이브러리를 먼저 검토합니다:

| 요구사항 | 추천 라이브러리 |
|---------|--------------|
| 캘린더 | FullCalendar |
| 차트/그래프 | Recharts |
| 데이터 테이블 | TanStack Table |
| 날짜 선택 | react-day-picker |
| 아이콘 | Lucide React |
| 날짜 유틸 | date-fns |
| 엑셀 내보내기 | exceljs |

---

## 11. 체크리스트 (새 기능 개발 시)

### 렌더링 전략
- [ ] Server / Client Component 판단 (인터랙션 필요 → Client, 정적 UI → Server)
- [ ] Client Component에만 `'use client'` 선언
- [ ] 페이지 최상위 div에 `page-animate` 클래스
- [ ] 로딩 상태 표시 (Client: `isLoading`, Server: `loading.tsx` / `Suspense`)
- [ ] 에러 상태 표시 (Client: 조건부 렌더, Server: `error.tsx`)
- [ ] 빈 데이터 상태 표시

### API 호출
- [ ] Server Component: `lib/api/server/`에 `async` 함수 작성, `fetch` 캐시 전략 설정
- [ ] Client Component GET: `lib/api/`에 SWR 훅으로 작성
- [ ] Client Component POST/PATCH/DELETE: async 함수로 작성
- [ ] 조건부 fetching 필요 시 SWR에 `null` 전달
- [ ] Mutation 후 `mutate()` 호출하여 캐시 갱신
- [ ] 목록 API는 `PaginatedData<T>` 타입 → `data?.list` 추출

### 폼
- [ ] @repo/schema에서 스키마 + 타입 import
- [ ] `zodResolver(Schema)` 사용
- [ ] `FormInput`, `FormSelect` 등 재사용 컴포넌트 사용
- [ ] 수정 폼에서 null → undefined 변환 처리

### Dialog
- [ ] `BaseDialog` 사용 (Dialog 직접 사용 금지)
- [ ] footer는 BaseDialog prop으로 분리
- [ ] form의 onSubmit 유지 (Enter 키)

### 타입
- [ ] @repo/schema에서 import (중복 정의 금지)
- [ ] 인라인 검증 로직 없는지 확인
