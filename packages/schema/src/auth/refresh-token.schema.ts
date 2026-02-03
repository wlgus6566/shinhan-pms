import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token이 필요합니다'),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
