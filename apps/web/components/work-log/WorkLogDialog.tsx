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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormInput, FormTextarea } from '@/components/form';
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
  onSubmit: (
    data: CreateWorkLogRequest | UpdateWorkLogRequest,
    taskId?: string,
  ) => Promise<void>;
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

  const handleFormSubmit = async (
    data: CreateWorkLogRequest | UpdateWorkLogRequest,
  ) => {
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
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-5"
          >
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-900">
                  작업 내용 *
                </label>
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
              <FormTextarea
                control={form.control}
                name="content"
                placeholder="오늘 진행한 작업 내용을 입력하세요"
                className="min-h-[120px] resize-none"
                rows={5}
                wrapClassName="relative"
                errorMessage={true}
              />
              <div className="flex justify-end mt-1">
                <p className="text-xs text-slate-500">
                  {form.watch('content')?.length || 0}/2000
                </p>
              </div>
            </div>

            {/* 작업 시간 */}
            <div className="flex justify-between items-end space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name="workHours"
                    label="작업 시간"
                    placeholder="시간"
                    type="number"
                    step={0.5}
                    min={0}
                    max={24}
                    errorMessage={true}
                    wrapClassName="mb-0"
                  />
                </div>
                <span className="text-sm text-slate-500 pb-2">시간</span>
              </div>
              <div className="flex gap-1">
                {WORK_HOURS_PRESETS.map((hours) => (
                  <Button
                    key={hours}
                    type="button"
                    variant={
                      form.watch('workHours') === hours ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => form.setValue('workHours', hours)}
                  >
                    {hours}h
                  </Button>
                ))}
              </div>
            </div>

            {/* 진행률 */}
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>진행률</FormLabel>
                    <span className="text-sm font-semibold text-slate-700">
                      {field.value ?? 0}%
                    </span>
                  </div>

                  {/* 슬라이더 + 프로그레스 바 통합 */}
                  <div className="relative py-2">
                    {/* 배경 트랙 */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-slate-200 rounded-full">
                      {/* 진행률 바 */}
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-200',
                          field.value === 100
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500',
                        )}
                        style={{ width: `${field.value ?? 0}%` }}
                      />
                    </div>

                    {/* 슬라이더 */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-indigo-500
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border-2
                        [&::-moz-range-thumb]:border-indigo-500
                        [&::-moz-range-thumb]:shadow-md
                        [&::-moz-range-thumb]:cursor-pointer"
                    />
                  </div>

                  {/* 프리셋 버튼 */}
                  <div className="flex gap-2 mt-3">
                    {PROGRESS_PRESETS.map((p) => (
                      <Button
                        key={p}
                        type="button"
                        variant={field.value === p ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'flex-1 h-8 text-xs',
                          field.value === p &&
                            p === 100 &&
                            'bg-emerald-500 hover:bg-emerald-600',
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
            <FormTextarea
              control={form.control}
              name="issues"
              label="이슈/블로커"
              placeholder="진행 중 발생한 이슈나 블로커가 있다면 입력하세요"
              className="min-h-[80px] resize-none"
              rows={3}
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
                  {isDeleting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
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
                  isSubmitting || isDeleting || (mode === 'create' && !taskId)
                }
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {mode === 'create' ? '작성' : '수정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
