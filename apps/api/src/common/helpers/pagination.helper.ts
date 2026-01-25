import type { PaginationMeta } from '@repo/schema';

/**
 * 페이지네이션 파라미터 파싱 및 skip 계산
 * pageSize=0이면 전체 조회 (달력 등에서 사용)
 */
export function parsePaginationParams(params: {
  pageNum?: number | string;
  pageSize?: number | string;
}): { pageNum: number; pageSize: number; skip: number } {
  const pageNum =
    typeof params.pageNum === 'string'
      ? parseInt(params.pageNum, 10) || 1
      : params.pageNum ?? 1;

  // pageSize: 문자열 "0"도 0으로 파싱해야 함
  let pageSize: number;
  if (typeof params.pageSize === 'string') {
    const parsed = parseInt(params.pageSize, 10);
    pageSize = isNaN(parsed) ? 10 : parsed;
  } else {
    pageSize = params.pageSize ?? 10;
  }

  const skip = (pageNum - 1) * pageSize;

  return { pageNum, pageSize, skip };
}

export function createPaginationMeta(
  totalCount: number,
  pageNum: number,
  pageSize: number,
): PaginationMeta {
  // pageSize=0이면 전체 조회 (달력 등)
  const effectivePageSize = pageSize === 0 ? totalCount : pageSize;
  const pages = effectivePageSize > 0 ? Math.ceil(totalCount / effectivePageSize) : 1;
  const isFirstPage = pageNum === 1;
  const isLastPage = pageNum >= pages;
  const hasNextPage = pageNum < pages;
  const nextPage = hasNextPage ? pageNum + 1 : null;

  return {
    totalCount,
    pageNum,
    pageSize: effectivePageSize,
    pages,
    nextPage,
    isFirstPage,
    isLastPage,
    hasNextPage,
  };
}
