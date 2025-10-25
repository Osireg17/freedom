/**
 * Standardized API response types for type-safe client-server communication
 */

import { ErrorCode } from '@/lib/error/custom-errors';

/**
 * Success response wrapper
 */
export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
};

/**
 * Error response wrapper
 */
export type ApiErrorResponse = {
  success: false;
  error: {
    code: string | ErrorCode;
    message: string;
    details?: unknown;
    timestamp?: string;
  };
};

/**
 * Generic API response (success or error)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Interview creation response
 */
export type CreateInterviewResponse = {
  success: true;
  interviewId: string;
  status: 'processing';
  message: string;
  runId: string;
};

/**
 * Interview status response
 */
export type InterviewStatusResponse = {
  interviewId: string;
  status: 'processing' | 'completed' | 'error';
  message: string;
  questionsCount: number;
  triggerDevRunStatus: string;
};

/**
 * Question data response
 */
export type QuestionResponse = {
  id: string;
  interviewId: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  timeToAnswer: number;
  prepTime: number;
  totalQuestions: number;
};

/**
 * Response submission result
 */
export type SubmitResponseResult = {
  success: true;
  responseId: string;
  status: 'processing';
  message: string;
  runId: string;
  audioUrl?: string;
};

/**
 * Server action response type (for form actions)
 */
export type ServerActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
