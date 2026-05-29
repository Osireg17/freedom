CREATE TYPE "public"."company_size_category" AS ENUM('startup', 'mid-size', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."interview_status" AS ENUM('not_started', 'ongoing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('ai', 'custom', 'resume');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('behavioral', 'technical', 'situational', 'other');--> statement-breakpoint
CREATE TABLE "behavioral_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"question_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"domain" text,
	"industry" text,
	"size_category" "company_size_category",
	"core_values" jsonb,
	"culture_keywords" text[],
	"leadership_style" text,
	"work_environment" text,
	"last_researched_at" timestamp,
	"research_confidence_score" integer,
	"source_urls" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" uuid NOT NULL,
	"interview_question_id" uuid NOT NULL,
	"transcription" text,
	"evaluation" text,
	"redo_attempt_number" integer DEFAULT 0,
	"overall_score" integer,
	"star_scores" jsonb,
	"communication_scores" jsonb,
	"content_scores" jsonb,
	"interpersonal_scores" jsonb,
	"speech_metrics" jsonb,
	"improvement_suggestions" jsonb,
	"audio_url" text,
	"audio_duration_ms" integer,
	"analyzed_at" timestamp,
	"contextual_relevance_scores" jsonb,
	"company_alignment_scores" jsonb,
	"job_alignment_breakdown" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" uuid NOT NULL,
	"question_number" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"original_question_id" uuid
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"interview_type" "interview_type" NOT NULL,
	"company_name" text,
	"job_position" text,
	"job_description" text,
	"job_experience" text,
	"resume_filename" text,
	"time_to_answer" integer NOT NULL,
	"status" "interview_status" DEFAULT 'not_started' NOT NULL,
	"last_question_index" integer DEFAULT 0,
	"original_interview_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"photo_url" text,
	"industry" text,
	"years_of_experience" integer,
	"username" text NOT NULL,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "interview_answers" ADD CONSTRAINT "interview_answers_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_answers" ADD CONSTRAINT "interview_answers_interview_question_id_interview_questions_id_fk" FOREIGN KEY ("interview_question_id") REFERENCES "public"."interview_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;