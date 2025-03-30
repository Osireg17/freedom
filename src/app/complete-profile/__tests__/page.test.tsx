import { render, screen } from '@testing-library/react';
import CompleteProfilePage from '../page';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

jest.mock('@/components/auth/profile-form', () => ({
    __esModule: true,
    default: function MockProfileForm({ userId, email }: { userId: string; email: string }) {
        return <div data-testid="profile-form" data-user-id={userId} data-email={email} />;
    },
}));

describe('CompleteProfilePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the profile form with user data', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null,
            user_metadata: {}
        };

        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
            },
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);

        const { container } = render(await CompleteProfilePage());

        expect(screen.getByTestId('complete-profile-page')).toBeInTheDocument();
        expect(screen.getByTestId('profile-form')).toBeInTheDocument();
        expect(screen.getByTestId('profile-form')).toHaveAttribute('data-user-id', 'user-123');
        expect(screen.getByTestId('profile-form')).toHaveAttribute('data-email', 'test@example.com');
    });

    it('displays email verification notice when email is not verified', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null,
            user_metadata: {}
        };

        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
            },
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);

        render(await CompleteProfilePage());

        expect(screen.getByText(/We've sent a verification email to/)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it('does not display email verification notice when email is verified', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {}
        };

        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
            },
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);

        render(await CompleteProfilePage());

        expect(screen.queryByText(/We've sent a verification email to/)).not.toBeInTheDocument();
    });
});