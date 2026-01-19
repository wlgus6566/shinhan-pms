import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface TableErrorProps {
  colSpan: number;
  message: string;
  onRetry?: () => void;
}

export function TableError({ colSpan, message, onRetry }: TableErrorProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32">
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-rose-600">{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              다시 시도
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
