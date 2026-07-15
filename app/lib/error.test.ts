// app/lib/error.test.ts v2.7.0
import { createError, handleError, logError, ErrorCode } from './error-handler';

// Mock i18n
jest.mock('./i18n', () => ({
  t: jest.fn((key: string) => key),
}));

// Mock console.error
global.console.error = jest.fn();

describe('error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createError', () => {
    it('should create an error with code and default message', () => {
      const error = createError(ErrorCode.NETWORK_TIMEOUT);
      expect(error.code).toBe(ErrorCode.NETWORK_TIMEOUT);
      expect(error.message).toBe('errors.networkTimeout');
      expect(error.timestamp).toBeDefined();
    });

    it('should create an error with custom message', () => {
      const error = createError(ErrorCode.API_ERROR, 'Custom API error');
      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.message).toBe('Custom API error');
    });

    it('should create an error with details', () => {
      const details = { field: 'test' };
      const error = createError(ErrorCode.VALIDATION_ERROR, 'Validation failed', details);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.details).toEqual(details);
    });
  });

  describe('handleError', () => {
    it('should handle AbortError as NETWORK_TIMEOUT', () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      const result = handleError(abortError);
      expect(result.code).toBe(ErrorCode.NETWORK_TIMEOUT);
    });

    it('should handle Error with Network message', () => {
      const networkError = new Error('Network request failed');
      const result = handleError(networkError);
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.message).toBe('Network request failed');
    });

    it('should handle auth/requires-recent-login as AUTH_EXPIRED', () => {
      const authError = new Error('auth/requires-recent-login');
      const result = handleError(authError);
      expect(result.code).toBe(ErrorCode.AUTH_EXPIRED);
    });

    it('should handle auth/user-not-found as AUTH_FAILED', () => {
      const authError = new Error('auth/user-not-found');
      const result = handleError(authError);
      expect(result.code).toBe(ErrorCode.AUTH_FAILED);
    });

    it('should handle generic Error as UNKNOWN_ERROR', () => {
      const error = new Error('Generic error message');
      const result = handleError(error);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should handle unknown error', () => {
      const error = 'Unknown error string';
      const result = handleError(error);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('logError', () => {
    it('should log error with context in development', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as Record<string, string>).NODE_ENV = 'development';

      const error = new Error('Test error');
      logError(error, 'Test context');

      expect(console.error).toHaveBeenCalled();

      (process.env as Record<string, string>).NODE_ENV = originalEnv || 'test';
    });
  });
});
