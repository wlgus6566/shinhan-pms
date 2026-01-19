# SWR Hooks

SWR(Stale-While-Revalidate)을 사용한 데이터 패칭 hooks입니다.

## 📚 개요

모든 데이터 패칭에 SWR을 사용합니다:
- ✅ 자동 캐싱
- ✅ 자동 재검증
- ✅ 로딩/에러 상태 관리
- ✅ 뮤테이션 지원
- ✅ 중복 요청 제거
- ✅ 포커스 시 재검증

## 🗂️ Hook 목록

### 프로젝트 관리 (`useProjects.ts`)

```typescript
import { useProjects, useProject } from '@/lib/hooks/useProjects';

// 프로젝트 목록 조회
const { projects, isLoading, error, mutate } = useProjects({
  search: '검색어',
  status: 'IN_PROGRESS'
});

// 단일 프로젝트 조회
const { project, isLoading, error, mutate } = useProject(projectId);
```

### 멤버 관리 (`useUsers.ts`)

```typescript
import { useUsers, useUser } from '@/lib/hooks/useUsers';

// 멤버 목록 조회
const { users, total, isLoading, error, mutate } = useUsers({
  search: '검색어',
  role: 'PM'
});

// 단일 멤버 조회
const { user, isLoading, error, mutate } = useUser(userId);
```

### 프로젝트 멤버 관리 (`useProjectMembers.ts`)

```typescript
import { 
  useProjectMembers, 
  useAvailableMembers 
} from '@/lib/hooks/useProjectMembers';

// 프로젝트 멤버 목록
const { members, isLoading, error, mutate } = useProjectMembers(projectId);

// 추가 가능한 멤버 목록
const { availableMembers, isLoading, error } = useAvailableMembers(projectId);
```

## 🎯 사용 패턴

### 1. 기본 사용법

```typescript
'use client';

import { useProjects } from '@/lib/hooks/useProjects';

export function ProjectList() {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!projects) return <EmptyState />;

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### 2. 검색/필터링

```typescript
'use client';

import { useState } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';

export function UserList() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');

  const params = useMemo(() => ({
    search: search || undefined,
    role: role !== 'ALL' ? role : undefined
  }), [search, role]);

  const { users, isLoading, error } = useUsers(params);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <RoleFilter value={role} onChange={setRole} />
      <UserTable users={users} loading={isLoading} error={error} />
    </>
  );
}
```

### 3. 뮤테이션 (Create/Update/Delete)

```typescript
'use client';

import { useProjects, createProject } from '@/lib/hooks/useProjects';
import { mutate } from 'swr';

export function CreateProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      
      // 전역 캐시 갱신
      mutate('/api/projects');
      
      // 또는 로컬 mutate 사용
      // const { mutate } = useProjects();
      // mutate();
      
      router.push('/projects');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4. 낙관적 업데이트 (Optimistic Update)

```typescript
import { mutate } from 'swr';

const handleDelete = async (id: number) => {
  const url = '/api/projects';
  
  // 현재 데이터 가져오기
  const currentData = await mutate<Project[]>(url);
  
  // 낙관적 업데이트 (즉시 UI 반영)
  mutate(
    url,
    currentData?.filter(p => p.id !== id),
    false // revalidate 비활성화
  );
  
  try {
    // 실제 API 호출
    await deleteProject(id);
    // 성공 시 재검증
    mutate(url);
  } catch (error) {
    // 실패 시 원래 데이터로 복구
    mutate(url, currentData);
  }
};
```

### 5. 조건부 데이터 패칭

```typescript
// ID가 null이면 요청하지 않음
const { project, isLoading } = useProject(projectId);

// 로그인한 경우에만 요청
const { user } = useAuth();
const { data } = useSWR(user ? '/api/profile' : null);
```

### 6. 전역 뮤테이션

```typescript
import { mutate } from 'swr';

// 특정 URL 재검증
mutate('/api/projects');

// 패턴으로 여러 URL 재검증
mutate(key => typeof key === 'string' && key.startsWith('/api/projects'));

// 전체 캐시 무효화
mutate(() => true);
```

## ⚙️ SWR 설정

### 전역 설정 (`swr-provider.tsx`)

```typescript
<SWRConfig
  value={{
    fetcher: (url: string) => fetcher(url),
    revalidateOnFocus: false,      // 포커스 시 재검증 비활성화
    revalidateOnReconnect: true,    // 재연결 시 재검증 활성화
    shouldRetryOnError: false,      // 에러 시 재시도 비활성화
    dedupingInterval: 2000,         // 2초 내 중복 요청 제거
    errorRetryCount: 3,             // 최대 3번 재시도
    errorRetryInterval: 5000,       // 5초 간격으로 재시도
  }}
>
  {children}
</SWRConfig>
```

### Hook별 설정

```typescript
const { data } = useSWR('/api/projects', {
  refreshInterval: 3000,           // 3초마다 자동 갱신
  revalidateOnFocus: true,         // 포커스 시 재검증
  dedupingInterval: 1000,          // 1초 내 중복 요청 제거
});
```

## 🔧 API 함수 사용

### Mutation 함수들

각 hook에서 제공하는 mutation 함수들:

```typescript
// 프로젝트
import { 
  createProject, 
  updateProject, 
  deleteProject 
} from '@/lib/hooks/useProjects';

// 멤버
import { 
  createUser, 
  updateUser, 
  deactivateUser 
} from '@/lib/hooks/useUsers';

// 프로젝트 멤버
import { 
  addProjectMember, 
  updateProjectMemberRole, 
  removeProjectMember 
} from '@/lib/hooks/useProjectMembers';
```

## 📋 체크리스트

### Hook 사용 시

- [ ] `'use client'` 선언 확인
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 빈 데이터 상태 처리
- [ ] mutate 후 캐시 갱신

### 성능 최적화

- [ ] 불필요한 재검증 비활성화
- [ ] 검색/필터 파라미터 메모이제이션
- [ ] 조건부 데이터 패칭 활용
- [ ] 중복 요청 방지

## 🎨 컴포넌트 예시

### 완전한 목록 페이지 예시

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useProjects } from '@/lib/hooks/useProjects';
import { TableLoading, TableError, TableEmpty } from '@/components/common/table';

export function ProjectListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const params = useMemo(() => ({
    search: search || undefined,
    status: status !== 'ALL' ? status : undefined
  }), [search, status]);

  const { projects, isLoading, error, mutate } = useProjects(params);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1>프로젝트 관리</h1>
        <button onClick={() => router.push('/projects/new')}>
          새 프로젝트
        </button>
      </div>

      <div className="flex gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <StatusFilter value={status} onChange={setStatus} />
      </div>

      <div className="bg-white rounded-2xl">
        <table>
          <thead>...</thead>
          <tbody>
            {isLoading ? (
              <TableLoading colSpan={7} />
            ) : error ? (
              <TableError 
                colSpan={7} 
                message={error.message} 
                onRetry={() => mutate()} 
              />
            ) : !projects?.length ? (
              <TableEmpty colSpan={7} />
            ) : (
              projects.map(project => (
                <ProjectRow key={project.id} project={project} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 🚀 마이그레이션 가이드

### Before (기존 방식)

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetch() {
    setLoading(true);
    try {
      const result = await getProjects();
      setData(result);
    } finally {
      setLoading(false);
    }
  }
  fetch();
}, []);
```

### After (SWR)

```typescript
const { projects, isLoading } = useProjects();
```

## 📚 참고 자료

- [SWR 공식 문서](https://swr.vercel.app/)
- [SWR Examples](https://swr.vercel.app/examples/basic)
- [Best Practices](https://swr.vercel.app/docs/advanced/performance)
