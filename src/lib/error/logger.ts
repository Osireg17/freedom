/**
 * Error logging utility for consistent error logging across the application
 * Follows the error handling strategy defined in the project documentation
 */

// In production, this would connect to a service like BetterStack or another logging service
const isProduction = process.env.NODE_ENV === 'production';

interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Log an error to the appropriate service based on environment
 */
export function logErrorToService(error: Error, context: ErrorContext = {}): void {
  // In development, output to console for immediate feedback
  if (!isProduction) {
    console.error('Error:', error.message, {
      name: error.name,
      stack: error.stack,
      ...context,
    });
    return;
  }

  // In production, send to error logging service
  // This would be replaced with actual implementation using BetterStack or similar
  console.error('Error:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ...context,
  });

  // In a real implementation, you would send to a service like:
  // return logtail.error(error.message, {
  //   level: 'error',
  //   name: error.name,
  //   stack: error.stack,
  //   ...context,
  //   environment: process.env.NODE_ENV,
  //   timestamp: new Date().toISOString(),
  // });
}

/**
 * Log a server event with specified level and context
 */
export function logServerEvent(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context: ErrorContext = {}
): void {
  if (!isProduction) {
    console[level](message, context);
    return;
  }

  // In production, would send to logging service
  console[level](message, {
    ...context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
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