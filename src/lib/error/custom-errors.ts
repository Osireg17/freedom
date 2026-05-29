/**
 * Custom error classes for typed error handling
 * These errors should be thrown in application code and handled by error handlers
 */

/**
 * Error codes for stable client-side handling
 */
export enum ErrorCode {
    // Validation errors (4xx)
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',

    // Authentication/Authorization errors (4xx)
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',

    // Resource errors (4xx)
    NOT_FOUND = 'NOT_FOUND',
    ALREADY_EXISTS = 'ALREADY_EXISTS',

    // Rate limiting (4xx)
    RATE_LIMITED = 'RATE_LIMITED',

    // Subscription/Business logic (4xx)
    SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
    FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',

    // Database errors (5xx)
    DATABASE_ERROR = 'DATABASE_ERROR',

    // External service errors (5xx)
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

    // Generic errors (5xx)
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Base class for all custom errors
 */
export abstract class AppError extends Error {
    abstract readonly code: ErrorCode
    abstract readonly statusCode: number
    readonly details?: unknown
    readonly isOperational: boolean = true // Expected errors vs bugs

    constructor(message: string, details?: unknown) {
        super(message)
        this.name = this.constructor.name
        this.details = details
        Error.captureStackTrace(this, this.constructor)
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        }
    }
}

/**
 * Validation errors (400)
 * Used for Zod validation failures and invalid input
 */
export class ValidationError extends AppError {
    readonly code = ErrorCode.VALIDATION_ERROR
    readonly statusCode = 400

    constructor(message: string, details?: { field?: string; issues?: unknown[] }) {
        super(message, details)
    }

    static fromZodError(zodError: unknown): ValidationError {
        // Extract field-level errors from Zod
        const error = zodError as { issues?: Array<{ path: (string | number)[]; message: string; code: string }> }
        const issues = Array.isArray(error.issues)
            ? error.issues.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
                code: issue.code
            }))
            : []

        return new ValidationError('Validation failed', { issues })
    }
}

/**
 * Database operation errors (500)
 */
export class DatabaseError extends AppError {
    readonly code = ErrorCode.DATABASE_ERROR
    readonly statusCode = 500

    constructor(
        message: string,
        details?: {
            operation?: 'create' | 'read' | 'update' | 'delete' | 'query'
            table?: string
            originalError?: Error
        }
    ) {
        super(message, details)
    }
}

/**
 * External service errors (503)
 * For Trigger.dev, Supabase Storage, OpenAI, Deepgram, etc.
 */
export class ExternalServiceError extends AppError {
    readonly code = ErrorCode.EXTERNAL_SERVICE_ERROR
    readonly statusCode = 503

    constructor(
        service: 'trigger.dev' | 'supabase-storage' | 'openai' | 'deepgram' | 'clerk' | string,
        message: string,
        details?: { originalError?: Error; operation?: string }
    ) {
        super(`${service}: ${message}`, { service, ...details })
    }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends AppError {
    readonly code = ErrorCode.NOT_FOUND
    readonly statusCode = 404

    constructor(
        resourceType: 'interview' | 'question' | 'answer' | 'user' | string,
        resourceId?: string
    ) {
        const message = resourceId
            ? `${resourceType} with ID "${resourceId}" not found`
            : `${resourceType} not found`
        super(message, { resourceType, resourceId })
    }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
    readonly code = ErrorCode.UNAUTHORIZED
    readonly statusCode = 401

    constructor(message: string = 'Authentication required', details?: unknown) {
        super(message, details)
    }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
    readonly code = ErrorCode.FORBIDDEN
    readonly statusCode = 403

    constructor(message: string = 'Access forbidden', details?: unknown) {
        super(message, details)
    }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError
}

/**
 * Type guard for operational errors (expected, should be handled)
 */
export function isOperationalError(error: unknown): boolean {
    if (isAppError(error)) {
        return error.isOperational
    }
    return false
}
