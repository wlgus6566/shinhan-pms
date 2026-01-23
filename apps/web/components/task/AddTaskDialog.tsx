'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskDifficultyEnum } from '@repo/schema';
import type { CreateTaskRequest } from '@repo/schema';
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
import { Checkbox } from '@/components/ui/checkbox';
import FormSelect from '@/components/form/FormSelect';
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

const difficultyOptions = [
  { value: 'HIGH', label: '상 (High)' },
  { value: 'MEDIUM', label: '중 (Medium)' },
  { value: 'LOW', label: '하 (Low)' },
];

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
              <FormField
                control={form.control}
                name="planningAssigneeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>기획 담당자</FormLabel>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {planningMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">기획팀 멤버가 없습니다</p>
                      ) : (
                        planningMembers.map((member) => (
                          <div key={member.memberId} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(member.member!.id.toString())}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const memberId = member.member!.id.toString();
                                if (checked) {
                                  field.onChange([...currentValue, memberId]);
                                } else {
                                  field.onChange(currentValue.filter((id) => id !== memberId));
                                }
                              }}
                            />
                            <label className="text-sm cursor-pointer">
                              {member.member!.name} ({member.member!.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designAssigneeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>디자인 담당자</FormLabel>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {designMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">디자인팀 멤버가 없습니다</p>
                      ) : (
                        designMembers.map((member) => (
                          <div key={member.memberId} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(member.member!.id.toString())}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const memberId = member.member!.id.toString();
                                if (checked) {
                                  field.onChange([...currentValue, memberId]);
                                } else {
                                  field.onChange(currentValue.filter((id) => id !== memberId));
                                }
                              }}
                            />
                            <label className="text-sm cursor-pointer">
                              {member.member!.name} ({member.member!.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frontendAssigneeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프론트엔드 담당자</FormLabel>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {frontendMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">프론트엔드팀 멤버가 없습니다</p>
                      ) : (
                        frontendMembers.map((member) => (
                          <div key={member.memberId} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(member.member!.id.toString())}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const memberId = member.member!.id.toString();
                                if (checked) {
                                  field.onChange([...currentValue, memberId]);
                                } else {
                                  field.onChange(currentValue.filter((id) => id !== memberId));
                                }
                              }}
                            />
                            <label className="text-sm cursor-pointer">
                              {member.member!.name} ({member.member!.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backendAssigneeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>백엔드 담당자</FormLabel>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {backendMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">백엔드팀 멤버가 없습니다</p>
                      ) : (
                        backendMembers.map((member) => (
                          <div key={member.memberId} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(member.member!.id.toString())}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const memberId = member.member!.id.toString();
                                if (checked) {
                                  field.onChange([...currentValue, memberId]);
                                } else {
                                  field.onChange(currentValue.filter((id) => id !== memberId));
                                }
                              }}
                            />
                            <label className="text-sm cursor-pointer">
                              {member.member!.name} ({member.member!.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
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
