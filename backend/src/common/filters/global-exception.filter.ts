import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: this.getErrorMessage(exception),
        details: this.getErrorDetails(exception),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: (request as any).id || crypto.randomUUID(),
      },
    };

    // Prevent exposing internal errors in production unless needed
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('Unhandled Exception:', exception);
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === 400) return 'VALIDATION_ERROR';
      if (status === 401) return 'AUTH_ERROR';
      if (status === 403) return 'FORBIDDEN';
      if (status === 404) return 'NOT_FOUND';
      if (status === 409) return 'CONFLICT';
      if (status === 429) return 'RATE_LIMIT';
      return 'API_ERROR';
    }
    return 'INTERNAL_SERVER_ERROR';
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        return (response as any).message || exception.message;
      }
      return exception.message;
    }
    return 'An unexpected error occurred';
  }

  private getErrorDetails(exception: unknown): any {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && (response as any).error) {
        return (response as any).error;
      }
    }
    return undefined;
  }
}
