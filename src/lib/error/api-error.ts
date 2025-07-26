/**
 * Standardized API Error handling for consistent error responses
 * across the application
 */

export interface ApiErrorDetails {
    field?: string;
    issue?: string;
    [key: string]: unknown;
  }
  
  export interface ApiErrorResponse {
    error: {
      code: string;
      message: string;
      details?: ApiErrorDetails[];
      requestId?: string;
      timestamp: string;
    }
  }
  
  /**
   * Custom error class for API errors with standardized structure
   */
  export class ApiError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: ApiErrorDetails[];
    public readonly requestId?: string;
  
    constructor(
      code: string,
      message: string,
      statusCode: number = 400,
      details?: ApiErrorDetails[],
      requestId?: string
    ) {
      super(message);
      this.name = 'ApiError';
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
      this.requestId = requestId;
    }
  
    /**
     * Converts the error to a standardized response format
     */
    public toResponse(): ApiErrorResponse {
      return {
        error: {
          code: this.code,
          message: this.message,
          details: this.details,
          requestId: this.requestId,
          timestamp: new Date().toISOString(),
        }
      };
    }
  }
  
  /**
   * Common API error factories for consistent error creation
   */
  export const ApiErrors = {
    BAD_REQUEST: (message = 'Invalid request parameters', details?: ApiErrorDetails[]) => 
      new ApiError('BAD_REQUEST', message, 400, details),
    
    UNAUTHORIZED: (message = 'Authentication required') => 
      new ApiError('UNAUTHORIZED', message, 401),
    
    FORBIDDEN: (message = 'You do not have permission to access this resource') => 
      new ApiError('FORBIDDEN', message, 403),
    
    NOT_FOUND: (resource = 'Resource', id?: string) => 
      new ApiError('NOT_FOUND', `${resource}${id ? ` with ID ${id}` : ''} not found`, 404),
    
    RATE_LIMITED: (message = 'Too many requests, please try again later') => 
      new ApiError('RATE_LIMITED', message, 429),
    
    SUBSCRIPTION_REQUIRED: (feature: string) => 
      new ApiError('SUBSCRIPTION_REQUIRED', `This feature requires a paid subscription`, 403, [
        { feature, issue: 'subscription_required' }
      ]),
    
    INTERNAL_ERROR: (message = 'An unexpected error occurred') => 
      new ApiError('INTERNAL_ERROR', message, 500),
    
    SERVICE_UNAVAILABLE: (service: string) => 
      new ApiError('SERVICE_UNAVAILABLE', `The ${service} service is currently unavailable`, 503),
  };