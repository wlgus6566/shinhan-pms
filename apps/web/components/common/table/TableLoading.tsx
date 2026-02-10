import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface TableLoadingProps {
  colSpan: number;
  rows?: number;
  message?: string;
}

export function TableLoading({
  colSpan,
  rows = 5,
  message,
}: TableLoadingProps) {
  if (message) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={colSpan} className="h-32">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-[bounce_0.6s_ease-in-out_infinite]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-[bounce_0.6s_ease-in-out_0.15s_infinite]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" />
            </div>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {Array.from({ length: colSpan }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton
                className="h-4"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
