'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskDifficultyEnum, TASK_DIFFICULTY_OPTIONS } from '@repo/schema';
import type { CreateTaskRequest } from '@repo/schema';
import { createTask } from '@/lib/api/tasks';
import { useProjectTaskTypes } from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Form } from '@/components/ui/form';
import { FormInput, FormTextarea, FormSelect } from '@/components/form';
import { Loader2, Plus, X } from 'lucide-react';
import type { ProjectMember } from '@/types/project';
import { TaskAssigneeTable } from './TaskAssigneeTable';

const AssigneeRowSchema = z.object({
  workArea: z.string(),
  memberId: z.string(),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
});

const AddTaskFormSchema = z.object({
  taskName: z.string().min(2, '작업명은 2자 이상이어야 합니다').max(100, '작업명은 100자 이하여야 합니다'),
  taskTypeId: z.string().min(1, '업무 구분을 선택해주세요'),
  description: z.string().max(1000, '작업내용은 1000자 이하여야 합니다').optional(),
  difficulty: TaskDifficultyEnum,
  clientName: z.string().max(100, '담당 RM은 100자 이하여야 합니다').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assignees: z.array(AssigneeRowSchema).max(10, '담당자는 최대 10명까지 추가할 수 있습니다').default([]),
  openDates: z.array(z.string()).max(3).default([]),
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
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

  const { taskTypes } = useProjectTaskTypes(projectId);

  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(AddTaskFormSchema),
    defaultValues: {
      taskName: '',
      taskTypeId: '',
      description: '',
      difficulty: 'MEDIUM',
      clientName: '',
      startDate: '',
      endDate: '',
      assignees: [],
      openDates: [''],
      notes: '',
    },
  });

  const onSubmit = async (data: AddTaskFormValues) => {
    try {
      setSubmitting(true);
      setError(null);

      const validAssignees = (data.assignees || []).filter(a => a.workArea && a.memberId);

      const requestData: CreateTaskRequest = {
        taskName: data.taskName,
        taskTypeId: Number(data.taskTypeId),
        description: data.description || undefined,
        difficulty: data.difficulty,
        clientName: data.clientName || undefined,
        assignees: validAssignees.map(a => ({
          userId: Number(a.memberId),
          workArea: a.workArea,
          startDate: a.startDate || undefined,
          endDate: a.endDate || undefined,
        })),
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        openDates: data.openDates?.filter(d => d !== '') || undefined,
        notes: data.notes || undefined,
      };

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
      size="xl"
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

          <FormSelect
            control={form.control}
            name="taskTypeId"
            label="업무 구분 *"
            placeholder="업무 구분 선택"
            options={taskTypes?.map(t => ({ value: t.id, label: t.name })) || []}
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
            placeholder="김고객"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <TaskAssigneeTable
            control={form.control}
            setValue={form.setValue}
            name="assignees"
            projectMembers={projectMembers}
          />

          {(() => {
            const openDates = form.watch('openDates') || [''];
            return (
              <div className="space-y-2">
                <label className="text-sm font-medium">오픈일 (상용배포일) - 최대 3건</label>
                {openDates.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">{index + 1}차</span>
                    <input
                      type="datetime-local"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={openDates[index] || ''}
                      onChange={(e) => {
                        const newDates = [...openDates];
                        newDates[index] = e.target.value;
                        form.setValue('openDates', newDates);
                      }}
                    />
                    {openDates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => {
                          const newDates = openDates.filter((_, i) => i !== index);
                          form.setValue('openDates', newDates);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {openDates.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('openDates', [...openDates, ''])}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    오픈일 추가
                  </Button>
                )}
              </div>
            );
          })()}

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
