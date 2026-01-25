'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  pageNum: number;
  pages: number;
  onPageChange: (page: number) => void;
  isFirstPage?: boolean;
  isLastPage?: boolean;
}

export function Pagination({
  pageNum,
  pages,
  onPageChange,
  isFirstPage = pageNum === 1,
  isLastPage = pageNum >= pages,
}: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={isFirstPage}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(pageNum - 1)}
        disabled={isFirstPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground px-2">
        {pageNum} / {pages}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(pageNum + 1)}
        disabled={isLastPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(pages)}
        disabled={isLastPage}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
