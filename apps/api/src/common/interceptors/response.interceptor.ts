import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse, SuccessCode } from '@repo/schema';
import { SUCCESS_MESSAGES } from '@repo/schema';
import {
  RESPONSE_CODE_KEY,
  SKIP_RESPONSE_WRAPPER_KEY,
} from '../decorators/response.decorator';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const skipWrapper = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_WRAPPER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipWrapper) {
      return next.handle();
    }

    const responseCode =
      this.reflector.getAllAndOverride<SuccessCode>(RESPONSE_CODE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'SUC001';

    return next.handle().pipe(
      map((data) => ({
        code: responseCode,
        message: SUCCESS_MESSAGES[responseCode],
        data,
      })),
    );
  }
}
