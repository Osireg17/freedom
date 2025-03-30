import { render, screen } from '@testing-library/react';
import SignUpPage from '../page';

// Mock the SignUp component
jest.mock('@/components/auth/signup', () => {
    return {
        __esModule: true,
        default: () => <div data-testid="signup-component">Mocked SignUp Component</div>,
    };
});

describe('SignUpPage', () => {
    it('renders the sign-up page with correct heading', () => {
        render(<SignUpPage />);

        // Check if page container is rendered
        expect(screen.getByTestId('signup-page')).toBeInTheDocument();

        // Check heading
        expect(screen.getByText('Create an Account')).toBeInTheDocument();
    });

    it('renders the description text', () => {
        render(<SignUpPage />);

        expect(
            screen.getByText('Enter your email below to create your account and start practicing')
        ).toBeInTheDocument();
    });

    it('renders the SignUp component', () => {
        render(<SignUpPage />);

        expect(screen.getByTestId('signup-component')).toBeInTheDocument();
    });

    it('has the correct layout classes', () => {
        render(<SignUpPage />);

        const container = screen.getByTestId('signup-page');
        expect(container).toHaveClass('container');
        expect(container).toHaveClass('flex');
        expect(container).toHaveClass('h-screen');
        expect(container).toHaveClass('w-full');
    });
});