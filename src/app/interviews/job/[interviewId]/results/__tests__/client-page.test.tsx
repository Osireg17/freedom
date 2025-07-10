/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ResultsClientPage from '../client-page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Mock data
const mockInterview = {
  id: 'interview-123',
  companyName: 'Tech Corp',
  jobPosition: 'Software Engineer',
  jobDescription: 'Full-stack development role',
  interviewType: 'custom',
  createdAt: new Date('2024-01-01T10:00:00Z'),
}

const mockQuestions = [
  {
    id: 'question-1',
    questionNumber: 1,
    questionText: 'Tell me about yourself',
    questionType: 'behavioral',
  },
  {
    id: 'question-2',
    questionNumber: 2,
    questionText: 'What is your greatest strength?',
    questionType: 'behavioral',
  },
  {
    id: 'question-3',
    questionNumber: 3,
    questionText: 'Describe a challenging project',
    questionType: 'situational',
  },
]

const mockResponses = [
  {
    id: 'response-1',
    interviewQuestionId: 'question-1',
    audioDurationMs: 120000, // 2 minutes
    createdAt: new Date('2024-01-01T10:05:00Z'),
  },
  {
    id: 'response-2',
    interviewQuestionId: 'question-2',
    audioDurationMs: 90000, // 1.5 minutes
    createdAt: new Date('2024-01-01T10:10:00Z'),
  },
  {
    id: 'response-3',
    interviewQuestionId: 'question-3',
    audioDurationMs: 180000, // 3 minutes
    createdAt: new Date('2024-01-01T10:15:00Z'),
  },
]

describe('ResultsClientPage', () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue(mockRouter)
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the completed interview message', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('Interview Completed!')).toBeInTheDocument()
      expect(screen.getByText('Software Engineer at Tech Corp')).toBeInTheDocument()
    })

    it('should show completion percentage', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('100% Complete')).toBeInTheDocument()
    })

    it('should handle missing company name gracefully', () => {
      const interviewWithoutCompany = {
        ...mockInterview,
        companyName: null,
      }

      render(
        <ResultsClientPage
          interview={interviewWithoutCompany}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    })

    it('should handle missing job position gracefully', () => {
      const interviewWithoutPosition = {
        ...mockInterview,
        jobPosition: null,
      }

      render(
        <ResultsClientPage
          interview={interviewWithoutPosition}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('Interview at Tech Corp')).toBeInTheDocument()
    })
  })

  describe('Summary Cards', () => {
    it('should display correct questions answered count', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('3/3')).toBeInTheDocument()
      expect(screen.getByText('All questions completed')).toBeInTheDocument()
    })

    it('should display correct total response time', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      // Total: 120000 + 90000 + 180000 = 390000ms = 6:30
      expect(screen.getByText('6:30')).toBeInTheDocument()
      expect(screen.getByText('Across all questions')).toBeInTheDocument()
    })

    it('should display completion status', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('Complete')).toBeInTheDocument()
      expect(screen.getByText('Ready for review')).toBeInTheDocument()
    })
  })

  describe('Question Overview', () => {
    it('should display all questions with their details', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('Tell me about yourself')).toBeInTheDocument()
      expect(screen.getByText('What is your greatest strength?')).toBeInTheDocument()
      expect(screen.getByText('Describe a challenging project')).toBeInTheDocument()
    })

    it('should display question numbers', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display response times for each question', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('Response time: 2:00')).toBeInTheDocument()
      expect(screen.getByText('Response time: 1:30')).toBeInTheDocument()
      expect(screen.getByText('Response time: 3:00')).toBeInTheDocument()
    })

    it('should handle missing response data gracefully', () => {
      const incompleteResponses = mockResponses.slice(0, 2) // Only first 2 responses

      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={incompleteResponses}
        />
      )

      expect(screen.getByText('Response time: N/A')).toBeInTheDocument()
    })

    it('should handle null response time gracefully', () => {
      const responsesWithNullTime = [
        ...mockResponses.slice(0, 2),
        {
          ...mockResponses[2],
          audioDurationMs: null,
        },
      ]

      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={responsesWithNullTime}
        />
      )

      expect(screen.getByText('Response time: 0:00')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to dashboard when back button is clicked', async () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      const backButton = screen.getByText('Back to Dashboard')
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Time Formatting', () => {
    it('should format durations correctly', () => {
      const testCases = [
        { ms: 0, expected: '0:00' },
        { ms: 30000, expected: '0:30' },
        { ms: 60000, expected: '1:00' },
        { ms: 90000, expected: '1:30' },
        { ms: 3600000, expected: '60:00' },
      ]

      testCases.forEach(({ ms, expected }) => {
        const responses = [
          {
            id: 'test-response',
            interviewQuestionId: 'question-1',
            audioDurationMs: ms,
            createdAt: new Date(),
          },
        ]

        const { unmount } = render(
          <ResultsClientPage
            interview={mockInterview}
            questions={[mockQuestions[0]]}
            responses={responses}
          />
        )

        expect(screen.getByText(`Response time: ${expected}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Next Steps Section', () => {
    it('should display next steps information', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      expect(screen.getByText('What happens next?')).toBeInTheDocument()
      expect(screen.getByText(/Your responses have been submitted and recorded/)).toBeInTheDocument()
      expect(screen.getByText(/The hiring team will review your interview responses/)).toBeInTheDocument()
      expect(screen.getByText(/You will be contacted with feedback and next steps/)).toBeInTheDocument()
      expect(screen.getByText(/You can view this summary anytime from your dashboard/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty questions array', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={[]}
          responses={[]}
        />
      )

      expect(screen.getByText('0/0')).toBeInTheDocument()
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })

    it('should handle partial completion correctly', () => {
      const partialResponses = mockResponses.slice(0, 2)

      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={partialResponses}
        />
      )

      expect(screen.getByText('67% Complete')).toBeInTheDocument()
      expect(screen.getByText('2/3')).toBeInTheDocument()
    })

    it('should handle zero response time', () => {
      const zeroTimeResponses = mockResponses.map(response => ({
        ...response,
        audioDurationMs: 0,
      }))

      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={zeroTimeResponses}
        />
      )

      expect(screen.getByText('0:00')).toBeInTheDocument() // Total time
      expect(screen.getAllByText('Response time: 0:00')).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Interview Completed!')
    })

    it('should have accessible back button', () => {
      render(
        <ResultsClientPage
          interview={mockInterview}
          questions={mockQuestions}
          responses={mockResponses}
        />
      )

      const backButton = screen.getByRole('button', { name: /back to dashboard/i })
      expect(backButton).toBeInTheDocument()
    })
  })
})