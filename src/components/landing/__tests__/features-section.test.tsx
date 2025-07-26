import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../features-section';

describe('FeaturesSection', () => {
    it('renders the section with correct headings', () => {
        render(<FeaturesSection />);

        expect(screen.getByTestId('landing-features-section')).toBeInTheDocument();
        expect(screen.getByTestId('landing-features-heading')).toHaveTextContent('Key Features to Ace Your Interviews');
        expect(screen.getByTestId('landing-features-description')).toHaveTextContent('Our AI-powered platform is specifically designed to help you master one-way video interviews.');
    });

    it('renders all feature cards', () => {
        render(<FeaturesSection />);

        expect(screen.getByTestId('landing-feature-job-questions')).toBeInTheDocument();
        expect(screen.getByTestId('landing-feature-speech-analysis')).toBeInTheDocument();
        expect(screen.getByTestId('landing-feature-star-method')).toBeInTheDocument();
        expect(screen.getByTestId('landing-feature-question-library')).toBeInTheDocument();
        expect(screen.getByTestId('landing-feature-analytics')).toBeInTheDocument();
        expect(screen.getByTestId('landing-feature-practice')).toBeInTheDocument();
    });

    it('shows coming soon badge for features marked as coming soon', () => {
        render(<FeaturesSection />);

        expect(screen.getByTestId('landing-feature-question-library-coming-soon-badge')).toBeInTheDocument();
        expect(screen.queryByTestId('landing-feature-job-questions-coming-soon-badge')).not.toBeInTheDocument();
    });

    it('displays the footnote for coming soon features', () => {
        render(<FeaturesSection />);

        expect(screen.getByTestId('landing-features-footnote')).toHaveTextContent('* Feature coming soon');
    });

    it('renders feature cards with correct titles', () => {
        render(<FeaturesSection />);

        expect(screen.getByText('Job-Specific Questions')).toBeInTheDocument();
        expect(screen.getByText('Speech Analysis')).toBeInTheDocument();
        expect(screen.getByText('STAR Method Evaluation')).toBeInTheDocument();
        expect(screen.getByText('Interview Question Library')).toBeInTheDocument();
        expect(screen.getByText('Detailed Analytics')).toBeInTheDocument();
        expect(screen.getByText('Practice Options')).toBeInTheDocument();
    });
});