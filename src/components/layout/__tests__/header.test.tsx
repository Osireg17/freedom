import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../header';

// Mock Next.js Link component
jest.mock('next/link', () => {
    const MockLink = ({ children, href, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string, children?: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

describe('Header component', () => {
    it('renders the header with logo', () => {
        render(<Header />);

        const header = screen.getByTestId('site-header');
        const logo = screen.getByTestId('header-logo-link');

        expect(header).toBeInTheDocument();
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('href', '/');
        expect(logo).toHaveTextContent('AceYourHireVue');
    });

    it('renders desktop navigation links', () => {
        render(<Header />);

        const featuresLink = screen.getByTestId('header-nav-features');
        const pricingLink = screen.getByTestId('header-nav-pricing');
        const contactLink = screen.getByTestId('header-nav-contact');

        expect(featuresLink).toBeInTheDocument();
        expect(featuresLink).toHaveAttribute('href', '/features');

        expect(pricingLink).toBeInTheDocument();
        expect(pricingLink).toHaveAttribute('href', '/pricing');

        expect(contactLink).toBeInTheDocument();
        expect(contactLink).toHaveAttribute('href', '/contact');
    });

    it('renders authentication buttons in desktop view', () => {
        render(<Header />);

        const signInButton = screen.getByTestId('header-signin-button');
        const signUpButton = screen.getByTestId('header-signup-button');

        expect(signInButton).toBeInTheDocument();
        expect(signInButton).toHaveAttribute('href', '/sign-in');

        expect(signUpButton).toBeInTheDocument();
        expect(signUpButton).toHaveAttribute('href', '/sign-up');
    });

    it('shows mobile menu when menu button is clicked', () => {
        render(<Header />);

        // Menu should not be visible initially
        expect(screen.queryByTestId('header-mobile-menu')).not.toBeInTheDocument();

        // Click the menu button
        const menuButton = screen.getByTestId('header-mobile-menu-button');
        fireEvent.click(menuButton);

        // Now the mobile menu should be visible
        const mobileMenu = screen.getByTestId('header-mobile-menu');
        expect(mobileMenu).toBeInTheDocument();

        // Check if mobile navigation links are rendered
        expect(screen.getByTestId('header-mobile-nav-features')).toBeInTheDocument();
        expect(screen.getByTestId('header-mobile-nav-pricing')).toBeInTheDocument();
        expect(screen.getByTestId('header-mobile-nav-contact')).toBeInTheDocument();
    });

    it('hides mobile menu when clicked again', () => {
        render(<Header />);

        // Open the menu
        const menuButton = screen.getByTestId('header-mobile-menu-button');
        fireEvent.click(menuButton);

        // Verify menu is open
        expect(screen.getByTestId('header-mobile-menu')).toBeInTheDocument();

        // Close the menu
        fireEvent.click(menuButton);

        // Verify menu is closed
        expect(screen.queryByTestId('header-mobile-menu')).not.toBeInTheDocument();
    });

    it('closes mobile menu when a navigation link is clicked', () => {
        render(<Header />);

        // Open the menu
        fireEvent.click(screen.getByTestId('header-mobile-menu-button'));

        // Click a navigation link
        fireEvent.click(screen.getByTestId('header-mobile-nav-features'));

        // Menu should be closed
        expect(screen.queryByTestId('header-mobile-menu')).not.toBeInTheDocument();
    });

    it('closes mobile menu when authentication buttons are clicked', () => {
        render(<Header />);

        // Open the menu
        fireEvent.click(screen.getByTestId('header-mobile-menu-button'));

        // Click sign in button
        fireEvent.click(screen.getByTestId('header-mobile-signin-button'));

        // Menu should be closed
        expect(screen.queryByTestId('header-mobile-menu')).not.toBeInTheDocument();

        // Open the menu again
        fireEvent.click(screen.getByTestId('header-mobile-menu-button'));

        // Click sign up button
        fireEvent.click(screen.getByTestId('header-mobile-signup-button'));

        // Menu should be closed
        expect(screen.queryByTestId('header-mobile-menu')).not.toBeInTheDocument();
    });
});