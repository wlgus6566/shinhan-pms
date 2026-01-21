'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateTaskFormSchema,
  type CreateTaskFormInput,
} from '@repo/schema';
import { createTask } from '@/lib/api/tasks';
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
import type { CreateTaskRequest } from '@/types/task';

interface AddTaskDialogProps {
  projectId: string;
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

export function AddTaskDialog({ projectId, projectMembers, open, onOpenChange, onSuccess }: AddTaskDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const NONE_VALUE = '_NONE_';

  const form = useForm<CreateTaskFormInput>({
    resolver: zodResolver(CreateTaskFormSchema),
    defaultValues: {
      taskName: '',
      description: '',
      difficulty: 'MEDIUM',
      clientName: '',
      planningAssigneeId: NONE_VALUE,
      designAssigneeId: NONE_VALUE,
      frontendAssigneeId: NONE_VALUE,
      backendAssigneeId: NONE_VALUE,
      startDate: '',
      endDate: '',
      notes: '',
    },
  });

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

  const onSubmit = async (data: CreateTaskFormInput) => {
    try {
      setSubmitting(true);
      setError(null);

      const requestData: CreateTaskRequest = {
        taskName: data.taskName,
        description: data.description || undefined,
        difficulty: data.difficulty,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>업무 등록</DialogTitle>
          <DialogDescription>새로운 업무를 등록합니다</DialogDescription>
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

            <FormSelect
              control={form.control}
              name="difficulty"
              label="중요도 *"
              placeholder="중요도 선택"
              options={difficultyOptions}
            />

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
                    등록 중...
                  </>
                ) : (
                  '등록'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
