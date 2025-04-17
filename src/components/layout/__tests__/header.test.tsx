import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Header } from '../header';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getCurrentUser } from '@/lib/actions/auth-actions';
import { usePathname } from 'next/navigation';

// Mock the hooks and functions
jest.mock('next/navigation', () => ({
    usePathname: jest.fn()
}));

jest.mock('../../../hooks/use-media-query', () => ({
    useMediaQuery: jest.fn()
}));

jest.mock('../../../lib/actions/auth-actions', () => ({
    getCurrentUser: jest.fn()
}));

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (usePathname as jest.Mock).mockReturnValue('/');
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        (getCurrentUser as jest.Mock).mockResolvedValue(null);
    });

    it('renders the logo with correct link', async () => {
        render(<Header />);

        const logoLink = screen.getByTestId('header-logo-link');
        expect(logoLink).toHaveAttribute('href', '/');
        expect(logoLink).toHaveTextContent('AceYourHireVue');
    });

    it('renders desktop navigation for non-authenticated users', async () => {
        render(<Header />);

        await waitFor(() => {
            expect(screen.getByTestId('header-nav-features')).toBeInTheDocument();
            expect(screen.getByTestId('header-nav-pricing')).toBeInTheDocument();
            expect(screen.getByTestId('header-nav-contact')).toBeInTheDocument();
            expect(screen.getByTestId('header-signin-button')).toBeInTheDocument();
            expect(screen.getByTestId('header-signup-button')).toBeInTheDocument();
        });
    });

    it('toggles mobile menu when menu button is clicked', async () => {
        (useMediaQuery as jest.Mock).mockReturnValue(true);

        render(<Header />);

        await waitFor(() => {
            expect(screen.getByTestId('header-mobile-menu-button')).toBeInTheDocument();
        });

        // Menu should be closed initially
        expect(screen.queryByTestId('header-mobile-menu')).not.toBeInTheDocument();

        // Click to open menu
        fireEvent.click(screen.getByTestId('header-mobile-menu-button'));

        // Menu should now be open
        expect(screen.getByTestId('header-mobile-menu')).toBeInTheDocument();
        expect(screen.getByTestId('header-mobile-nav-features')).toBeInTheDocument();

        // Click again to close menu
        fireEvent.click(screen.getByTestId('header-mobile-menu-button'));

        // Menu should be closed again
        expect(screen.queryByTestId('header-mobile-menu')).not.toBeInTheDocument();
    });

    it('renders AuthenticatedNavigation when user is logged in', async () => {
        const mockUser = {
            user_metadata: { first_name: 'John' }
        };
        (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

        render(<Header />);

        // Wait for authentication check to complete
        await waitFor(() => {
            // We can't directly test the AuthenticatedNavigation component,
            // but we can check that the regular navigation is not displayed
            expect(screen.queryByTestId('header-nav-features')).not.toBeInTheDocument();
        });
    });

    it('does not render header on error pages', async () => {
        (usePathname as jest.Mock).mockReturnValue('/error/404');

        const { container } = render(<Header />);

        expect(container.firstChild).toBeNull();
    });
});