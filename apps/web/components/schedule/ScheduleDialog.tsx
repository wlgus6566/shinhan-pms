'use client';

import { useState, useEffect } from 'react';
import { BaseDialog } from '@/components/ui/base-dialog';
import { ScheduleForm } from './ScheduleForm';
import type { Schedule, CreateScheduleRequest } from '@/types/schedule';
import {
  createProjectSchedule,
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
        // Create
        await createProjectSchedule(projectId, data);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('일정 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule || !confirm('정말 이 일정을 삭제하시겠습니까?')) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteSchedule(schedule.id);
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('일정 삭제에 실패했습니다.');
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
        onDelete={internalMode === 'view' && isCreator ? handleDelete : undefined}
      />
    </BaseDialog>
  );
}
