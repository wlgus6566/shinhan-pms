import { SetMetadata } from '@nestjs/common';
import type { SuccessCode } from '@repo/schema';

export const RESPONSE_CODE_KEY = 'response_code';
export const SKIP_RESPONSE_WRAPPER_KEY = 'skip_response_wrapper';

/**
 * Set custom response code for the endpoint
 * @param code Success code (SUC001, SUC002, SUC003)
 */
export const ResponseCode = (code: SuccessCode) =>
  SetMetadata(RESPONSE_CODE_KEY, code);

/**
 * Skip response wrapper for the endpoint (useful for file downloads, etc.)
 */
export const SkipResponseWrapper = () =>
  SetMetadata(SKIP_RESPONSE_WRAPPER_KEY, true);
