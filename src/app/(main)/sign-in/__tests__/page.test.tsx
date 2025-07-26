import React from 'react';
import { render, screen } from '@testing-library/react';
import SignInPage, { metadata } from '../page';

// Mock the SignIn component since we're only testing the page component here
jest.mock('@/components/auth/signin', () => {
    return function MockSignIn() {
        return <div data-testid="signin-component">Sign In Component</div>;
    };
});

describe('SignInPage', () => {
    it('renders the sign in page with correct elements', () => {
        render(<SignInPage />);

        // Check if the page container is rendered
        const pageContainer = screen.getByTestId('signin-page');
        expect(pageContainer).toBeInTheDocument();

        // Check if the heading is rendered correctly
        const heading = screen.getByRole('heading', { name: /welcome back/i });
        expect(heading).toBeInTheDocument();

        // Check if the description text is rendered
        const descriptionText = screen.getByText(/sign in to your account to continue your interview practice/i);
        expect(descriptionText).toBeInTheDocument();

        // Check if the SignIn component is rendered
        const signInComponent = screen.getByTestId('signin-component');
        expect(signInComponent).toBeInTheDocument();
    });

    it('has correct metadata', () => {
        expect(metadata.title).toBe('Sign In - AceYourHireVue');
        expect(metadata.description).toBe('Sign in to your AceYourHireVue account to continue practicing for interviews');
    });
});