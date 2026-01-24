'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskDifficultyEnum, TaskStatusEnum } from '@repo/schema';
import type { UpdateTaskRequest } from '@repo/schema';
import { updateTask } from '@/lib/api/tasks';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { FormInput, FormTextarea, FormSelect, FormCheckboxGroup } from '@/components/form';
import { Loader2 } from 'lucide-react';
import type { ProjectMember } from '@/types/project';
import type { Task, TaskStatus } from '@/types/task';

// Form schema with string IDs for checkboxes (converted to numbers on submit)
const EditTaskFormSchema = z.object({
  taskName: z.string().min(2, '작업명은 2자 이상이어야 합니다').max(100, '작업명은 100자 이하여야 합니다'),
  description: z.string().max(1000, '작업내용은 1000자 이하여야 합니다').optional(),
  difficulty: TaskDifficultyEnum,
  status: TaskStatusEnum,
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

type EditTaskFormValues = z.infer<typeof EditTaskFormSchema>;

interface EditTaskDialogProps {
  task: Task;
  projectMembers: ProjectMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const difficultyOptions = [
  { value: 'HIGH', label: '상 (High)' },
  { value: 'MEDIUM', label: '중 (Medium)' },
  { value: 'LOW', label: '하 (Low)' },
];

const statusOptions = [
  { value: 'WAITING', label: '작업 대기' },
  { value: 'IN_PROGRESS', label: '작업 중' },
  { value: 'WORK_COMPLETED', label: '작업 완료' },
  { value: 'OPEN_WAITING', label: '오픈 대기' },
  { value: 'OPEN_RESPONDING', label: '오픈 대응' },
  { value: 'COMPLETED', label: '완료' },
];

export function EditTaskDialog({ task, projectMembers, open, onOpenChange, onSuccess }: EditTaskDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(EditTaskFormSchema),
    defaultValues: {
      taskName: task.taskName,
      description: task.description || '',
      difficulty: task.difficulty,
      status: task.status,
      clientName: task.clientName || '',
      planningAssigneeIds: task.planningAssignees?.map(a => a.id.toString()) || [],
      designAssigneeIds: task.designAssignees?.map(a => a.id.toString()) || [],
      frontendAssigneeIds: task.frontendAssignees?.map(a => a.id.toString()) || [],
      backendAssigneeIds: task.backendAssignees?.map(a => a.id.toString()) || [],
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      openDate: task.openDate || '',
      notes: task.notes || '',
    },
  });

  // Reset form when task changes
  useEffect(() => {
    form.reset({
      taskName: task.taskName,
      description: task.description || '',
      difficulty: task.difficulty,
      status: task.status,
      clientName: task.clientName || '',
      planningAssigneeIds: task.planningAssignees?.map(a => a.id.toString()) || [],
      designAssigneeIds: task.designAssignees?.map(a => a.id.toString()) || [],
      frontendAssigneeIds: task.frontendAssignees?.map(a => a.id.toString()) || [],
      backendAssigneeIds: task.backendAssignees?.map(a => a.id.toString()) || [],
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      openDate: task.openDate || '',
      notes: task.notes || '',
    });
  }, [task, form]);

  // 파트별 멤버 필터링
  const planningMembers = projectMembers.filter(m => m.workArea === 'PLANNING');
  const designMembers = projectMembers.filter(m => m.workArea === 'DESIGN');
  const frontendMembers = projectMembers.filter(m => m.workArea === 'FRONTEND');
  const backendMembers = projectMembers.filter(m => m.workArea === 'BACKEND');

  const onSubmit = async (data: EditTaskFormValues) => {
    try {
      setSubmitting(true);
      setError(null);

      const requestData: UpdateTaskRequest = {
        taskName: data.taskName,
        description: data.description || undefined,
        difficulty: data.difficulty,
        status: data.status,
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

      await updateTask(task.id, requestData);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.message || '업무 수정에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>업무 수정</DialogTitle>
          <DialogDescription>업무 정보를 수정합니다</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="difficulty"
                label="중요도 *"
                placeholder="중요도 선택"
                options={difficultyOptions}
              />

              <FormSelect
                control={form.control}
                name="status"
                label="상태 *"
                placeholder="상태 선택"
                options={statusOptions}
              />
            </div>

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
              type="date"
            />

            <FormTextarea
              control={form.control}
              name="notes"
              label="비고"
              placeholder="추가 메모"
              className="resize-none"
              rows={2}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    수정 중...
                  </>
                ) : (
                  '수정'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
