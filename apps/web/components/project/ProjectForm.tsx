'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dynamic from 'next/dynamic';
import {
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput, FormTextarea, FormSelect } from '@/components/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { ProjectStatus } from '@/types/project';

// Hoist static data outside component
const projectTypeOptions = [
  { value: 'OPERATION', label: '운영' },
  { value: 'BUILD', label: '구축' },
] as const;

const projectSchema = z
  .object({
    name: z
      .string()
      .min(2, '프로젝트명은 최소 2자 이상이어야 합니다')
      .max(100, '프로젝트명은 최대 100자까지 입력할 수 있습니다'),
    client: z
      .string()
      .max(100, '클라이언트는 최대 100자까지 입력할 수 있습니다')
      .optional(),
    projectType: z.enum(['OPERATION', 'BUILD'] as const),
    startDate: z.string().min(1, '시작일을 선택하세요'),
    endDate: z.string().min(1, '종료일을 선택하세요'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: '종료일은 시작일 이후여야 합니다',
    path: ['endDate'],
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  mode: 'create' | 'edit';
}

export function ProjectForm({ projectId, mode }: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      client: '',
      projectType: 'BUILD',
      startDate: '',
      endDate: '',
    },
  });

  // Narrow dependencies: remove form from deps (rerender-dependencies)
  useEffect(() => {
    if (mode === 'edit' && projectId) {
      getProject(projectId)
        .then((project) => {
          // Convert ISO date strings to YYYY-MM-DD format
          const startDate = project.startDate ? project.startDate.split('T')[0] : '';
          const endDate = project.endDate ? project.endDate.split('T')[0] : '';

          form.reset({
            name: project.name,
            client: project.client || '',
            projectType: (project.projectType as 'OPERATION' | 'BUILD') || 'BUILD',
            startDate,
            endDate,
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [projectId, mode]); // Removed form from deps

  // Use useCallback for stable callback refs
  const onSubmit = useCallback(
    async (values: ProjectFormValues) => {
      setIsSaving(true);
      setSuccess(false);
      setError(null);

      try {
        if (mode === 'create') {
          await createProject(values);
          router.push('/projects');
        } else if (projectId) {
          await updateProject(projectId, values);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [mode, projectId, router],
  );

  const onDelete = useCallback(async () => {
    if (!projectId) return;

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      router.push('/projects');
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  }, [projectId, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              프로젝트 정보가 업데이트되었습니다
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormInput
          control={form.control}
          name="name"
          label="프로젝트명 *"
          placeholder="프로젝트명을 입력하세요"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="client"
            label="클라이언트"
            placeholder="클라이언트명을 입력하세요"
          />

          <FormSelect
            control={form.control}
            name="projectType"
            label="타입 *"
            placeholder="프로젝트 타입을 선택하세요"
            options={projectTypeOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="startDate"
            label="시작일 *"
            type="date"
          />

          <FormInput
            control={form.control}
            name="endDate"
            label="종료일 *"
            type="date"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? '등록' : '저장'}
          </Button>

          {mode === 'edit' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                  삭제
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>프로젝트 삭제</DialogTitle>
                  <DialogDescription>
                    정말 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수
                    없습니다.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {}}>
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    확인
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </form>
    </Form>
  );
}
