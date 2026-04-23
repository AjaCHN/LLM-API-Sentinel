// app/lib/error.ts v2.4.3
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export class FirebaseError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'FirebaseError';
    this.code = code;
  }
}

export class NetworkError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

export function handleError(error: unknown): string {
  if (error instanceof ApiError) {
    return `API Error (${error.code}): ${error.message}`;
  } else if (error instanceof FirebaseError) {
    return `Firebase Error (${error.code}): ${error.message}`;
  } else if (error instanceof NetworkError) {
    return `Network Error (${error.status}): ${error.message}`;
  } else if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return 'Unknown error occurred';
}

export function logError(error: unknown, context?: string) {
  const errorMessage = handleError(error);
  const logMessage = context ? `${context}: ${errorMessage}` : errorMessage;
  console.error(logMessage);
  
  // 这里可以添加错误日志收集逻辑，例如发送到监控服务
  // sendErrorToMonitoring(error, context);
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}
