/**
 * Standard API Response Format
 * Per 06_API_CONTRACTS.md §2.3
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiMeta {
  request_id: string;
  latency_ms?: number;
  page?: number;
  limit?: number;
  total?: number;
}

export function successResponse<T>(
  data: T,
  requestId: string,
  latencyMs?: number,
): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: {
      request_id: requestId,
      latency_ms: latencyMs,
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  requestId: string,
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: { code, message },
    meta: {
      request_id: requestId,
    },
  };
}
