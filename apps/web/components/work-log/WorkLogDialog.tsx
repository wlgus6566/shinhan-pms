'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateWorkLogSchema } from '@repo/schema';
import type { CreateWorkLogRequest, UpdateWorkLogRequest } from '@repo/schema';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Copy, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { WorkLog, MyTask } from '@/types/work-log';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  workLog?: WorkLog | null;
  selectedDate: Date;
  selectedTaskId?: string;
  myTasks: MyTask[];
  previousLog?: WorkLog | null;
  onSubmit: (data: CreateWorkLogRequest | UpdateWorkLogRequest, taskId?: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const WORK_HOURS_PRESETS = [0.5, 1, 2, 4, 8];
const PROGRESS_PRESETS = [0, 25, 50, 75, 100];

export function WorkLogDialog({
  open,
  onOpenChange,
  mode,
  workLog,
  selectedDate,
  selectedTaskId,
  myTasks,
  previousLog,
  onSubmit,
  onDelete,
}: WorkLogDialogProps) {
  const [taskId, setTaskId] = useState<string>(selectedTaskId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CreateWorkLogRequest | UpdateWorkLogRequest>({
    resolver: zodResolver(CreateWorkLogSchema),
    defaultValues: {
      workDate: format(selectedDate, 'yyyy-MM-dd'),
      content: '',
      workHours: undefined,
      progress: undefined,
      issues: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && workLog) {
        setTaskId(workLog.taskId);
        form.reset({
          workDate: workLog.workDate || format(selectedDate, 'yyyy-MM-dd'),
          content: workLog.content,
          workHours: workLog.workHours ?? undefined,
          progress: workLog.progress ?? undefined,
          issues: workLog.issues || '',
        });
      } else {
        setTaskId(selectedTaskId || '');
        form.reset({
          workDate: format(selectedDate, 'yyyy-MM-dd'),
          content: '',
          workHours: undefined,
          progress: undefined,
          issues: '',
        });
      }
    }
  }, [open, mode, workLog, selectedTaskId, selectedDate, form]);

  const handleCopyPrevious = () => {
    if (previousLog) {
      form.setValue('content', previousLog.content);
      form.setValue('workHours', previousLog.workHours ?? undefined);
      form.setValue('progress', previousLog.progress ?? undefined);
      form.setValue('issues', previousLog.issues || '');
    }
  };

  const handleFormSubmit = async (data: CreateWorkLogRequest | UpdateWorkLogRequest) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data, mode === 'create' ? taskId : undefined);
      onOpenChange(false);
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리되므로 여기서는 다이얼로그를 열어둠
      // 로딩 상태만 해제
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '업무일지 작성' : '업무일지 수정'}
          </DialogTitle>
          <DialogDescription>
            {format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
            {/* 업무 선택 */}
            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="task">업무 선택</Label>
                <Select value={taskId} onValueChange={setTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="업무를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {myTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex flex-col">
                          <span>{task.taskName}</span>
                          {task.project && (
                            <span className="text-xs text-slate-500">
                              {task.project.projectName}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {mode === 'edit' && workLog?.task && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700">
                  {workLog.task.taskName}
                </p>
              </div>
            )}

            {/* 작업 내용 */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>작업 내용 *</FormLabel>
                    {mode === 'create' && previousLog && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPrevious}
                        className="h-7 text-xs text-slate-500 hover:text-slate-700"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        어제 일지 복사
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="오늘 진행한 작업 내용을 입력하세요"
                      className="min-h-[120px] resize-none"
                      maxLength={2000}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <p className="text-xs text-slate-500">
                      {field.value?.length || 0}/2000
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* 작업 시간 */}
            <FormField
              control={form.control}
              name="workHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>작업 시간</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="시간"
                        step={0.5}
                        className="w-24"
                      />
                    </FormControl>
                    <span className="flex items-center text-sm text-slate-500">시간</span>
                    <div className="flex gap-1 ml-auto">
                      {WORK_HOURS_PRESETS.map((hours) => (
                        <Button
                          key={hours}
                          type="button"
                          variant={field.value === hours ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => field.onChange(hours)}
                        >
                          {hours}h
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 진행률 */}
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>진행률</FormLabel>
                  <div className="flex gap-2">
                    {PROGRESS_PRESETS.map((p) => (
                      <Button
                        key={p}
                        type="button"
                        variant={field.value === p ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'flex-1 h-9',
                          field.value === p && p === 100 && 'bg-emerald-500 hover:bg-emerald-600'
                        )}
                        onClick={() => field.onChange(p)}
                      >
                        {p}%
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 이슈/블로커 */}
            <FormField
              control={form.control}
              name="issues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이슈/블로커</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="진행 중 발생한 이슈나 블로커가 있다면 입력하세요"
                      className="min-h-[80px] resize-none"
                      maxLength={1000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              {mode === 'edit' && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="mr-auto"
                >
                  {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  삭제
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isDeleting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isDeleting ||
                  (mode === 'create' && !taskId)
                }
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === 'create' ? '작성' : '수정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
