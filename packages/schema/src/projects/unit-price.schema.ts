import { z } from 'zod';
import { GradeEnum } from '../common/enums';

// 단건 단가 아이템
export const UnitPriceItemSchema = z.object({
  grade: GradeEnum,
  unitPrice: z.number().int().min(0, '단가는 0 이상이어야 합니다'),
  notes: z.string().max(200, '비고는 최대 200자까지 입력 가능합니다').optional().nullable(),
});

// 단가 조회 쿼리
export const GetUnitPricesQuerySchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'YYYY-MM 형식이어야 합니다'),
});

// 단가 일괄 저장 요청 (PUT)
export const SaveUnitPricesSchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'YYYY-MM 형식이어야 합니다'),
  items: z.array(UnitPriceItemSchema).min(1).max(4),
});

// 단가 응답 타입
export const UnitPriceResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  grade: z.string(),
  yearMonth: z.string(),
  unitPrice: z.number(),
  notes: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

// 단가 변경 이력 응답 (저장 단위별)
export const UnitPriceHistoryRowSchema = z.object({
  yearMonth: z.string(),
  EXPERT: z.number().nullable(),
  ADVANCED: z.number().nullable(),
  INTERMEDIATE: z.number().nullable(),
  BEGINNER: z.number().nullable(),
  updatedByName: z.string().nullable(),
  createdAt: z.string(),
});

export type UnitPriceItem = z.infer<typeof UnitPriceItemSchema>;
export type GetUnitPricesQuery = z.infer<typeof GetUnitPricesQuerySchema>;
export type SaveUnitPricesRequest = z.infer<typeof SaveUnitPricesSchema>;
export type UnitPriceResponse = z.infer<typeof UnitPriceResponseSchema>;
export type UnitPriceHistoryRow = z.infer<typeof UnitPriceHistoryRowSchema>;
