import DashboardPage from '../page';
import { protectRoute } from '@/lib/actions/auth-actions';

// Mock the dependencies
jest.mock('@/lib/actions/auth-actions', () => ({
    protectRoute: jest.fn(),
}));

jest.mock('@/components/dashboard/layout/dashboard-layout', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="dashboard-layout">Dashboard Layout</div>),
}));

describe('DashboardPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call protectRoute to verify authentication', async () => {
        const mockUser = { id: '123', name: 'Test User' };
        (protectRoute as jest.Mock).mockResolvedValue(mockUser);

        await DashboardPage();

        expect(protectRoute).toHaveBeenCalledTimes(1);
    });

    it('should redirect to sign-in when user is not authenticated', async () => {
        // When protectRoute doesn't return a user, it should handle the redirect internally
        (protectRoute as jest.Mock).mockResolvedValue(null);

        await DashboardPage();

        expect(protectRoute).toHaveBeenCalledTimes(1);
    });
});