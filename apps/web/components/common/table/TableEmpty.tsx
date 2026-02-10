import { TableCell, TableRow } from '@/components/ui/table';
import { Inbox, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function TableEmpty({
  colSpan,
  message = '데이터가 없습니다',
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: TableEmptyProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-60">
        <div className="flex flex-col items-center justify-center gap-3 animate-[fadeIn_0.4s_ease-out]">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400">
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">{message}</p>
            {description && (
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            )}
          </div>
          {actionLabel && onAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAction}
              className="mt-1"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
