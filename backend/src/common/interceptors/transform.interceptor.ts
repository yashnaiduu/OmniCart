import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';
import { successResponse } from '../response';

/**
 * Transform interceptor
 * Wraps ALL successful responses in the standard API response envelope
 * Per 06_API_CONTRACTS.md §2.3
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || 'unknown';
    const start = Date.now();

    return next.handle().pipe(
      map((data) => {
        // If response is already in API format, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        const latencyMs = Date.now() - start;
        return successResponse(data, requestId, latencyMs);
      }),
    );
  }
}
