import { render, screen } from '@testing-library/react';
import JobInterviewPage from '../page';
import { protectRoute } from '@/lib/actions/auth-actions';

// Mock the protectRoute function
jest.mock('@/lib/actions/auth-actions', () => ({
    protectRoute: jest.fn().mockResolvedValue(undefined),
}));

// Mock the JobInterviewForm component
jest.mock('@/components/interviews/job/job-interview-form', () => {
    return function MockJobInterviewForm() {
        return <div data-testid="job-interview-form">Mock Job Interview Form</div>;
    };
});

describe('JobInterviewPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls protectRoute to ensure authentication', async () => {
        await JobInterviewPage();
        expect(protectRoute).toHaveBeenCalledTimes(1);
    });

    it('renders the job interview page with correct elements', async () => {
        const Component = await JobInterviewPage();
        render(Component);

        // Check main page elements
        expect(screen.getByTestId('job-interview-page')).toBeInTheDocument();
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
        expect(screen.getByTestId('job-interview-page-heading')).toBeInTheDocument();
        expect(screen.getByTestId('job-interview-page-description')).toBeInTheDocument();

        // Check heading content
        expect(screen.getByTestId('job-interview-page-heading')).toHaveTextContent('Job-Based Interview Practice');

        // Check for the "How It Works" section elements
        expect(screen.getByText('Paste Job Description')).toBeInTheDocument();
        expect(screen.getByText('AI Generates Questions')).toBeInTheDocument();
        expect(screen.getByText('Practice & Receive Feedback')).toBeInTheDocument();

        // Check for the tips section
        expect(screen.getByText('Tips for the best results')).toBeInTheDocument();

        // Check for the form section
        expect(screen.getByText('Create Your Job Interview')).toBeInTheDocument();
        expect(screen.getByTestId('job-interview-form')).toBeInTheDocument();
    });

    it('displays the back button with correct link', async () => {
        const Component = await JobInterviewPage();
        render(Component);

        const backButton = screen.getByTestId('back-button');
        expect(backButton).toHaveTextContent('Back');
        expect(backButton.closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('renders all three "How It Works" cards', async () => {
        const Component = await JobInterviewPage();
        render(Component);

        const howItWorksCards = [
            'Paste Job Description',
            'AI Generates Questions',
            'Practice & Receive Feedback'
        ];

        howItWorksCards.forEach(cardTitle => {
            expect(screen.getByText(cardTitle)).toBeInTheDocument();
        });
    });
});