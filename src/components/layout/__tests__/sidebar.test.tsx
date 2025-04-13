import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardSidebar from '../sidebar';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const usePathnameMock = require('next/navigation').usePathname;

// Mock the next/navigation hook
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock the SignOutButton component
jest.mock('@/components/auth/signout-button', () => ({
    SignOutButton: jest.fn(({ className, 'data-testid': dataTestId }) => (
        <button className={className} data-testid={dataTestId}>
            Sign Out
        </button>
    )),
}));

describe('DashboardSidebar', () => {

    beforeEach(() => {
        usePathnameMock.mockReturnValue('/dashboard');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders expanded sidebar by default', () => {
        render(<DashboardSidebar />);

        expect(screen.getByText('AceYourHireVue')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice Interviews')).toBeInTheDocument();
        expect(screen.getByTestId('collapse-sidebar-button')).toBeInTheDocument();
    });

    test('collapses sidebar when toggle button is clicked', async () => {
        const user = userEvent.setup();
        render(<DashboardSidebar />);

        await user.click(screen.getByTestId('collapse-sidebar-button'));

        expect(screen.queryByText('AceYourHireVue')).not.toBeInTheDocument();
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.getByTestId('expand-sidebar-button')).toBeInTheDocument();
    });

    test('calls onToggle prop when provided', async () => {
        const mockOnToggle = jest.fn();
        const user = userEvent.setup();
        render(<DashboardSidebar onToggle={mockOnToggle} />);

        await user.click(screen.getByTestId('collapse-sidebar-button'));

        expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    test('renders sidebar in collapsed state when isCollapsed prop is true', () => {
        render(<DashboardSidebar isCollapsed={true} />);

        expect(screen.queryByText('AceYourHireVue')).not.toBeInTheDocument();
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.getByTestId('expand-sidebar-button')).toBeInTheDocument();
    });

    test('renders help section when expanded', () => {
        render(<DashboardSidebar />);

        expect(screen.getByText('Need help?')).toBeInTheDocument();
        expect(screen.getByTestId('help-button')).toBeInTheDocument();
        expect(screen.getByTestId('support-button')).toBeInTheDocument();
    });

    test('renders simplified help button when collapsed', async () => {
        const user = userEvent.setup();
        render(<DashboardSidebar />);

        await user.click(screen.getByTestId('collapse-sidebar-button'));

        expect(screen.queryByText('Need help?')).not.toBeInTheDocument();
        expect(screen.queryByTestId('support-button')).not.toBeInTheDocument();
        expect(screen.getByTestId('help-button')).toBeInTheDocument();
    });

    test('renders signout button', () => {
        render(<DashboardSidebar />);

        expect(screen.getByTestId('signout-button')).toBeInTheDocument();
    });
});