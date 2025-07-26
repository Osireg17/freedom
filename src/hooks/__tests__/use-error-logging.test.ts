// src/hooks/use-error-logging.test.ts
import { renderHook, act } from '@testing-library/react';
import { logErrorToService } from '@/lib/error/logger';
import { useLogger } from '@/lib/axiom/client';
import { useErrorLogging } from '../use-error-logging';

// Mock the dependencies
jest.mock('@/lib/error/logger', () => ({
  logErrorToService: jest.fn(),
}));

jest.mock('@/lib/axiom/client', () => ({
  useLogger: jest.fn(),
}));

describe('useErrorLogging', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the axiom logger
    const mockAxiomLogger = {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };
    (useLogger as jest.Mock).mockReturnValue(mockAxiomLogger);
    
    // Save original addEventListener to restore later
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Clean up any lingering event listeners
    jest.restoreAllMocks();
  });

  test('should initialize with null lastError', () => {
    const { result } = renderHook(() => useErrorLogging());
    
    expect(result.current.lastError).toBeNull();
    expect(typeof result.current.logError).toBe('function');
    expect(typeof result.current.clearLastError).toBe('function');
  });

  test('should set up and clean up event listeners', () => {
    const { unmount } = renderHook(() => useErrorLogging());
    
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  test('should handle manually logged Error objects', () => {
    const { result } = renderHook(() => useErrorLogging());
    const mockAxiomLogger = useLogger();
    const testError = new Error('Test error message');
    const additionalContext = { userId: '123', action: 'test-action' };
    
    act(() => {
      result.current.logError(testError, additionalContext);
    });
    
    // Check if lastError is set correctly
    expect(result.current.lastError).toEqual(testError);
    
    // Check if proper logging methods are called
    expect(logErrorToService).toHaveBeenCalledWith(
      testError,
      expect.objectContaining(additionalContext)
    );
    
    // In production, Axiom should also be called
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    act(() => {
      result.current.logError(testError, additionalContext);
    });
    
    expect(mockAxiomLogger.error).toHaveBeenCalledWith(
      testError.message,
      expect.objectContaining({
        stack: testError.stack,
        ...additionalContext
      })
    );
    
    // Restore environment
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('should handle manually logged non-Error objects', () => {
    const { result } = renderHook(() => useErrorLogging());
    const nonErrorObject = 'This is a string error';
    
    act(() => {
      result.current.logError(nonErrorObject);
    });
    
    // Check if lastError is created as an Error instance
    expect(result.current.lastError).toBeInstanceOf(Error);
    expect(result.current.lastError?.message).toBe(nonErrorObject);
    
    // Check if proper logging methods are called
    expect(logErrorToService).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  test('should clear last error', () => {
    const { result } = renderHook(() => useErrorLogging());
    const testError = new Error('Test error');
    
    act(() => {
      result.current.logError(testError);
    });
    
    expect(result.current.lastError).toEqual(testError);
    
    act(() => {
      result.current.clearLastError();
    });
    
    expect(result.current.lastError).toBeNull();
  });

  test('should handle PromiseRejectionEvent through global handler', () => {
    renderHook(() => useErrorLogging());
    
    // Get the registered handler
    const rejectionHandler = (window.addEventListener as jest.Mock).mock.calls.find(
      call => call[0] === 'unhandledrejection'
    )[1];
    
    const reason = new Error('Promise rejection reason');
    
    // Create a mock PromiseRejectionEvent
    const mockRejectionEvent = {
      reason,
      preventDefault: jest.fn(),
    } as unknown as PromiseRejectionEvent;
    
    // Manually trigger the rejection handler
    act(() => {
      rejectionHandler(mockRejectionEvent);
    });
    
    // Verify that preventDefault was called
    expect(mockRejectionEvent.preventDefault).toHaveBeenCalled();
    
    // Verify that the error was logged properly
    expect(logErrorToService).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        stack: reason.stack,
      })
    );
  });

  test('should handle non-Error promise rejections', () => {
    renderHook(() => useErrorLogging());
    
    // Get the registered handler
    const rejectionHandler = (window.addEventListener as jest.Mock).mock.calls.find(
      call => call[0] === 'unhandledrejection'
    )[1];
    
    const reason = 'String rejection reason';
    
    // Create a mock PromiseRejectionEvent with a string reason
    const mockRejectionEvent = {
      reason,
      preventDefault: jest.fn(),
    } as unknown as PromiseRejectionEvent;
    
    // Manually trigger the rejection handler
    act(() => {
      rejectionHandler(mockRejectionEvent);
    });
    
    // Verify error was logged properly
    expect(logErrorToService).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        stack: undefined,
      })
    );
  });

  test('should handle logging API failures gracefully', () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Make logErrorToService throw an error
    (logErrorToService as jest.Mock).mockImplementation(() => {
      throw new Error('Logging service failed');
    });
    
    const { result } = renderHook(() => useErrorLogging());
    
    act(() => {
      result.current.logError(new Error('Test error'));
    });
    
    // Should have called console.error as fallback
    expect(console.error).toHaveBeenCalled();
    
    // Still should have set the lastError state
    expect(result.current.lastError).toBeInstanceOf(Error);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});