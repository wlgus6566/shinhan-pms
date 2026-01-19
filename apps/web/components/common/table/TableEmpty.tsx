import { TableCell, TableRow } from '@/components/ui/table';

interface TableEmptyProps {
  colSpan: number;
  message?: string;
}

export function TableEmpty({
  colSpan,
  message = '데이터가 없습니다',
}: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
