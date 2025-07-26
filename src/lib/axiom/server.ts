import axiomClient from '@/lib/axiom/axiom';
import { Logger, AxiomJSTransport } from '@axiomhq/logging';
import { NextRequest, NextResponse } from 'next/server';

// Create the Axiom logger instance
export const logger = new Logger({
  transports: [
    new AxiomJSTransport({ 
      axiom: axiomClient, 
      dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET! 
    }),
  ],
});

// Create a typed version of the route handler for App Router
export function withAxiom<T>(
  handler: (
    req: NextRequest, 
    context: { params: T }
  ) => Promise<NextResponse> | NextResponse
) {


  return async (request: NextRequest, context: { params: T }) => {
    try {
      // Pass the request and context to the original handler
      const response = await Promise.resolve(handler(request, context));
      
      // Return the response
      return response;
    } catch (error) {
      // Log the error
      logger.error('Unhandled route error', {
        path: request.nextUrl.pathname,
        method: request.method,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Re-throw to be handled by global error handlers
      throw error;
    } finally {
      // Make sure logs are sent even if the request ends early
      await logger.flush();
    }
  };
}