/**
 * Error logging utility for consistent error logging across the application
 * Uses Axiom for production logging and console for development
 */

import { logger as axiomLogger } from '@/lib/axiom/server';

const isProduction = process.env.NODE_ENV === 'production';

interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Log an error to the appropriate service based on environment
 */
export function logErrorToService(error: Error | unknown, context: ErrorContext = {}): void {
  // Handle non-Error objects and convert them
  const normalizedError = error instanceof Error ? error : new Error(
    typeof error === 'string' ? error : 'Unknown error'
  );

  // Capture additional properties for TypeError specifically
  const typeErrorInfo = error instanceof TypeError ? {
    targetObject: error.name === 'TypeError' && error.message.includes('null') ? 'null' : 'undefined',
    operation: error.message.includes('setting') ? 'property write' : 'unknown operation'
  } : {};

  // Create a structured error object
  const errorData = {
    name: normalizedError.name,
    message: normalizedError.message,
    stack: normalizedError.stack,
    ...typeErrorInfo,
    ...context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // In development, output to console for immediate feedback
  if (!isProduction) {
    console.error('Error:', normalizedError.message, errorData);
    return;
  }

  // In production, send to Axiom
  axiomLogger.error(normalizedError.message, errorData);
}

/**
 * Log a server event with specified level and context
 */
export function logServerEvent(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context: ErrorContext = {}
): void {
  // Create structured log data
  const logData = {
    ...context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  if (!isProduction) {
    console[level](message, logData);
    return;
  }

  // In production, use Axiom
  axiomLogger[level](message, logData);
}

/**
 * Specific helper for logging server errors
 */
export function logServerError(
  error: Error,
  context: ErrorContext = {}
): void {
  return logServerEvent('error', 'Server error occurred', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context
  });
}
