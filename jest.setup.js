// jest.setup.ts
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    usePathname: () => '/features',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock for next/headers
jest.mock('next/headers', () => ({
    cookies: () => ({
        get: jest.fn(),
        getAll: jest.fn(),
        set: jest.fn(),
    }),
    headers: () => ({
        get: jest.fn(),
        getAll: jest.fn(),
        entries: jest.fn(),
    }),
}));

// Mock for useTheme from next-themes
jest.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: jest.fn(),
        themes: ['light', 'dark', 'system'],
    }),
}));

// Need to mock window.matchMedia for Tailwind/responsive components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock React error as console error during tests
const originalConsoleError = console.error;
console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
        return;
    }
    originalConsoleError(...args);
};
