import { NextResponse } from 'next/server'
import { ZodError, type ZodIssue } from 'zod'
import {
    AppError,
    ValidationError,
    DatabaseError,
    ExternalServiceError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    isAppError,
} from './custom-errors'
import { ApiErrors } from './api-error'
import { logServerError, logServerEvent } from './logger'

/**
 * Context for error logging
 */
export interface ErrorContext {
    route?: string
    userId?: string
    interviewId?: string
    questionId?: string
    operation?: string
    [key: string]: unknown
}

/**
 * Convert application errors to API responses with proper logging
 */
export function handleApiError(
    error: unknown,
    context: ErrorContext = {}
): NextResponse {
    // Log the error with context
    if (error instanceof Error) {
        logServerError(error, {
            context: context.route || 'api',
            ...context,
        })
    } else {
        logServerEvent('error', 'Non-Error thrown', {
            ...context,
            error: String(error),
        })
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        const validationError = ValidationError.fromZodError(error)
        logServerEvent('warn', 'Validation error', {
            ...context,
            issues: validationError.details,
        })

        // Convert validation error details to ApiErrorDetails format
        const apiDetails = (error.issues as ZodIssue[] | undefined)?.map((issue: ZodIssue) => ({
            field: issue.path && issue.path.length ? issue.path.join('.') : undefined,
            issue: issue.message || undefined,
        }))

        return NextResponse.json(
            ApiErrors.BAD_REQUEST(validationError.message, apiDetails).toResponse(),
            { status: 400 }
        )
    }

    // Handle custom application errors
    if (isAppError(error)) {
        return handleAppError(error, context)
    }

    // Handle unknown errors
    logServerEvent('error', 'Unhandled error', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
        ApiErrors.INTERNAL_ERROR('An unexpected error occurred').toResponse(),
        { status: 500 }
    )
}

/**
 * Convert AppError to appropriate NextResponse
 */
function handleAppError(error: AppError, context: ErrorContext): NextResponse {
    // Map custom errors to ApiError responses
    if (error instanceof ValidationError) {
        // Convert validation details to ApiErrorDetails format
        const details = error.details as { issues?: Array<{ path: string; message: string }> }
        const apiDetails = details?.issues?.map(issue => ({
            field: issue.path,
            issue: issue.message,
        }))

        return NextResponse.json(
            ApiErrors.BAD_REQUEST(error.message, apiDetails).toResponse(),
            { status: error.statusCode }
        )
    }

    if (error instanceof NotFoundError) {
        const details = error.details as { resourceType?: string; resourceId?: string } | undefined
        const resourceType = details?.resourceType || 'Resource'
        const resourceId = details?.resourceId

        return NextResponse.json(
            ApiErrors.NOT_FOUND(resourceType, resourceId).toResponse(),
            { status: error.statusCode }
        )
    }

    if (error instanceof AuthenticationError) {
        return NextResponse.json(
            ApiErrors.UNAUTHORIZED(error.message).toResponse(),
            { status: error.statusCode }
        )
    }

    if (error instanceof AuthorizationError) {
        return NextResponse.json(
            ApiErrors.FORBIDDEN(error.message).toResponse(),
            { status: error.statusCode }
        )
    }

    if (error instanceof ExternalServiceError) {
        const details = error.details as { service?: string } | undefined
        const service = details?.service || 'External service'

        return NextResponse.json(
            ApiErrors.SERVICE_UNAVAILABLE(service).toResponse(),
            { status: error.statusCode }
        )
    }

    if (error instanceof DatabaseError) {
        // Database errors are 500 - log but don't expose internals
        const details = error.details as Record<string, unknown> | undefined
        logServerEvent('error', 'Database operation failed', {
            ...context,
            ...(details || {}),
        })

        return NextResponse.json(
            ApiErrors.INTERNAL_ERROR('A database error occurred').toResponse(),
            { status: error.statusCode }
        )
    }

    // Fallback for other AppError instances
    return NextResponse.json(
        {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
        },
        { status: error.statusCode }
    )
}

/**
 * Helper to throw NotFoundError if resource is null/undefined
 */
export function assertFound<T>(
    resource: T | null | undefined,
    resourceType: string,
    resourceId?: string
): asserts resource is T {
    if (resource === null || resource === undefined) {
        throw new NotFoundError(resourceType, resourceId)
    }
}

/**
 * Helper to wrap database operations with error handling
 */
export async function wrapDatabaseOperation<T>(
    operation: () => Promise<T>,
    details: {
        operation: 'create' | 'read' | 'update' | 'delete' | 'query'
        table: string
    }
): Promise<T> {
    try {
        return await operation()
    } catch (error) {
        throw new DatabaseError(
            `Database ${details.operation} failed on ${details.table}`,
            {
                ...details,
                originalError: error instanceof Error ? error : undefined,
            }
        )
    }
}

/**
 * Helper to wrap external service calls
 */
export async function wrapExternalService<T>(
    service: string,
    operation: () => Promise<T>,
    operationName?: string
): Promise<T> {
    try {
        return await operation()
    } catch (error) {
        throw new ExternalServiceError(
            service,
            `${operationName || 'Operation'} failed`,
            {
                originalError: error instanceof Error ? error : undefined,
                operation: operationName,
            }
        )
    }
}
