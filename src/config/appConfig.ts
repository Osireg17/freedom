export const appConfig = {
    name: 'Phoenix', // Codename
    productName: 'AceYourHireVue',
    description: 'AI-powered interview preparation for one-way interviews',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    subscriptionTiers: {
        free: 'free',
        standard: 'standard',
        pro: 'pro',
    },
    limits: {
        free: {
            interviewsPerMonth: 3,
            retryAttemptsAllowed: 0,
        },
        standard: {
            interviewsPerMonth: 10,
            retryAttemptsAllowed: 2,
        },
        pro: {
            interviewsPerMonth: Infinity,
            retryAttemptsAllowed: 3,
        },
    },
};
