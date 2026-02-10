import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { ApiResponse, ErrorCode } from '@repo/schema';
import { ERROR_MESSAGES } from '@repo/schema';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (process.env.NODE_ENV === 'production') {
      const message = exception instanceof HttpException
        ? exception.message
        : 'Internal server error';
      console.error(`[HttpExceptionFilter] ${message}`);
    } else {
      console.error('[HttpExceptionFilter] Caught exception:', exception);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.ERR005;
    let code: ErrorCode = 'ERR005';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extract message from exception response
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message;
        }
      }

      // Map HTTP status to error code
      code = this.mapStatusToErrorCode(status);
    }

    const errorResponse: ApiResponse<null> = {
      code,
      message,
      data: null,
    };

    // Fastify uses .code() instead of .status()
    if (typeof response.code === 'function') {
      response.code(status).send(errorResponse);
    } else {
      response.status(status).json(errorResponse);
    }
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'ERR001';
      case HttpStatus.UNAUTHORIZED:
        return 'ERR002';
      case HttpStatus.FORBIDDEN:
        return 'ERR003';
      case HttpStatus.NOT_FOUND:
        return 'ERR004';
      default:
        return 'ERR005';
    }
  }
}
