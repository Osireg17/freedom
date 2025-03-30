import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignOutButton } from '../signout-button';
import { signOut } from '@/lib/actions/auth-actions';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Mock dependencies
jest.mock('@/lib/actions/auth-actions', () => ({
    signOut: jest.fn()
}));

jest.mock('../../../hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn()
}));

describe('SignOutButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useErrorLogging as jest.Mock).mockReturnValue({
            logError: jest.fn()
        });
    });

    it('renders without icon when showIcon is false', () => {
        render(<SignOutButton showIcon={false} />);
        const button = screen.getByTestId('sign-out-button');
        expect(button).toHaveTextContent('Sign out');
        expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    it('shows loading state when clicked', async () => {
        (signOut as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<SignOutButton />);

        fireEvent.click(screen.getByTestId('sign-out-button'));

        expect(screen.getByText('Signing out...')).toBeInTheDocument();
        expect(screen.getByTestId('sign-out-button')).toBeDisabled();

        await waitFor(() => {
            expect(signOut).toHaveBeenCalledTimes(1);
        });
    });

    it('handles sign out error correctly', async () => {
        const error = new Error('Sign out failed');
        const logError = jest.fn();
        (useErrorLogging as jest.Mock).mockReturnValue({ logError });
        (signOut as jest.Mock).mockRejectedValueOnce(error);

        render(<SignOutButton />);
        fireEvent.click(screen.getByTestId('sign-out-button'));

        await waitFor(() => {
            expect(logError).toHaveBeenCalledWith(error, { action: 'signOutButton' });
            expect(screen.getByTestId('sign-out-button')).not.toBeDisabled();
            expect(screen.getByText('Sign out')).toBeInTheDocument();
        });
    });
});