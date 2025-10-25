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
Working on: `008-Eval-Algo`

## Branch Context (008-Eval-Algo)

### Recent Commits
1. **b913933**: Testing
2. **9944e45**: Propagate errors upwards instead of hiding them in try-catch blocks across multiple routes
3. **fab85a5**: Refactor device setup and connection flow
4. **e69e52e**: Eval for star method works now need to iron out some small stuff. need to add tests as well
5. **6098f42**: Starting eval algo

### Changes in this Branch
- 33 files changed, 27,248 insertions, 24,168 deletions
- Major work on evaluation algorithm implementation
- Device setup and connection flow refactoring
- Error handling improvements across API routes

---

## Evaluation Algorithm Architecture

### Overview
The evaluation system uses a **fan-out pattern** with Trigger.dev v4 SDK for analyzing interview responses. Currently implements STAR method analysis with infrastructure for additional dimensions.

### Core Flow
```
User Submits Response (video/audio)
    ↓
Upload to Supabase Storage
    ↓
Trigger recordInterviewTask
    ↓
Deepgram Transcription (Nova-3)
    ↓
analyseSTARTask (Parallel execution with triggerAndWait)
    ↓
Update Database with Analysis
    ↓
Delete Audio File
    ↓
Results Ready for User
```

### Implementation Status

#### ✅ Working (Production Ready)
1. **Video/Audio Recording & Upload**
   - Supabase Storage integration
   - WebM format support
   - Location: `src/app/api/interviews/[interviewId]/questions/[questionId]/response/route.ts`

2. **Transcription**
   - Deepgram Nova-3 API
   - Smart formatting and language detection
   - Location: `trigger/interviews/record.ts`

3. **STAR Method Analysis** (Core Implementation)
   - Full implementation with tier awareness (Free/Standard/Pro)
   - Proper error handling with graceful degradation
   - Database persistence
   - Location: `trigger/interviews/analyse-star-task.ts` (179 lines)

#### 📋 Planned (Infrastructure Ready, Not Implemented)
1. **Communication Analysis** - Empty file (0 bytes)
   - Would analyze: Speech quality, clarity, pacing, filler words
   - File: `trigger/interviews/analyse-communication-task.ts`

2. **Contextual Relevance Analysis** - Empty file (0 bytes)
   - Would analyze: Job description alignment, skills demonstration
   - File: `trigger/interviews/analyse-contextual-task.ts`

3. **Company Culture Alignment** - Empty file (0 bytes)
   - Would analyze: Value alignment, cultural fit
   - File: `trigger/interviews/analyse-culture-task.ts`

### STAR Method Scoring Structure

Each response is evaluated across 4 dimensions (25% weight each):

**SITUATION Component**
- `present` (boolean)
- `clarity` (0-100)
- `specificity` (0-100)
- `relevance` (0-100)
- `details` (string)
- `missing` (string)

**TASK Component**
- Same structure as Situation

**ACTION Component**
- Same structure + `leadership` (0-100) + `skills_demonstrated` (string[])

**RESULT Component**
- Similar structure + `quantifiable` (0-100) + `impact` (0-100)

**Overall Output**
```typescript
{
  overallScore: number;           // 0-100 weighted combination
  starCompleteness: number;       // 0-100 how complete STAR structure
  responseQuality: number;        // 0-100 overall quality
  strengths: string[];            // Specific strong points
  improvements: string[];         // Actionable improvements
  evaluation: string;             // User-friendly summary
}
```

### Tier-Based Analysis Differences

**Free Tier**
- Basic STAR structure evaluation
- Model: `gpt-4.1-mini`
- Max tokens: 1000
- Concise feedback (1-2 lines)

**Standard Tier**
- Full STAR breakdown
- Skill identification
- Model: `gpt-4.1-mini`
- Max tokens: 1000
- Detailed feedback (2-3 lines)
- Additional: `key_skills_shown`, `communication_effectiveness`, `next_steps`

**Pro Tier**
- Advanced analysis with behavioral indicators
- Model: `gpt-5-mini`
- Max tokens: 2000
- Comprehensive feedback (3-4 lines)
- Additional: `competencies_demonstrated`, `behavioral_indicators` (leadership/teamwork/problem_solving), `coaching_recommendations`, `interview_readiness`

### Key Files

**Core System**
- `trigger/interviews/record.ts` (126 lines) - Main orchestrator
- `trigger/interviews/analyse-star-task.ts` (179 lines) - STAR analysis implementation
- `src/lib/middleware/star-prompt.ts` - Tier-specific prompt generation
- `src/lib/middleware/create-prompts.ts` - Prompt utilities

**Database Schema**
- `src/lib/db/schema.ts` - Interview answers table with analysis columns:
  - `overallScore` (integer)
  - `starScores` (jsonb) - Full STAR breakdown
  - `communicationScores` (jsonb) - Placeholder
  - `contentScores` (jsonb) - Placeholder
  - `interpersonalScores` (jsonb) - Placeholder
  - `speechMetrics` (jsonb) - Placeholder
  - `contextualRelevanceScores` (jsonb) - Planned
  - `companyAlignmentScores` (jsonb) - Planned
  - `jobAlignmentBreakdown` (jsonb) - Planned
  - `improvementSuggestions` (jsonb)
  - `analyzedAt` (timestamp)

### Error Handling Pattern

**Principle**: Propagate errors upwards, never silently fail

Recent commit emphasized this approach across API routes. Analysis failures result in:
1. Transcription-only storage (graceful degradation)
2. Full error logging with context
3. User notification (no silent failures)

```typescript
try {
  const taskResult = await analyseSTARTask.triggerAndWait({...});
  if (taskResult.ok) {
    // Update with full analysis
  } else {
    throw new Error(`Task failed: ${taskResult.error}`);
  }
} catch (analysisError) {
  // Fallback: Store transcription only
  await db.update(interviewAnswers).set({
    transcription: transcript,
    // No scores/evaluation
  });
}
```

### Performance Characteristics

**Current**
- Transcription: 2-3 seconds
- STAR Analysis: 2-3 seconds
- Total pipeline: 4-6 seconds (sequential)

**With Planned Parallel Analysis**
- Could reduce to 3-4 seconds using `batchTriggerAndWait`

**Concurrency Limits**
- STAR analysis: 10 concurrent tasks
- Prevents LLM throttling

### Next Steps for Evaluation System

1. **Implement Communication Analysis Task**
   - Extract speech metrics from Deepgram results
   - Create scoring for clarity, pacing, confidence

2. **Add Results Retrieval API**
   - Create endpoint: `GET /api/interviews/[interviewId]/questions/[questionId]/analysis`
   - Format for UI consumption with tier-appropriate detail

3. **Create Analysis Results Component**
   - Display STAR breakdown with visualization
   - Show tier-specific features
   - Include improvement suggestions

4. **Implement Context-Aware Analysis**
   - Parse job descriptions for requirements
   - Map response to job competencies

5. **Add Company Research Pipeline**
   - Web search for company culture data
   - Cache company profiles

6. **Batch Processing Orchestration**
   - Implement `batchTriggerAndWait` for multiple analyses
   - Error handling for partial failures

---

## Device Setup & Connection Flow

### Architecture Overview

The device setup system uses a **3-stage architecture** with session-based management:

1. **Device Selection** (`/device-setup`) - User picks camera/mic, preview with audio levels
2. **Connection Verification** (`/device-setup/connect`) - Tests selected devices, stores stream
3. **Interview Recording** (`/questions/[id]`) - Reuses stored stream, no permission re-prompts

### Critical Innovation: Media Stream Persistence

The system maintains a **global MediaStream** that persists across page navigation:
- Eliminates redundant permission prompts (2 for first-time users, 0 for returning users)
- No re-enumeration delays
- Consistent device selection
- Better user experience

### Session Management System

**Three-tier storage approach:**
- **sessionStorage**: Browser session ID (unique per tab)
- **localStorage**: Device IDs + session ID reference + timestamp
- **JavaScript global**: Active MediaStream (reused for recording)

**24-hour expiration** ensures security while maintaining convenience

### Permission Handling Strategy

**Stage 1 (Device Selection)**: First `getUserMedia()` call → permission prompt
**Stage 2 (Verification)**: Second `getUserMedia()` with exact device IDs → stream stored globally
**Stage 3 (Recording)**: Uses stored stream directly → NO permission prompt

**Result**: Efficient permission handling with no redundancy

### Key Files

**Core System**
- `src/lib/device-session.ts` - Session & stream management (12 utility functions)
- `src/lib/__tests__/device-session.test.ts` - 50+ unit tests

**Components**
- `src/components/interviews/device/device-selector.tsx` - Device selection UI
- `src/components/interviews/device/device-connection-status.tsx` - Connection verification (271 lines)
- `src/components/interviews/question-answering/video-recorder.tsx` - Recording with stream reuse

**Routes**
- `src/app/interviews/job/[interviewId]/device-setup/page.tsx` - Setup page
- `src/app/interviews/job/[interviewId]/device-setup/device-bypass.tsx` - Session bypass
- `src/app/interviews/job/[interviewId]/device-setup/connect/page.tsx` - Connection verification (53 lines)
- `src/app/interviews/job/[interviewId]/client-wrapper.tsx` - Smart routing buttons

### Bypass Functionality

The `DeviceBypass` component intelligently redirects:
```
Valid Session + < 24h → Skip setup, go directly to recording
Otherwise → Show device setup UI
```

### Session Validation Rules

Valid only if ALL are true:
- Session ID matches browser session
- Timestamp < 24 hours old
- Both device IDs present (camera and microphone)
- JSON data not corrupted

Invalid sessions trigger automatic cleanup and redirect

### User Journeys

**First-Time User**: Setup → Verification → Recording (2 permission prompts)
**Returning User (Same Session)**: Bypass → Recording directly (0 permission prompts)
**After 24 Hours**: Session expires → New setup required

### Integration with VideoRecorder

VideoRecorder benefits significantly:
- Detects pre-existing stream on mount
- No permission re-prompts
- Immediate recording readiness
- Graceful fallback if needed

### Testing Coverage

- 50+ unit test assertions
- Session generation, validation, expiration
- Cross-session invalidation
- Corrupted data handling
- Media stream lifecycle
- beforeunload cleanup
- Component interaction tests

### Performance Impact

**Benefits**:
- Eliminates 2+ expensive getUserMedia calls per question
- Removes redundant permission prompts
- Faster transition to recording
- Consistent device selection

**Overhead**:
- ~50 bytes session ID
- ~200 bytes device settings
- Single global stream reference (minimal memory)

---

## Trigger.dev v4 SDK Best Practices

### Important Pattern

**DO USE** (v4):
```typescript
import { task, schemaTask } from "@trigger.dev/sdk";

export const myTask = schemaTask({
  id: "my-task",
  schema: z.object({...}),
  run: async (payload) => {...}
});

// Trigger and wait
const result = await myTask.triggerAndWait({...});
if (result.ok) {
  // Access result.output
} else {
  // Handle result.error
}
```

**DON'T USE** (v2 - deprecated):
```typescript
client.defineJob({
  id: "job-id",
  run: async (payload, io) => {...}
});
```

### Result vs Output

`triggerAndWait()` returns a `Result` object:
- Check `result.ok` before accessing `result.output`
- `result.error` contains error information if failed
- Use `.unwrap()` for quick error throwing

### Never Wrap in Promise.all

```typescript
// ❌ DON'T DO THIS
await Promise.all([
  task1.triggerAndWait({...}),
  task2.triggerAndWait({...})
]);

// ✅ DO THIS
await task.batchTriggerAndWait([
  { payload: {...} },
  { payload: {...} }
]);
```

---

## Known Gaps & Future Work

### Immediate Needs

1. **Results Display Implementation**
   - Current results page shows completion metrics only
   - No analysis scores or feedback displayed yet
   - Need to create components for STAR breakdown visualization

2. **Analysis Retrieval API**
   - No endpoint to fetch detailed analysis results
   - Need: `GET /api/interviews/[interviewId]/questions/[questionId]/analysis`

3. **Progress Indication**
   - No real-time progress updates during analysis
   - Could use Trigger.dev run status polling

4. **Retry Mechanism**
   - Failed analyses fallback to transcription-only
   - No automatic retry for transient failures

### Medium-Term Enhancements

1. Complete communication analysis task
2. Implement contextual relevance analysis
3. Add company culture alignment analysis
4. Create comprehensive scoring algorithm
5. Build company research pipeline

### Documentation Resources

- **Evaluation Plan**: `contextual-scoring-enhancement.md` (1584 lines)
- **Main README**: `README.md` with architecture overview
- **CLAUDE.md**: Trigger.dev v4 best practices