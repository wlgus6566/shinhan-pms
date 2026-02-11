'use client';

import { cn } from '@/lib/utils';
import {
  DIFFICULTY_LABELS,
  type TaskDifficulty,
} from '@/types/task';

const DIFFICULTY_CONFIG: Record<
  TaskDifficulty,
  { filled: number; color: string; dotActive: string; dotInactive: string }
> = {
  HIGH: {
    filled: 3,
    color: 'text-rose-600',
    dotActive: 'bg-rose-500',
    dotInactive: 'bg-rose-200',
  },
  MEDIUM: {
    filled: 2,
    color: 'text-amber-600',
    dotActive: 'bg-amber-500',
    dotInactive: 'bg-amber-200',
  },
  LOW: {
    filled: 1,
    color: 'text-green-600',
    dotActive: 'bg-green-500',
    dotInactive: 'bg-green-200',
  },
};

interface DifficultyIndicatorProps {
  difficulty: TaskDifficulty;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function DifficultyIndicator({
  difficulty,
  showLabel = true,
  size = 'sm',
  className,
}: DifficultyIndicatorProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={cn(
              dotSize,
              'rounded-full transition-colors',
              level <= config.filled ? config.dotActive : config.dotInactive,
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className={cn('text-xs font-medium', config.color)}>
          {DIFFICULTY_LABELS[difficulty]}
        </span>
      )}
    </span>
  );
}
