'use client';

import { useState, useEffect } from 'react';
import { BaseDialog } from '@/components/ui/base-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ScheduleForm } from './ScheduleForm';
import type { Schedule, CreateScheduleRequest } from '@/types/schedule';
import {
  createProjectSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '@/lib/api/schedules';
import { useAuth } from '@/context/AuthContext';

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'create' | 'edit';
  schedule?: Schedule | null;
  projectId: string;
  onSuccess: () => void;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  mode,
  schedule,
  projectId,
  onSuccess,
}: ScheduleDialogProps) {
  const { user } = useAuth();
  const [internalMode, setInternalMode] = useState<typeof mode>(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync internal mode with external mode when dialog opens
  useEffect(() => {
    if (open) {
      setInternalMode(mode);
    }
  }, [open, mode]);

  // Reset internal mode when dialog closes
  useEffect(() => {
    if (!open) {
      setInternalMode(mode);
      setIsSubmitting(false);
    }
  }, [open, mode]);

  const handleEdit = () => {
    setInternalMode('edit');
  };

  const handleCancelEdit = () => {
    setInternalMode('view');
  };

  const handleFormSubmit = async (data: CreateScheduleRequest) => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.warn('Already submitting, skipping duplicate request');
      return;
    }

    setIsSubmitting(true);
    try {
      if (internalMode === 'edit' && schedule) {
        // Update
        await updateSchedule(schedule.id, data);
      } else {
        // Create: 연차/반차는 글로벌 일정으로 생성 (projectId 없이)
        const isGlobalLeave =
          data.scheduleType === 'VACATION' || data.scheduleType === 'HALF_DAY';
        if (isGlobalLeave) {
          await createSchedule(data);
        } else {
          await createProjectSchedule(projectId, data);
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await deleteSchedule(schedule.id);
      setShowDeleteConfirm(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDialogTitle = () => {
    if (internalMode === 'view') return '일정 상세';
    if (internalMode === 'edit') return '일정 수정';
    return '새 일정 추가';
  };

  // Check if current user is the creator of the schedule
  const isCreator = schedule && user && schedule.createdBy === String(user.id);

  return (
    <>
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={getDialogTitle()}
    >
      <ScheduleForm
        schedule={internalMode === 'create' ? null : schedule}
        projectId={projectId}
        onSubmit={handleFormSubmit}
        onCancel={
          internalMode === 'view'
            ? () => onOpenChange(false)
            : handleCancelEdit
        }
        isLoading={isSubmitting}
        viewMode={internalMode === 'view'}
        onEdit={internalMode === 'view' && isCreator ? handleEdit : undefined}
        onDelete={internalMode === 'view' && isCreator ? () => setShowDeleteConfirm(true) : undefined}
      />
    </BaseDialog>
    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      onConfirm={handleDelete}
      title="일정 삭제"
      description="정말 이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      confirmLabel="삭제"
      variant="destructive"
    />
    </>
  );
}
