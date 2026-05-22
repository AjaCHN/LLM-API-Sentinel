// app/lib/error.test.ts v2.5.1
import { ApiError, FirebaseError, NetworkError, handleError, logError, isNetworkError, isApiError, isFirebaseError } from './error';

// Mock console.error
global.console.error = jest.fn();

describe('error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ApiError', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError('API error message', 'API_ERROR', 400);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('API error message');
      expect(error.code).toBe('API_ERROR');
      expect(error.status).toBe(400);
    });
  });

  describe('FirebaseError', () => {
    it('should create a FirebaseError with correct properties', () => {
      const error = new FirebaseError('Firebase error message', 'FIREBASE_ERROR');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('FirebaseError');
      expect(error.message).toBe('Firebase error message');
      expect(error.code).toBe('FIREBASE_ERROR');
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError with correct properties', () => {
      const error = new NetworkError('Network error message', 500);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network error message');
      expect(error.status).toBe(500);
    });
  });

  describe('handleError', () => {
    it('should handle ApiError', () => {
      const error = new ApiError('API error message', 'API_ERROR', 400);
      const result = handleError(error);
      expect(result).toBe('API Error (API_ERROR): API error message');
    });

    it('should handle FirebaseError', () => {
      const error = new FirebaseError('Firebase error message', 'FIREBASE_ERROR');
      const result = handleError(error);
      expect(result).toBe('Firebase Error (FIREBASE_ERROR): Firebase error message');
    });

    it('should handle NetworkError', () => {
      const error = new NetworkError('Network error message', 500);
      const result = handleError(error);
      expect(result).toBe('Network Error (500): Network error message');
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error message');
      const result = handleError(error);
      expect(result).toBe('Error: Generic error message');
    });

    it('should handle unknown error', () => {
      const error = 'Unknown error';
      const result = handleError(error);
      expect(result).toBe('Unknown error occurred');
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      logError(error, 'Test context');
      expect(console.error).toHaveBeenCalledWith('Test context: Error: Test error');
    });

    it('should log error without context', () => {
      const error = new Error('Test error');
      logError(error);
      expect(console.error).toHaveBeenCalledWith('Error: Test error');
    });
  });

  describe('type guards', () => {
    it('should identify NetworkError', () => {
      const networkError = new NetworkError('Network error', 500);
      const apiError = new ApiError('API error', 'API_ERROR', 400);
      expect(isNetworkError(networkError)).toBe(true);
      expect(isNetworkError(apiError)).toBe(false);
    });

    it('should identify ApiError', () => {
      const apiError = new ApiError('API error', 'API_ERROR', 400);
      const networkError = new NetworkError('Network error', 500);
      expect(isApiError(apiError)).toBe(true);
      expect(isApiError(networkError)).toBe(false);
    });

    it('should identify FirebaseError', () => {
      const firebaseError = new FirebaseError('Firebase error', 'FIREBASE_ERROR');
      const networkError = new NetworkError('Network error', 500);
      expect(isFirebaseError(firebaseError)).toBe(true);
      expect(isFirebaseError(networkError)).toBe(false);
    });
  });
});
