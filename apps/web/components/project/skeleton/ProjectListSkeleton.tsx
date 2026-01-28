'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ProjectListSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-slate-100">
            <TableHead>프로젝트명</TableHead>
            <TableHead>클라이언트</TableHead>
            <TableHead className="text-center">타입</TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead>기간</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-[80px] rounded-full" />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-[60px] rounded-full" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[180px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
