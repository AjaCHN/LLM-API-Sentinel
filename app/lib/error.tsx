// app/lib/error.tsx v2.7.0
import React from 'react';
import { AppError } from '../types';
import { t } from './i18n';
import { handleError as handleErrorFn, logError as logErrorFn } from './error-handler';

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
    const appError = handleErrorFn(error);
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: unknown, _errorInfo: React.ErrorInfo): void {
    logErrorFn(error, 'ErrorBoundary');
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
