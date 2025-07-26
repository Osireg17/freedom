/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/interviews/job/[id]/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InterviewPage from '../page';


// --- Mock Dependencies ---

// Mock next/navigation
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
    notFound: () => mockNotFound(),
    // Mock Link component minimally if needed, or rely on assertion of href
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock auth-actions
const mockProtectRoute = jest.fn();
jest.mock('@/lib/actions/auth-actions', () => ({
    protectRoute: () => mockProtectRoute(),
}));

// Mock db (Drizzle client)
const mockFindFirstInterview = jest.fn();
const mockFindManyQuestions = jest.fn();
jest.mock('@/lib/db', () => ({
    db: {
        query: {
            interviews: {
                findFirst: (...args: any[]) => mockFindFirstInterview(...args),
            },
            interviewQuestions: {
                findMany: (...args: any[]) => mockFindManyQuestions(...args),
            },
        },
    },
}));

// Mock UI components minimally (optional, avoids errors if they have complex internal logic)
jest.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
}));
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));
jest.mock('lucide-react', () => ({
    ChevronLeft: (props: any) => <svg {...props} />,
}));

// --- Test Setup ---

const mockUserId = 'user-123';
const mockInterviewId = 'interview-abc';

const mockInterviewData = {
    id: mockInterviewId,
    userId: mockUserId,
    interviewType: 'ai',
    companyName: 'TestCorp',
    jobPosition: 'Software Engineer',
    jobDescription: 'Develop stuff',
    jobExperience: '3',
    resumeFilename: null,
    timeToAnswer: 60,
    status: 'completed',
    lastQuestionIndex: 0,
    originalInterviewId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockQuestionsData = [
    {
        id: 'q-1',
        interviewId: mockInterviewId,
        questionNumber: 1,
        questionText: 'Tell me about yourself.',
        questionType: 'behavioral',
        originalQuestionId: null,
    },
    {
        id: 'q-2',
        interviewId: mockInterviewId,
        questionNumber: 2,
        questionText: 'Why TestCorp?',
        questionType: 'situational',
        originalQuestionId: null,
    },
    {
        id: 'q-3',
        interviewId: mockInterviewId,
        questionNumber: 3,
        questionText: 'What are your strengths?',
        questionType: 'behavioral',
        originalQuestionId: null,
    },
];

// Helper function to render the component, handling the async nature
const renderPage = async (params: { id: string }) => {
    // Next.js Page components receive props asynchronously
    const PageComponent = await InterviewPage({ params: Promise.resolve(params) });
    // Render the resolved component
    return render(<>{PageComponent}</>);
};


// --- Test Suite ---

describe('InterviewPage', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        // Default happy path mocks
        mockProtectRoute.mockResolvedValue({ id: mockUserId }); // Simulate authenticated user
        mockFindFirstInterview.mockResolvedValue(mockInterviewData);
        mockFindManyQuestions.mockResolvedValue(mockQuestionsData);
        mockNotFound.mockImplementation(() => {
            // Throwing an error simulates the notFound behavior in tests
            throw new Error('NEXT_NOT_FOUND');
        });
    });

    it('should render interview details and questions when found and authorized', async () => {
        await renderPage({ id: mockInterviewId });

        // Check protectRoute was called
        expect(mockProtectRoute).toHaveBeenCalledTimes(1);

        // Check DB calls
        // Check DB calls
        expect(mockFindFirstInterview).toHaveBeenCalledTimes(1);
        // Apply the fix here too
        expect(mockFindFirstInterview).toHaveBeenCalledWith({ where: expect.anything() });
        expect(mockFindManyQuestions).toHaveBeenCalledTimes(1);
        expect(mockFindManyQuestions).toHaveBeenCalledWith({
            where: expect.anything(),
            orderBy: expect.any(Function),
        });

        // Check rendered content
        expect(screen.getByRole('heading', { name: /Software Engineer Interview/i })).toBeInTheDocument();
        expect(screen.getByText(/TestCorp • 3 questions/i)).toBeInTheDocument();
        expect(screen.getByText('Tell me about yourself.')).toBeInTheDocument();
        expect(screen.getByText('Why TestCorp?')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /Start Answering/i })).toHaveLength(3);
        expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toHaveAttribute('href', '/dashboard');

        // Check notFound was NOT called
        expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('should call notFound if interview does not exist', async () => {
        mockFindFirstInterview.mockResolvedValue(null); // Simulate interview not found

        // Expect the component promise to reject or throw due to notFound()
        await expect(InterviewPage({ params: Promise.resolve({ id: mockInterviewId }) }))
            .rejects.toThrow('NEXT_NOT_FOUND');


        // Check DB call was made
        expect(mockFindFirstInterview).toHaveBeenCalledTimes(1);
        // Ensure notFound function was invoked
        expect(mockNotFound).toHaveBeenCalledTimes(1);
        // Questions shouldn't be fetched if interview isn't found
        expect(mockFindManyQuestions).not.toHaveBeenCalled();
    });

    it('should call notFound if interview does not belong to the user', async () => {
        mockFindFirstInterview.mockResolvedValue({
            ...mockInterviewData,
            userId: 'another-user-id', // Different user
        });

        await expect(InterviewPage({ params: Promise.resolve({ id: mockInterviewId }) }))
            .rejects.toThrow('NEXT_NOT_FOUND');

        expect(mockFindFirstInterview).toHaveBeenCalledTimes(1);
        expect(mockNotFound).toHaveBeenCalledTimes(1);
        expect(mockFindManyQuestions).not.toHaveBeenCalled();
    });

    it('should call notFound if no questions are found for the interview', async () => {
        mockFindManyQuestions.mockResolvedValue([]); // Simulate no questions

        await expect(InterviewPage({ params: Promise.resolve({ id: mockInterviewId }) }))
            .rejects.toThrow('NEXT_NOT_FOUND');

        expect(mockFindFirstInterview).toHaveBeenCalledTimes(1);
        expect(mockFindManyQuestions).toHaveBeenCalledTimes(1);
        expect(mockNotFound).toHaveBeenCalledTimes(1);
    });
});