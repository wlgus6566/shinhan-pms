import type { PaginatedData, PaginationMeta, PaginationParams } from '@repo/schema';

/**
 * PaginatedData에서 페이지네이션 메타 정보 추출
 */
export function extractPagination<T>(
  data: PaginatedData<T> | undefined,
): PaginationMeta | undefined {
  if (!data) return undefined;

  return {
    totalCount: data.totalCount,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
    pages: data.pages,
    nextPage: data.nextPage,
    isFirstPage: data.isFirstPage,
    isLastPage: data.isLastPage,
    hasNextPage: data.hasNextPage,
  };
}

/**
 * 페이지네이션 파라미터를 URLSearchParams에 추가
 */
export function appendPaginationParams(
  query: URLSearchParams,
  params: PaginationParams,
): void {
  if (params.pageNum) query.append('pageNum', String(params.pageNum));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));
}

/**
 * URL 쿼리 스트링 생성 (? 포함)
 */
export function buildQueryString(query: URLSearchParams): string {
  const str = query.toString();
  return str ? `?${str}` : '';
}

// Re-export PaginationParams for convenience
export type { PaginationParams };
