import type { PaginationMeta } from '@repo/schema';

/**
 * 페이지네이션 파라미터 파싱 및 skip 계산
 */
export function parsePaginationParams(params: {
  pageNum?: number | string;
  pageSize?: number | string;
}): { pageNum: number; pageSize: number; skip: number } {
  const pageNum =
    typeof params.pageNum === 'string'
      ? parseInt(params.pageNum, 10) || 1
      : params.pageNum ?? 1;
  const pageSize =
    typeof params.pageSize === 'string'
      ? parseInt(params.pageSize, 10) || 10
      : params.pageSize ?? 10;
  const skip = (pageNum - 1) * pageSize;

  return { pageNum, pageSize, skip };
}

export function createPaginationMeta(
  totalCount: number,
  pageNum: number,
  pageSize: number,
): PaginationMeta {
  const pages = Math.ceil(totalCount / pageSize) || 1;
  const isFirstPage = pageNum === 1;
  const isLastPage = pageNum >= pages;
  const hasNextPage = pageNum < pages;
  const nextPage = hasNextPage ? pageNum + 1 : null;

  return {
    totalCount,
    pageNum,
    pageSize,
    pages,
    nextPage,
    isFirstPage,
    isLastPage,
    hasNextPage,
  };
}
