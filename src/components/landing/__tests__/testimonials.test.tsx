import { render, screen } from '@testing-library/react';
import { TestimonialsSection } from '../testimonials';

describe('TestimonialsSection', () => {
    it('renders the section with correct data-testid', () => {
        render(<TestimonialsSection />);
        const section = screen.getByTestId('landing-testimonials-section');
        expect(section).toBeInTheDocument();
    });

    it('renders the heading and description', () => {
        render(<TestimonialsSection />);
        const heading = screen.getByTestId('landing-testimonials-heading');
        const description = screen.getByTestId('landing-testimonials-description');

        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Success Stories');
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(/Hear from job seekers who improved their interview performance/);
    });

    it('renders all three testimonials', () => {
        render(<TestimonialsSection />);
        const testimonial1 = screen.getByTestId('landing-testimonial-1');
        const testimonial2 = screen.getByTestId('landing-testimonial-2');
        const testimonial3 = screen.getByTestId('landing-testimonial-3');

        expect(testimonial1).toBeInTheDocument();
        expect(testimonial2).toBeInTheDocument();
        expect(testimonial3).toBeInTheDocument();
    });

    it('displays the correct names and roles for each testimonial', () => {
        render(<TestimonialsSection />);

        expect(screen.getByText('Jamie Doe')).toBeInTheDocument();
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();

        expect(screen.getByText('Taylor Smith')).toBeInTheDocument();
        expect(screen.getByText('Marketing Manager')).toBeInTheDocument();

        expect(screen.getByText('Alex Rodriguez')).toBeInTheDocument();
        expect(screen.getByText('Business Analyst')).toBeInTheDocument();
    });
});