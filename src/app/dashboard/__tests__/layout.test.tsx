import { render, screen } from '@testing-library/react';
import DashboardLayout from '../layout';
import { protectRoute } from '@/lib/actions/auth-actions';

// Mock the auth actions
jest.mock('@/lib/actions/auth-actions', () => ({
    protectRoute: jest.fn(),
}));

// Mock the metadata since it's not relevant for these tests
jest.mock('next', () => ({
    Metadata: jest.fn(),
}));

describe('DashboardLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call protectRoute on render', async () => {
        // Arrange
        const mockChildren = <div>Test children</div>;

        // Act
        await render(await DashboardLayout({ children: mockChildren }));

        // Assert
        expect(protectRoute).toHaveBeenCalledTimes(1);
    });

    it('should render the children within the container', async () => {
        // Arrange
        const mockChildren = <div data-testid="test-children">Test children</div>;

        // Act
        const { container } = render(await DashboardLayout({ children: mockChildren }));

        // Assert
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
        expect(screen.getByTestId('test-children')).toBeInTheDocument();
    });

    it('should have the correct container classes', async () => {
        // Arrange
        const mockChildren = <div>Test children</div>;

        // Act
        const { container } = render(await DashboardLayout({ children: mockChildren }));
        const dashboardContainer = screen.getByTestId('dashboard-container');

        // Assert
        expect(dashboardContainer).toHaveClass('container');
        expect(dashboardContainer).toHaveClass('py-8');
        expect(dashboardContainer).toHaveClass('max-w-4xl');
        expect(dashboardContainer).toHaveClass('mx-auto');
    });
});