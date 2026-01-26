import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  error?: string | null;
  className?: string;
}

export function BaseDialog({
  open,
  onOpenChange,
  size = 'md',
  title,
  description,
  children,
  footer,
  error,
  className,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'overflow-hidden flex flex-col',
          size === 'sm' && 'sm:max-w-[500px]',
          size === 'md' && 'sm:max-w-[600px]',
          size === 'lg' && 'max-w-2xl',
          className,
        )}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background z-10 border-b pb-4 -mx-6 px-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          {children}
        </div>

        {/* Sticky Footer (optional) */}
        {footer && (
          <div className="sticky bottom-0 bg-background z-10 border-t pt-4 -mx-6 px-6">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
