'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateWorkLogRequest, UpdateWorkLogRequest } from '@repo/schema';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormInput, FormTextarea } from '@/components/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WorkLog, MyTask } from '@/types/work-log';
import { WorkLogSuggestions } from './WorkLogSuggestions';

// 다중 작성용 스키마 (프론트엔드 전용)
const WorkLogEntrySchema = z.object({
  taskId: z.string().min(1, '업무를 선택해주세요'),
  content: z.string().max(2000, '작업 내용은 최대 2000자까지 입력 가능합니다'),
  workHours: z
    .number()
    .min(0.5, '작업 시간은 최소 0.5시간입니다')
    .max(24, '작업 시간은 최대 24시간입니다')
    .optional(),
  progress: z
    .number()
    .min(0, '진행률은 최소 0%입니다')
    .max(100, '진행률은 최대 100%입니다')
    .optional(),
  issues: z
    .string()
    .max(1000, '이슈 내용은 최대 1000자까지 입력 가능합니다')
    .optional(),
});

const MultiWorkLogFormSchema = z.object({
  workDate: z.string(),
  entries: z
    .array(WorkLogEntrySchema)
    .min(1, '최소 1개의 업무일지가 필요합니다'),
});

type MultiWorkLogFormValues = z.infer<typeof MultiWorkLogFormSchema>;

// 다중 제출 결과 타입
export interface MultiSubmitResult {
  success: string[];
  failed: Array<{ taskId: string; error: string }>;
}

interface WorkLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  workLogs?: WorkLog[];
  existingWorkLogs?: WorkLog[];
  selectedDate: Date;
  selectedTaskId?: string;
  myTasks: MyTask[];
  onSubmit: (
    data: CreateWorkLogRequest | UpdateWorkLogRequest,
    taskId?: string,
  ) => Promise<void>;
  onMultiSubmit?: (
    entries: Array<{ taskId: string; data: CreateWorkLogRequest }>,
  ) => Promise<MultiSubmitResult>;
  onMultiUpdate?: (
    updates: Array<{ workLogId: string; data: UpdateWorkLogRequest }>,
  ) => Promise<MultiSubmitResult>;
  onDelete?: () => Promise<void>;
  onDeleteWorkLog?: (workLog: WorkLog) => Promise<void>;
}

const WORK_HOURS_PRESETS = [0.5, 1, 2, 4, 8];
const PROGRESS_PRESETS = [0, 25, 50, 75, 100];

export function WorkLogDialog({
  open,
  onOpenChange,
  mode,
  workLogs = [],
  existingWorkLogs = [],
  selectedDate,
  selectedTaskId,
  myTasks,
  onSubmit,
  onMultiSubmit,
  onMultiUpdate,
  onDelete,
  onDeleteWorkLog,
}: WorkLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // 다중 폼 (생성/수정 모드 통합)
  const multiForm = useForm<MultiWorkLogFormValues>({
    resolver: zodResolver(MultiWorkLogFormSchema),
    defaultValues: {
      workDate: format(selectedDate, 'yyyy-MM-dd'),
      entries: [
        {
          taskId: selectedTaskId || '',
          content: '',
          workHours: undefined,
          progress: undefined,
          issues: '',
        },
      ],
    },
  });

  const { fields } = useFieldArray({
    control: multiForm.control,
    name: 'entries',
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      if (mode === 'edit' && workLogs.length > 0) {
        // 수정 모드: workLogs 배열을 multiForm 엔트리로 변환
        const entries = workLogs.map((log) => ({
          taskId: log.taskId,
          content: log.content,
          workHours: log.workHours ?? undefined,
          progress: log.progress ?? undefined,
          issues: log.issues || '',
        }));

        multiForm.reset({
          workDate: workLogs[0]?.workDate || dateStr,
          entries,
        });
      } else {
        // 생성 모드: 해당 날짜에 미작성된 업무만 엔트리로 생성 (전체 표시)
        const existingTaskIds = new Set(
          existingWorkLogs
            ?.filter((log) => log.workDate === dateStr)
            .map((log) => log.taskId) || [],
        );

        const entries = myTasks
          .filter((task) => !existingTaskIds.has(task.id))
          .map((task) => ({
            taskId: task.id,
            content: '',
            workHours: undefined,
            progress: undefined,
            issues: '',
          }));

        multiForm.reset({
          workDate: dateStr,
          entries: entries.length > 0 ? entries : [],
        });
      }
    }
  }, [open, mode, workLogs, existingWorkLogs, myTasks, selectedDate]);

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

  const handleContentFocus = (index: number) => {
    if (mode === 'create') {
      const taskId = multiForm.watch(`entries.${index}.taskId`);
      if (taskId) {
        setShowSuggestions(index);
      }
    }
  };

  const handleSuggestionSelect = (content: string, index: number) => {
    multiForm.setValue(`entries.${index}.content`, content);
    setShowSuggestions(null);
    textareaRefs.current[index]?.focus();
  };

  // 다중 제출 핸들러 (생성/수정 모드 통합)
  const handleMultiFormSubmit = async (data: MultiWorkLogFormValues) => {
    // 입력값이 있는 엔트리만 필터링 (content가 있거나 progress/workHours가 있는 경우)
    const filledEntries = data.entries.filter(
      (entry) =>
        entry.content?.trim() ||
        entry.workHours !== undefined ||
        entry.progress !== undefined,
    );

    if (filledEntries.length === 0) {
      alert('최소 1개 이상의 업무일지를 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && onMultiUpdate) {
        // 수정 모드: workLogId로 각각 업데이트
        const updates = filledEntries.map((entry, index) => {
          const originalLog = workLogs[index];
          return {
            workLogId: originalLog?.id || '',
            data: {
              workDate: data.workDate,
              content: entry.content,
              workHours: entry.workHours,
              progress: entry.progress,
              issues: entry.issues,
            },
          };
        });

        const result = await onMultiUpdate(updates);

        if (result.failed.length === 0) {
          onOpenChange(false);
        } else {
          const errorMessages = result.failed
            .map(
              (f) =>
                `• ${workLogs.find((l) => l.id === f.taskId)?.task?.taskName || f.taskId}: ${f.error}`,
            )
            .join('\n');
          alert(`일부 업무일지 수정에 실패했습니다:\n${errorMessages}`);
        }
      } else if (mode === 'create' && onMultiSubmit) {
        // 생성 모드
        const entries = filledEntries.map((entry) => ({
          taskId: entry.taskId,
          data: {
            workDate: data.workDate,
            content: entry.content,
            workHours: entry.workHours,
            progress: entry.progress,
            issues: entry.issues,
          },
        }));

        const result = await onMultiSubmit(entries);

        if (result.failed.length === 0) {
          onOpenChange(false);
        } else if (result.success.length > 0) {
          const failedTaskIds = new Set(result.failed.map((f) => f.taskId));
          const remainingEntries = data.entries.filter((entry) =>
            failedTaskIds.has(entry.taskId),
          );
          multiForm.reset({
            workDate: data.workDate,
            entries: remainingEntries,
          });
          const errorMessages = result.failed
            .map(
              (f) =>
                `• ${myTasks.find((t) => t.id === f.taskId)?.taskName || f.taskId}: ${f.error}`,
            )
            .join('\n');
          alert(`일부 업무일지 저장에 실패했습니다:\n${errorMessages}`);
        } else {
          const errorMessages = result.failed
            .map(
              (f) =>
                `• ${myTasks.find((t) => t.id === f.taskId)?.taskName || f.taskId}: ${f.error}`,
            )
            .join('\n');
          alert(`업무일지 저장에 실패했습니다:\n${errorMessages}`);
        }
      } else {
        // fallback: 단일 제출 방식
        const entry = filledEntries[0];
        if (entry) {
          await onSubmit(
            {
              workDate: data.workDate,
              content: entry.content,
              workHours: entry.workHours,
              progress: entry.progress,
              issues: entry.issues,
            },
            entry.taskId,
          );
          onOpenChange(false);
        }
      }
    } catch (error) {
      // 에러 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  // 작성할 업무가 없는 경우 (모든 업무일지가 작성된 경우)
  const noEntriesAvailable = mode === 'create' && fields.length === 0;

  // 공통 엔트리 렌더링 함수
  const renderEntryCard = (index: number) => {
    const currentTaskId = multiForm.watch(`entries.${index}.taskId`);
    const currentTask = myTasks.find((t) => t.id === currentTaskId);
    const workLog = mode === 'edit' ? workLogs[index] : null;

    return (
      <Card key={fields[index]?.id || index} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium">
                {currentTask?.taskName ||
                  workLog?.task?.taskName ||
                  `업무 ${index + 1}`}
              </CardTitle>
              {currentTask?.project && (
                <span className="text-xs text-slate-500">
                  {currentTask.project.projectName}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 작업 내용 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-900">
                작업 내용 *
              </label>
            </div>
            <div className="relative">
              <FormField
                control={multiForm.control}
                name={`entries.${index}.content`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormControl>
                      <textarea
                        {...formField}
                        ref={(e) => {
                          formField.ref(e);
                          textareaRefs.current[index] = e;
                        }}
                        placeholder="오늘 진행한 작업 내용을 입력하세요"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80 resize-none"
                        rows={4}
                        onFocus={() => handleContentFocus(index)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === 'create' && (
                <WorkLogSuggestions
                  taskId={currentTaskId || null}
                  open={showSuggestions === index}
                  onOpenChange={(open) =>
                    setShowSuggestions(open ? index : null)
                  }
                  onSelect={(content) => handleSuggestionSelect(content, index)}
                  anchorRef={{ current: textareaRefs.current[index] ?? null }}
                />
              )}
            </div>
            <div className="flex justify-end mt-1">
              <p className="text-xs text-slate-500">
                {multiForm.watch(`entries.${index}.content`)?.length || 0}/2000
              </p>
            </div>
          </div>

          {/* 작업 시간 */}
          <div className="flex justify-between items-end space-y-2">
            <div className="flex gap-2 items-end">
              <div className="w-[100px]">
                <FormInput
                  control={multiForm.control}
                  name={`entries.${index}.workHours`}
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
            <div className="flex gap-1 flex-1 justify-end">
              {WORK_HOURS_PRESETS.map((hours) => (
                <Button
                  key={hours}
                  type="button"
                  variant={
                    multiForm.watch(`entries.${index}.workHours`) === hours
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    multiForm.setValue(`entries.${index}.workHours`, hours)
                  }
                >
                  {hours}h
                </Button>
              ))}
            </div>
          </div>

          {/* 진행률 */}
          <FormField
            control={multiForm.control}
            name={`entries.${index}.progress`}
            render={({ field: formField }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>진행률</FormLabel>
                  <span className="text-sm font-semibold text-slate-700">
                    {formField.value ?? 0}%
                  </span>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-slate-200 rounded-full">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-200',
                        formField.value === 100
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500',
                      )}
                      style={{ width: `${formField.value ?? 0}%` }}
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={formField.value ?? 0}
                    onChange={(e) => formField.onChange(Number(e.target.value))}
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

                <div className="flex gap-2 mt-3">
                  {PROGRESS_PRESETS.map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={formField.value === p ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'flex-1 h-8 text-xs',
                        formField.value === p &&
                          p === 100 &&
                          'bg-emerald-500 hover:bg-emerald-600',
                      )}
                      onClick={() => formField.onChange(p)}
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
            control={multiForm.control}
            name={`entries.${index}.issues`}
            label="이슈/블로커"
            placeholder="진행 중 발생한 이슈나 블로커가 있다면 입력하세요"
            className="min-h-[60px] resize-none"
            rows={2}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={mode === 'edit' ? '업무일지 수정' : '업무일지 작성'}
      description={format(selectedDate, 'yyyy년 M월 d일 (EEEE)', {
        locale: ko,
      })}
      footer={
        noEntriesAvailable ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
            <Button
              onClick={multiForm.handleSubmit(handleMultiFormSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {mode === 'edit' ? '수정' : '작성'} ({fields.length}건)
            </Button>
          </>
        )
      }
    >
      {noEntriesAvailable ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            모든 업무일지가 작성되었습니다
          </h3>
          <p className="text-slate-500">
            선택한 날짜에 모든 업무에 대한 일지가 이미 작성되어 있습니다.
          </p>
        </div>
      ) : (
        <Form {...multiForm}>
          <form
            onSubmit={multiForm.handleSubmit(handleMultiFormSubmit)}
            className="space-y-4"
          >
            {fields.map((_, index) => renderEntryCard(index))}
          </form>
        </Form>
      )}
    </BaseDialog>
  );
}
