import { TableCell, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface TableLoadingProps {
  colSpan: number;
  message?: string;
}

export function TableLoading({
  colSpan,
  message = '데이터를 불러오는 중...',
}: TableLoadingProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
