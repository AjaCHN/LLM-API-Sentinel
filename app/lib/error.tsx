// app/lib/error.tsx v2.5.1
import React from 'react';
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
    if ('code' in errorRecord && typeof errorRecord.code === 'string' && errorRecord.code.startsWith('auth/')) {
      const code = errorRecord.code;
      switch (code) {
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const appError = handleError(error);
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: unknown, _errorInfo: React.ErrorInfo): void {
    logError(error, 'ErrorBoundary');
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">{t('errors.errorOccurred')}</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            {t('errors.refreshPage')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorNotification({ error, onClose }: { error: AppError; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg flex items-center gap-2 z-50">
      <div className="text-xl">⚠️</div>
      <div className="flex-1">
        <h3 className="font-bold">{t('errors.errorOccurred')}</h3>
        <p className="text-sm">{error.message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}
