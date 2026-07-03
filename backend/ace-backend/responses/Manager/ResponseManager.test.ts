import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserResponse } from './ResponseManager';
import { db, responsesBucket } from '../../db/db';
import { tasks } from '@trigger.dev/sdk/v3';
import { UserResponseRequest } from '../types';

// --- MOCKS ---
const mockReturning = vi.fn().mockResolvedValue([{ id: 'answer-123' }]);
const mockOnConflictDoUpdate = vi.fn(() => ({
    returning: mockReturning
}));
const mockInsertValues = vi.fn(() => ({
    onConflictDoUpdate: mockOnConflictDoUpdate
}));
const mockUpload = vi.fn();

vi.mock('../../db/db', () => ({
    db: {
        insert: vi.fn(() => ({
            values: mockInsertValues
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({ where: vi.fn().mockResolvedValue({}) }))
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
        invalidArgument: vi.fn((msg) => new MockAPIError('invalid_argument', msg)),
        unauthenticated: vi.fn((msg) => new MockAPIError('unauthenticated', msg)),
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
        const params = {
            interviewId: 'int-123',
            questionId: 'q-123',
            videoResponseBuffer: Buffer.from('dummy-payload'),
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

        it('should throw invalidArgument if payload is empty', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue({ id: params.questionId });

            const invalidParams = { ...params, videoResponseBuffer: Buffer.alloc(0) };
            await expect(createUserResponse(invalidParams, userId)).rejects.toThrow('Response payload is empty');
        });

        it('should throw invalidArgument if payload is too large', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue({ id: params.questionId });

            const invalidParams = { ...params, videoResponseBuffer: Buffer.alloc(51 * 1024 * 1024) };
            await expect(createUserResponse(invalidParams, userId)).rejects.toThrow('Response payload is too large');
        });

        it('should insert or update answer, upload to bucket, trigger task, and return success', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue({ id: params.questionId });

            mockUpload.mockResolvedValue(undefined);

            const mockRunId = 'run-456';
            const mockUpsertedId = 'answer-upserted-123';
            (tasks.trigger as any).mockResolvedValue({ id: mockRunId });
            mockReturning.mockResolvedValue([{ id: mockUpsertedId }]);

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

            // DB Upsert check
            expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: expect.any(Array),
                    set: expect.objectContaining({
                        redoAttemptNumber: 0,
                        audioDurationMs: params.responseTimeMs,
                        audioUrl: expect.stringContaining(`interviews/${userId}/${params.interviewId}/`),
                    })
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
                responseId: mockUpsertedId,
                status: 'processing',
                message: 'Your response has been submitted and is being analyzed.',
                runId: mockRunId,
                audioUrl: undefined
            });
        });
    });
});