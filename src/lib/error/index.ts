/**
 * Central export for all error handling utilities
 */

// Error classes
export {
    AppError,
    ValidationError,
    DatabaseError,
    ExternalServiceError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    ErrorCode,
    isAppError,
    isOperationalError,
} from './custom-errors'

// Error handling utilities
export {
    handleApiError,
    assertFound,
    wrapDatabaseOperation,
    wrapExternalService,
    type ErrorContext,
} from './error-handler'

// Existing API error utilities
export { ApiError, ApiErrors, type ApiErrorResponse, type ApiErrorDetails } from './api-error'

// Logging utilities
export { logErrorToService, logServerError, logServerEvent } from './logger'
