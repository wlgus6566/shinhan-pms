# 프론트엔드 개발 (Next.js + shadcn/ui)

## 초기 설정

### shadcn/ui 설정 (최초 1회)

```bash
cd apps/web

# Tailwind CSS 설정 파일 생성
npx tailwindcss init -p

# shadcn/ui 초기화
npx shadcn@latest init

# 초기화 시 설정:
# - TypeScript: Yes
# - Style: New York
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: tailwind.config.ts
# - Components: @/components
# - Utils: @/lib/utils
```

### 필요한 컴포넌트 설치

```bash
# 기본 컴포넌트 설치
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add alert
npx shadcn@latest add dialog
```

### 유틸리티 함수 (자동 생성됨)

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 디렉토리 구조

```
apps/web/
├── app/
│   ├── globals.css              # Tailwind 기본 스타일
│   └── {feature}/
│       ├── page.tsx             # 목록
│       ├── [id]/
│       │   └── page.tsx         # 상세
│       ├── new/
│       │   └── page.tsx         # 생성
│       └── [id]/edit/
│           └── page.tsx         # 수정
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트 (자동 생성)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   └── ...
│   └── {feature}/               # 기능별 컴포넌트
│       ├── {Feature}List.tsx
│       ├── {Feature}Form.tsx
│       └── {Feature}Detail.tsx
└── lib/
    ├── utils.ts                 # cn() 유틸리티
    └── api/
        └── {feature}.ts         # API 클라이언트
```

## API 클라이언트 작성

```typescript
// lib/api/projects.ts
import {
  ProjectResponseDto,
  CreateProjectDto,
  UpdateProjectDto,
} from '@repo/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getProjects(filters?: {
  search?: string;
  status?: string;
}): Promise<ProjectResponseDto[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(
    `${API_BASE_URL}/api/projects?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error('프로젝트 목록을 불러올 수 없습니다');
  }

  return response.json();
}

export async function getProject(id: string): Promise<ProjectResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);

  if (!response.ok) {
    throw new Error('프로젝트를 찾을 수 없습니다');
  }

  return response.json();
}

export async function createProject(
  data: CreateProjectDto,
): Promise<ProjectResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '프로젝트를 생성할 수 없습니다');
  }

  return response.json();
}

export async function updateProject(
  id: string,
  data: UpdateProjectDto,
): Promise<ProjectResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '프로젝트를 수정할 수 없습니다');
  }

  return response.json();
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('프로젝트를 삭제할 수 없습니다');
  }
}
```

## 컴포넌트 작성 (shadcn/ui 기반)

### 목록 컴포넌트

```typescript
// components/projects/ProjectList.tsx
'use client';

import Link from 'next/link';
import { ProjectResponseDto } from '@repo/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectListProps {
  projects: ProjectResponseDto[];
}

const statusVariants = {
  ACTIVE: 'default',
  COMPLETED: 'secondary',
  SUSPENDED: 'outline',
} as const;

const statusLabels = {
  ACTIVE: '진행중',
  COMPLETED: '완료',
  SUSPENDED: '중단',
} as const;

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        프로젝트가 없습니다
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="hover:bg-accent transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{project.projectName}</CardTitle>
                <Badge variant={statusVariants[project.status as keyof typeof statusVariants]}>
                  {statusLabels[project.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              {project.description && (
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </CardHeader>
            {(project.startDate || project.endDate) && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.startDate && new Date(project.startDate).toLocaleDateString('ko-KR')}
                  {project.startDate && project.endDate && ' ~ '}
                  {project.endDate && new Date(project.endDate).toLocaleDateString('ko-KR')}
                </p>
              </CardContent>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
```

### 폼 컴포넌트 (react-hook-form + zod)

```typescript
// components/projects/ProjectForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from '@repo/api';
import { createProject, updateProject } from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const projectSchema = z.object({
  projectName: z.string()
    .min(2, '프로젝트명은 최소 2자 이상이어야 합니다')
    .max(100, '프로젝트명은 최대 100자까지 입력 가능합니다'),
  description: z.string()
    .max(1000, '설명은 최대 1000자까지 입력 가능합니다')
    .optional()
    .or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'COMPLETED', 'SUSPENDED']).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: '종료일은 시작일 이후여야 합니다',
  path: ['endDate'],
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: ProjectResponseDto;
  mode: 'create' | 'edit';
}

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: project?.projectName || '',
      description: project?.description || '',
      startDate: project?.startDate || '',
      endDate: project?.endDate || '',
      status: project?.status as 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' || 'ACTIVE',
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (mode === 'create') {
        await createProject(data as CreateProjectDto);
        router.push('/projects');
      } else {
        await updateProject(project!.id, data as UpdateProjectDto);
        router.push(`/projects/${project!.id}`);
      }
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : '오류가 발생했습니다',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>프로젝트명 *</FormLabel>
              <FormControl>
                <Input placeholder="프로젝트명을 입력하세요" {...field} />
              </FormControl>
              <FormDescription>
                2-100자 사이로 입력해주세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="프로젝트에 대한 설명을 입력하세요"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                최대 1000자까지 입력 가능합니다
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작일</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>종료일</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {mode === 'edit' && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상태</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="상태를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">진행중</SelectItem>
                    <SelectItem value="COMPLETED">완료</SelectItem>
                    <SelectItem value="SUSPENDED">중단</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? '저장 중...'
              : mode === 'create'
              ? '생성'
              : '수정'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 상세 컴포넌트

```typescript
// components/projects/ProjectDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectResponseDto } from '@repo/api';
import { deleteProject } from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProjectDetailProps {
  project: ProjectResponseDto;
}

const statusLabels = {
  ACTIVE: '진행중',
  COMPLETED: '완료',
  SUSPENDED: '중단',
} as const;

export function ProjectDetail({ project }: ProjectDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      router.push('/projects');
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.projectName}</h1>
          <Badge className="mt-2">
            {statusLabels[project.status as keyof typeof statusLabels]}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${project.id}/edit`)}
          >
            수정
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">삭제</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>프로젝트 삭제</DialogTitle>
                <DialogDescription>
                  정말 삭제하시겠습니까? 삭제된 프로젝트는 복구할 수 없습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>프로젝트 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">설명</h3>
              <p className="mt-1">{project.description}</p>
            </div>
          )}

          {(project.startDate || project.endDate) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">기간</h3>
              <p className="mt-1">
                {project.startDate && new Date(project.startDate).toLocaleDateString('ko-KR')}
                {project.startDate && project.endDate && ' ~ '}
                {project.endDate && new Date(project.endDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">생성일시</h3>
              <p className="mt-1">{new Date(project.createdAt).toLocaleString('ko-KR')}</p>
            </div>
            {project.updatedAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">수정일시</h3>
                <p className="mt-1">{new Date(project.updatedAt).toLocaleString('ko-KR')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => router.push('/projects')}>
        ← 목록으로
      </Button>
    </div>
  );
}
```

## 페이지 작성 (CSR 패턴)

> **중요**: 모든 데이터 페칭은 클라이언트 사이드에서 수행합니다. 페이지 컴포넌트 상단에 `'use client'`를 추가하고 `useEffect`를 사용하여 데이터를 가져옵니다.

### 목록 페이지

```typescript
// app/projects/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectResponseDto } from '@repo/api';
import { getProjects } from '@/lib/api/projects';
import { ProjectList } from '@/components/projects/ProjectList';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">프로젝트 목록</h1>
        <Button asChild>
          <Link href="/projects/new">+ 새 프로젝트</Link>
        </Button>
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
```

### 상세 페이지

```typescript
// app/projects/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectResponseDto } from '@repo/api';
import { getProject } from '@/lib/api/projects';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { Loader2 } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProject(id as string)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        {error || '프로젝트를 찾을 수 없습니다'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProjectDetail project={project} />
    </div>
  );
}
```

### 수정 페이지

```typescript
// app/projects/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectResponseDto } from '@repo/api';
import { getProject } from '@/lib/api/projects';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Loader2 } from 'lucide-react';

export default function EditProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProject(id as string)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        {error || '프로젝트를 찾을 수 없습니다'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">프로젝트 수정</h1>
      <ProjectForm mode="edit" project={project} />
    </div>
  );
}
```

## globals.css 설정

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 체크리스트

- [ ] shadcn/ui 초기화 완료
- [ ] 필요한 컴포넌트 설치 완료
- [ ] Tailwind CSS 설정 완료
- [ ] API 클라이언트 작성 완료
- [ ] Form에 react-hook-form + zod validation 적용
- [ ] 모든 shadcn 컴포넌트 정상 동작
- [ ] 와이어프레임과 기능 일치
- [ ] 에러 처리 구현
- [ ] 로딩 상태 표시
