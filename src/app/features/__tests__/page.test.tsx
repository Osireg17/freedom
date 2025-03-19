import { render, screen } from '@testing-library/react';
import FeaturesPage from '../page';

// Mock the components that are used in the FeaturesPage
jest.mock('../../../components/features/features-card', () => ({
    FeatureCard: ({ testId, title, description }: { testId: string, title: string, description: string }) => (
        <div data-testid={testId}>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    ),
}));

jest.mock('../../../components/features/video-demo', () => ({
    VideoDemo: ({ testId, title }: { testId: string, title: string }) => <div data-testid={testId}>{title}</div>,
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>,
}));

describe('FeaturesPage', () => {
    it('renders the main page structure correctly', () => {
        render(<FeaturesPage />);

        // Check main heading
        expect(screen.getByTestId('features-page-heading')).toBeInTheDocument();
        expect(screen.getByTestId('features-page-description')).toBeInTheDocument();

        // Check main sections
        expect(screen.getByTestId('features-overview-section')).toBeInTheDocument();
        expect(screen.getByTestId('features-videos-section')).toBeInTheDocument();
        expect(screen.getByTestId('features-how-it-works-section')).toBeInTheDocument();
        expect(screen.getByTestId('features-cta-section')).toBeInTheDocument();
    });

    it('renders all feature cards', () => {
        render(<FeaturesPage />);

        // Check each feature card exists
        expect(screen.getByTestId('feature-card-questions')).toBeInTheDocument();
        expect(screen.getByTestId('feature-card-practice')).toBeInTheDocument();
        expect(screen.getByTestId('feature-card-star')).toBeInTheDocument();
        expect(screen.getByTestId('feature-card-communication')).toBeInTheDocument();
        expect(screen.getByTestId('feature-card-analytics')).toBeInTheDocument();
        expect(screen.getByTestId('feature-card-library')).toBeInTheDocument();
    });

    it('renders all video demonstrations', () => {
        render(<FeaturesPage />);

        // Check each video demo exists
        expect(screen.getByTestId('video-demo-job-based')).toBeInTheDocument();
        expect(screen.getByTestId('video-demo-resume-based')).toBeInTheDocument();
        expect(screen.getByTestId('video-demo-star-method')).toBeInTheDocument();
        expect(screen.getByTestId('video-demo-speech-analysis')).toBeInTheDocument();
    });

    it('renders how it works steps', () => {
        render(<FeaturesPage />);

        // Check all steps exist
        expect(screen.getByTestId('how-it-works-step-1')).toBeInTheDocument();
        expect(screen.getByTestId('how-it-works-step-2')).toBeInTheDocument();
        expect(screen.getByTestId('how-it-works-step-3')).toBeInTheDocument();
        expect(screen.getByTestId('how-it-works-step-4')).toBeInTheDocument();
    });

    it('renders the CTA section with correct links', () => {
        render(<FeaturesPage />);

        // Check CTA section exists
        expect(screen.getByTestId('features-cta-section')).toBeInTheDocument();

        // Check if there are links to sign-up and contact
        const links = screen.getAllByRole('link');
        const signUpLink = links.find(link => link.getAttribute('href') === '/sign-up');
        const contactLink = links.find(link => link.getAttribute('href') === '/contact');

        expect(signUpLink).toBeInTheDocument();
        expect(contactLink).toBeInTheDocument();
    });
});