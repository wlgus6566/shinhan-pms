import { z } from 'zod';

// 프로젝트 생성 시 업무 구분 입력
export const TaskTypeInputSchema = z.object({
  name: z.string().min(2, '업무 구분명은 2-50자 사이여야 합니다').max(50),
  description: z.string().max(200, '설명은 최대 200자까지 입력 가능합니다').optional(),
  displayOrder: z.number().int().nonnegative('순서는 0 이상이어야 합니다').optional(),
});

// 프로젝트 수정 시 업무 구분 입력 (id 포함)
export const TaskTypeUpdateInputSchema = z.object({
  id: z.string().optional(), // 기존 업무 구분 ID (없으면 신규 생성)
  name: z.string().min(2, '업무 구분명은 2-50자 사이여야 합니다').max(50),
  description: z.string().max(200, '설명은 최대 200자까지 입력 가능합니다').optional(),
  displayOrder: z.number().int().nonnegative('순서는 0 이상이어야 합니다').optional(),
});

export type TaskTypeInput = z.infer<typeof TaskTypeInputSchema>;
export type TaskTypeUpdateInput = z.infer<typeof TaskTypeUpdateInputSchema>;
