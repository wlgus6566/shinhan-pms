# 개발 패턴 (Development Patterns)

## 1. 폼 컴포넌트 패턴

### 핵심 원칙
FormField를 직접 사용하는 대신 `@/components/form`의 재사용 가능한 컴포넌트를 사용합니다.

### 사용 가능한 폼 컴포넌트

| 컴포넌트 | 용도 | 사용 예시 |
|---------|------|----------|
| **FormInput** | 텍스트/숫자/날짜 입력 | `<FormInput control={form.control} name="title" label="제목 *" type="text" />` |
| **FormTextarea** | 여러 줄 텍스트 입력 | `<FormTextarea control={form.control} name="description" label="설명" rows={3} />` |
| **FormSelect** | 단일 선택 드롭다운 | `<FormSelect control={form.control} name="type" options={typeOptions} />` |
| **FormCheckbox** | 단일 체크박스 (boolean) | `<FormCheckbox control={form.control} name="isActive" label="활성화" />` |
| **FormCheckboxGroup** | 다중 체크박스 (string[]) | `<FormCheckboxGroup control={form.control} name="assigneeIds" options={members} />` |
| **FormRadioGroup** | 라디오 버튼 그룹 | `<FormRadioGroup control={form.control} name="priority" options={priorities} />` |
| **FormSwitch** | 토글 스위치 | `<FormSwitch control={form.control} name="enabled" label="활성화" />` |

### 금지 패턴

**❌ FormField 직접 사용 금지**:
```typescript
// 나쁜 예
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
```

**✅ 재사용 컴포넌트 사용**:
```typescript
// 좋은 예
<FormInput
  control={form.control}
  name="title"
  label="제목"
/>
```

### 예외 사항

다음 경우에만 FormField 직접 사용 허용:
- 커스텀 UI가 필요한 경우 (예: progress 버튼 그룹)
- 기존 재사용 컴포넌트로 구현 불가능한 특수한 경우

### 폼 검증

React Hook Form + Zod 사용:

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CreateProjectSchema } from '@repo/schema';
import type { CreateProjectRequest } from '@repo/schema';

const form = useForm<CreateProjectRequest>({
  resolver: zodResolver(CreateProjectSchema),
});
```

## 2. Dialog 컴포넌트 패턴

### 핵심 원칙
모든 Dialog는 `BaseDialog`를 사용하여 일관된 UI/UX를 제공합니다.

### Form과 함께 사용하기

Form의 footer는 `<form>` 밖으로 분리하여 BaseDialog의 footer prop으로 전달:

```typescript
<BaseDialog
  open={open}
  onOpenChange={onOpenChange}
  title="프로젝트 등록"
  footer={
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        취소
      </Button>
      <Button onClick={form.handleSubmit(onSubmit)}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        등록
      </Button>
    </div>
  }
>
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* 폼 필드들 (footer 없음) */}
    </form>
  </Form>
</BaseDialog>
```

### 주의사항
- form의 `onSubmit`은 유지 (Enter 키 지원)
- footer 버튼은 `onClick={form.handleSubmit(onSubmit)}` 사용
- error는 BaseDialog의 `error` prop으로 전달 (수동 표시 제거)

### 금지 패턴

```typescript
// ❌ Dialog 직접 사용 금지
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';

// ✅ BaseDialog 사용
import { BaseDialog } from '@/components/ui/base-dialog';
```

## 3. SWR 기반 API 호출 패턴

### 핵심 원칙
모든 API 호출 로직은 `lib/api/` 디렉토리에 통합 관리합니다.

### 패턴 정의

```typescript
// lib/api/{domain}.ts 구조

// 1. GET 요청 → SWR 훅
export function useDomain(params) {
  const { data, error, isLoading, mutate } = useSWR(url);
  return { data, isLoading, error, mutate };
}

// 2. POST/PATCH/DELETE → async 함수
export async function createDomain(data) {
  return fetcher('/api/domain', { method: 'POST', body: data });
}
```

### 조건부 Fetching

SWR에 `null`을 전달하면 요청하지 않습니다:

```typescript
// 단일 항목 조회 - ID 없으면 요청 안 함
export function useProject(id: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null
  );
  return { project: data, isLoading, error, mutate };
}

// 날짜 범위 필수 - 파라미터 없으면 요청 안 함
export function useMyWorkLogs(startDate: string, endDate: string) {
  const url = startDate && endDate
    ? `/api/work-logs/my?startDate=${startDate}&endDate=${endDate}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<WorkLog[]>(url);
  return { workLogs: data, isLoading, error, mutate };
}
```

### 캐시 Revalidation

Mutation 후 관련 캐시를 갱신합니다:

```typescript
// 패턴 1: 부모에서 mutate 전달
const { tasks, mutate } = useTasks(projectId);
<AddTaskDialog onSuccess={() => mutate()} />

// 패턴 2: 전역 mutate 사용
import { useSWRConfig } from 'swr';
const { mutate: globalMutate } = useSWRConfig();
await createTask(projectId, data);
globalMutate(`/api/projects/${projectId}/tasks`);
```

### 금지 사항

```typescript
// ❌ 컴포넌트에서 직접 useSWR 호출 금지
const { data } = useSWR('/api/projects', fetcher);

// ✅ lib/api/의 훅 사용
const { projects } = useProjects();

// ❌ useState + useEffect 패턴 금지
const [data, setData] = useState(null);
useEffect(() => {
  fetchData().then(setData);
}, []);

// ✅ SWR 훅 사용
const { data, isLoading } = useData();
```

## 4. API 응답 구조 표준화

### 핵심 원칙
모든 API 응답은 `ResponseInterceptor`에 의해 표준 래퍼 형식으로 감싸집니다.

### 표준 응답 구조

```typescript
// @repo/schema의 ApiResponse 타입
interface ApiResponse<T> {
  code: string;      // 'SUC001', 'SUC002', 'SUC003' 등
  message: string;   // '처리가 완료되었습니다.' 등
  data: T;           // 실제 데이터
}

// 페이지네이션 응답
interface PaginatedData<T> {
  list: T[];
  totalCount: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  nextPage: number | null;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasNextPage: boolean;
}
```

### Axios Interceptor 동작

`lib/api/fetcher.ts`의 axios interceptor가 자동으로 `data` 필드를 추출합니다:

```typescript
// API 원본 응답
{ code: 'SUC001', message: '...', data: [...] }

// axios interceptor 처리 후 (SWR이 받는 데이터)
[...]  // data 필드만 추출됨
```

### 페이지네이션 응답 처리

목록 조회 API는 페이지네이션 래퍼를 반환하므로, SWR 훅에서 `list` 필드를 추출해야 합니다:

```typescript
import type { PaginatedData } from '@repo/schema';

// ❌ 잘못된 패턴 - 배열을 직접 기대
export function useProjectMembers(projectId: string | null) {
  const { data } = useSWR<ProjectMember[]>(url);  // 타입 오류!
  return { members: data };  // data는 PaginatedData 객체
}

// ✅ 올바른 패턴 - PaginatedData에서 list 추출
export function useProjectMembers(projectId: string | null) {
  const { data } = useSWR<PaginatedData<ProjectMember>>(url);
  return {
    members: data?.list,        // 실제 배열
    totalCount: data?.totalCount,
    // ...기타 페이지네이션 정보
  };
}
```

### 런타임 에러 대응

- `TypeError: xxx.some is not a function` → 배열 대신 객체를 받고 있음
- `TypeError: Cannot read property 'length' of undefined` → `data?.list` 패턴 확인
