// app/lib/error-handler.ts v2.6.0
import { AppError } from '../types';
import { t } from './i18n';

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  AUTH = 'AUTH',
  FIREBASE = 'FIREBASE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorCode {
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  API_ERROR = 'API_ERROR',
  API_RATE_LIMITED = 'API_RATE_LIMITED',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  FIREBASE_ERROR = 'FIREBASE_ERROR',
  FIRESTORE_ERROR = 'FIRESTORE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

const ERROR_KEYS: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_TIMEOUT]: 'errors.networkTimeout',
  [ErrorCode.NETWORK_OFFLINE]: 'errors.networkOffline',
  [ErrorCode.NETWORK_ERROR]: 'errors.networkError',
  [ErrorCode.API_UNAVAILABLE]: 'errors.apiUnavailable',
  [ErrorCode.API_ERROR]: 'errors.apiError',
  [ErrorCode.API_RATE_LIMITED]: 'errors.apiRateLimited',
  [ErrorCode.AUTH_REQUIRED]: 'errors.authRequired',
  [ErrorCode.AUTH_FAILED]: 'errors.authFailed',
  [ErrorCode.AUTH_EXPIRED]: 'errors.authExpired',
  [ErrorCode.FIREBASE_ERROR]: 'errors.firebaseError',
  [ErrorCode.FIRESTORE_ERROR]: 'errors.firestoreError',
  [ErrorCode.VALIDATION_ERROR]: 'errors.validationError',
  [ErrorCode.UNKNOWN_ERROR]: 'errors.unknownError',
};

export function createError(
  code: ErrorCode,
  message?: string,
  details?: unknown
): AppError {
  return {
    code,
    message: message || t(ERROR_KEYS[code]),
    details,
    timestamp: Date.now(),
  };
}

export function handleError(error: unknown): AppError {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return createError(ErrorCode.NETWORK_TIMEOUT);
    }

    if (error.message && error.message.includes('Network')) {
      return createError(ErrorCode.NETWORK_ERROR, error.message);
    }

    const errorRecord = error as unknown as Record<string, unknown>;
    const errorCode = 'code' in errorRecord ? String(errorRecord.code) : error.message;
    
    if (errorCode && errorCode.startsWith('auth/')) {
      switch (errorCode) {
        case 'auth/requires-recent-login':
          return createError(ErrorCode.AUTH_EXPIRED);
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return createError(ErrorCode.AUTH_FAILED);
        default:
          return createError(ErrorCode.AUTH_FAILED, error.message);
      }
    }

    return createError(
      ErrorCode.UNKNOWN_ERROR,
      error.message || t('errors.unknownError'),
      error
    );
  }

  return createError(
    ErrorCode.UNKNOWN_ERROR,
    t('errors.unknownError'),
    error
  );
}

export function logError(error: unknown, context: string): void {
  const appError = handleError(error);

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, appError);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  if (process.env.NODE_ENV === 'production') {
  }
}
