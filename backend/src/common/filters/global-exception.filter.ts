import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { errorResponse } from '../response';

/**
 * Global exception filter
 * Ensures ALL errors conform to the API response contract (06_API_CONTRACTS.md §2.4)
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, any>;
        message = res.message
          ? Array.isArray(res.message)
            ? res.message.join(', ')
            : res.message
          : message;
        code = res.error || code;
      }

      // Map HTTP status to error codes
      if (status === 400) code = 'INVALID_INPUT';
      if (status === 401) code = 'UNAUTHORIZED';
      if (status === 403) code = 'FORBIDDEN';
      if (status === 404) code = 'NOT_FOUND';
      if (status === 429) code = 'RATE_LIMITED';
    }

    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} → ${status} ${code}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse(code, message, requestId));
  }
}
