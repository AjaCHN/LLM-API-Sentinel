// app/lib/error.tsx v2.5.0
import React from 'react';
import { AppError } from '../types';

// 错误类型
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  AUTH = 'AUTH',
  FIREBASE = 'FIREBASE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

// 错误代码
export enum ErrorCode {
  // 网络错误
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // API 错误
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  API_ERROR = 'API_ERROR',
  API_RATE_LIMITED = 'API_RATE_LIMITED',
  
  // 认证错误
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  
  // Firebase 错误
  FIREBASE_ERROR = 'FIREBASE_ERROR',
  FIRESTORE_ERROR = 'FIRESTORE_ERROR',
  
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 错误消息映射
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 网络错误
  [ErrorCode.NETWORK_TIMEOUT]: '网络请求超时，请检查您的网络连接',
  [ErrorCode.NETWORK_OFFLINE]: '您当前处于离线状态，请检查网络连接',
  [ErrorCode.NETWORK_ERROR]: '网络连接错误，请稍后重试',
  
  // API 错误
  [ErrorCode.API_UNAVAILABLE]: 'API 服务暂时不可用',
  [ErrorCode.API_ERROR]: 'API 请求失败',
  [ErrorCode.API_RATE_LIMITED]: 'API 请求过于频繁，请稍后重试',
  
  // 认证错误
  [ErrorCode.AUTH_REQUIRED]: '请先登录',
  [ErrorCode.AUTH_FAILED]: '登录失败，请检查您的凭据',
  [ErrorCode.AUTH_EXPIRED]: '登录已过期，请重新登录',
  
  // Firebase 错误
  [ErrorCode.FIREBASE_ERROR]: 'Firebase 服务错误',
  [ErrorCode.FIRESTORE_ERROR]: '数据库操作失败',
  
  // 验证错误
  [ErrorCode.VALIDATION_ERROR]: '输入数据验证失败',
  
  // 未知错误
  [ErrorCode.UNKNOWN_ERROR]: '发生未知错误，请稍后重试',
};

// 创建错误对象
export function createError(
  code: ErrorCode,
  message?: string,
  details?: any
): AppError {
  return {
    code,
    message: message || ERROR_MESSAGES[code],
    details,
    timestamp: Date.now(),
  };
}

// 处理错误
export function handleError(error: any): AppError {
  // 处理网络错误
  if (error.name === 'AbortError') {
    return createError(ErrorCode.NETWORK_TIMEOUT);
  }
  
  if (error.message && error.message.includes('Network')) {
    return createError(ErrorCode.NETWORK_ERROR, error.message);
  }
  
  // 处理 Firebase 错误
  if (error.code && error.code.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/requires-recent-login':
        return createError(ErrorCode.AUTH_EXPIRED);
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return createError(ErrorCode.AUTH_FAILED);
      default:
        return createError(ErrorCode.AUTH_FAILED, error.message);
    }
  }
  
  // 处理 API 错误
  if (error.response) {
    const status = error.response.status;
    if (status === 401) {
      return createError(ErrorCode.AUTH_REQUIRED);
    } else if (status === 429) {
      return createError(ErrorCode.API_RATE_LIMITED);
    } else if (status >= 500) {
      return createError(ErrorCode.API_UNAVAILABLE);
    } else {
      return createError(ErrorCode.API_ERROR, error.message);
    }
  }
  
  // 处理其他错误
  return createError(
    ErrorCode.UNKNOWN_ERROR,
    error.message || '发生未知错误',
    error
  );
}

// 记录错误
export function logError(error: any, context: string): void {
  const appError = handleError(error);
  
  // 在开发环境中打印详细错误信息
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, appError);
    if (error.stack) {
      console.error(error.stack);
    }
  }
  
  // 在生产环境中可以发送错误到错误监控服务
  if (process.env.NODE_ENV === 'production') {
    // 这里可以集成错误监控服务，如 Sentry、LogRocket 等
    // Example: Sentry.captureException(appError);
  }
}

// 错误边界组件
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: AppError | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): { hasError: boolean; error: AppError } {
    const appError = handleError(error);
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo): void {
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
          <h2 className="text-2xl font-bold mb-2">发生错误</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 错误通知组件
export function ErrorNotification({ error, onClose }: { error: AppError; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg flex items-center gap-2 z-50">
      <div className="text-xl">⚠️</div>
      <div className="flex-1">
        <h3 className="font-bold">错误</h3>
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
