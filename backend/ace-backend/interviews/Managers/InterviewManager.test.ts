import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInterview, getInterviewStatus, getInterviewQuestion } from './InterviewManager';
import { db } from '../../db/db';
import { tasks, runs } from '@trigger.dev/sdk/v3';

// --- MOCKS ---
const mockInsertValues = vi.fn().mockResolvedValue({});
vi.mock('../../db/db', () => ({
    db: {
        insert: vi.fn(() => ({
            values: mockInsertValues
        })),
        query: {
            interviews: {
                findFirst: vi.fn(),
            },
            interviewQuestions: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
            }
        }
    }
}));

vi.mock('@trigger.dev/sdk/v3', () => ({
    tasks: {
        trigger: vi.fn(),
    },
    runs: {
        retrieve: vi.fn(),
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

describe('InterviewManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createInterview', () => {
        it('should trigger task and insert interview into database', async () => {
            const userId = 'user-123';
            const params = {
                jobTitle: 'Software Engineer',
                companyName: 'Tech Co',
                jobDescription: 'Great job',
                yearsExperience: '5',
                timeToAnswer: '120',
                prepTime: '60',
            };

            const mockRunId = 'run-123';
            (tasks.trigger as any).mockResolvedValue({ id: mockRunId });

            const result = await createInterview(params, userId);

            expect(tasks.trigger).toHaveBeenCalledWith(
                'generate-job-interview-questions',
                expect.objectContaining({
                    userId,
                    jobTitle: params.jobTitle,
                    companyName: params.companyName,
                    jobDescription: params.jobDescription,
                    yearsExperience: 5,
                    timeToAnswer: 120,
                    prepTime: 60,
                })
            );

            expect(db.insert).toHaveBeenCalled();
            expect(mockInsertValues).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    interviewType: 'ai',
                    companyName: params.companyName,
                    jobPosition: params.jobTitle,
                    jobDescription: params.jobDescription,
                    jobExperience: params.yearsExperience,
                    timeToAnswer: 120,
                    triggerRunId: mockRunId,
                    status: 'not_started',
                })
            );

            expect(result).toEqual({
                interviewId: expect.any(String),
                runId: mockRunId,
                status: 'processing',
            });
        });
    });

    describe('getInterviewStatus', () => {
        const interviewId = 'int-123';
        const userId = 'user-123';

        it('should throw notFound if interview does not exist', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue(null);

            await expect(getInterviewStatus(interviewId, userId)).rejects.toThrow('not found');
        });

        it('should throw permissionDenied if userId does not match', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId: 'other-user' });

            await expect(getInterviewStatus(interviewId, userId)).rejects.toThrow('cannot access another user');
        });

        it('should throw internal if interview has no triggerRunId', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId, triggerRunId: null });

            await expect(getInterviewStatus(interviewId, userId)).rejects.toThrow('no associated run ID');
        });

        it('should return completed status when run is COMPLETED and isSuccess is true', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId, triggerRunId: 'run-123' });
            (runs.retrieve as any).mockResolvedValue({ status: 'COMPLETED', isSuccess: true });
            (db.query.interviewQuestions.findMany as any).mockResolvedValue([{ id: 'q1' }, { id: 'q2' }]);

            const result = await getInterviewStatus(interviewId, userId);

            expect(runs.retrieve).toHaveBeenCalledWith('run-123');
            expect(db.query.interviewQuestions.findMany).toHaveBeenCalled();
            expect(result).toEqual({
                interviewId,
                status: 'completed',
                message: 'Interview questions have been generated successfully.',
                questionsCount: 2,
                triggerDevRunStatus: 'COMPLETED',
            });
        });

        it('should return error status when run is FAILED', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId, triggerRunId: 'run-123' });
            (runs.retrieve as any).mockResolvedValue({ status: 'FAILED' });
            (db.query.interviewQuestions.findMany as any).mockResolvedValue([]);

            const result = await getInterviewStatus(interviewId, userId);

            expect(result.status).toBe('error');
            expect(result.triggerDevRunStatus).toBe('FAILED');
        });
    });

    describe('getInterviewQuestion', () => {
        const interviewId = 'int-123';
        const questionId = 'q-123';
        const userId = 'user-123';

        it('should throw notFound if interview does not exist', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue(null);

            await expect(getInterviewQuestion(interviewId, questionId, userId)).rejects.toThrow('not found');
        });

        it('should throw permissionDenied if userId does not match', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId: 'other-user', timeToAnswer: 120 });

            await expect(getInterviewQuestion(interviewId, questionId, userId)).rejects.toThrow('cannot access another user');
        });

        it('should throw notFound if question does not exist', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId, timeToAnswer: 120 });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue(null);

            await expect(getInterviewQuestion(interviewId, questionId, userId)).rejects.toThrow('question not found');
        });

        it('should return question details and total questions count', async () => {
            (db.query.interviews.findFirst as any).mockResolvedValue({ userId, timeToAnswer: 120 });
            (db.query.interviewQuestions.findFirst as any).mockResolvedValue({
                id: questionId,
                interviewId,
                questionNumber: 1,
                questionText: 'What is your greatest weakness?',
                questionType: 'behavioral',
            });
            (db.query.interviewQuestions.findMany as any).mockResolvedValue([{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]);

            const result = await getInterviewQuestion(interviewId, questionId, userId);

            expect(db.query.interviewQuestions.findFirst).toHaveBeenCalled();
            expect(db.query.interviewQuestions.findMany).toHaveBeenCalled();

            expect(result).toEqual({
                id: questionId,
                interviewId,
                questionNumber: 1,
                questionText: 'What is your greatest weakness?',
                questionType: 'behavioral',
                timeToAnswer: 120,
                prepTime: 30,
                totalQuestions: 3,
            });
        });
    });
});
