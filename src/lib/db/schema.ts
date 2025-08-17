import { relations, sql } from 'drizzle-orm';
import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    jsonb, pgEnum
} from 'drizzle-orm/pg-core';

// Enums
export const interviewTypeEnum = pgEnum('interview_type', ['ai', 'custom', 'resume']);
export const interviewStatusEnum = pgEnum('interview_status', ['not_started', 'ongoing', 'completed']);
export const questionTypeEnum = pgEnum('question_type', ['behavioral', 'technical', 'situational', 'other']);
export const companySizeCategoryEnum = pgEnum('company_size_category', ['startup', 'mid-size', 'enterprise']);

// Users table - updated for Supabase Auth
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  photoUrl: text('photo_url'),
  industry: text('industry'),
  yearsOfExperience: integer('years_of_experience'),
  username: text('username').notNull().unique(),
  subscriptionTier: text('subscription_tier').default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Interviews table - remains the same
export const interviews = pgTable('interviews', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  interviewType: interviewTypeEnum('interview_type').notNull(),
  companyName: text('company_name'),
  jobPosition: text('job_position'),
  jobDescription: text('job_description'),
  jobExperience: text('job_experience'),
  resumeFilename: text('resume_filename'),
  timeToAnswer: integer('time_to_answer').notNull(),
  status: interviewStatusEnum('status').default('not_started').notNull(),
  lastQuestionIndex: integer('last_question_index').default(0),
  originalInterviewId: uuid('original_interview_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Interview Questions table - remains the same
export const interviewQuestions = pgTable('interview_questions', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  interviewId: uuid('interview_id').references(() => interviews.id).notNull(),
  questionNumber: integer('question_number').notNull(),
  questionText: text('question_text').notNull(),
  questionType: questionTypeEnum('question_type').notNull(),
  originalQuestionId: uuid('original_question_id'),
});

// Interview Answers table - remains the same
export const interviewAnswers = pgTable('interview_answers', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  interviewId: uuid('interview_id').references(() => interviews.id).notNull(),
  interviewQuestionId: uuid('interview_question_id').references(() => interviewQuestions.id).notNull(),
  transcription: text('transcription'),
  evaluation: text('evaluation'),
  redoAttemptNumber: integer('redo_attempt_number').default(0),
  // Analysis metrics
  overallScore: integer('overall_score'),
  starScores: jsonb('star_scores'),
  communicationScores: jsonb('communication_scores'),
  contentScores: jsonb('content_scores'),
  interpersonalScores: jsonb('interpersonal_scores'),
  speechMetrics: jsonb('speech_metrics'),
  improvementSuggestions: jsonb('improvement_suggestions'),
  audioUrl: text('audio_url'),
  audioDurationMs: integer('audio_duration_ms'),
  analyzedAt: timestamp('analyzed_at'),
  // New contextual scoring columns
  contextualRelevanceScores: jsonb('contextual_relevance_scores'),
  companyAlignmentScores: jsonb('company_alignment_scores'),
  jobAlignmentBreakdown: jsonb('job_alignment_breakdown'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Company Profiles table
export const companyProfiles = pgTable('company_profiles', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  companyName: text('company_name').notNull(),
  domain: text('domain'),
  industry: text('industry'),
  sizeCategory: companySizeCategoryEnum('size_category'),
  
  // Culture & Values Data
  coreValues: jsonb('core_values'), // [{"value": "Innovation", "description": "...", "intensity": 8}]
  cultureKeywords: text('culture_keywords').array(), // ["fast-paced", "collaborative", "data-driven"]
  leadershipStyle: text('leadership_style'), // "democratic", "hierarchical", "flat"
  workEnvironment: text('work_environment'), // "remote-first", "hybrid", "in-office"
  
  // Metadata
  lastResearchedAt: timestamp('last_researched_at'),
  researchConfidenceScore: integer('research_confidence_score'), // 0-100
  sourceUrls: text('source_urls').array(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Behavioral Questions table - remains the same
export const behavioralQuestions = pgTable('behavioral_questions', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  category: text('category').notNull(),
  questionText: text('question_text').notNull(),
});

// Relationships - remain the same
export const usersRelations = relations(users, ({ many }) => ({
  interviews: many(interviews)
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id]
  }),
  questions: many(interviewQuestions)
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one, many }) => ({
  interview: one(interviews, {
    fields: [interviewQuestions.interviewId],
    references: [interviews.id]
  }),
  answers: many(interviewAnswers)
}));

export const interviewAnswersRelations = relations(interviewAnswers, ({ one }) => ({
  interview: one(interviews, {
    fields: [interviewAnswers.interviewId],
    references: [interviews.id]
  }),
  question: one(interviewQuestions, {
    fields: [interviewAnswers.interviewQuestionId],
    references: [interviewQuestions.id]
  })
}));

export const companyProfilesRelations = relations(companyProfiles, ({ many }) => ({
  // Note: No direct foreign key relationship, but companies can be referenced
  // by name in interviews table via companyName field
}));