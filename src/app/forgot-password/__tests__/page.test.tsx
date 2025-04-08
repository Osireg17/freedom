import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompleteProfilePage from '../../complete-profile/page';
import { createClient } from '@/lib/supabase/server';

// Mock the dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

jest.mock('@/components/auth/profile-form', () => ({
    __esModule: true,
    default: () => <div data-testid="profile-form">ProfileForm</div>,
}));

describe('CompleteProfilePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders profile form when user is authenticated', async () => {
        const mockUser = {
            id: 'user123',
            email: 'test@example.com',
            email_confirmed_at: null,
            user_metadata: {}
        };

        (createClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: mockUser },
                    error: null,
                }),
            },
        });

        const Component = await CompleteProfilePage();
        render(Component);

        expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
        expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });

    it('shows an email verification notice when email is not verified', async () => {
        const mockUser = {
            id: 'user123',
            email: 'test@example.com',
            email_confirmed_at: null,
            user_metadata: {}
        };

        (createClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: mockUser },
                    error: null,
                }),
            },
        });

        const Component = await CompleteProfilePage();
        render(Component);

        expect(screen.getByText(/We've sent a verification email to/)).toBeInTheDocument();
    });

    it('does not show email verification notice when email is verified', async () => {
        const mockUser = {
            id: 'user123',
            email: 'test@example.com',
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {}
        };

        (createClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: mockUser },
                    error: null,
                }),
            },
        });

        const Component = await CompleteProfilePage();
        render(Component);

        expect(screen.queryByText(/We've sent a verification email to/)).not.toBeInTheDocument();
    });
});