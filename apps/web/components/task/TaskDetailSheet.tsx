'use client';

import { useState, useCallback, memo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { STATUS_LABELS, STATUS_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type Task } from '@/types/task';
import { Calendar, User, Clock, AlertCircle, FileText, Edit, Trash2 } from 'lucide-react';

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPM?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

// Hoist static dialog text to prevent recreation (rendering-hoist-jsx)
const DeleteDialogContent = memo(() => (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle>업무 삭제</AlertDialogTitle>
      <AlertDialogDescription>
        정말로 이 업무를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialogFooter>
  </>
));
DeleteDialogContent.displayName = 'DeleteDialogContent';

export function TaskDetailSheet({ task, open, onOpenChange, isPM = false, onEdit, onDelete }: TaskDetailSheetProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Use useCallback for stable function references (rerender-functional-setstate)
  const handleEdit = useCallback(() => {
    if (onEdit && task) {
      onEdit(task);
    }
  }, [onEdit, task]);

  const handleDelete = useCallback(() => {
    if (onDelete && task) {
      onDelete(task.id);
      setDeleteDialogOpen(false);
    }
  }, [onDelete, task]);

  if (!task) return null;

  const assignees = [
    { label: '기획 담당자', assignee: task.planningAssignee, icon: User },
    { label: '디자인 담당자', assignee: task.designAssignee, icon: User },
    { label: '프론트엔드 담당자', assignee: task.frontendAssignee, icon: User },
    { label: '백엔드 담당자', assignee: task.backendAssignee, icon: User },
  ].filter(a => a.assignee);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <SheetTitle className="text-xl font-bold leading-tight pr-8">
              {task.taskName}
            </SheetTitle>
            {isPM && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Badge className={DIFFICULTY_COLORS[task.difficulty]}>
              중요도: {DIFFICULTY_LABELS[task.difficulty]}
            </Badge>
            <Badge className={STATUS_COLORS[task.status]}>
              {STATUS_LABELS[task.status]}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* RM 정보 */}
          {task.clientName && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                RM (요청 관리자)
              </h3>
              <div className="pl-6">
                <p className="text-base font-medium">{task.clientName}</p>
              </div>
            </div>
          )}

          {/* 담당자 정보 */}
          {assignees.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  담당자
                </h3>
                <div className="space-y-2 pl-6">
                  {assignees.map(({ label, assignee }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{assignee?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 기간 정보 */}
          {(task.startDate || task.endDate) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  작업 기간
                </h3>
                <div className="pl-6 flex items-center gap-2 text-base">
                  {task.startDate && <span>{task.startDate}</span>}
                  {task.startDate && task.endDate && <span className="text-muted-foreground">~</span>}
                  {task.endDate && <span>{task.endDate}</span>}
                </div>
              </div>
            </>
          )}

          {/* 설명 */}
          {task.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  업무 설명
                </h3>
                <div className="pl-6">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>
            </>
          )}

          {/* 비고 */}
          {task.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  비고
                </h3>
                <div className="pl-6">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* 생성/수정 정보 */}
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              정보
            </h3>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              {task.createdAt && (
                <p>생성일: {new Date(task.createdAt).toLocaleString('ko-KR')}</p>
              )}
              {task.updatedAt && (
                <p>수정일: {new Date(task.updatedAt).toLocaleString('ko-KR')}</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <DeleteDialogContent />
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
