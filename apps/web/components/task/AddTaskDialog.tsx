'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskDifficultyEnum, TASK_DIFFICULTY_OPTIONS } from '@repo/schema';
import type { CreateTaskRequest } from '@repo/schema';
import { createTask } from '@/lib/api/tasks';
import { Button } from '@/components/ui/button';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Form } from '@/components/ui/form';
import { FormInput, FormTextarea, FormSelect, FormCheckboxGroup } from '@/components/form';
import { Loader2 } from 'lucide-react';
import type { ProjectMember } from '@/types/project';

// Form schema with string IDs for checkboxes (converted to numbers on submit)
const AddTaskFormSchema = z.object({
  taskName: z.string().min(2, '작업명은 2자 이상이어야 합니다').max(100, '작업명은 100자 이하여야 합니다'),
  description: z.string().max(1000, '작업내용은 1000자 이하여야 합니다').optional(),
  difficulty: TaskDifficultyEnum,
  clientName: z.string().max(100, '담당 RM은 100자 이하여야 합니다').optional(),
  planningAssigneeIds: z.array(z.string()).optional(),
  designAssigneeIds: z.array(z.string()).optional(),
  frontendAssigneeIds: z.array(z.string()).optional(),
  backendAssigneeIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  openDate: z.string().optional(),
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: '종료일은 시작일보다 이후여야 합니다',
  path: ['endDate'],
});

type AddTaskFormValues = z.infer<typeof AddTaskFormSchema>;

interface AddTaskDialogProps {
  projectId: string;
  projectMembers: ProjectMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTaskDialog({ projectId, projectMembers, open, onOpenChange, onSuccess }: AddTaskDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(AddTaskFormSchema),
    defaultValues: {
      taskName: '',
      description: '',
      difficulty: 'MEDIUM',
      clientName: '',
      planningAssigneeIds: [],
      designAssigneeIds: [],
      frontendAssigneeIds: [],
      backendAssigneeIds: [],
      startDate: '',
      endDate: '',
      openDate: '',
      notes: '',
    },
  });

  // 파트별 멤버 필터링
  const planningMembers = projectMembers.filter(m => m.workArea === 'PLANNING');
  const designMembers = projectMembers.filter(m => m.workArea === 'DESIGN');
  const frontendMembers = projectMembers.filter(m => m.workArea === 'FRONTEND');
  const backendMembers = projectMembers.filter(m => m.workArea === 'BACKEND');

  const onSubmit = async (data: AddTaskFormValues) => {
    try {
      setSubmitting(true);
      setError(null);

      const requestData: CreateTaskRequest = {
        taskName: data.taskName,
        description: data.description || undefined,
        difficulty: data.difficulty,
        clientName: data.clientName || undefined,
        planningAssigneeIds: data.planningAssigneeIds?.map(id => Number(id)),
        designAssigneeIds: data.designAssigneeIds?.map(id => Number(id)),
        frontendAssigneeIds: data.frontendAssigneeIds?.map(id => Number(id)),
        backendAssigneeIds: data.backendAssigneeIds?.map(id => Number(id)),
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        openDate: data.openDate || undefined,
        notes: data.notes || undefined,
      };

      console.log('Form data:', JSON.stringify(data, null, 2));
      console.log('Request data:', JSON.stringify(requestData, null, 2));

      await createTask(projectId, requestData);
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || '업무 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="업무 등록"
      description="새로운 업무를 등록합니다"
      error={error}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                등록 중...
              </>
            ) : (
              '등록'
            )}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            control={form.control}
            name="taskName"
            label="작업명 *"
            placeholder="메인 페이지 개발"
          />

          <FormTextarea
            control={form.control}
            name="description"
            label="작업내용"
            placeholder="작업 상세 내용"
            className="resize-none"
            rows={3}
          />

          <FormSelect
            control={form.control}
            name="difficulty"
            label="난이도 *"
            placeholder="난이도 선택"
            options={TASK_DIFFICULTY_OPTIONS}
          />

          <FormInput
            control={form.control}
            name="clientName"
            label="담당 RM (고객사 이름)"
            placeholder="신한카드"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormCheckboxGroup
              control={form.control}
              name="planningAssigneeIds"
              label="기획 담당자"
              options={planningMembers.map(m => ({
                id: m.member!.id.toString(),
                label: `${m.member!.name} (${m.member!.email})`
              }))}
              emptyMessage="기획팀 멤버가 없습니다"
              maxHeight="max-h-48"
            />

            <FormCheckboxGroup
              control={form.control}
              name="designAssigneeIds"
              label="디자인 담당자"
              options={designMembers.map(m => ({
                id: m.member!.id.toString(),
                label: `${m.member!.name} (${m.member!.email})`
              }))}
              emptyMessage="디자인팀 멤버가 없습니다"
              maxHeight="max-h-48"
            />

            <FormCheckboxGroup
              control={form.control}
              name="frontendAssigneeIds"
              label="프론트엔드 담당자"
              options={frontendMembers.map(m => ({
                id: m.member!.id.toString(),
                label: `${m.member!.name} (${m.member!.email})`
              }))}
              emptyMessage="프론트엔드팀 멤버가 없습니다"
              maxHeight="max-h-48"
            />

            <FormCheckboxGroup
              control={form.control}
              name="backendAssigneeIds"
              label="백엔드 담당자"
              options={backendMembers.map(m => ({
                id: m.member!.id.toString(),
                label: `${m.member!.name} (${m.member!.email})`
              }))}
              emptyMessage="백엔드팀 멤버가 없습니다"
              maxHeight="max-h-48"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="startDate"
              label="시작일"
              type="date"
            />

            <FormInput
              control={form.control}
              name="endDate"
              label="종료일"
              type="date"
            />
          </div>

          <FormInput
            control={form.control}
            name="openDate"
            label="오픈일 (상용배포일)"
            type="datetime-local"
          />

          <FormTextarea
            control={form.control}
            name="notes"
            label="비고"
            placeholder="추가 메모"
            className="resize-none"
            rows={2}
          />
        </form>
      </Form>
    </BaseDialog>
  );
}
