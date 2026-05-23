import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();

    // Assign a request ID if not present
    if (!request.id) {
      request.id = crypto.randomUUID();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      })),
    );
  }
}
