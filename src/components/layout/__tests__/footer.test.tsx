import { render, screen } from '@testing-library/react';
import { Footer } from '../footer';

describe('Footer component', () => {
    it('renders the footer with correct company name', () => {
        render(<Footer />);

        expect(screen.getByTestId('site-footer')).toBeInTheDocument();
        expect(screen.getByTestId('footer-company-heading')).toHaveTextContent('AceYourHireVue');
    });

    it('displays the current year in the copyright notice', () => {
        render(<Footer />);

        const currentYear = new Date().getFullYear();
        expect(screen.getByTestId('footer-copyright')).toHaveTextContent(`© ${currentYear} AceYourHireVue. All rights reserved.`);
    });

    it('renders all navigation sections correctly', () => {
        render(<Footer />);

        // Check section headings
        expect(screen.getByTestId('footer-product-heading')).toHaveTextContent('Product');
        expect(screen.getByTestId('footer-company-links-heading')).toHaveTextContent('Company');
        expect(screen.getByTestId('footer-legal-heading')).toHaveTextContent('Legal');
    });

    it('renders all navigation links with correct hrefs', () => {
        render(<Footer />);

        // Product links
        expect(screen.getByTestId('footer-link-features')).toHaveAttribute('href', '/features');
        expect(screen.getByTestId('footer-link-pricing')).toHaveAttribute('href', '/pricing');
        expect(screen.getByTestId('footer-link-testimonials')).toHaveAttribute('href', '/testimonials');

        // Company links
        expect(screen.getByTestId('footer-link-about')).toHaveAttribute('href', '/about');
        expect(screen.getByTestId('footer-link-contact')).toHaveAttribute('href', '/contact');
        expect(screen.getByTestId('footer-link-careers')).toHaveAttribute('href', '/careers');

        // Legal links
        expect(screen.getByTestId('footer-link-privacy')).toHaveAttribute('href', '/privacy');
        expect(screen.getByTestId('footer-link-terms')).toHaveAttribute('href', '/terms');
    });

    it('renders social media links with correct attributes', () => {
        render(<Footer />);

        const twitterLink = screen.getByTestId('footer-social-twitter');
        expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
        expect(twitterLink).toHaveAttribute('target', '_blank');
        expect(twitterLink).toHaveAttribute('rel', 'noreferrer');

        const linkedinLink = screen.getByTestId('footer-social-linkedin');
        expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com');
        expect(linkedinLink).toHaveAttribute('target', '_blank');
        expect(linkedinLink).toHaveAttribute('rel', 'noreferrer');
    });
});