import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticatedNavigation } from '../auth-navigation';
import { usePathname } from 'next/navigation';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock the SignOutButton component
jest.mock('@/components/auth/signout-button', () => ({
    SignOutButton: jest.fn(() => <button data-testid="mocked-signout-button">Sign Out</button>),
}));

describe('AuthenticatedNavigation', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/dashboard');
    });

    it('renders desktop navigation by default', () => {
        render(<AuthenticatedNavigation username="testuser" />);

        // Check if nav items are rendered
        expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('nav-item-analytics')).toBeInTheDocument();
        expect(screen.getByTestId('nav-item-profile')).toBeInTheDocument();
        expect(screen.getByTestId('nav-item-interviews')).toBeInTheDocument();

        // Check username displayed
        expect(screen.getByTestId('user-menu-trigger')).toHaveTextContent('testuser');
    });

    it('displays "Account" when username is not provided', () => {
        render(<AuthenticatedNavigation />);

        expect(screen.getByTestId('user-menu-trigger')).toHaveTextContent('Account');
    });

    it('highlights active nav item based on current path', () => {
        (usePathname as jest.Mock).mockReturnValue('/analytics');
        render(<AuthenticatedNavigation />);

        const analyticsLink = screen.getByTestId('nav-item-analytics');
        expect(analyticsLink).toHaveClass('bg-primary/10');
        expect(analyticsLink).toHaveAttribute('aria-current', 'page');

        const dashboardLink = screen.getByTestId('nav-item-dashboard');
        expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('highlights interviews button when on interview path', () => {
        (usePathname as jest.Mock).mockReturnValue('/interviews/job');
        render(<AuthenticatedNavigation />);

        const interviewsButton = screen.getByTestId('nav-item-interviews');
        expect(interviewsButton).toHaveClass('bg-primary/10');
    });

    it('renders mobile navigation when isMobile is true', async () => {
        render(<AuthenticatedNavigation isMobile={true} username="testuser" />);

        // Check that we have the mobile menu button
        const mobileMenuButton = screen.getByTestId('mobile-menu-button');
        expect(mobileMenuButton).toBeInTheDocument();
        expect(mobileMenuButton).toHaveTextContent('testuser');

        // Desktop navigation elements should not be present
        expect(screen.queryByTestId('nav-item-dashboard')).not.toBeInTheDocument();
    });

    it('renders interview types dropdown', async () => {
        render(<AuthenticatedNavigation />);
        const user = userEvent.setup();

        // Open the dropdown
        await user.click(screen.getByTestId('nav-item-interviews'));

        // Check interview types
        expect(screen.getByTestId('interview-type-job')).toBeInTheDocument();
        expect(screen.getByTestId('interview-type-resume')).toBeInTheDocument();

        // Check that custom interview is disabled with "Coming Soon" badge
        const customInterview = screen.getByTestId('interview-type-custom');
        expect(customInterview).toHaveClass('cursor-not-allowed');
        expect(customInterview).toHaveTextContent('Coming Soon');
    });
});