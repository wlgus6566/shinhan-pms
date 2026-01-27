# Custom Hooks

## useUrlQueryParams

URL 쿼리 파라미터를 관리하는 재사용 가능한 커스텀 훅입니다. 페이지네이션, 필터링, 검색 등의 상태를 URL에 저장하여 새로고침 시에도 유지됩니다.

### 기능

- ✅ URL 쿼리 파라미터로 상태 관리
- ✅ 새로고침 시 필터 상태 유지
- ✅ 타입 안전성 (TypeScript)
- ✅ 기본값 설정 가능
- ✅ 기본값과 동일한 값은 URL에서 제거 (깔끔한 URL 유지)
- ✅ 브라우저 히스토리 관리 (replace/push 선택 가능)

### 기본 사용법

```tsx
'use client';

import { useUrlQueryParams } from '@/hooks';

export function MyListComponent() {
  // 기본값 설정
  const { params, setParam, setParams } = useUrlQueryParams({
    defaults: {
      status: 'ALL',
      pageNum: 1,
      pageSize: 10,
    },
  });

  // URL에서 값 읽기
  const status = (params.status as string) || 'ALL';
  const currentPage = (params.pageNum as number) || 1;
  const search = (params.search as string) || '';

  return (
    <div>
      {/* 단일 파라미터 업데이트 */}
      <button onClick={() => setParam('status', 'ACTIVE')}>
        Active만 보기
      </button>

      {/* 여러 파라미터 한번에 업데이트 */}
      <button onClick={() => setParams({ status: 'COMPLETED', pageNum: 1 })}>
        완료된 항목 보기
      </button>
    </div>
  );
}
```

### 실제 예시: Projects 페이지

```tsx
'use client';

import { useUrlQueryParams } from '@/hooks/useUrlQueryParams';
import { useProjects } from '@/lib/api/projects';

export function ProjectListTable() {
  // URL 쿼리 파라미터로 필터 상태 관리
  const { params, setParam, setParams } = useUrlQueryParams({
    defaults: {
      status: 'ALL',
      pageNum: 1,
    },
  });

  const search = (params.search as string) || '';
  const status = (params.status as string) || 'ALL';
  const currentPage = (params.pageNum as number) || 1;

  // API 호출용 파라미터 생성
  const apiParams = useMemo(() => {
    const p: any = { pageNum: currentPage };
    if (search) p.search = search;
    if (status !== 'ALL') p.status = status;
    return p;
  }, [search, status, currentPage]);

  const { projects, pagination, isLoading } = useProjects(apiParams);

  return (
    <div>
      {/* 검색: 검색 시 페이지를 1로 리셋 */}
      <Input
        value={search}
        onChange={(e) => {
          setParams({ search: e.target.value, pageNum: 1 });
        }}
      />

      {/* 필터: 필터 변경 시 페이지를 1로 리셋 */}
      <Select
        value={status}
        onValueChange={(value) => {
          setParams({ status: value, pageNum: 1 });
        }}
      >
        <SelectItem value="ALL">전체</SelectItem>
        <SelectItem value="ACTIVE">진행중</SelectItem>
      </Select>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={pagination?.pages}
        onPageChange={(page) => setParam('pageNum', page)}
      />
    </div>
  );
}
```

### API 참조

#### `useUrlQueryParams(options?)`

**Options:**

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `defaults` | `QueryParams` | `{}` | 쿼리 파라미터 기본값 |
| `replace` | `boolean` | `true` | `true`: history replace, `false`: history push |

**반환값:**

| 속성 | 타입 | 설명 |
|------|------|------|
| `params` | `QueryParams` | 현재 URL 쿼리 파라미터 (기본값 포함) |
| `setParam` | `(key, value) => void` | 단일 파라미터 업데이트 |
| `setParams` | `(params) => void` | 여러 파라미터 한번에 업데이트 |
| `clearParams` | `() => void` | 모든 파라미터 초기화 (기본값으로) |
| `removeParams` | `(...keys) => void` | 특정 파라미터 제거 |

### URL 예시

```
# 기본 페이지 (기본값이므로 URL에 파라미터 없음)
/projects

# 상태 필터 적용
/projects?status=IN_PROGRESS

# 페이지 2로 이동
/projects?status=IN_PROGRESS&pageNum=2

# 검색어 추가
/projects?status=IN_PROGRESS&pageNum=1&search=신한

# 기본값(status=ALL, pageNum=1)으로 돌아가면 URL 깨끗해짐
/projects
```

### 다른 페이지에 적용하기

1. **Users 페이지 예시:**

```tsx
const { params, setParam, setParams } = useUrlQueryParams({
  defaults: {
    role: 'ALL',
    department: 'ALL',
    pageNum: 1,
  },
});
```

2. **Tasks 페이지 예시:**

```tsx
const { params, setParam, setParams } = useUrlQueryParams({
  defaults: {
    status: 'ALL',
    priority: 'ALL',
    assignee: '',
    pageNum: 1,
    pageSize: 20,
  },
});
```

### 주의사항

1. **페이지 컴포넌트에 `'use client'` 필수**
   ```tsx
   'use client'; // 반드시 최상단에 추가
   ```

2. **필터 변경 시 페이지 리셋**
   - 검색이나 필터 변경 시 `pageNum: 1`을 함께 설정하여 첫 페이지로 돌아가도록 합니다.

3. **타입 캐스팅**
   - URL에서 읽은 값은 적절히 타입 캐스팅이 필요합니다.
   - 숫자는 자동 변환되지만, enum 타입 등은 명시적으로 캐스팅하세요.

4. **기본값 활용**
   - 기본값을 설정하면 해당 값일 때 URL에 나타나지 않아 깔끔합니다.
   - 예: `status: 'ALL'`이 기본값이면, ALL 선택 시 URL에 `?status=ALL`이 추가되지 않습니다.

### 테스트 방법

1. **필터 적용**: 상태 필터나 검색어 입력 → URL 변경 확인
2. **새로고침**: F5 또는 브라우저 새로고침 → 필터 상태 유지 확인
3. **뒤로가기**: 브라우저 뒤로가기 → 이전 필터 상태로 복원 확인
4. **URL 직접 입력**: `/projects?status=IN_PROGRESS&pageNum=2` → 해당 상태로 로드 확인
