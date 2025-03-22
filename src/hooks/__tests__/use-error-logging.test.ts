import { renderHook, act } from '@testing-library/react';
import { useErrorLogging } from '../use-error-logging';
import { logErrorToService } from '@/lib/error/logger';

// Mock the logger service
jest.mock('@/lib/error/logger', () => ({
  logErrorToService: jest.fn(),
}));

describe('useErrorLogging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window listeners
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  it('should initialize with null lastError', () => {
    const { result } = renderHook(() => useErrorLogging());
    expect(result.current.lastError).toBeNull();
  });

  it('should add global error listeners on mount', () => {
    renderHook(() => useErrorLogging());
    expect(window.addEventListener).toHaveBeenCalledTimes(2);
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  it('should remove global error listeners on unmount', () => {
    const { unmount } = renderHook(() => useErrorLogging());
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledTimes(2);
    expect(window.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  it('should log caught errors and update lastError', async () => {
    const { result } = renderHook(() => useErrorLogging());
    const testError = new Error('Test error');
    const additionalContext = { userId: '123' };
    
    await act(async () => {
      result.current.logError(testError, additionalContext);
    });
    
    expect(logErrorToService).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        ...additionalContext
      })
    );
    expect(result.current.lastError).toEqual(testError);
  });

  it('should handle non-Error objects in logCaughtError', async () => {
    const { result } = renderHook(() => useErrorLogging());
    const errorString = 'String error message';
    
    await act(async () => {
      result.current.logError(errorString);
    });
    
    expect(logErrorToService).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
    expect(result.current.lastError).toBeInstanceOf(Error);
    expect(result.current.lastError?.message).toBe(errorString);
  });

  it('should clear lastError when clearLastError is called', async () => {
    const { result } = renderHook(() => useErrorLogging());
    
    await act(async () => {
      result.current.logError(new Error('Test error'));
    });
    
    expect(result.current.lastError).not.toBeNull();
    
    act(() => {
      result.current.clearLastError();
    });
    
    expect(result.current.lastError).toBeNull();
  });

  // This test requires manually triggering global events
  it('should handle global error events', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let globalErrorHandler: Function | null = null;
    
    // Override the addEventListener mock to capture the handler
    window.addEventListener = jest.fn((event, handler) => {
      if (event === 'error') {
        globalErrorHandler = handler;
      }
    });
    
    const { result } = renderHook(() => useErrorLogging());
    
    expect(globalErrorHandler).not.toBeNull();
    
    // Create a mock error event
    const errorEvent = new ErrorEvent('error', {
      message: 'Global error',
      filename: 'test.js',
      lineno: 10,
      colno: 20,
      error: new Error('Global error')
    });
    
    act(() => {
      // Manually trigger the handler
      if (globalErrorHandler) {
        globalErrorHandler(errorEvent);
      }
    });
    
    expect(result.current.lastError).not.toBeNull();
    expect(result.current.lastError?.message).toBe('Global error');
    expect(logErrorToService).toHaveBeenCalled();
  });
});