# AceYourHireVue

## Product Overview

AceYourHireVue is a **specialized one-way interview preparation SaaS platform** focused exclusively on helping job seekers practice and excel in one-way video interviews. The application leverages **Large Language Models (LLMs) and speech analysis** to simulate realistic interview experiences that mirror actual HireVue assessments used by many Fortune 500 companies.

### Core Value Proposition

Unlike generic interview preparation tools, AceYourHireVue offers:

**Context-Aware Question Generation:** Dynamically tailored questions based on job descriptions, resumes, and industry trends.
**Real-Time Feedback:** Instant scoring and actionable insights on responses powered by Large Language Model (LLM) technology.
**Adaptive Learning:** Progress tracking and iterative practice sessions that evolve with the user's skill level.
**Specialized Focus:** Exclusively designed for the one-way video interview format.

### Key Features

**Job Description-Based Interviews:** Generate relevant interview questions from a specific job posting.
**Resume-Based Interviews:** Create personalized questions that target a user's experience.
**Interview Question Library:** Access a comprehensive database of behavioral and technical questions.
**Custom Interview Creation:** Select specific questions for targeted practice.
**Interview Replay & Practice:** Review recordings with the option to retry responses up to three times.
**Tiered Response Analysis:** AI-powered evaluation of content, communication quality, and speech patterns delivered after session completion.
**Progress Analytics:** Track performance metrics across different question categories.

### Target Audience

**Early Career Job Seekers:** Students, recent graduates, and interns preparing for one-way interviews.
**Mid-Career Professionals:** Individuals who need to practice one-way interview formats.
**Anyone Facing HireVue Interviews:** Job candidates specifically preparing for one-way video interview formats.

### Technology Highlights

**Frontend:** Next.js with ShadCN UI components for a responsive, accessible experience.
**Backend:** Next.js API Routes orchestrated by Trigger.dev for background tasks.
**Database:** Supabase (PostgreSQL) with Drizzle ORM for data management.
**AI Processing:** Integration with Deepseek/OpenAI/Gemini for question generation and LLM analysis.
**Speech Analysis:** Deepgram for transcription and utterance analysis.
**Authentication:** Clerk for secure user management.
**Deployment:** Vercel for serverless hosting.

### Business Model

AceYourHireVue operates on a **tiered subscription model**:

**Free Tier:** Basic assessment with limited interviews per month.
**Standard Tier:** Enhanced analysis and more features.
**Premium Tier:** Unlimited access and comprehensive features.

AceYourHireVue is a specialised practice platform that helps job seekers become comfortable and confident with the one-way interview format, allowing them to present their best selves when it matters most.


# AceYourHireVue Requirements

This document provides a **detailed overview of the requirements** for the AceYourHireVue SaaS platform, expanding on the initial summary by incorporating specific user stories, functional details, non-functional expectations, and acceptance criteria directly from the requirements documentation. It outlines the key functional and non-functional aspects of the application to guide the development and testing processes.

## Overview

AceYourHireVue is a SaaS application designed to help users prepare for job interviews by leveraging Large Language Models (LLMs) and an extensive question library to provide personalized interview questions, practice sessions, and progress tracking. This document details the specific features and constraints that shape the product’s design and development.

## Functional Requirements 

The AceYourHireVue platform provides several key features to support interview preparation:

**Job Description-Based Interview Questions**:
    **User Story:** As a job seeker, I want to enter details about a specific job posting so that I can practice for that exact position.
    **Functional Requirements:**
        The system shall present a form for users to input **job title, description, company name, years of experience, desired response time, and preparation time**.
        The system shall **parse the submitted job details to extract relevant keywords, roles, and responsibilities**.
        Based on the parsed details, the system shall generate a **minimum of five job-specific interview questions** covering various scenarios.
        Users shall be able to **preview the generated questions** before starting the interview.
        Users shall be able to **record and submit answers** for each question.
        Users shall have the option to **replay their recorded responses**.
        Users shall be permitted to **redo their responses up to three times** before final LLM evaluation.
    **Acceptance Criteria Example (FR-1.3):** The system generates at least 5 unique job-specific questions; questions cover at least 3 different scenarios relevant to the job/industry; generated questions contain job-specific terminology.

**Resume-Based Interview Questions**:
    **User Story:** As an experienced professional, I want the system to analyse my resume so that I can practice answering questions relevant to my specific background.
    **Functional Requirements:**
        Users shall be able to **upload their resume in PDF or DOCX format**.
        The system shall **parse the uploaded resume to extract key skills, experiences, and job history**.
        The system shall allow users to **generate questions based on their last uploaded PDF**.
        The system shall generate at least **five personalized interview questions** based on the extracted resume data.
        Generated questions shall be categorized into five areas: **Technical Skills, Experience, Problem Solving, Leadership, and Communication**.
        Users shall be allowed to redo their responses up to **three times**.
        Users shall be able to **record and submit answers**.
        Users shall have the ability to **replay their recorded responses**.
        Users shall be permitted to **redo their responses up to three times**.
    **Acceptance Criteria Example (FR-2.5):** Questions are tagged with their respective categories; each category has at least one question; category filters work correctly.

**Interview Question Library**:
    **User Story:** As a frequent user, I want to access a diverse library of interview questions so that I can prepare for various interview scenarios.
    **Functional Requirements:**
        Users shall be able to **filter and search** questions by company, industry, category, difficulty, and question type.
        The system shall display **metadata** for each question, including source, frequency of use, and company association.
        Users shall be able to **submit questions** they've encountered to the public library.
        The system shall incorporate questions from **public sources like Glassdoor**.
        Submitted questions shall go through a **moderation process**.
        Users shall be able to **select up to five questions** to create custom sessions.
        The system shall **recommend relevant questions** based on user targets.
        Users shall be able to **save their custom question selections** as templates.
    **Acceptance Criteria Example (FR-3.1):** Filter controls display all available categories, difficulty levels, and question types; search function returns relevant results within 2 seconds; results update dynamically as filters are applied.

**Interview Replay and Practice**:
    **User Story:** As a user working on my interview skills, I want to review my recorded responses so that I can identify areas for improvement.
    **Functional Requirements:**
        Users shall be able to **review recorded interview sessions**, including video and audio.
        Users shall be allowed to **redo individual questions up to three times**.
        The system shall **automatically delete previous recordings** upon each redo.
        Users shall be able to **retake entire interview sessions or specific questions**.
        Redo sessions shall be stored **separately in the history**.
    **Acceptance Criteria Example (FR-4.2):** System limits retries to 3 per question; retry option is clearly presented; system maintains the latest retry as the final submission.

**User-Created Interviews**:
    **User Story:** As a job seeker with specific concerns, I want to create custom interview sessions focusing on my weak areas.
    **Functional Requirements:**
        Users shall be able to create custom sessions by selecting **five questions**.
        Users shall be able to create sessions with **mixed question types**.
        Users shall be able to **save their custom interview sessions**.
        Users shall be able to **name and organize** their custom sessions.
        Users shall be able to **record answers** to all questions in custom sessions.
        **AI feedback** shall be generated for each response.
        Completed custom sessions shall appear in **history with analytics**.
        The **retry counter** shall limit attempts to three.
    **Acceptance Criteria Example (FR-5.1):** Interface allows selection of exactly 5 questions; questions are presented in order selected; error message if fewer than 5 selected.

**User Onboarding and Management**:
    **User Story:** As a new user, I want a simple registration process so that I can quickly start practicing interviews.
    **Functional Requirements:**
        The system shall provide **secure registration and login** (email/password or social login).
        The system shall support **password reset and account recovery**.
        Users shall be able to create and edit their **profiles**.
        Users shall be able to view their **subscription status and manage payment methods**.
        Users shall be able to **download or delete their data**.
        The system shall provide **clear privacy settings and data usage information**.

**Feedback and Progress Tracking**:
    **User Story:** As a user committed to improvement, I want to track my progress over time so that I can see how my interview skills are developing.
    **Functional Requirements:**
        The system shall **evaluate user responses using LLM technology** and provide structured feedback based on content, clarity, and relevance.
        Feedback shall include **specific suggestions for improvement and highlight strengths**.
        The system shall display **performance metrics and improvement trends** over time through an interactive dashboard.
        Users shall be able to view performance by **question category, session type, and time period**.
        Based on performance, the system shall **recommend specific questions or sessions**.

## Non-Functional Requirements 

The AceYourHireVue platform is built with the following non-functional considerations:

**Performance & Scalability**:
    **NFR-1:** Question generation API shall complete within **10 seconds** under normal load.
    **NFR-2:** The system shall support over **10,000 concurrent users** with average page load times under **2 seconds**. **Load testing and auto-scaling** are required.
    **Acceptance Criteria Example (NFR-1):** Question generation completes in ≤10 seconds for 90% of requests; system provides loading indicator; error handling if generation exceeds 20 seconds.

**Security & Compliance**:
    **NFR-3:** All sensitive data shall be encrypted using **AES-256** both in transit (**TLS 1.2+**) and at rest.
    **NFR-4:** The system shall adhere to **GDPR, CCPA**, and other relevant data protection regulations, including user consent management and audit logging.
    **Acceptance Criteria Example (NFR-3):** All data transmission uses TLS 1.2+; stored data is encrypted with AES-256; security audit confirms no vulnerable endpoints.

**Usability & Accessibility**:
    **NFR-5:** The user interface shall be **fully mobile-responsive** and meet **WCAG 2.1 Level AA** accessibility guidelines.
    **NFR-6:** The **onboarding process** shall be streamlined to no more than three steps with intuitive navigation.

## Future Enhancements

Future enhancements planned for AceYourHireVue include:

AI-driven video analytics and tone analysis.
Community engagement features (discussion forums, shared interview questions).

Okay, I can provide a more detailed breakdown of the AceYourHireVue technical architecture based on the "AceYourHireVue Technical/Architecture Documentation.pdf".

# AceYourHireVue Technical Architecture

This document provides a **detailed blueprint of the AceYourHireVue SaaS platform's technical architecture**. It elaborates on the system design, infrastructure choices, and key technologies to ensure a **scalable, secure, and high-performance** web application. This architecture document aims to clarify system interactions and component responsibilities, supporting **clear implementation, maintainability, and future scalability**.

## 1. Introduction 

**Purpose:** This document serves as the **technical and architectural blueprint** for the AceYourHireVue SaaS platform.
**AceYourHireVue leverages Large Language Models (LLMs)** to generate personalized interview questions, provide automated feedback, and track user progress.
The architecture is designed to support **real-time API interactions, secure data storage, efficient AI-driven assessments, and compliance with data privacy standards**.
**Intended Audience:** This document is intended for:
    **Developers:** To understand the system structure, dependencies, and implementation best practices.
    **Future Engineers/Contributors:** To gain insights into design choices and maintainability strategies.
    **Product Stakeholders:** To align technical decisions with business objectives.
    **Security & Compliance Teams:** To ensure adherence to industry standards and data protection regulations.
**Scope of the Document:** This document outlines:
    **System Architecture:** A high-level overview of the frontend, backend, database, and AI components.
    **Technology Stack:** The frameworks, tools, and services selected.
    **Infrastructure & Deployment Strategy:** Hosting, CI/CD, and monitoring mechanisms.
    **Security & Compliance:** Data protection, authentication, and regulatory adherence.
    **Scalability & Performance:** Strategies to optimize performance and support growth.
    **Future Enhancements:** Potential upgrades and improvements for later iterations.

## 2. System Overview 

**High-Level Architecture:** AceYourHireVue is built on a **modular and scalable architecture**. It leverages **modern cloud-based and serverless solutions** for performance and cost-efficiency.
**Core Components include:** (As elaborated in subsequent sections)

## 3. Application Architecture 

**3.1 Frontend:**
    **Framework:** **Next.js** is used for server-side rendering (SSR) and static site generation (SSG).
    **State Management:** **TanStack Query (React Query)** is employed for efficient data fetching and caching.
    **Styling:** **ShadCN UI**, a customizable component library, provides a modern and accessible user interface.
    **Routing:** The **Next.js App Router** is used for improved routing performance.
    **Security Considerations:**
        **CSRF protection** is implemented through secure HTTP-only cookies.
        **Client-side validation** helps prevent malicious input.
        **API rate limiting** is in place to mitigate abuse.
**3.2 Backend:**
    Implemented using **Next.js API routes**.
    **Trigger.dev** orchestrates background tasks. It's important to note that Trigger.dev functions must return a job ID immediately to track asynchronous execution, and pre-warming strategies are used to mitigate cold start delays.
**3.3 AI and Speech Processing:**
    **Question Generation and User Answer Analysis:** The system uses **Deepseek API, OpenAI, or Gemini** [Need to evaluate price & effectiveness] for dynamically generating role-specific interview questions and analyzing user answers.
    **Speech Analysis:** **Deepgram** is used for real-time speech-to-text transcription and analysis of user responses. Deepgram evaluates fluency, tone, and confidence, providing detailed insights into verbal communication.
**3.4 Database & Storage:**
    **Supabase (PostgreSQL)** is the primary database for structured data, offering automated backups and read replicas. It also provides secure file storage for resumes and recordings.
    **Drizzle ORM** is used for type-safe database operations.
    **NeonDB** will be used to run unit tests and integration tests.
**3.5 Authentication & User Management:**
    **Clerk** handles multi-method authentication (email/password, Google, Microsoft) and is integrated with Supabase.
**3.6 Pricing & Payments:**
    **Stripe** is used for subscription management and payment processing.
**3.7 Hosting & Deployment:**
    **Vercel** hosts both the frontend and backend (Next.js API routes), providing serverless deployments and automatic scaling.
    Background tasks are managed by Trigger.dev.

## 4. AI & Speech Processing

(Information already covered in 3.3)

## 5. Infrastructure & Deployment Strategy

**5.1 Hosting & Deployment:**
    **Frontend:** Hosted on Vercel with continuous integration and automatic scaling.
    **Backend:** Next.js API routes on Vercel; background tasks managed by Trigger.dev.
    **Database:** Supabase PostgreSQL with automated backups and read replicas.
    **File Storage:** Supabase Storage for resume uploads and interview recordings.
    **CI/CD Pipeline:** **GitHub Actions** is used for automated testing, linting, and deployment.
    **Background Processing Consideration:** As mentioned earlier, Trigger.dev functions have specific considerations regarding job ID return and cold starts.
**5.2 Monitoring & Logging:**
    **Error Tracking:** **Highlight.io** monitors both frontend and backend errors.
    **Performance Monitoring:** **Vercel Analytics** is used for frontend performance, and custom metrics are tracked for backend APIs.
    **Logging:** Centralized logging is implemented using **Supabase logs** and **Vercel server logs** to track API usage and performance. **BetterStack** is also implemented for comprehensive logging and error tracking, offering features like a generous free tier and SQL-like query syntax for log analysis.
    **Audit Logging:** Detailed logs are maintained for security audits and anomaly detection to support regulatory requirements.

## 6. Security & Compliance 

**Error Handling Philosophy:** AceYourHireVue prioritizes user experience preservation (graceful degradation), comprehensive error tracking, quick recovery from transient failures, and a clear distinction between user and system errors.
**Global Error Handling Framework:**
    **Frontend Error Handling:** Aims for clear, non-technical language, actionable next steps, and appropriate tone.
    **Error Display Strategy:** Critical errors are shown in modal dialogs, non-critical errors as inline notifications, and background errors as toast notifications.
    **Common Error Scenarios and Messaging:** The document provides examples of user messages and internal context for scenarios like resume upload failure, LLM generation timeout, and audio recording failure.
**Monitoring and Alerting:** Highlight.io is used for real-time error tracking, and a custom dashboard visualizes error rates.
**Graceful Degradation:** The system aims to maintain core functionality even when non-critical features fail. For example, if the transcription service is down, a simplified interview mode is shown. AI-intensive features are disabled first during service disruptions, and users are clearly informed about temporarily limited functionality.
**Deployment Error Prevention:** Automated checks are implemented in the CI/CD pipeline to prevent deploying broken code, such as checking for `console.log` statements and incomplete error handling (`throw new Error` without `try/catch`).

## 7. Error Handling Strategy

(Largely covered in Section 6)

## 8. Testing Strategy

**Testing Philosophy:** AceYourHireVue adopts a comprehensive testing approach based on the testing pyramid principle, balancing speed, coverage, and reliability.
**Types of Tests:**
    **Unit Tests:** Test individual functions and small units of code in isolation using Jest with TypeScript support. A minimum of **70% test coverage** is required for all business logic code, enforced in the CI pipeline.
    **Component Tests:** Validate the rendering and behavior of React components.
    **End-to-End (E2E) Tests:** Simulate real user scenarios to validate overall system behavior using Cypress with Percy for visual regression testing. Critical paths like subscription signup are prioritized for E2E tests.
    **Performance Tests:** Ensure system responsiveness, especially for AI-powered features, using Lighthouse CI and custom timing measurements. Baseline performance expectations are defined (e.g., <3s for question generation).
    **Accessibility Tests:** Ensure WCAG 2.1 AA compliance using axe-core integration.
    **Subscription Tier Tests:** Verify that features are correctly enabled or disabled based on the user's subscription tier using Jest. Each feature must have tests for all applicable tiers (Free, Standard, Pro).
    **AI Component Tests:** Ensure reliability and quality of AI-generated content using a custom test framework. Acceptable quality thresholds are defined for AI outputs.
**Test Case Management & Execution:**
    In-code documentation using JSDoc is maintained.
    Test scenarios are created for complex features.
    Consistent test data and mock implementations are used.
    Various npm scripts are defined for running different types of tests (`test`, `test:ci`, `test:coverage`, `test:perf`, `test:a11y`, `test:subscription`, `test:ai`, `cypress:open`, `cypress:run`, `cypress:visual`).
    Continuous testing is implemented with unit, component, and critical integration tests running on every PR, and the full E2E suite running nightly and before production deployments.
    Test coverage reports are generated and stored.
    Test flakiness detection is implemented.
**Test Environment Strategy for Vercel Deployment:**
    **Development:** Local development using `next dev` with `.env.local`. Uses local mocks for external services where appropriate and connects to development instances of Supabase.
    **Preview Environments:** Automatically created by Vercel for each pull request with isolated Supabase test instances.
    **Staging:** Deployed from a dedicated `staging` branch, using a separate Supabase project mimicking production. URL: `staging.aceyourhirevue.com`.
    **Production:** Deployed from the `main` branch, connected to the production Supabase instance with additional deployment safeguards. URL: `aceyourhirevue.com`.
    **Environment Variables Management:** Vercel's UI is used to manage environment-specific values, with sensitive credentials stored securely. A `.env.example` file is maintained for documentation.
    **Vercel-Optimised Testing Workflow:** Includes local testing with `.env.test.local`, automated checks on PRs, and environment mapping.
**Testing Schedule and Cadence:** Unit tests run on every commit, integration tests daily and on PRs, E2E tests on staging before deployment, performance tests weekly, accessibility audits bi-weekly, and manual exploratory testing before major releases.
**Bug Prioritisation and Resolution:** Bugs are classified by severity (Critical, High, Medium, Low) with defined resolution SLAs.
**LLM Response Validation and Speech Analysis Testing:** Specific approaches are defined for testing the AI components, including consistency checks, adherence to expected formats, accuracy verification, and performance benchmarking. Feedback quality is also assured through subject matter expert review.

## 9. Security Implementation Details

**Security-First Development Approach:** Emphasizes leveraging trusted third-party services, implementing security best practices, prioritizing user data protection, and using automated vulnerability scanning.
**Authentication Implementation:**
    **Clerk Integration:** Utilizes Clerk's pre-built components for rapid deployment and configures multi-provider authentication.
    **Strong Password Policies:** Minimum length and complexity requirements are enforced.
    **MFA:** Enabled for added security.
    **Session Management:** Uses Clerk's session management with JWT-based authentication.
**Authorization Implementation:** Role-based access control is used to manage user permissions. Supabase Row Level Security (RLS) policies are implemented to protect data at the database level.
**Data Protection Measures:** Sensitive data is encrypted at rest using Supabase's encryption features. Data in transit is secured with HTTPS. Steps are taken to minimize the exposure of user data to AI services, such as caching common AI responses.
**Vulnerability Management:** Regular dependency updates are performed using Dependabot. GitHub CodeQL scans are scheduled weekly for code vulnerabilities.
**Security Monitoring for Solo Development:** Automated security scanning, simple security logging, and Sentry for capturing security-related exceptions are implemented. Manual security reviews are conducted before major deployments, using the OWASP Top 10 as a checklist.
**Incident Response Plan:** A simple procedure is defined for identifying, containing, fixing, and notifying users about security issues, as well as documenting preventive measures.
**Recovery Readiness:** Database backups with point-in-time recovery, documented recovery procedures, updated rollback procedures, and template communications for security incidents are maintained.
**Compliance Implementation:** GDPR and cookie compliance measures are implemented, including data export and deletion functionalities, a clear privacy policy, and cookie notices.


The technical architecture for AceYourHireVue is designed to be **modular, scalable, and cost-efficient**, leveraging modern cloud-based and serverless solutions. The architecture supports real-time API interactions, secure data storage, efficient AI-driven assessments, and compliance with data privacy standards. This document outlines the system design, infrastructure choices, and key technologies.

**Key Components of the Architecture:**

**Frontend:**
    The frontend is built using **Next.js (React-based)** for server-rendered and statically generated content.
    This choice provides **fast rendering, SEO-friendliness, and a responsive UI**.
    **ShadCN UI**, a component library based on Tailwind CSS, is used for styling a modern and customizable user interface.
    **TanStack Query (React Query)** is used for efficient data fetching and caching.
    **Next.js App Router** is implemented for improved routing performance.
    Security considerations for the frontend include **CSRF protection through secure HTTP-only cookies, client-side validation, and API rate limiting**.

**Backend:**
    The backend logic is implemented using **Next.js API Routes**.
    **Trigger.dev** is used for orchestrating asynchronous workflows and background tasks.
    **Cold start mitigation** strategies, such as pre-warming and fallback queuing mechanisms, are employed for Trigger.dev to reduce delays.

**Database & Storage:**
    **Supabase (PostgreSQL)** is the technology chosen for structured data storage, providing automated backups, read replicas, and secure file storage.
    Supabase Storage is used for storing resumes and interview recordings.
    **NeonDB** will be used to run unit tests and integration tests.
    **Drizzle ORM** is used for type-safe database operations with Supabase.
    Database strategy with Vercel involves using **Supabase database branches or separate projects for each environment** and implementing database migrations.

**AI & Speech Processing:**
    **Question Generation:** AceYourHireVue uses either **Deepseek API, OpenAI, or Gemini** [Need to evaluate price & effectiveness] for dynamically generating role-specific interview questions and analyzing user answers. Specifically, **ChatGPT 4o-mini-web-search** and **Google Gemini Flash 2.0 with search grounding** are considered.
    **Speech Analysis:** **Deepgram** is used for real-time speech-to-text transcription and analysis of stored responses. Deepgram's Nova-3 model is used with feature flags enabled based on the user's subscription tier.

**Authentication & User Management:**
    **Clerk** handles multi-method authentication (email/password, Google, Microsoft) and is integrated with Supabase.
    Clerk's middleware is used to protect API routes by validating authentication tokens.
    Session management is handled by Clerk with **JWT-based authentication** and secure HTTP-only cookies.

**Hosting & Deployment:**
    The frontend and backend (Next.js API routes) are hosted on **Vercel** for serverless deployments and automatic scaling.
    Vercel provides continuous integration and preview environments for each pull request.
    Deployment safety includes checks and monitoring to prevent and quickly resolve deployment-related errors.

**Pricing & Payments:**
    **Stripe** is used for subscription management and payment processing.

**Error Handling:**
    AceYourHireVue implements a **multi-layered error handling approach** prioritizing user experience preservation (graceful degradation), comprehensive error tracking and visibility, quick recovery from transient failures, and a clear distinction between user errors and system failures.
    **Highlight.io** is used for real-time error tracking and aggregation.
    Error handling strategies include **graceful degradation** to maintain core functionality when non-critical features fail.
    **Circuit Breaker** and **Bulkhead** patterns are implemented for recovery and resilience, preventing cascading failures and resource exhaustion.
    A **Feature Degradation Strategy** is in place to gracefully degrade functionality during service disruptions based on service health.
    Error messages follow specific guidelines to be clear, actionable, contextual, consistent, constructive, and concise.
    Error display strategies vary based on error type, using modal dialogs for critical errors and inline/toast notifications for non-critical/background errors.
    Monitoring and alerting are crucial, with plans for error dashboards focusing on system health, user experience, and AI services.
    A post-mortem process is defined for significant incidents, including timeline documentation, root cause analysis, impact assessment, remediation plan, and lessons learned.

**Monitoring and Logging:**
    **Highlight.io** is used for real-time error tracking.
    Custom dashboards are planned for error rate visualization.
    Audit logging is maintained for security audits and anomaly detection.
    **BetterStack** can be integrated at the middleware level for global request logging.

    ## AceYourHireVue API Documentation

# AceYourHireVue API Documentation

### Overview of Technologies
**Backend:** Next.js API Routes orchestrated by Trigger.dev
**Database:** Supabase (PostgreSQL)
**AI for Content Generation & Analysis:** Deepseek/OpenAI/Gemini
**Speech-to-Text:** Deepgram
**Authentication & User Management:** Clerk
**Payments & Subscriptions:** Stripe
**Deployment:** Vercel

### Authentication
Authentication is handled by **Clerk**.
API routes are protected using **Clerk's middleware** to validate authentication tokens.
The authentication flow involves users signing up or signing in through Clerk-powered UI components, which manage session tokens.
Protected API routes typically retrieve the `userId` using `getAuth(req)` from `@clerk/nextjs/server`.

### API Endpoints

The AceYourHireVue API provides endpoints for various functionalities:

#### User Management
**Get User Profile:** `GET /api/user/profile`
    Retrieves the profile information of the authenticated user, including subscription details and statistics.
    **Response (200 OK):** Includes `userId`, `email`, `firstName`, `lastName`, `createdAt`, `subscription`, and `stats`.
**Update User Profile:** `PATCH /api/user/profile`
    Updates the profile of the authenticated user.

#### Resume Management
**Upload Resume:** `POST /api/resumes`
    Uploads a new resume file (multipart/form-data).
    **Response (201 Created):** Includes `resumeId`, `filename`, `fileSize`, `uploadedAt`, `status`, and `processingEstimate`.
**Get Resume Processing Status:** `GET /api/resumes/{resumeId}/status`
    Checks the processing status of a specific resume.
    **Response (200 OK):** Includes `resumeId`, `status`, and `parsedData` (if completed).
**Get All Resumes:** `GET /api/resumes`
    Retrieves a list of all resumes for the authenticated user.
    **Response (200 OK):** An array of resume objects, each containing `resumeId`, `filename`, `uploadedAt`, and `status`.
**Delete Resume:** `DELETE /api/resumes/{resumeId}`
    Deletes a specific resume, including the file from Supabase Storage and associated database records.
    **Response (204 No Content)**.

#### Interview Generation
**Generate Job-Based Interview:** `POST /api/interviews/job-based`
    Creates a new interview session based on job description details, triggering an LLM to generate relevant questions.
    **Request Body:** Includes `jobPosition`, `companyName`, `jobDescription`, `jobExperience`, and `timeToAnswer`.
**Get Interview Generation Status:** `GET /api/interviews/{interviewId}/status`
    Checks the status of interview question generation.
    **Response (200 OK):** Includes `interviewId`, `type`, `status`, `createdAt`, `completedAt`, and an array of `questions` with details.
**Generate Resume-Based Interview:** `POST /api/interviews/resume-based`
    Creates a new interview session based on a user's resume, with the LLM analyzing the resume to generate targeted questions.
    **Request Body:** Includes `resumeFilename`, the binary `resumeFile`, and `timeToAnswer`.
    **Response (201 Created):** Includes `interviewId`, `uuid`, `type`, `status`, `createdAt`, `processingEstimate`, and `settings`.
**Create Custom Interview:** `POST /api/interviews/custom`
    Creates a custom interview session using questions from the behavioral questions library.
    **Request Body:** Includes `title`, an array of `questionIds`, and `timeToAnswer`.
    **Response (201 Created):** Includes `uuid`, `type`, `title`, `status`, `createdAt`, and an array of `questions` with details.

#### Interview Sessions
**Get All Interviews:** `GET /api/interviews`
    Retrieves all interview sessions for the authenticated user, with optional query parameters for filtering and pagination (`status`, `type`, `page`, `limit`).
    **Response (200 OK):** An object containing an array of `interviews` and `pagination` details.
**Get Interview Details:** `GET /api/interviews/{interviewId}`
    Retrieves detailed information about a specific interview session, including questions and answers.
    **Response (200 OK):** Includes interview metadata, an array of `questions` with their `answers` (including evaluation and video URL), and an `overall_evaluation`.
**Get Interview Replay Session:** `GET /api/interviews/{interviewId}/replay`
    Retrieves data needed for the interview replay functionality.
    **Response (200 OK):** Includes the interview `uuid`, the current `questionIndex`, `totalQuestions`, and an array of `questions` with their current `status` and `response` details.
**Start Interview Session:** `POST /api/interviews/{interviewId}/start`
    Initiates an interview session, preparing the first question for recording.
    **Response (200 OK):** Includes `interviewId`, `status`, `currentQuestionIndex`, and details of the `currentQuestion`.
**Get Current Question:** `GET /api/interviews/{interviewId}/currentQuestion`
    Retrieves the current active question in the interview session.
    **Response (200 OK):** Includes `questionIndex`, `totalQuestions`, the `question` details, and `retryAttemptsRemaining`.
**Move to Next Question:** `POST /api/interviews/{interviewId}/nextQuestion`
    Advances to the next question in the interview sequence.
    **Response (200 OK):** Includes `success`, `currentQuestionIndex`, `totalQuestions`, the next `question` details, and `retryAttemptsRemaining`.
**Complete Interview:** `POST /api/interviews/{interviewId}/complete`
    Marks an interview as completed, triggering LLM evaluation.
    **Response (200 OK):** Includes `interviewId`, `status`, `completedAt`, `questionsAnswered`, `totalQuestions`, `evaluationStatus`, and `evaluationEstimate`.

#### Question Responses
**Submit Question Response (Video Recording):** `POST /api/interviews/{interviewId}/questions/{questionId}/response`
    Submits the final video response to a specific interview question (multipart/form-data).
    **Request Body:** Includes the binary `videoResponse`, `responseTimeMs`, and `redoAttemptNumber`.
**Increment Retry Attempt:** `PATCH /api/interviews/{interviewId}/questions/{questionId}/retry`
    Increments the retry attempt counter for a question.
    **Request Body:** `{ "action": "increment_retry" }`.
    **Response (200 OK):** Includes `questionId`, `redoAttemptNumber`, `redoAttemptsRemaining`, and `status`.
    **Response (400 Bad Request):** When the retry limit is reached.
**Get Response Processing Status:** `GET /api/interviews/{interviewId}/questions/{questionId}/response/status`
    Checks the status of response processing and feedback generation.
    **Response (200 OK):** Includes `responseId`, `status` (uploading, transcribing, analyzing, completed, failed), `processingStage`, `progress`, and `estimatedCompletion`.
**Get Question Feedback:** `GET /api/interviews/{interviewId}/questions/{questionId}/feedback`
    Retrieves AI-generated feedback for a specific question response.

#### Behavioral Question Library
**Get Question Categories:** `GET /api/questions/categories`
    Retrieves available behavioral question categories.
    **Response (200 OK):** An object with an array of `categories`, each including the `category` name and `questionCount`.
**Search Behavioral Question Library:** `GET /api/questions/library`
    Searches and filters the behavioral question library using optional query parameters (`category`, `search`, `page`, `limit`).
    **Response (200 OK):** An object containing an array of `questions` and `pagination` details.

#### Analytics and Progress
**Get User Statistics:** `GET /api/analytics/stats`
    Retrieves overall performance statistics for the authenticated user. The level of detail varies based on the user's subscription tier.
    **Response (200 OK):** Includes `overview`, `performance`, `categoryBreakdown`, `recentActivity`, and `recommendedPracticeAreas`. The specific data returned depends on the subscription tier.
**Get Interview Progress History:** `GET /api/analytics/history`
    Retrieves a chronological history of the user's interview progress, with optional query parameters for `timeframe` and `limit`.
    **Response (200 OK):** Includes an array of interview summaries with completion dates and evaluation scores, along with overall progress trends.
**Get Detailed Category Analysis:** `GET /api/analytics/categories/{category}`
    Retrieves detailed analysis for a specific question category. This endpoint has different responses based on the user's subscription tier.
    **Path Parameters:** `category` (e.g., "Leadership", "Technical").
    **Free Tier Response (402 Payment Required):** Indicates that the feature is available on higher tiers with an `upgrade_url`.
    **Standard Tier Response (200 OK):** Includes `category`, `questionsAnswered`, `averageEvaluationScore`, `commonStrengths`, and `commonWeaknesses`.
    **Pro Tier Response (200 OK):** Includes all Standard Tier data plus `improvementTrend`, `questionPerformance`, and `recommendedPractice`.

### Trigger.dev Jobs
AceYourHireVue uses **Trigger.dev** to handle asynchronous processing tasks. These jobs are not directly exposed as API endpoints but are crucial for the application's workflow. Examples include:
**Resume Processing Job:** Parses uploaded resumes and extracts key information using an LLM. Triggered by the `resume.uploaded` event.
**Interview Question Generation Jobs:** Generate interview questions based on job descriptions or resumes.
**Response Analysis Job:** Processes audio responses, transcribes them using Deepgram, and generates feedback using an LLM. Triggered by the `response.submitted` event.

### Database Schema
The AceYourHireVue application uses a **Supabase (PostgreSQL)** database. The database schema includes several key tables to support the application's functionalities. Here is a comprehensive overview of the schema based on the provided sources:

**Key Tables and Their Schemas:**

**`users`**
    `id` **uuid** [pk, note: "Primary key; unique user identifier"] / `id` **SERIAL** PRIMARY KEY
    `first_name` **varchar(255)** [not null]
    `last_name` **varchar(255)** [not null]
    `email` **varchar(255)** [not null, unique]
    `photo_url` **varchar(255)** [note: "URL to the user's profile photo"]
    `industry` **varchar(255)** [note: "User's industry"]
    `years_of_experience` **int** [note: "Years of experience"]
    `birthday` **date** [note: "User's birthday"]
    `username` **varchar(255)** [not null, unique, note: "Unique username"]
    `subscription_tier` **varchar(10)** [default: 'free', note: "Subscription tier: free, standard, pro"]
    `created_at` **timestamp** [default: 'now()']
    `updated_at` **timestamp** [default: 'now()']
    `uuid` **UUID** (referenced by `user_id` in `interviews` and `user_id` in `interview_analytics`, `user_progress`, `category_performance`)
    `clerk_id` (mentioned in the context of querying users)

**`interviews`**
    `id` **uuid** [pk, note: "Primary key"] / `id` **SERIAL** PRIMARY KEY
    `user_id` **uuid** [ref: > users.id, note: "References the user taking the interview"] / `user_id` **UUID** REFERENCES users(uuid)
    `interview_type` **InterviewType** [note: "Determines the interview category"] / `interview_type` **InterviewType ENUM** -- job-based, resume-based, custom
        Enum values: `ai`, `custom`, `resume`
    `company_name` **varchar(255)** [note: "Nullable; for AI interviews"]
    `job_position` **varchar(255)** [note: "Nullable; for AI interviews"]
    `job_description` **text** [note: "Nullable; for AI interviews"]
    `job_experience` **varchar(16)** [note: "Nullable"]
    `resume_filename` **varchar(255)** [note: "Nullable; for resume interviews"]
    `time_to_answer` **int** [note: "Time in seconds"]
    `status` **InterviewStatus** [note: "Tracks interview progress"] / `status` **InterviewStatus ENUM** -- processing, ready, in-progress, completed
        Enum values: `not_started`, `ongoing`, `completed`
    `last_question_index` **int** [note: "Index of the last answered question (for resumable interviews)"]
    `original_interview_id` **uuid** [note: "Nullable; references the original interview for redo"]
    `created_at` **timestamp**
    `updated_at` **timestamp**
    `uuid` **UUID** (referenced by `interview_id` in `interview_questions`, `interview_answers`, and `interview_analytics`)

**`interview_questions`**
    `id` **uuid** [pk, note: "Primary key"] / `id` **SERIAL** PRIMARY KEY
    `interview_id` **uuid** [ref: > interviews.id, note: "FK referencing interviews"] / `interview_id` **UUID** REFERENCES interviews(uuid)
    `question_number` **int** [note: "Order/index of the question"]
    `question_text` **text** [note: "The actual question text"]
    `question_type` **QuestionType** [note: "Category of the question (behavioral, technical, custom)"] / `question_type` **QuestionType ENUM** -- behavioral, technical, scenario-based, etc.
        Enum values: `behavioral`, `technical`, `custom`
    `original_question_id` **uuid** [note: "Nullable; if redone, points to the original question"]
    `uuid` **UUID** (referenced by `interview_question_id` in `interview_answers`)

**`interview_answers`**
    `id` **uuid** [pk, note: "Primary key"] / `id` **SERIAL** PRIMARY KEY
    `interview_id` **uuid** [ref: > interviews.id, note: "FK referencing interviews"] / `interview_id` **UUID** REFERENCES interviews(uuid)
    `interview_question_id` **uuid** [ref: > interview_questions.id, note: "FK referencing interview_questions"] / `interview_question_id` **UUID** REFERENCES interview_questions(uuid)
    `answer_text` **text** [note: "Userʼs answer"]
    `evaluation` **text** [note: "Evaluation or feedback on the answer"]
    `redo_attempt_number` **int** [note: "Tracks the number of redo attempts for this answer"]
    `created_at` **timestamp**
    `updated_at` **timestamp**
    `overall_score` **int** [note: "Basic score for all tiers"]
    `star_scores` **jsonb** [note: "STAR method breakdown (Standard & Pro tiers)"]
    `communication_scores` **jsonb** [note: "Communication quality assessment (Standard & Pro tiers)"]
    `content_scores` **jsonb** [note: "Content effectiveness (Standard & Pro tiers)"]
    `interpersonal_scores` **jsonb** [note: "Interpersonal traits (Pro tier only)"]
    `speech_metrics` **jsonb** [note: "Speech metrics from Deepgram (varies by tier)"]
    `improvement_suggestions` **text[]** [note: "Improvement suggestions"]
    `transcription` **text** [note: "Transcript from speech-to-text"]
    `audio_url` **varchar(255)** [note: "Audio URL"]
    `audio_duration_ms` **int** [note: "Audio duration in milliseconds"]
    `analyzed_at` **timestamp** [note: "Analysis timestamp"]

**`behavioral_questions`**
    `id` **int** [pk, increment, note: "Primary key"] / `id` **SERIAL** PRIMARY KEY
    `category` **varchar(100)** [note: "E.g., teamwork, conflict resolution"]
    `question_text` **text** [note: "The actual behavioral question"]

**`interview_analytics`**
    `id` **uuid** [pk, note: "Primary key"]
    `interview_id` **uuid** [ref: > interviews.id, note: "FK referencing interviews"]
    `user_id` **uuid** [ref: > users.id, note: "FK referencing users"]
    `avg_overall_score` **float**
    `avg_star_situation` **float**
    `avg_star_task` **float**
    `avg_star_action` **float**
    `avg_star_result` **float**
    `avg_communication_score` **float**
    `avg_content_score` **float**
    `avg_interpersonal_score` **float**
    `strongest_category` **varchar(100)**
    `weakest_category` **varchar(100)**
    `retry_attempts_used` **int**
    `speaking_rate_avg` **float**
    `filler_word_frequency` **float**
    `analyzed_at` **timestamp**

**`user_progress`**
    `id` **uuid** [pk, note: "Primary key"]
    `user_id` **uuid** [ref: > users.id, note: "FK referencing users"]
    `time_period` **varchar(20)** [note: "Time period (e.g., 'last_week', 'last_month')"]
    `start_date` **date**
    `end_date` **date**
    `interviews_completed` **int**
    `questions_answered` **int**
    `avg_overall_score` **float**
    `avg_star_score` **float**
    `avg_communication_score` **float**
    `avg_content_score` **float**
    `avg_interpersonal_score` **float**
    `improvement_percentage` **float**
    `strongest_category` **varchar(100)**
    `weakest_category` **varchar(100)**
    `created_at` **timestamp** [default: 'now()']

**`category_performance`**
    `id` **uuid** [pk, note: "Primary key"]
    `user_id` **uuid** [ref: > users.id, note: "FK referencing users"]
    `category` **varchar(100)**
    `questions_answered` **int**
    `avg_score` **float**
    `strongest_question_id` **uuid** [ref: > interview_questions.id, note: "FK referencing interview_questions"]
    `weakest_question_id` **uuid** [ref: > interview_questions.id, note: "FK referencing interview_questions"]
    `common_strengths` **text[]**
    `common_weaknesses` **text[]**
    `recommended_questions` **int[]** [note: "References behavioral_questions(id)"]
    `updated_at` **timestamp** [default: 'now()']

**Enums:**

**`InterviewType`**: `ai`, `custom`, `resume`
**`InterviewStatus`**: `not_started`, `ongoing`, `completed` / `processing`, `ready`, `in-progress`, `completed`
**`QuestionType`**: `behavioral`, `technical`, `custom` / `behavioral`, `technical`, `scenario-based`

**Relations and Key Features:**

**User to Interviews**: One-to-Many (A user can have multiple interview sessions)
**Interview to Questions**: One-to-Many (An interview has multiple questions)
**Question to Answers**: One-to-Many (A question can have multiple answers due to retries)
**Behavioral Questions**: Library of pre-defined behavioral questions
The schema supports interview replay functionality using the `redo_attempt_number` in the `interview_answers` table.

**Indexes:**

`idx_users_clerk_id` ON `users` (`clerk_id`)
`idx_interviews_user_id` ON `interviews` (`user_id`)
`idx_interviews_status` ON `interviews` (`status`)
`idx_interviews_created_at` ON `interviews` (`created_at`)
`idx_questions_interview_id` ON `interview_questions` (`interview_id`) / `questions` (`interview_id`)
`idx_responses_question_id` ON `interview_answers` (`interview_question_id`) / `responses` (`question_id`)
`idx_question_library_text_search` ON `behavioral_questions` USING gin(to_tsvector('english', `question_text`)) / `question_library` USING gin(to_tsvector('english', `text`))


### Error Handling
All API routes implement a **consistent error handling approach**. Examples show handling `ZodError` for validation issues and PostgreSQL unique constraint violations. A general error response for internal server errors is also implemented. The application also uses a standardized API error response format as defined in the Error Handling Documentation.

### Rate Limiting and Throttling
Rate limiting is implemented at the API route level using **Upstash Redis** to prevent abuse and ensure fair usage.

### Logging
Standardised logging is implemented in API routes using helper functions (`logApiRequest`, `logServerError`) which likely use a service like BetterStack. Middleware can also be used for global request logging.

### Environment Setup
The API documentation mentions the need to set up environment variables such as `BETTERSTACK_SOURCE_TOKEN` in the `.env.local` file.

# AceYourHireVue Prompt Engineering

### design principles** for LLM prompts:

**Industry & Company Relevance**: Questions should reflect the specific industry and company culture.
**Behavioral Focus**: Prompts should encourage candidates to describe past behaviors and experiences.
**Scenario-Based Questions**: Include realistic work scenarios to assess problem-solving skills.
**Technical Assessment**: For technical roles, prompts should evaluate relevant technical knowledge.
**Clear Question Structure**: Questions should be easy for candidates to understand and answer.
**Multi-Part Questions**: Include follow-up prompts to encourage detailed answers.
**Experience Calibration**: Questions should be appropriate for the candidate's experience level.
**Cross-Domain Integration**: Where relevant, questions should combine technical, behavioral, and scenario-based elements.
**Contemporary Relevance**: Questions should incorporate current industry trends and best practices.

A critical aspect of the system is **experience level calibration**. The documentation defines three experience levels:

**University Student / 0-1 Years Experience**: Focus on academic projects, internships, and entry-level responsibilities.
**2-5 Years of Experience**: Focus on individual contributions and early leadership.
**6+ Years Experience**: Can include complex scenarios, strategic elements, and leadership challenges.

The system uses several **calibration techniques** by adjusting:

**Scenario Context**
**Technical Depth**
**Behavioral Complexity**
**Expected Scope of Impact**

The documentation provides several **prompt templates** for different question types:

**Scenario-Based Question Template**: Used to generate questions involving realistic scenarios with situational constraints and follow-up prompts.
**Technical Question Template**: Designed to assess technical knowledge and problem-solving skills, with considerations for different experience levels and follow-up questions about implementation, alternatives, and performance.
**Behavioral Question Template**: Focuses on past behavior and experience, including follow-up prompts to explore the situation and the candidate's role.
**Resume-Based Question Template**: Generates personalized questions based on the candidate's resume, probing deeper into their experiences and skills and including follow-up prompts.
**Current-Context Question Template**: Creates questions that incorporate current industry developments and company context, using a clear scenario and specific follow-up prompts.

For **job-based interviews**, AceYourHireVue generates a **mix of question types**: approximately 60% behavioral, 30% technical, and 10% scenario-based.

The system also incorporates **real-time context integration** to enhance question relevance by including current industry trends and recent company news. This involves steps like retrieving company news, getting industry trends, and accessing updated technical practices.


In conclusion, the prompt engineering strategy aims to generate high-quality, realistic interview questions tailored to the job context and candidate experience level by leveraging LLM capabilities and incorporating current industry knowledge. This approach reduces the need for manual mapping of companies to industries.

## AceYourHireVue Response Analysis Framework

This outlines the **tiered response analysis system** used by AceYourHireVue to evaluate user interview responses. The framework utilizes speech-to-text processing and Large Language Models (LLMs) to provide detailed feedback, with the depth of analysis varying based on the user's subscription tier.

### Overview
The Response Analysis Framework is designed to analyze interview responses across multiple dimensions. Its goal is to provide job seekers with valuable insights into their interview performance, helping them identify strengths and areas for improvement. The system offers a progressive feature set across three subscription tiers: Free, Standard, and Pro.

### Subscription Tiers and Features

**Free Tier: Basic Assessment**
    Basic transcription of interview responses.
    Overall STAR Method score (0-100).
    Brief feedback (2-3 sentences).
    Limited response storage (last 5 interview sessions).
    Basic improvement suggestions.

**Standard Tier: Enhanced Analysis**
    Includes all Free Tier features.
    More detailed analysis and feedback.
    STAR Method breakdown (scores for Situation, Task, Action, Result).
    Communication assessment (scores for Clarity, Conciseness, Professionalism).
    Content analysis (scores for Relevance, Specificity, Depth).
    Basic speech metrics (speaking rate, filler word count).

**Pro Tier: Comprehensive Coaching**
    Includes all Standard Tier features.
    Advanced speech pattern analysis (utterances, pauses).
    Analysis of interpersonal traits (Confidence, Authenticity, Self-awareness, Adaptability).
    Industry-specific insights on how responses might be received.
    Detailed feedback with strengths, weaknesses, and actionable suggestions.

### Speech Processing
The framework uses **Deepgram** for speech-to-text processing. The level of detail extracted from the Deepgram response depends on the user's subscription tier:

**Basic Transcript Extraction (All Tiers)**: Extracts the main transcript of the response.
**Standard Tier Analysis**: Extracts the transcript, speaking rate (words per minute), and filler word count and frequency.
**Pro Tier Analysis**: Includes all Standard Tier metrics, plus detailed information on utterances (complete thoughts) and pauses (count, total duration, average duration, long pauses). Pro tier configuration includes `utterances: true` and measurements for `pause_duration: true`. Standard tier includes `filler_words: true` and measurements for `speaking_rate: true`. All tiers utilize `smart_format: true`.

### Multi-Dimension LLM Analysis
Once speech data is processed, LLMs are used to analyze the response with varying levels of detail based on the user's tier:

**Free Tier LLM Analysis**: Provides an overall STAR Method score (0-100) and a brief 2-3 sentence feedback summary highlighting one strength and one area for improvement.
**Standard Tier LLM Analysis**: Offers a detailed analysis including a STAR Method evaluation (scoring each component), communication assessment, content quality assessment, and 3-5 specific improvement suggestions.
**Pro Tier LLM Analysis**: Performs a comprehensive analysis covering STAR Method evaluation, in-depth communication quality, content effectiveness, interpersonal traits, and provides an overall evaluation with a summary, key improvement areas, and industry-specific insights.

### Score Calculation
Each tier employs a different method to calculate the overall score:

**Free Tier Score**: A single composite score (0-100) based on the LLM's evaluation of the STAR method implementation.
**Standard Tier Score**: Calculated by averaging the scores from the STAR Method evaluation, communication assessment, and content quality assessment.
**Pro Tier Score**: A weighted average of scores across all evaluated dimensions, including speech metrics, STAR, communication, content, and interpersonal traits.

### Integration with Analytics API
The Response Analysis Framework is tightly integrated with the AceYourHireVue Analytics API to ensure a consistent user experience across subscription tiers. This integration ensures:

**Consistent feature availability** for response analysis data in analytics endpoints based on the user's subscription.
**Appropriate data aggregation and presentation** of response analysis metrics within the Analytics API.
A **seamless user experience** between reviewing individual response feedback and understanding overall performance trends via analytics.

The database schema for responses is extended to store analysis results such as overall score, STAR scores, communication scores, content scores, interpersonal scores, and speech metrics. API endpoints, such as the interview detail endpoint (`GET /api/interviews/{interviewId}`) and the analytics category endpoint (`GET /api/analytics/categories/{category}`), leverage this data to provide tier-appropriate information to the user.

### Future Enhancements
Planned future enhancements for the Response Analysis Framework include:

Visual Speech Pattern Timeline: A visual representation of the user's speech patterns.
Model Response Examples: AI-generated examples of improved responses.
Progress Tracking Dashboards: Visualization of improvement across practice sessions.
Custom Analysis Weights: Allowing users to emphasize certain aspects of the analysis.
Comparative Analysis: Benchmarking against successful candidates.

This framework provides a robust and scalable solution for delivering AI-powered interview feedback tailored to different user needs and subscription levels.

## AceYourHireVue Error Handling Documentation

This document serves as a **comprehensive guide to the error handling strategy** implemented within the AceYourHireVue application. It establishes **consistent patterns for managing, reporting, and resolving errors** across the platform, which is crucial for maintaining user trust, ensuring system stability, and facilitating rapid debugging.

### Purpose

The primary purposes of this error handling documentation are to:

Provide a **consistent approach to handling errors** throughout the application.
Ensure **appropriate error messaging** for different user contexts and subscription tiers.
Establish **robust logging and monitoring** for effective error detection and resolution.
Define **recovery strategies** for various potential failure scenarios.

### Guiding Principles

The error handling strategy is built upon the following guiding principles:

**User Experience First**: Prioritize clear communication and graceful degradation of functionality during errors.
**Comprehensive Visibility**: Ensure all errors are properly captured and logged for analysis.
**Actionable Information**: Error messages should guide users towards potential solutions.
**Security Consciousness**: Never expose sensitive information in user-facing error messages.
**Graceful Degradation**: Maintain core functionality even when non-critical features encounter failures.

### Error Classification System

AceYourHireVue employs a system to classify errors into distinct categories and assign severity levels to ensure appropriate handling and response.

**Error Types**: Errors are categorized based on their origin (e.g., Validation Error, Authentication Error, Resource Error, Integration Error, System Error, Network Error, Rate Limit Error) with specific examples and handling strategies defined for each.
**Error Severity Levels**: Errors are assigned severity levels (Critical, High, Medium, Low) to prioritize response times and determine notification channels for developers.

### Implementation Architecture

The documentation details the error handling implementation across different parts of the application:

**Frontend Error Handling**:
    **Global Error Boundary**: Implemented using React Error Boundaries to prevent cascading UI failures and provide a fallback UI with options to try again or go home.
    **API Request Error Handling**: Utilizes a custom `useApi` hook to standardize API error handling, including showing error toasts, handling rate limits, unauthorized access, forbidden requests (like subscription issues), and implementing retry logic for network errors.
    **Form Validation Errors**: Emphasizes consistent form validation with helpful and clear error messages using libraries like `react-hook-form` and `zod`.
**Backend Error Handling**:
    **Standardized API Error Responses**: Defines a consistent JSON format for API error responses, including an error code, message, optional details, request ID, and timestamp. Common API errors are predefined (e.g., BAD\_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT\_FOUND, RATE\_LIMITED, INTERNAL\_ERROR, SERVICE\_UNAVAILABLE).
    **API Route Error Handler**: Implements a middleware wrapper (`withErrorHandling`) for Next.js API routes to handle errors consistently, including converting specific errors like `ZodError` (validation), Prisma "not found", and PostgreSQL unique constraint violations into standardized `ApiError` responses. It also logs unhandled errors.
    **Example API Route with Error Handling**: Shows a practical example of how to use the `withErrorHandling` middleware in an API route.
**AI Services Error Handling**: Describes how errors from LLM and speech recognition services (like API timeouts) are handled, including retry mechanisms with exponential backoff and fallback to secondary LLM providers.
**Background Job Error Handling**: Outlines robust error handling for background jobs managed by Trigger.dev, including tracking job progress, specific error handling for services like Deepgram, retry logic for LLM analysis, and updating the response record with error status.

### User-Facing Error Communication

The documentation provides guidelines and strategies for communicating errors to users effectively.

**Error Messaging Guidelines**: User-facing error messages should be Clear & Non-Technical, Actionable, Contextual, Consistent, Constructive, and Concise.
**Error Display Strategies**: Different error types warrant different display methods (e.g., Modal dialogs for critical errors, Inline field messages for validation errors, Toast notifications for non-critical errors, Status indicators for background errors, Upgrade prompts for subscription limits).
**Subscription Tier-Specific Error Handling**: Error messages and the level of detail provided can be tailored based on the user's subscription tier (Free, Standard, Pro), offering more detailed information to higher-tier users.

### Logging & Monitoring Strategy

A comprehensive logging and monitoring strategy is essential for identifying and resolving issues.

**Error Logging Framework**: AceYourHireVue utilizes **BetterStack** for centralized error logging and monitoring.
    **Server-Side Logging Utility**: Implements helper functions (`logServerEvent`, `logServerError`, `logApiRequest`) in `lib/logger.ts` for structured logging with context, with conditional console output in development and logging to BetterStack in other environments.
    **Client-Side Error Tracking**: Uses a custom hook (`useErrorLogging`) to capture client-side errors (including global `error` and `unhandledrejection` events) and send them to a backend API endpoint for logging.
**Monitoring and Alerting**:
    **Alert Thresholds**: Defines alert triggers based on error frequency, impact, and severity levels (Critical, High, Medium, Low) with corresponding alert methods and response times.
    **Monitoring Queries**: Provides BetterStack query examples for monitoring specific error patterns like critical service failures, authentication failures, LLM service issues, and slow API responses.
    **Error Dashboards**: Suggests creating specialized dashboards for different error categories (System Health, User Experience, AI Services).
**Post-Mortem Process**: Outlines a structured process to follow after significant incidents, including documenting the timeline, root cause analysis, impact assessment, remediation plan, and lessons learned.

### Recovery & Resilience Patterns

The documentation describes patterns implemented to enhance the application's resilience.

**Circuit Breaker Pattern**: Implemented using a `CircuitBreaker` class to prevent cascading failures when dependent services are unreliable, with options for a fallback function. An example usage for the LLM service with a fallback is provided.
**Bulkhead Pattern**: Discusses the isolation of components (like using connection pools for external services) to contain failures and prevent resource exhaustion.
**Feature Degradation Strategy**: Describes a tiered approach to gracefully degrade functionality during service disruptions based on service health status, ensuring core features remain available. An example shows how the `InterviewRecorder` component adapts based on the transcription service status.

### Deployment Considerations

Error prevention and quick resolution during deployment are crucial.

**Deployment Error Prevention**:
    **Pre-Deployment Checks**: Suggests automated checks in the CI/CD pipeline to identify potential error patterns and ensure error monitoring is configured.
    **Staged Rollout Strategy**: Recommends strategies like Canary Deployments and Feature Flags to gradually roll out new features and minimize the impact of potential errors.
**Post-Deployment Monitoring**: Emphasizes heightened monitoring of error rates and user impact immediately after deployment.
**Rollback Procedures**: Stresses the importance of documented rollback procedures with clear criteria and commands to revert to a stable state in case of critical deployment errors.

### Error Handling in Documentation & Training

Proper documentation and training are vital for maintaining the error handling strategy.

**Error Documentation**: Maintaining an internal Error Catalog with causes and resolutions and creating User-Facing Error Guides in the help center are recommended.
**Onboarding & Training**: Training new team members on the error handling mentality and developer guidelines (when and how to use patterns, logging vs. alerting, message standards) is essential.

### Conclusion

This Error Handling Strategy provides a comprehensive framework for managing errors in AceYourHireVue, aiming for a resilient application with better user experiences and faster issue resolution. The key components are consistent error classification, user-centric error communication, robust logging and monitoring, resilience patterns, and deployment safety.

## AceYourHireVue Development & Testing Documentation

This serves as a guide to the **development processes, tools, and testing methodologies** employed for the AceYourHireVue application. It aims to ensure a **robust, maintainable, and high-quality codebase** by outlining best practices for development, security, and performance.

### Purpose and Objectives

This documentation defines how AceYourHireVue is built, tested, and deployed. Its objectives include:

Establishing a **clear development workflow** with version control and branching.
Defining a **structured file organization** for better maintainability and testability.
Detailing the **testing strategy**, covering various test types.
Outlining the **CI/CD pipeline** for automation.
Ensuring adherence to best practices for **coding, security, and performance**.

### Key Sections

The document covers the following crucial aspects of development and testing:

**Development Environment & Tooling**: Specifies the technologies and frameworks used, such as **Next.js**, **TanStack Query**, **ShadCN UI**, **Git**, **GitHub Actions**, **Jest**, **React Testing Library**, **Cypress**, **Lighthouse CI**, and **axe-core**. It also details the setup for local development and testing environments like **NeonDB**, as well as staging and production on **Vercel**.
**File Structure & Branching Strategy**: Describes the **domain-driven file organization** for better separation of concerns. It also outlines the **Git branching strategy**, including `main`, `develop`, feature, release, hotfix, and bugfix branches, and how they integrate with **Vercel's deployment environments** (Preview, Staging, Production).
**Testing Strategy**: Provides a comprehensive overview of the testing approach, emphasizing **early defect detection** and **regression prevention**. It details various types of tests:
    **Unit Tests**: Testing individual functions and hooks in isolation using **Jest**.
    **Component Tests**: Validating the rendering and behavior of React components using **Jest** and **React Testing Library**.
    **Integration Tests**: Ensuring different system parts work together using **Jest**, **Supertest**, and **NeonDB**.
    **End-to-End (E2E) Tests**: Simulating real user scenarios using **Cypress** and **Percy** for visual regression testing.
    **Performance Tests**: Ensuring system responsiveness using **Lighthouse CI**.
    **Accessibility Tests**: Ensuring WCAG 2.1 AA compliance using **axe-core**.
    **Subscription Tier Tests**: Verifying feature enablement based on user tiers.
    **AI Component Tests**: Ensuring reliability and quality of AI-generated content.
    The section also covers test case management, execution, continuous testing, test environment management, and error case coverage.
**Continuous Integration & Deployment (CI/CD)**: Explains the automated pipeline using **GitHub Actions** for linting, testing (unit, integration, component, subscription, E2E), and deployment to **Vercel**.
**Roles & Responsibilities**: Outlines the responsibilities of a solo developer, encompassing development, testing, CI/CD management, and documentation.
**Risk Management & Contingency**: Identifies potential risks, such as **cold starts with Trigger.dev**, and proposes mitigation strategies.
**Documentation & Reporting**: Emphasizes the importance of **inline code documentation** and keeping the `README.md` and this plan up to date. It also mentions using **GitHub Issues and Projects** for tracking progress and reviewing CI/CD reports.