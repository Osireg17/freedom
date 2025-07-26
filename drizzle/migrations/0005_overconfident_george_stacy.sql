ALTER TABLE "public"."interview_questions" ALTER COLUMN "question_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."question_type";--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('behavioral', 'technical', 'situational', 'other');--> statement-breakpoint
ALTER TABLE "public"."interview_questions" ALTER COLUMN "question_type" SET DATA TYPE "public"."question_type" USING "question_type"::"public"."question_type";