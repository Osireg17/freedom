import { render, screen } from '@testing-library/react';
import { HowItWorksSection } from '../how-it-works';

describe('HowItWorksSection', () => {
    it('renders the section with the correct id and test id', () => {
        render(<HowItWorksSection />);
        const section = screen.getByTestId('landing-how-it-works-section');
        expect(section).toBeInTheDocument();
        expect(section).toHaveAttribute('id', 'how-it-works');
    });

    it('renders the heading with the correct text', () => {
        render(<HowItWorksSection />);
        const heading = screen.getByTestId('landing-how-it-works-heading');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('How AceYourHireVue Works');
    });

    it('renders the description text', () => {
        render(<HowItWorksSection />);
        const description = screen.getByTestId('landing-how-it-works-description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(
            'Our simple 4-step process will help you prepare for your one-way video interviews'
        );
    });

    it('renders all 4 steps with correct numbering', () => {
        render(<HowItWorksSection />);

        const step1 = screen.getByTestId('landing-step-1');
        const step2 = screen.getByTestId('landing-step-2');
        const step3 = screen.getByTestId('landing-step-3');
        const step4 = screen.getByTestId('landing-step-4');

        expect(step1).toBeInTheDocument();
        expect(step2).toBeInTheDocument();
        expect(step3).toBeInTheDocument();
        expect(step4).toBeInTheDocument();

        expect(step1).toHaveTextContent('1');
        expect(step2).toHaveTextContent('2');
        expect(step3).toHaveTextContent('3');
        expect(step4).toHaveTextContent('4');
    });

    it('renders the correct heading and content for step 1', () => {
        render(<HowItWorksSection />);
        const step1 = screen.getByTestId('landing-step-1');

        expect(step1).toHaveTextContent('Create Your Session');
        expect(step1).toHaveTextContent(
            'Upload a job description or resume to generate relevant interview questions.'
        );
    });

    it('renders the correct heading and content for step 2', () => {
        render(<HowItWorksSection />);
        const step2 = screen.getByTestId('landing-step-2');

        expect(step2).toHaveTextContent('Practice Your Answers');
        expect(step2).toHaveTextContent(
            'Record your responses to questions, with options to retry up to 3 times.'
        );
    });

    it('renders the correct heading and content for step 3', () => {
        render(<HowItWorksSection />);
        const step3 = screen.getByTestId('landing-step-3');

        expect(step3).toHaveTextContent('Receive AI Feedback');
        expect(step3).toHaveTextContent(
            'Get detailed analysis on your content, delivery, and communication style.'
        );
    });

    it('renders the correct heading and content for step 4', () => {
        render(<HowItWorksSection />);
        const step4 = screen.getByTestId('landing-step-4');

        expect(step4).toHaveTextContent('Track Your Progress');
        expect(step4).toHaveTextContent(
            'Monitor your improvement over time and focus on areas that need attention.'
        );
    });
});