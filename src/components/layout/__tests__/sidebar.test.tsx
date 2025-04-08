import { render, screen, fireEvent } from '@testing-library/react';
import DashboardSidebar from '../sidebar';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/auth/signout-button';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock the SignOutButton component
jest.mock('@/components/auth/signout-button', () => ({
    SignOutButton: jest.fn(() => <button data-testid="mocked-signout-button">Sign Out</button>),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
        li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('DashboardSidebar', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/dashboard');
        // Reset window.innerWidth for each test
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });
    });

    it('renders the sidebar with all navigation items', () => {
        render(<DashboardSidebar />);

        expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-item-overview')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-item-practice-interviews')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-item-analytics')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-item-profile')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-item-settings')).toBeInTheDocument();
        expect(screen.getByTestId('mocked-signout-button')).toBeInTheDocument();
    });

    it('highlights the active navigation item', () => {
        (usePathname as jest.Mock).mockReturnValue('/dashboard/analytics');
        render(<DashboardSidebar />);

        const analyticsItem = screen.getByTestId('sidebar-item-analytics');
        expect(analyticsItem).toHaveClass('bg-gray-800');
        expect(analyticsItem).toHaveClass('text-white');
    });

    it('collapses the sidebar when the collapse button is clicked', () => {
        render(<DashboardSidebar />);

        // Initially expanded, collapse button should be visible
        const collapseButton = screen.getByTestId('collapse-sidebar-button');
        expect(collapseButton).toBeInTheDocument();

        // Click to collapse
        fireEvent.click(collapseButton);

        // After collapse, expand button should be visible
        expect(screen.getByTestId('expand-sidebar-button')).toBeInTheDocument();

        // CSS variable should be updated
        expect(document.documentElement.style.getPropertyValue('--sidebar-width')).toBe('64px');
        expect(document.documentElement.classList.contains('sidebar-collapsed')).toBe(true);
    });

    it('expands the sidebar when the expand button is clicked', () => {
        render(<DashboardSidebar />);

        // First collapse the sidebar
        fireEvent.click(screen.getByTestId('collapse-sidebar-button'));

        // Then click to expand
        const expandButton = screen.getByTestId('expand-sidebar-button');
        fireEvent.click(expandButton);

        // CSS variable should be updated
        expect(document.documentElement.style.getPropertyValue('--sidebar-width')).toBe('256px');
        expect(document.documentElement.classList.contains('sidebar-expanded')).toBe(true);
    });

    it('collapses the sidebar on mobile when clicking outside', () => {
        // Mock window width to be mobile size
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 600,
        });

        render(<DashboardSidebar />);

        // Simulate a click outside the sidebar
        fireEvent.mouseDown(document.body);

        // The sidebar should be collapsed
        expect(document.documentElement.style.getPropertyValue('--sidebar-width')).toBe('64px');
        expect(document.documentElement.classList.contains('sidebar-collapsed')).toBe(true);
    });

    it('cleanup removes CSS classes when unmounted', () => {
        const { unmount } = render(<DashboardSidebar />);

        // Initially, sidebar-expanded class is added
        expect(document.documentElement.classList.contains('sidebar-expanded')).toBe(true);

        // Unmount component
        unmount();

        // Classes should be removed
        expect(document.documentElement.classList.contains('sidebar-expanded')).toBe(false);
        expect(document.documentElement.classList.contains('sidebar-collapsed')).toBe(false);
    });
});