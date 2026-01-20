'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { WorkLog, CreateWorkLogRequest, UpdateWorkLogRequest, MyTask } from '@/types/work-log';
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
  const [content, setContent] = useState('');
  const [workHours, setWorkHours] = useState<string>('');
  const [progress, setProgress] = useState<number | undefined>();
  const [issues, setIssues] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && workLog) {
        setTaskId(workLog.taskId);
        setContent(workLog.content);
        setWorkHours(workLog.workHours?.toString() || '');
        setProgress(workLog.progress ?? undefined);
        setIssues(workLog.issues || '');
      } else {
        setTaskId(selectedTaskId || '');
        setContent('');
        setWorkHours('');
        setProgress(undefined);
        setIssues('');
      }
    }
  }, [open, mode, workLog, selectedTaskId]);

  const handleCopyPrevious = () => {
    if (previousLog) {
      setContent(previousLog.content);
      setWorkHours(previousLog.workHours?.toString() || '');
      setProgress(previousLog.progress ?? undefined);
      setIssues(previousLog.issues || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const data: CreateWorkLogRequest | UpdateWorkLogRequest = {
        workDate: format(selectedDate, 'yyyy-MM-dd'),
        content: content.trim(),
        workHours: workHours ? Number(workHours) : undefined,
        progress,
        issues: issues.trim() || undefined,
      };

      await onSubmit(data, mode === 'create' ? taskId : undefined);
      onOpenChange(false);
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">작업 내용 *</Label>
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
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 진행한 작업 내용을 입력하세요"
              className="min-h-[120px] resize-none"
              maxLength={2000}
              required
            />
            <p className="text-xs text-slate-500 text-right">
              {content.length}/2000
            </p>
          </div>

          {/* 작업 시간 */}
          <div className="space-y-2">
            <Label htmlFor="workHours">작업 시간</Label>
            <div className="flex gap-2">
              <Input
                id="workHours"
                type="number"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                placeholder="시간"
                min={0.5}
                max={24}
                step={0.5}
                className="w-24"
              />
              <span className="flex items-center text-sm text-slate-500">시간</span>
              <div className="flex gap-1 ml-auto">
                {WORK_HOURS_PRESETS.map((hours) => (
                  <Button
                    key={hours}
                    type="button"
                    variant={workHours === hours.toString() ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setWorkHours(hours.toString())}
                  >
                    {hours}h
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 진행률 */}
          <div className="space-y-2">
            <Label>진행률</Label>
            <div className="flex gap-2">
              {PROGRESS_PRESETS.map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={progress === p ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'flex-1 h-9',
                    progress === p && p === 100 && 'bg-emerald-500 hover:bg-emerald-600'
                  )}
                  onClick={() => setProgress(p)}
                >
                  {p}%
                </Button>
              ))}
            </div>
          </div>

          {/* 이슈/블로커 */}
          <div className="space-y-2">
            <Label htmlFor="issues">이슈/블로커</Label>
            <Textarea
              id="issues"
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="진행 중 발생한 이슈나 블로커가 있다면 입력하세요"
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
          </div>

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
                !content.trim() ||
                (mode === 'create' && !taskId)
              }
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'create' ? '작성' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
