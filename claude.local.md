# AceYourHireVue - Claude Local Context

## Repository Overview
**AceYourHireVue** is a comprehensive AI-driven interview preparation SaaS platform built with Next.js. The application helps job seekers practice one-way interviews through personalized question generation and AI-powered response analysis.

## Tech Stack
- **Frontend**: Next.js 15 with React 19, TailwindCSS, Shadcn/ui components
- **Backend**: Next.js API Routes with Trigger.dev for background processing  
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Clerk with multi-method auth
- **AI/LLM**: OpenAI, Deepseek API, Google Gemini for question generation and analysis
- **Speech**: Deepgram Nova-3 for speech-to-text transcription
- **Payments**: Stripe for subscription management
- **Monitoring**: Axiom for logging, BetterStack for observability
- **Testing**: Jest, React Testing Library, Cypress for E2E
- **Deployment**: Vercel with GitHub Actions CI/CD

## Project Structure
```
src/
├── app/                    # Next.js 13+ app directory
│   ├── (main)/            # Main app routes (contact, features, pricing, auth)
│   ├── api/               # API routes (interviews, logging, webhooks)
│   ├── dashboard/         # Dashboard pages
│   ├── interviews/        # Interview-related pages
│   └── auth/              # Authentication routes
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   ├── interviews/       # Interview functionality
│   ├── landing/          # Landing page components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components (Shadcn)
├── lib/                  # Utilities and configurations
│   ├── actions/          # Server actions
│   ├── axiom/           # Logging setup
│   ├── db/              # Database schema and config
│   ├── error/           # Error handling utilities
│   ├── supabase/        # Supabase client configurations
│   └── utils.ts         # General utilities
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── config/              # Application configuration
```

## Key Features
1. **Job-based Interview Questions**: AI generates questions from job descriptions
2. **Resume-based Questions**: Personalized questions based on uploaded resumes  
3. **Tiered Response Analysis**: Different levels of feedback based on subscription tier
4. **Device Setup**: Camera/microphone testing before interviews
5. **Progress Tracking**: Analytics and performance metrics
6. **Subscription Management**: Free, Standard, and Pro tiers

## Development Commands
- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run test`: Run tests in watch mode
- `npm run test:ci`: Run tests in CI mode
- `npm run test:coverage`: Generate test coverage report
- `npm run lint`: Run ESLint
- `npm run db:generate`: Generate Drizzle schema
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open Drizzle Studio

## Testing Strategy
- **Unit Tests**: Jest for individual components and functions
- **Integration Tests**: API route testing with mocked external services
- **E2E Tests**: Cypress for full user workflows
- **Accessibility Tests**: axe-core integration for WCAG compliance
- **Performance Tests**: Lighthouse CI for performance monitoring
- **Subscription Tier Tests**: Feature access validation

## Error Handling
- Centralized logging with `lib/error/logger.ts`
- Structured error responses with appropriate HTTP status codes
- User-friendly error messages with tier-appropriate detail levels
- Comprehensive error monitoring via Axiom and BetterStack

## Environment Setup
Key environment variables needed:
- Supabase credentials (URL, anon key, service role key)
- Clerk authentication keys
- OpenAI/Deepseek/Gemini API keys
- Deepgram API key
- Stripe keys for payments
- Axiom/BetterStack logging tokens

## Recent Development
Based on git history, recent work includes:
- Enhanced VideoRecorder tests with device session integration
- Interview results page implementation with detailed summaries
- Device session management and bypass functionality
- Device setup page for interview preparation

## Important Files to Know
- `src/lib/db/schema.ts`: Database schema definitions
- `src/components/interviews/question-answering/video-recorder.tsx`: Core recording functionality
- `src/app/api/interviews/`: API endpoints for interview management
- `trigger/`: Background job definitions for async processing
- `src/lib/device-session.ts`: Device session management utilities

## Current Branch
Working on: `feature/006-form-interview`