import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ProfileForm from '../profile-form';
import { createUserRecord } from '@/lib/actions/auth-actions';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/lib/actions/auth-actions', () => ({
    createUserRecord: jest.fn(),
}));

jest.mock('../../../hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn(),
}));

describe('ProfileForm', () => {
    const mockUserId = 'user-123';
    const mockEmail = 'test@example.com';
    const mockPush = jest.fn();
    const mockRefresh = jest.fn();
    const mockLogError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            refresh: mockRefresh,
        });
        (useErrorLogging as jest.Mock).mockReturnValue({
            logError: mockLogError,
        });
    });

    it('renders the profile form correctly', () => {
        render(<ProfileForm userId={mockUserId} email={mockEmail} />);

        expect(screen.getByText('Complete your profile')).toBeInTheDocument();
        expect(screen.getByTestId('profile-firstname-input')).toBeInTheDocument();
        expect(screen.getByTestId('profile-lastname-input')).toBeInTheDocument();
        expect(screen.getByTestId('profile-submit-button')).toBeInTheDocument();
    });

    it('validates form fields properly', async () => {
        render(<ProfileForm userId={mockUserId} email={mockEmail} />);

        // Submit form without filling required fields
        fireEvent.click(screen.getByTestId('profile-submit-button'));

        // Check validation messages appear
        await waitFor(() => {
            expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument();
            expect(screen.getByText('Last name must be at least 2 characters')).toBeInTheDocument();
        });
    });

    it('submits the form with valid data', async () => {
        (createUserRecord as jest.Mock).mockResolvedValue({ success: true });

        render(<ProfileForm userId={mockUserId} email={mockEmail} />);

        // Fill form
        fireEvent.change(screen.getByTestId('profile-firstname-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('profile-lastname-input'), { target: { value: 'Doe' } });

        // Submit form
        fireEvent.click(screen.getByTestId('profile-submit-button'));

        await waitFor(() => {
            expect(createUserRecord).toHaveBeenCalledWith(
                mockUserId,
                mockEmail,
                'John',
                'Doe'
            );
            expect(toast.success).toHaveBeenCalledWith('Profile created successfully');
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    it('handles form submission error', async () => {
        const errorMessage = 'Database connection failed';
        (createUserRecord as jest.Mock).mockResolvedValue({
            success: false,
            error: errorMessage
        });

        render(<ProfileForm userId={mockUserId} email={mockEmail} />);

        // Fill form
        fireEvent.change(screen.getByTestId('profile-firstname-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('profile-lastname-input'), { target: { value: 'Doe' } });

        // Submit form
        fireEvent.click(screen.getByTestId('profile-submit-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(errorMessage);
            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    it('handles unexpected exceptions during submission', async () => {
        const error = new Error('Network error');
        (createUserRecord as jest.Mock).mockRejectedValue(error);

        render(<ProfileForm userId={mockUserId} email={mockEmail} />);

        // Fill form
        fireEvent.change(screen.getByTestId('profile-firstname-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('profile-lastname-input'), { target: { value: 'Doe' } });

        // Submit form
        fireEvent.click(screen.getByTestId('profile-submit-button'));

        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalledWith(error, { action: 'profileForm' });
            expect(toast.error).toHaveBeenCalledWith('An error occurred while creating your profile. Please try again.');
        });
    });

    it('respects custom redirectTo prop', async () => {
        (createUserRecord as jest.Mock).mockResolvedValue({ success: true });

        render(<ProfileForm userId={mockUserId} email={mockEmail} redirectTo="/custom-page" />);

        // Fill form
        fireEvent.change(screen.getByTestId('profile-firstname-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('profile-lastname-input'), { target: { value: 'Doe' } });

        // Submit form
        fireEvent.click(screen.getByTestId('profile-submit-button'));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/custom-page');
        });
    });
});