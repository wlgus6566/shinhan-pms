import { z } from 'zod';

export const WorkLogContentSuggestionSchema = z.object({
  content: z.string(),
  lastUsedDate: z.string(),
  usageCount: z.number(),
});

export const WorkLogSuggestionsResponseSchema = z.object({
  suggestions: z.array(WorkLogContentSuggestionSchema),
});

export type WorkLogContentSuggestion = z.infer<
  typeof WorkLogContentSuggestionSchema
>;
export type WorkLogSuggestionsResponse = z.infer<
  typeof WorkLogSuggestionsResponseSchema
>;
