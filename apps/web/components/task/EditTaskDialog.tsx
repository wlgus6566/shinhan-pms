'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/form/FormSelect';
import { Loader2 } from 'lucide-react';
import type { ProjectMember } from '@/types/project';
import type { Task, UpdateTaskRequest, TaskStatus } from '@/types/task';

const editTaskSchema = z.object({
  taskName: z.string().min(2, '작업명은 2자 이상이어야 합니다').max(100, '작업명은 100자 이하여야 합니다'),
  description: z.string().max(1000, '작업내용은 1000자 이하여야 합니다').optional(),
  difficulty: z.enum(['HIGH', 'MEDIUM', 'LOW'] as const, {
    required_error: '중요도를 선택하세요',
  }),
  status: z.enum(['WAITING', 'IN_PROGRESS', 'WORK_COMPLETED', 'OPEN_WAITING', 'OPEN_RESPONDING', 'COMPLETED'] as const, {
    required_error: '상태를 선택하세요',
  }),
  clientName: z.string().max(100, '담당 RM은 100자 이하여야 합니다').optional(),
  planningAssigneeId: z.string().optional(),
  designAssigneeId: z.string().optional(),
  frontendAssigneeId: z.string().optional(),
  backendAssigneeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: '종료일은 시작일보다 이후여야 합니다',
  path: ['endDate'],
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

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

  const NONE_VALUE = '_NONE_';

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      taskName: task.taskName,
      description: task.description || '',
      difficulty: task.difficulty,
      status: task.status,
      clientName: task.clientName || '',
      planningAssigneeId: task.planningAssignee?.id || NONE_VALUE,
      designAssigneeId: task.designAssignee?.id || NONE_VALUE,
      frontendAssigneeId: task.frontendAssignee?.id || NONE_VALUE,
      backendAssigneeId: task.backendAssignee?.id || NONE_VALUE,
      startDate: task.startDate || '',
      endDate: task.endDate || '',
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
      planningAssigneeId: task.planningAssignee?.id || NONE_VALUE,
      designAssigneeId: task.designAssignee?.id || NONE_VALUE,
      frontendAssigneeId: task.frontendAssignee?.id || NONE_VALUE,
      backendAssigneeId: task.backendAssignee?.id || NONE_VALUE,
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      notes: task.notes || '',
    });
  }, [task, form]);

  // 파트별 멤버 필터링
  const planningMembers = projectMembers.filter(m => m.workArea === 'PLANNING');
  const designMembers = projectMembers.filter(m => m.workArea === 'DESIGN');
  const frontendMembers = projectMembers.filter(m => m.workArea === 'FRONTEND');
  const backendMembers = projectMembers.filter(m => m.workArea === 'BACKEND');

  const getMemberOptions = (members: ProjectMember[]) => [
    { value: NONE_VALUE, label: '선택 안 함' },
    ...members
      .filter(m => m.member)
      .map(m => ({
        value: m.member!.id.toString(),
        label: `${m.member!.name} (${m.member!.email})`,
      })),
  ];

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
        planningAssigneeId:
          data.planningAssigneeId && data.planningAssigneeId !== NONE_VALUE
            ? Number(data.planningAssigneeId)
            : undefined,
        designAssigneeId:
          data.designAssigneeId && data.designAssigneeId !== NONE_VALUE
            ? Number(data.designAssigneeId)
            : undefined,
        frontendAssigneeId:
          data.frontendAssigneeId && data.frontendAssigneeId !== NONE_VALUE
            ? Number(data.frontendAssigneeId)
            : undefined,
        backendAssigneeId:
          data.backendAssigneeId && data.backendAssigneeId !== NONE_VALUE
            ? Number(data.backendAssigneeId)
            : undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
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

            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>작업명 *</FormLabel>
                  <FormControl>
                    <Input placeholder="메인 페이지 개발" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>작업내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="작업 상세 내용"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당 RM (고객사 이름)</FormLabel>
                  <FormControl>
                    <Input placeholder="신한카드" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="planningAssigneeId"
                label="기획 담당자"
                placeholder="선택 안 함"
                options={getMemberOptions(planningMembers)}
              />

              <FormSelect
                control={form.control}
                name="designAssigneeId"
                label="디자인 담당자"
                placeholder="선택 안 함"
                options={getMemberOptions(designMembers)}
              />

              <FormSelect
                control={form.control}
                name="frontendAssigneeId"
                label="프론트엔드 담당자"
                placeholder="선택 안 함"
                options={getMemberOptions(frontendMembers)}
              />

              <FormSelect
                control={form.control}
                name="backendAssigneeId"
                label="백엔드 담당자"
                placeholder="선택 안 함"
                options={getMemberOptions(backendMembers)}
              />
            </div>

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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비고</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="추가 메모"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
