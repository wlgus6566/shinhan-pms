import { z } from 'zod';

// ===== Success Codes =====
export const SuccessCodeEnum = z.enum(['SUC001', 'SUC002', 'SUC003']);
export type SuccessCode = z.infer<typeof SuccessCodeEnum>;

export const SUCCESS_MESSAGES: Record<SuccessCode, string> = {
  SUC001: '처리가 완료되었습니다.',
  SUC002: '생성이 완료되었습니다.',
  SUC003: '삭제가 완료되었습니다.',
};

// ===== Error Codes =====
export const ErrorCodeEnum = z.enum([
  'ERR001', // 잘못된 요청
  'ERR002', // 인증 실패
  'ERR003', // 권한 없음
  'ERR004', // 리소스 없음
  'ERR005', // 서버 오류
]);
export type ErrorCode = z.infer<typeof ErrorCodeEnum>;

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  ERR001: '잘못된 요청입니다.',
  ERR002: '인증에 실패했습니다.',
  ERR003: '접근 권한이 없습니다.',
  ERR004: '요청한 리소스를 찾을 수 없습니다.',
  ERR005: '서버 오류가 발생했습니다.',
};

// ===== Pagination =====
export interface PaginationParams {
  pageNum?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  totalCount: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  nextPage: number | null;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasNextPage: boolean;
}

// ===== Generic Response Types =====
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface PaginatedData<T> extends PaginationMeta {
  list: T[];
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
