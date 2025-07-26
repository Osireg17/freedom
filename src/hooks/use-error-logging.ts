// src/hooks/use-error-logging.ts
'use client';

import { useState, useEffect } from 'react';
import { logErrorToService } from '@/lib/error/logger';
import { useLogger } from '@/lib/axiom/client';

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  location?: string;
  additionalContext?: Record<string, unknown>;
}

/**
 * Hook for client-side error tracking and reporting
 * Captures uncaught errors and provides methods for manual error logging
 */
export function useErrorLogging() {
  const [lastError, setLastError] = useState<Error | null>(null);
  const axiomLogger = useLogger();
  
  // Send client errors to backend for logging
  const logError = async (details: ErrorDetails) => {
    try {
      // Log to Axiom for production
      if (process.env.NODE_ENV === 'production') {
        axiomLogger.error(details.message, {
          stack: details.stack,
          componentStack: details.componentStack,
          location: details.location,
          ...details.additionalContext
        });
      }
      
      // Also log through our existing service for backward compatibility
      logErrorToService(
        new Error(details.message), 
        { 
          stack: details.stack,
          componentStack: details.componentStack,
          location: details.location,
          ...details.additionalContext
        }
      );
    } catch (e) {
      // Fallback if logging API fails
      console.error('Failed to log error', e);
    }
  };

  // Set up global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      event.preventDefault();
      let errorDetails: ErrorDetails;
      
      if (event instanceof ErrorEvent) {
        errorDetails = {
          message: event.message,
          stack: event.error?.stack,
          location: `${event.filename}:${event.lineno}:${event.colno}`,
        };
      } else {
        // Handle unhandled promise rejections
        const reason = event.reason;
        errorDetails = {
          message: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : undefined,
        };
      }
      
      logError(errorDetails);
      setLastError(
        event instanceof ErrorEvent ? event.error : new Error(String(event.reason))
      );
    };

    // Add global event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, [logError]);

  // Function to manually log caught errors
  const logCaughtError = (
    error: unknown,
    additionalContext?: Record<string, unknown>
  ) => {
    const isErrorObject = error instanceof Error;
    const errorDetails: ErrorDetails = {
      message: isErrorObject ? error.message : String(error),
      stack: isErrorObject ? error.stack : undefined,
      additionalContext,
    };
    
    logError(errorDetails);
    setLastError(isErrorObject ? error : new Error(String(error)));
  };

  return {
    lastError,
    logError: logCaughtError,
    clearLastError: () => setLastError(null),
  };
}