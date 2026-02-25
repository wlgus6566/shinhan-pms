'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {
  CreateWorkLogRequest,
  UpdateWorkLogRequest,
} from '@/types/work-log';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, History, FolderOpen, Plus, X } from 'lucide-react';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
}: WorkLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const { fields, append, remove } = useFieldArray({
    control: multiForm.control,
    name: 'entries',
  });

  // 생성 모드: 업무 추가용 select 상태
  const [selectedTaskToAdd, setSelectedTaskToAdd] = useState<string>('');

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
        // 생성 모드: 미작성 업무 중 첫 번째를 자동 추가
        const existingTaskIds = new Set(
          existingWorkLogs
            ?.filter((log) => log.workDate === dateStr)
            .map((log) => log.taskId) || [],
        );

        const unloggedTasks = myTasks.filter(
          (task) => !existingTaskIds.has(task.id),
        );

        // selectedTaskId가 있으면 해당 업무를 우선, 없으면 첫 번째 미작성 업무
        const firstTask = selectedTaskId
          ? unloggedTasks.find((t) => t.id === selectedTaskId) || unloggedTasks[0]
          : unloggedTasks[0];

        const initialEntries = firstTask
          ? [
              {
                taskId: firstTask.id,
                content: '',
                workHours: undefined as number | undefined,
                progress: undefined as number | undefined,
                issues: '',
              },
            ]
          : [];

        multiForm.reset({
          workDate: dateStr,
          entries: initialEntries,
        });
        setSelectedTaskToAdd('');
      }
    }
  }, [open, mode, workLogs, existingWorkLogs, myTasks, selectedDate]);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowSuggestions = (index: number) => {
    const taskId = multiForm.watch(`entries.${index}.taskId`);
    if (taskId) {
      setShowSuggestions(showSuggestions === index ? null : index);
    }
  };

  const handleSuggestionSelect = (content: string, index: number) => {
    multiForm.setValue(`entries.${index}.content`, content);
    setShowSuggestions(null);
    textareaRefs.current[index]?.focus();
  };

  // 다중 제출 핸들러 (생성/수정 모드 통합)
  const handleMultiFormSubmit = async (data: MultiWorkLogFormValues) => {
    // 작업 내용이 있는 엔트리만 필터링
    const filledEntries = data.entries.filter(
      (entry) => entry.content?.trim(),
    );

    if (filledEntries.length === 0) {
      toast.warning('최소 1개 이상의 업무일지를 작성해주세요.');
      return;
    }

    // 작성된 엔트리에 대해 작업시간/진행률 필수 검증
    let hasValidationError = false;
    data.entries.forEach((entry, index) => {
      if (entry.content?.trim()) {
        if (entry.workHours === undefined || entry.workHours === null) {
          multiForm.setError(`entries.${index}.workHours`, {
            message: '작업 시간을 입력해주세요',
          });
          hasValidationError = true;
        }
        if (entry.progress === undefined || entry.progress === null) {
          multiForm.setError(`entries.${index}.progress`, {
            message: '진행률을 선택해주세요',
          });
          hasValidationError = true;
        }
      }
    });

    if (hasValidationError) {
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
          toast.error(`일부 업무일지 수정에 실패했습니다`);
        }
      } else if (mode === 'create' && onMultiSubmit) {
        // 생성 모드
        const entries = filledEntries.map((entry) => ({
          taskId: entry.taskId,
          data: {
            workDate: data.workDate,
            content: entry.content,
            workHours: entry.workHours!,
            progress: entry.progress!,
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
          toast.error(`일부 업무일지 저장에 실패했습니다`);
        } else {
          const errorMessages = result.failed
            .map(
              (f) =>
                `• ${myTasks.find((t) => t.id === f.taskId)?.taskName || f.taskId}: ${f.error}`,
            )
            .join('\n');
          toast.error(`업무일지 저장에 실패했습니다`);
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

  // 프로젝트별 그룹핑
  const projectGroups = useMemo(() => {
    const groups: {
      projectId: string;
      projectName: string;
      indices: number[];
    }[] = [];
    const projectMap = new Map<string, number>();

    fields.forEach((_, index) => {
      const taskId = multiForm.getValues(`entries.${index}.taskId`);
      const task = myTasks.find((t) => t.id === taskId);
      const workLog = mode === 'edit' ? workLogs[index] : null;

      const projectId =
        task?.projectId || workLog?.task?.projectId || 'unknown';
      const projectName = task?.project?.projectName || '프로젝트 미지정';

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, groups.length);
        groups.push({ projectId, projectName, indices: [] });
      }
      groups[projectMap.get(projectId)!]!.indices.push(index);
    });

    return groups;
  }, [fields, myTasks, workLogs, mode, multiForm]);

  // 생성 모드: 추가 가능한 업무 목록 (이미 추가된 업무 + 기존 작성된 업무 제외)
  const availableTasks = useMemo(() => {
    if (mode !== 'create') return [];

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingTaskIds = new Set(
      existingWorkLogs
        ?.filter((log) => log.workDate === dateStr)
        .map((log) => log.taskId) || [],
    );

    const addedTaskIds = new Set(
      fields.map((_, index) => multiForm.getValues(`entries.${index}.taskId`)),
    );

    return myTasks.filter(
      (task) => !existingTaskIds.has(task.id) && !addedTaskIds.has(task.id),
    );
  }, [mode, myTasks, existingWorkLogs, selectedDate, fields, multiForm]);

  // 업무 추가 핸들러
  const handleAddTask = () => {
    if (!selectedTaskToAdd) return;

    append({
      taskId: selectedTaskToAdd,
      content: '',
      workHours: undefined,
      progress: undefined,
      issues: '',
    });
    setSelectedTaskToAdd('');
  };

  // 업무 제거 핸들러
  const handleRemoveEntry = (index: number) => {
    remove(index);
  };

  // 모든 업무일지가 이미 작성된 경우
  const allTasksLogged = mode === 'create' && availableTasks.length === 0 && fields.length === 0;

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
            </div>
            {mode === 'create' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                onClick={() => handleRemoveEntry(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 작업 내용 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-900">
                작업 내용 *
              </label>
              {mode === 'create' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-slate-700 gap-1"
                  onClick={() => handleShowSuggestions(index)}
                >
                  <History className="h-3 w-3" />
                  이전내역
                </Button>
              )}
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
          <div className="flex sm:justify-between space-y-2 flex-col sm:flex-row sm:items-end">
            <div className="flex gap-2 items-end">
              <div className="w-[100px]">
                <FormInput
                  control={multiForm.control}
                  name={`entries.${index}.workHours`}
                  label="작업 시간 *"
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
            <div className="flex gap-1 flex-1 sm:justify-end">
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
                  <FormLabel>진행률 *</FormLabel>
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
    <>
      <BaseDialog
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title={mode === 'edit' ? '업무일지 수정' : '업무일지 작성'}
        description={format(selectedDate, 'yyyy년 M월 d일 (EEEE)', {
          locale: ko,
        })}
        footer={
          allTasksLogged ? (
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
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isDeleting}
              >
                취소
              </Button>
              {mode === 'edit' && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                  loading={isDeleting}
                >
                  삭제
                </Button>
              )}
              <Button
                onClick={multiForm.handleSubmit(handleMultiFormSubmit)}
                disabled={isSubmitting || isDeleting || fields.length === 0}
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {mode === 'edit' ? '수정' : '작성'}
              </Button>
            </>
          )
        }
      >
        {allTasksLogged ? (
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
              className="space-y-6"
            >
              {/* 생성 모드: 업무 추가 셀렉터 */}
              {mode === 'create' && availableTasks.length > 0 && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      업무 선택
                    </label>
                    <Select
                      value={selectedTaskToAdd}
                      onValueChange={setSelectedTaskToAdd}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="작성할 업무를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            <span className="text-xs text-muted-foreground mr-1">
                              [{task.project?.projectName || '프로젝트 미지정'}]
                            </span>
                            {task.taskName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTask}
                    disabled={!selectedTaskToAdd}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    추가
                  </Button>
                </div>
              )}

              {/* 프로젝트별 그룹핑된 업무 카드 */}
              {projectGroups.map((group) => (
                <div key={group.projectId} className="space-y-3">
                  {/* 프로젝트 그룹 헤더 */}
                  <div className="flex items-center gap-2 px-1">
                    <FolderOpen className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-700">
                      {group.projectName}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {group.indices.length}건
                    </span>
                    <div className="flex-1 border-t border-slate-200 ml-2" />
                  </div>
                  {/* 프로젝트 내 업무 카드 */}
                  <div className="space-y-3 pl-2">
                    {group.indices.map((index) => renderEntryCard(index))}
                  </div>
                </div>
              ))}
            </form>
          </Form>
        )}
      </BaseDialog>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="업무일지 삭제"
        description="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
      />
    </>
  );
}
