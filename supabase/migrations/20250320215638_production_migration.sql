create schema if not exists "drizzle";

create sequence "drizzle"."__drizzle_migrations_id_seq";

create table "drizzle"."__drizzle_migrations" (
    "id" integer not null default nextval('drizzle.__drizzle_migrations_id_seq'::regclass),
    "hash" text not null,
    "created_at" bigint
);


alter sequence "drizzle"."__drizzle_migrations_id_seq" owned by "drizzle"."__drizzle_migrations"."id";

CREATE UNIQUE INDEX __drizzle_migrations_pkey ON drizzle.__drizzle_migrations USING btree (id);

alter table "drizzle"."__drizzle_migrations" add constraint "__drizzle_migrations_pkey" PRIMARY KEY using index "__drizzle_migrations_pkey";


create type "public"."interview_status" as enum ('not_started', 'ongoing', 'completed');

create type "public"."interview_type" as enum ('ai', 'custom', 'resume');

create type "public"."question_type" as enum ('behavioral', 'technical', 'custom');

create table "public"."behavioral_questions" (
    "id" uuid not null default uuid_generate_v4(),
    "category" text not null,
    "question_text" text not null
);


create table "public"."interview_answers" (
    "id" uuid not null default uuid_generate_v4(),
    "interview_id" uuid not null,
    "interview_question_id" uuid not null,
    "answer_text" text,
    "evaluation" text,
    "redo_attempt_number" integer default 0,
    "overall_score" integer,
    "star_scores" jsonb,
    "communication_scores" jsonb,
    "content_scores" jsonb,
    "interpersonal_scores" jsonb,
    "speech_metrics" jsonb,
    "improvement_suggestions" jsonb,
    "transcription" text,
    "audio_url" text,
    "audio_duration_ms" integer,
    "analyzed_at" timestamp without time zone,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."interview_questions" (
    "id" uuid not null default uuid_generate_v4(),
    "interview_id" uuid not null,
    "question_number" integer not null,
    "question_text" text not null,
    "question_type" question_type not null,
    "original_question_id" uuid
);


create table "public"."interviews" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "interview_type" interview_type not null,
    "company_name" text,
    "job_position" text,
    "job_description" text,
    "job_experience" text,
    "resume_filename" text,
    "time_to_answer" integer not null,
    "status" interview_status not null default 'not_started'::interview_status,
    "last_question_index" integer default 0,
    "original_interview_id" uuid,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."users" (
    "id" uuid not null default uuid_generate_v4(),
    "clerk_id" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "email" text not null,
    "photo_url" text,
    "industry" text,
    "years_of_experience" integer,
    "username" text not null,
    "subscription_tier" text not null default 'free'::text,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


CREATE UNIQUE INDEX behavioral_questions_pkey ON public.behavioral_questions USING btree (id);

CREATE UNIQUE INDEX interview_answers_pkey ON public.interview_answers USING btree (id);

CREATE UNIQUE INDEX interview_questions_pkey ON public.interview_questions USING btree (id);

CREATE UNIQUE INDEX interviews_pkey ON public.interviews USING btree (id);

CREATE UNIQUE INDEX users_clerk_id_unique ON public.users USING btree (clerk_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_username_unique ON public.users USING btree (username);

alter table "public"."behavioral_questions" add constraint "behavioral_questions_pkey" PRIMARY KEY using index "behavioral_questions_pkey";

alter table "public"."interview_answers" add constraint "interview_answers_pkey" PRIMARY KEY using index "interview_answers_pkey";

alter table "public"."interview_questions" add constraint "interview_questions_pkey" PRIMARY KEY using index "interview_questions_pkey";

alter table "public"."interviews" add constraint "interviews_pkey" PRIMARY KEY using index "interviews_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."interview_answers" add constraint "interview_answers_interview_id_interviews_id_fk" FOREIGN KEY (interview_id) REFERENCES interviews(id) not valid;

alter table "public"."interview_answers" validate constraint "interview_answers_interview_id_interviews_id_fk";

alter table "public"."interview_answers" add constraint "interview_answers_interview_question_id_interview_questions_id_" FOREIGN KEY (interview_question_id) REFERENCES interview_questions(id) not valid;

alter table "public"."interview_answers" validate constraint "interview_answers_interview_question_id_interview_questions_id_";

alter table "public"."interview_questions" add constraint "interview_questions_interview_id_interviews_id_fk" FOREIGN KEY (interview_id) REFERENCES interviews(id) not valid;

alter table "public"."interview_questions" validate constraint "interview_questions_interview_id_interviews_id_fk";

alter table "public"."interviews" add constraint "interviews_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."interviews" validate constraint "interviews_user_id_users_id_fk";

alter table "public"."users" add constraint "users_clerk_id_unique" UNIQUE using index "users_clerk_id_unique";

alter table "public"."users" add constraint "users_username_unique" UNIQUE using index "users_username_unique";

grant delete on table "public"."behavioral_questions" to "anon";

grant insert on table "public"."behavioral_questions" to "anon";

grant references on table "public"."behavioral_questions" to "anon";

grant select on table "public"."behavioral_questions" to "anon";

grant trigger on table "public"."behavioral_questions" to "anon";

grant truncate on table "public"."behavioral_questions" to "anon";

grant update on table "public"."behavioral_questions" to "anon";

grant delete on table "public"."behavioral_questions" to "authenticated";

grant insert on table "public"."behavioral_questions" to "authenticated";

grant references on table "public"."behavioral_questions" to "authenticated";

grant select on table "public"."behavioral_questions" to "authenticated";

grant trigger on table "public"."behavioral_questions" to "authenticated";

grant truncate on table "public"."behavioral_questions" to "authenticated";

grant update on table "public"."behavioral_questions" to "authenticated";

grant delete on table "public"."behavioral_questions" to "service_role";

grant insert on table "public"."behavioral_questions" to "service_role";

grant references on table "public"."behavioral_questions" to "service_role";

grant select on table "public"."behavioral_questions" to "service_role";

grant trigger on table "public"."behavioral_questions" to "service_role";

grant truncate on table "public"."behavioral_questions" to "service_role";

grant update on table "public"."behavioral_questions" to "service_role";

grant delete on table "public"."interview_answers" to "anon";

grant insert on table "public"."interview_answers" to "anon";

grant references on table "public"."interview_answers" to "anon";

grant select on table "public"."interview_answers" to "anon";

grant trigger on table "public"."interview_answers" to "anon";

grant truncate on table "public"."interview_answers" to "anon";

grant update on table "public"."interview_answers" to "anon";

grant delete on table "public"."interview_answers" to "authenticated";

grant insert on table "public"."interview_answers" to "authenticated";

grant references on table "public"."interview_answers" to "authenticated";

grant select on table "public"."interview_answers" to "authenticated";

grant trigger on table "public"."interview_answers" to "authenticated";

grant truncate on table "public"."interview_answers" to "authenticated";

grant update on table "public"."interview_answers" to "authenticated";

grant delete on table "public"."interview_answers" to "service_role";

grant insert on table "public"."interview_answers" to "service_role";

grant references on table "public"."interview_answers" to "service_role";

grant select on table "public"."interview_answers" to "service_role";

grant trigger on table "public"."interview_answers" to "service_role";

grant truncate on table "public"."interview_answers" to "service_role";

grant update on table "public"."interview_answers" to "service_role";

grant delete on table "public"."interview_questions" to "anon";

grant insert on table "public"."interview_questions" to "anon";

grant references on table "public"."interview_questions" to "anon";

grant select on table "public"."interview_questions" to "anon";

grant trigger on table "public"."interview_questions" to "anon";

grant truncate on table "public"."interview_questions" to "anon";

grant update on table "public"."interview_questions" to "anon";

grant delete on table "public"."interview_questions" to "authenticated";

grant insert on table "public"."interview_questions" to "authenticated";

grant references on table "public"."interview_questions" to "authenticated";

grant select on table "public"."interview_questions" to "authenticated";

grant trigger on table "public"."interview_questions" to "authenticated";

grant truncate on table "public"."interview_questions" to "authenticated";

grant update on table "public"."interview_questions" to "authenticated";

grant delete on table "public"."interview_questions" to "service_role";

grant insert on table "public"."interview_questions" to "service_role";

grant references on table "public"."interview_questions" to "service_role";

grant select on table "public"."interview_questions" to "service_role";

grant trigger on table "public"."interview_questions" to "service_role";

grant truncate on table "public"."interview_questions" to "service_role";

grant update on table "public"."interview_questions" to "service_role";

grant delete on table "public"."interviews" to "anon";

grant insert on table "public"."interviews" to "anon";

grant references on table "public"."interviews" to "anon";

grant select on table "public"."interviews" to "anon";

grant trigger on table "public"."interviews" to "anon";

grant truncate on table "public"."interviews" to "anon";

grant update on table "public"."interviews" to "anon";

grant delete on table "public"."interviews" to "authenticated";

grant insert on table "public"."interviews" to "authenticated";

grant references on table "public"."interviews" to "authenticated";

grant select on table "public"."interviews" to "authenticated";

grant trigger on table "public"."interviews" to "authenticated";

grant truncate on table "public"."interviews" to "authenticated";

grant update on table "public"."interviews" to "authenticated";

grant delete on table "public"."interviews" to "service_role";

grant insert on table "public"."interviews" to "service_role";

grant references on table "public"."interviews" to "service_role";

grant select on table "public"."interviews" to "service_role";

grant trigger on table "public"."interviews" to "service_role";

grant truncate on table "public"."interviews" to "service_role";

grant update on table "public"."interviews" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


