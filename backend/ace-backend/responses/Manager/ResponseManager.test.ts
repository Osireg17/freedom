import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserResponse } from './ResponseManager';
import { db, responsesBucket } from '../../db/db';
import { tasks } from '@trigger.dev/sdk/v3';
import { UserResponseRequest } from '../types';

// --- MOCKS ---
const mockInsertValues = vi.fn().mockResolvedValue({});
const mockUpdateSet = vi.fn(() => ({ where: vi.fn().mockResolvedValue({}) }));
const mockUpload = vi.fn();

vi.mock('../../db/db', () => ({
    db: {
        insert: vi.fn(() => ({
            values: mockInsertValues
        })),
        update: vi.fn(() => ({
            set: mockUpdateSet
        })),
        query: {
            interviews: {
                findFirst: vi.fn(),
            },
            interviewQuestions: {
                findFirst: vi.fn(),
            },
            interviewAnswers: {
                findFirst: vi.fn(),
            }
        }
    },
    responsesBucket: {
        upload: vi.fn(),
    }
}));

vi.mock('@trigger.dev/sdk/v3', () => ({
    tasks: {
        trigger: vi.fn(),
    }
}));

class MockAPIError extends Error {
    constructor(public code: string, message: string) {
        super(message);
    }
}

vi.mock('encore.dev/api', () => ({
    APIError: {
        notFound: vi.fn((msg) => new MockAPIError('not_found', msg)),
        permissionDenied: vi.fn((msg) => new MockAPIError('permission_denied', msg)),
        internal: vi.fn((msg) => new MockAPIError('internal', msg)),
    }
}));

vi.mock('encore.dev/log', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
    }
}));

describe('ResponseManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Point the mocked module method to our mock function so we can easily check assertions and alter behavior
        (responsesBucket.upload as any).mockImplementation(mockUpload);
    });

    describe('createUserResponse', () => {
        const userId = 'user-123';
        const params: UserResponseRequest = {
            interviewId: 'int-123',
            questionId: 'q-123',
            videoResponseBase64: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // tiny base64
            responseTimeMs: 5000,
            redoAttemptNumber: 0
        };

        it('should throw notFound if interview does not exist', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue(null);

            await expect(createUserResponse(params, userId)).rejects.toThrow('Interview not found');
        });

        it('should throw permissionDenied if userId does not match', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId: 'other-user' });

            await expect(createUserResponse(params, userId)).rejects.toThrow('You do not have permission');
        });

        it('should throw notFound if question does not exist', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue(null);

            await expect(createUserResponse(params, userId)).rejects.toThrow('Question not found');
        });

        it('should insert new answer, upload to bucket, trigger task, and return success', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue({ id: params.questionId });
            (db.query.interviewAnswers.findFirst as any).mockResolvedValue(null); // No existing answer

            mockUpload.mockResolvedValue(undefined);

            const mockRunId = 'run-456';
            (tasks.trigger as any).mockResolvedValue({ id: mockRunId });

            const result = await createUserResponse(params, userId);

            // Upload check
            expect(mockUpload).toHaveBeenCalledWith(
                expect.stringContaining(`interviews/${userId}/${params.interviewId}/`),
                expect.any(Buffer),
                { contentType: 'audio/webm' }
            );

            // DB Insert check
            expect(db.insert).toHaveBeenCalled();
            expect(mockInsertValues).toHaveBeenCalledWith(
                expect.objectContaining({
                    interviewId: params.interviewId,
                    interviewQuestionId: params.questionId,
                    redoAttemptNumber: 0,
                    audioDurationMs: params.responseTimeMs,
                    audioUrl: expect.stringContaining(`interviews/${userId}/${params.interviewId}/`),
                })
            );

            // Trigger check
            expect(tasks.trigger).toHaveBeenCalledWith(
                'record-interview-task',
                expect.objectContaining({
                    interviewId: params.interviewId,
                    questionId: params.questionId,
                    userId,
                    audioPath: expect.stringContaining(`interviews/${userId}/${params.interviewId}/`)
                })
            );

            // Result check
            expect(result).toEqual({
                success: true,
                responseId: expect.any(String),
                status: 'processing',
                message: 'Your response has been submitted and is being analyzed.',
                runId: mockRunId,
                audioUrl: undefined
            });
        });

        it('should update existing answer if one already exists', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue({ id: params.questionId });

            const existingAnswerId = 'answer-123';
            (db.query.interviewAnswers.findFirst as any).mockResolvedValue({ id: existingAnswerId });

            mockUpload.mockResolvedValue(undefined);
            (tasks.trigger as any).mockResolvedValue({ id: 'run-789' });

            const result = await createUserResponse(params, userId);

            // DB Update check
            expect(db.update).toHaveBeenCalled();
            expect(mockUpdateSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    redoAttemptNumber: 0,
                    audioDurationMs: params.responseTimeMs,
                    audioUrl: expect.stringContaining(`interviews/${userId}/${params.interviewId}/`),
                })
            );

            expect(result.responseId).toBe(existingAnswerId);
        });
    });
});