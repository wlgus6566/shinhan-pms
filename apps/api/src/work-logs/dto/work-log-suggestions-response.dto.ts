import { createZodDto } from 'nestjs-zod';
import {
  WorkLogContentSuggestionSchema,
  WorkLogSuggestionsResponseSchema,
} from '@repo/schema';

export class ContentSuggestionDto extends createZodDto(
  WorkLogContentSuggestionSchema,
) {}

export class WorkLogSuggestionsResponseDto extends createZodDto(
  WorkLogSuggestionsResponseSchema,
) {}
