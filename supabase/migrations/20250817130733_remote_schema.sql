

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."interview_status" AS ENUM (
    'not_started',
    'ongoing',
    'completed'
);


ALTER TYPE "public"."interview_status" OWNER TO "postgres";


CREATE TYPE "public"."interview_type" AS ENUM (
    'ai',
    'custom',
    'resume'
);


ALTER TYPE "public"."interview_type" OWNER TO "postgres";


CREATE TYPE "public"."question_type" AS ENUM (
    'behavioral',
    'technical',
    'situational',
    'other'
);


ALTER TYPE "public"."question_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Insert into your users table matching your Drizzle schema
  INSERT INTO public.users (
    id, 
    first_name, 
    last_name, 
    email,
    username,
    subscription_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    -- Create username from email by taking everything before @ and adding a random number
    lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g')) || '-' || 
    lpad(floor(random() * 10000)::text, 4, '0'),
    'free',
    now(),
    now()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."behavioral_questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category" "text" NOT NULL,
    "question_text" "text" NOT NULL
);


ALTER TABLE "public"."behavioral_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_answers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "interview_id" "uuid" NOT NULL,
    "interview_question_id" "uuid" NOT NULL,
    "evaluation" "text",
    "redo_attempt_number" integer DEFAULT 0,
    "overall_score" integer,
    "star_scores" "jsonb",
    "communication_scores" "jsonb",
    "content_scores" "jsonb",
    "interpersonal_scores" "jsonb",
    "speech_metrics" "jsonb",
    "improvement_suggestions" "jsonb",
    "transcription" "text",
    "audio_url" "text",
    "audio_duration_ms" integer,
    "analyzed_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interview_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "interview_id" "uuid" NOT NULL,
    "question_number" integer NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" "public"."question_type" NOT NULL,
    "original_question_id" "uuid"
);


ALTER TABLE "public"."interview_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "interview_type" "public"."interview_type" NOT NULL,
    "company_name" "text",
    "job_position" "text",
    "job_description" "text",
    "job_experience" "text",
    "resume_filename" "text",
    "time_to_answer" integer NOT NULL,
    "status" "public"."interview_status" DEFAULT 'not_started'::"public"."interview_status" NOT NULL,
    "last_question_index" integer DEFAULT 0,
    "original_interview_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "photo_url" "text",
    "industry" "text",
    "years_of_experience" integer,
    "username" "text" NOT NULL,
    "subscription_tier" "text" DEFAULT 'free'::"text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."behavioral_questions"
    ADD CONSTRAINT "behavioral_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_answers"
    ADD CONSTRAINT "interview_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_unique" UNIQUE ("username");



ALTER TABLE ONLY "public"."interview_answers"
    ADD CONSTRAINT "interview_answers_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id");



ALTER TABLE ONLY "public"."interview_answers"
    ADD CONSTRAINT "interview_answers_interview_question_id_interview_questions_id_" FOREIGN KEY ("interview_question_id") REFERENCES "public"."interview_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



CREATE POLICY "Authenticated users can delete their own interview answers" ON "public"."interview_answers" FOR DELETE TO "authenticated" USING (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can delete their own interview questions" ON "public"."interview_questions" FOR DELETE TO "authenticated" USING (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can delete their own interviews" ON "public"."interviews" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can delete their own records" ON "public"."users" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Authenticated users can insert their own interview answers" ON "public"."interview_answers" FOR INSERT TO "authenticated" WITH CHECK (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can insert their own interview questions" ON "public"."interview_questions" FOR INSERT TO "authenticated" WITH CHECK (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can insert their own interviews" ON "public"."interviews" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can insert their own records" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can select their own interview answers" ON "public"."interview_answers" FOR SELECT TO "authenticated" USING (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can select their own interview questions" ON "public"."interview_questions" FOR SELECT TO "authenticated" USING (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can select their own interviews" ON "public"."interviews" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can select their own records" ON "public"."users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Authenticated users can update their own interview answers" ON "public"."interview_answers" FOR UPDATE TO "authenticated" USING (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can update their own interview questions" ON "public"."interview_questions" FOR UPDATE TO "authenticated" USING (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("interview_id" IN ( SELECT "interviews"."id"
   FROM "public"."interviews"
  WHERE ("interviews"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Authenticated users can update their own interviews" ON "public"."interviews" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can update their own records" ON "public"."users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."behavioral_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



























GRANT ALL ON TABLE "public"."behavioral_questions" TO "anon";
GRANT ALL ON TABLE "public"."behavioral_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."behavioral_questions" TO "service_role";



GRANT ALL ON TABLE "public"."interview_answers" TO "anon";
GRANT ALL ON TABLE "public"."interview_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_answers" TO "service_role";



GRANT ALL ON TABLE "public"."interview_questions" TO "anon";
GRANT ALL ON TABLE "public"."interview_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_questions" TO "service_role";



GRANT ALL ON TABLE "public"."interviews" TO "anon";
GRANT ALL ON TABLE "public"."interviews" TO "authenticated";
GRANT ALL ON TABLE "public"."interviews" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
