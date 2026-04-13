import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

/**
 * Logging interceptor per 04_BACKEND_SPEC.md §7
 * JSON structured logging with request_id, service, latency
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const requestId = (request.headers['x-request-id'] as string) || 'unknown';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const latency = Date.now() - start;
        this.logger.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            service: 'api-gateway',
            level: 'info',
            request_id: requestId,
            method,
            url,
            latency_ms: latency,
            message: 'request completed',
          }),
        );
      }),
    );
  }
}
